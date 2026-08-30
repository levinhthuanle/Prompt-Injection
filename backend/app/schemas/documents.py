from pydantic import BaseModel
from typing import Optional, List


class DocumentIngestRequest(BaseModel):
    documents: List[dict]


class DocumentSearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 3
