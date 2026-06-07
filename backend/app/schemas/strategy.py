from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel


class StrategyCreate(BaseModel):
    competition_id: UUID
    code: str
    mode: str = "code"


class StrategyResponse(BaseModel):
    id: UUID
    user_id: UUID
    competition_id: UUID
    code: str
    mode: str
    status: str
    error_message: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True


class ResultResponse(BaseModel):
    id: UUID
    strategy_id: UUID
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    calmar_ratio: float
    regime_scores: dict
    equity_curve: list
    completed_at: datetime

    class Config:
        from_attributes = True


class CompetitionResponse(BaseModel):
    id: UUID
    title: str
    description: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
