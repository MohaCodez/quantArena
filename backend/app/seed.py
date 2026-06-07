"""
Seed the database with a sample dataset and competition.
Run: python -m app.seed
"""
from app.database import SessionLocal, engine, Base
from app.models import Dataset, Competition

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create dataset
dataset = Dataset(
    name="Sample Mixed Market",
    regime="mixed",
    is_revealed=False,
    file_path="/app/data/sample_dataset.json",
)
db.add(dataset)
db.commit()
db.refresh(dataset)

# Create competition
competition = Competition(
    title="QuantArena Challenge #1",
    description="Submit a strategy that performs well across 500 days of mixed market conditions. Your strategy function receives each candle with RSI, SMA indicators.",
    dataset_id=dataset.id,
    is_active=True,
)
db.add(competition)
db.commit()
db.refresh(competition)

print(f"Dataset ID: {dataset.id}")
print(f"Competition ID: {competition.id}")
print("Seed complete!")
db.close()
