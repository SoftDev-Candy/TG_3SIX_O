from pydantic import BaseModel
from typing import Optional, Tuple


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

class Dispatcher_call(BaseModel):
    location: int
    description: Optional[str]
    title: Optional[str]
    phone_number: str
    emergency_service_need: Tuple[bool, bool, bool]
