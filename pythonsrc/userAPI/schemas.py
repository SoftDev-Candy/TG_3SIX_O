from pydantic import BaseModel
from typing import Optional


class Distruption_Submission(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    location: int
    severity: int

class Distruption_view(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    location: int
    severity: int
    file_name: Optional[str]

