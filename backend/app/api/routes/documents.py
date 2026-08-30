from fastapi import APIRouter, HTTPException
from app.schemas.documents import DocumentIngestRequest, DocumentSearchRequest
from app.services.rag import ingest_documents, search_documents

router = APIRouter()


@router.post("/ingest")
def ingest_docs(request: DocumentIngestRequest):
    count = ingest_documents(request.documents)
    return {"ingested": count}


@router.post("/search")
def search_docs(request: DocumentSearchRequest):
    results = search_documents(request.query, n_results=request.n_results)
    return {"results": results, "count": len(results)}
