from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.competition import Competition
from app.schemas.strategy import CompetitionResponse

router = APIRouter(prefix="/competitions", tags=["competitions"])


@router.get("/", response_model=list[CompetitionResponse])
def list_competitions(db: Session = Depends(get_db)):
    return db.query(Competition).filter(Competition.is_active == True).all()


@router.get("/{competition_id}", response_model=CompetitionResponse)
def get_competition(competition_id: str, db: Session = Depends(get_db)):
    comp = db.query(Competition).filter(Competition.id == competition_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    return comp
