from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.strategy import Strategy, Result
from app.models.user import User

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/{competition_id}")
def get_leaderboard(competition_id: str, db: Session = Depends(get_db)):
    rows = (
        db.query(Result, Strategy, User)
        .join(Strategy, Result.strategy_id == Strategy.id)
        .join(User, Strategy.user_id == User.id)
        .filter(Strategy.competition_id == competition_id)
        .filter(Strategy.status == "done")
        .limit(50)
        .all()
    )

    return [
        {
            "rank": i + 1,
            "username": user.username,
            "total_return": result.total_return,
            "sharpe_ratio": result.sharpe_ratio,
            "max_drawdown": result.max_drawdown,
            "win_rate": result.win_rate,
            "calmar_ratio": result.calmar_ratio,
            "score": _compute_score(result),
            "submitted_at": strategy.submitted_at.isoformat(),
        }
        for i, (result, strategy, user) in enumerate(
            sorted(rows, key=lambda r: _compute_score(r[0]), reverse=True)
        )
    ]


def _compute_score(result):
    """
    Composite score (0-100) weighted across metrics:
    - Sharpe ratio: 30%
    - Total return: 25%
    - Max drawdown (inverted, lower is better): 25%
    - Win rate: 10%
    - Calmar ratio: 10%
    """
    # Normalize each metric to roughly 0-100 range
    sharpe_score = max(0, min(100, (result.sharpe_ratio + 1) * 33))  # -1 to 2 -> 0 to 100
    return_score = max(0, min(100, (result.total_return + 50) * 1))  # -50 to 50 -> 0 to 100
    drawdown_score = max(0, 100 - result.max_drawdown * 2)  # 0% -> 100, 50% -> 0
    win_score = result.win_rate  # already 0-100
    calmar_score = max(0, min(100, (result.calmar_ratio + 1) * 33))

    score = (
        sharpe_score * 0.30
        + return_score * 0.25
        + drawdown_score * 0.25
        + win_score * 0.10
        + calmar_score * 0.10
    )
    return round(score, 1)
