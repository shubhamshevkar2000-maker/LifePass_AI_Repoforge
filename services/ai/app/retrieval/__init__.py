"""
LifePass AI — Semantic Retrieval & Matching Assistance Package
Workstream 2: AI + Document Intelligence (Stage AI-3)
"""

from app.retrieval.embedding import EmbeddingProvider, LocalHashEmbeddingProvider
from app.retrieval.index import FaissVectorStore, RecordDocumentEntry
from app.retrieval.matcher import SemanticRetrievalAssistant, RetrievalAssistant
from app.retrieval.fixtures import (
    DEMO_RECORDS,
    ALICE_USER_ID,
    BOB_USER_ID,
    populate_demo_vector_store,
)

__all__ = [
    "EmbeddingProvider",
    "LocalHashEmbeddingProvider",
    "FaissVectorStore",
    "RecordDocumentEntry",
    "SemanticRetrievalAssistant",
    "RetrievalAssistant",
    "DEMO_RECORDS",
    "ALICE_USER_ID",
    "BOB_USER_ID",
    "populate_demo_vector_store",
]
