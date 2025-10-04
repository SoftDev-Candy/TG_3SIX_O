import uvicorn
import datetime
import json
import shutil
from typing import List
from fastapi import FastAPI, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import select, create_engine
from models import Distruption, Base
from schemas import Distruption_Submission, Distruption_view
from pathlib import Path

app = FastAPI()

sqlite_file_name = "../../sqlitedb.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url)
SessionLocal = sessionmaker(engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/view-data/", response_model=List[Distruption_view])
def view_data(db: Session = Depends(get_db)):
    query = select(Distruption)
    query_result = db.scalars(query)

    return query_result


@app.post("/submit-distruption/")
def submit_distruption(dist_data: str = Form(...),file: UploadFile = File(None) ,db: Session = Depends(get_db)):
    created_at = datetime.datetime.now(datetime.timezone.utc).date()
    dist_data = Distruption_Submission.model_validate(json.loads(dist_data))
    file_name = None
    if file:
        file_name = file.filename
        print("SAVE")            
        file_path = Path(__file__).parent.parent.parent / "usr_imgs" / Path(file.filename).name
        print(file_path)
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    distruption = Distruption(id=dist_data.id, owner_id=dist_data.owner_id, title=dist_data.title,
                              description=dist_data.description, location=dist_data.location, severity=dist_data.severity, file_name=file_name, created_at=created_at)

    db.add(distruption)
    db.commit()


    return {"info": "success"}


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    uvicorn.run(app, host="127.0.0.1", port=8000)
    print("exit")
