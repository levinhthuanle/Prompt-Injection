#!/usr/bin/env python3
"""Ingest university documents into ChromaDB."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pathlib import Path
from app.services.rag import ingest_documents, get_collection

DOCS_DIR = Path(__file__).parent.parent / "app" / "data" / "documents"


def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> list:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def ingest_all():
    print("Ingesting documents into ChromaDB...")
    docs = []
    doc_id = 0

    for md_file in sorted(DOCS_DIR.glob("*.md")):
        text = md_file.read_text()
        title = md_file.stem.replace("_", " ").title()
        chunks = chunk_text(text)
        print(f"  {md_file.name}: {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            docs.append({
                "id": f"{md_file.stem}_{i}",
                "text": chunk,
                "source": md_file.name,
                "title": title,
            })
        doc_id += len(chunks)

    count = ingest_documents(docs)
    print(f"Ingested {count} document chunks from {DOCS_DIR}.")


if __name__ == "__main__":
    ingest_all()
