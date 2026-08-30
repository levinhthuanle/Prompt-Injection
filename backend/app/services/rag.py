import logging
from typing import List, Dict, Any, Optional
import chromadb
from app.core.config import settings

logger = logging.getLogger("uniguard.rag")

COLLECTION_NAME = "university_docs"


def get_chroma_client() -> chromadb.HttpClient:
    return chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)


def get_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(COLLECTION_NAME)


def ingest_documents(documents: List[Dict[str, str]]) -> int:
    collection = get_collection()
    ids = [d["id"] for d in documents]
    texts = [d["text"] for d in documents]
    metadatas = [{"source": d.get("source", "unknown"), "title": d.get("title", "")} for d in documents]
    collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(documents)


def search_documents(query: str, n_results: int = 3) -> List[Dict[str, Any]]:
    collection = get_collection()
    try:
        results = collection.query(query_texts=[query], n_results=n_results)
    except Exception as e:
        logger.error(f"ChromaDB query error: {e}")
        return []

    docs = []
    if results and results.get("documents") and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i] if results.get("metadatas") else {}
            distance = results["distances"][0][i] if results.get("distances") else 1.0
            docs.append({
                "text": doc,
                "source": meta.get("source", ""),
                "title": meta.get("title", ""),
                "distance": round(distance, 4),
            })
    return docs


def format_retrieved_docs(docs: List[Dict[str, Any]], isolate: bool = True) -> str:
    if not docs:
        return ""
    parts = []
    for doc in docs:
        title = doc.get("title", doc.get("source", "document"))
        text = doc["text"]
        if isolate:
            parts.append(f"<UNTRUSTED_DOCUMENT source=\"{title}\">\n{text}\n</UNTRUSTED_DOCUMENT>")
        else:
            parts.append(f"--- {title} ---\n{text}")
    return "\n\n".join(parts)


def check_chroma_health() -> bool:
    try:
        client = get_chroma_client()
        client.heartbeat()
        return True
    except Exception:
        return False
