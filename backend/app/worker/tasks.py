import json
from pathlib import Path

from app.worker.celery_app import celery_app
from app.database import SessionLocal
from app.models.strategy import Strategy, Result
from app.models.competition import Competition, Dataset
from app.engine.backtest import run_backtest
from app.sandbox.executor import create_strategy_fn


@celery_app.task(name="app.worker.tasks.run_backtest_task")
def run_backtest_task(strategy_id: str):
    db = SessionLocal()
    try:
        strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
        if not strategy:
            return

        strategy.status = "running"
        db.commit()

        # Load dataset
        competition = db.query(Competition).filter(Competition.id == strategy.competition_id).first()
        dataset = db.query(Dataset).filter(Dataset.id == competition.dataset_id).first()

        data_path = Path(dataset.file_path)
        if not data_path.exists():
            strategy.status = "failed"
            strategy.error_message = "Dataset not found"
            db.commit()
            return

        with open(data_path) as f:
            market_data = json.load(f)

        # Compile user code in sandbox
        try:
            strategy_fn = create_strategy_fn(strategy.code)
        except (SyntaxError, ValueError) as e:
            strategy.status = "failed"
            strategy.error_message = str(e)
            db.commit()
            return

        # Run backtest
        try:
            scores = run_backtest(strategy_fn, market_data)
        except Exception as e:
            strategy.status = "failed"
            strategy.error_message = f"Runtime error: {str(e)}"
            db.commit()
            return

        # Save results
        result = Result(
            strategy_id=strategy.id,
            total_return=scores["total_return"],
            sharpe_ratio=scores["sharpe_ratio"],
            max_drawdown=scores["max_drawdown"],
            win_rate=scores["win_rate"],
            calmar_ratio=scores["calmar_ratio"],
            regime_scores={},
            equity_curve=scores["equity_curve"],
        )
        db.add(result)
        strategy.status = "done"
        db.commit()

    except Exception as e:
        strategy.status = "failed"
        strategy.error_message = f"Unexpected error: {str(e)}"
        db.commit()
    finally:
        db.close()
