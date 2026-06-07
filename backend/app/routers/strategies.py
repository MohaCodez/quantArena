from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.strategy import Strategy, Result
from app.schemas.strategy import StrategyCreate, StrategyResponse, ResultResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/strategies", tags=["strategies"])


@router.post("/", response_model=StrategyResponse, status_code=201)
def submit_strategy(data: StrategyCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    strategy = Strategy(
        user_id=user.id,
        competition_id=data.competition_id,
        code=data.code,
        mode=data.mode,
        status="pending",
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    # TODO: trigger celery task here
    return strategy


@router.get("/me", response_model=list[StrategyResponse])
def my_strategies(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Strategy).filter(Strategy.user_id == user.id).order_by(Strategy.submitted_at.desc()).all()


@router.get("/{strategy_id}", response_model=StrategyResponse)
def get_strategy(strategy_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy


@router.get("/{strategy_id}/result", response_model=ResultResponse)
def get_result(strategy_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    result = db.query(Result).filter(Result.strategy_id == strategy_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not ready")
    return result
