"""
LifePass AI — FAISS Vector Index & Record Store
Workstream 2: AI + Document Intelligence (Stage AI-3)
Reference: docs/AI_AGENT_SPEC.md Section 6 & docs/AI_WORKSTREAM_PLAN.md Stage AI-3
"""

from dataclasses import dataclass, field
import logging
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
import faiss
import numpy as np
from app.retrieval.embedding import EmbeddingProvider, LocalHashEmbeddingProvider

logger = logging.getLogger("lifepass.ai.retrieval.index")


@dataclass
class RecordDocumentEntry:
    """In-memory metadata entry associated with an indexed vector."""
    vector_id: int
    record_id: UUID
    user_id: UUID
    document_type: str
    category: str
    status: str = "processed"
    label: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    summary_text: str = ""


class FaissVectorStore:
    """
    Local FAISS Vector Index using IndexFlatIP (Cosine similarity on unit vectors).
    Provides semantic search over citizen record summaries and extracts,
    coupled with deterministic metadata and user boundary filtering.
    
    Principles:
    - Candidate discovery only; never claims authenticity or verification.
    - Enforces user_id filtering to guarantee cross-tenant record isolation.
    - Zero cloud vector DB dependencies.
    """
    def __init__(
        self,
        dimension: int = 128,
        embedding_provider: Optional[EmbeddingProvider] = None,
    ):
        self.dimension = dimension
        self.embedding_provider = embedding_provider or LocalHashEmbeddingProvider(dimension=dimension)
        self.index = faiss.IndexFlatIP(self.dimension)
        self._records_by_vector_id: Dict[int, RecordDocumentEntry] = {}
        self._records_by_record_id: Dict[UUID, RecordDocumentEntry] = {}
        self._next_vector_id = 0

    def count(self) -> int:
        """Returns the number of vectors indexed in FAISS."""
        return self.index.ntotal

    def clear(self) -> None:
        """Clears all vectors and in-memory entries."""
        self.index = faiss.IndexFlatIP(self.dimension)
        self._records_by_vector_id.clear()
        self._records_by_record_id.clear()
        self._next_vector_id = 0

    def add_record(
        self,
        record_id: UUID,
        user_id: UUID,
        document_type: str,
        category: str,
        text: str,
        label: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        status: str = "processed",
    ) -> int:
        """
        Embeds record text and adds it to the FAISS index with metadata tracking.
        Returns the assigned vector_id.
        """
        # If record already exists in store, update its entry
        if record_id in self._records_by_record_id:
            logger.info("Record %s already indexed; updating entry", record_id)
            existing_entry = self._records_by_record_id[record_id]
            existing_entry.document_type = document_type
            existing_entry.category = category
            existing_entry.label = label or existing_entry.label
            existing_entry.status = status
            if metadata:
                existing_entry.metadata.update(metadata)
            return existing_entry.vector_id

        # Compute unit vector
        vector = self.embedding_provider.get_embedding(text)
        vector_2d = np.expand_dims(vector, axis=0).astype(np.float32)

        vector_id = self._next_vector_id
        self._next_vector_id += 1

        self.index.add(vector_2d)

        entry = RecordDocumentEntry(
            vector_id=vector_id,
            record_id=record_id,
            user_id=user_id,
            document_type=document_type,
            category=category,
            status=status,
            label=label or document_type.replace("_", " ").title(),
            metadata=metadata or {},
            summary_text=text[:300],
        )

        self._records_by_vector_id[vector_id] = entry
        self._records_by_record_id[record_id] = entry

        return vector_id

    def search_candidates(
        self,
        query_text: str,
        top_k: int = 5,
        user_id_filter: Optional[UUID] = None,
        accepted_document_types: Optional[List[str]] = None,
        category_filter: Optional[str] = None,
        min_similarity: float = 0.35,
    ) -> List[Tuple[RecordDocumentEntry, float]]:
        """
        Performs semantic search with deterministic metadata filtering.
        
        Filtering rules:
        - user_id_filter: strictly ensures candidates belong ONLY to this user.
        - accepted_document_types: filters for matching document types if specified.
        - category_filter: filters for matching category if specified.
        - status: skips rejected or archived records.
        """
        if self.index.ntotal == 0 or not query_text or not query_text.strip():
            return []

        query_vec = self.embedding_provider.get_embedding(query_text)
        query_2d = np.expand_dims(query_vec, axis=0).astype(np.float32)

        # Retrieve a broader candidate pool to allow for post-filtering
        k_search = min(self.index.ntotal, max(top_k * 4, 10))
        scores, indices = self.index.search(query_2d, k_search)

        results: List[Tuple[RecordDocumentEntry, float]] = []

        for score, vector_id in zip(scores[0], indices[0]):
            if vector_id == -1 or vector_id not in self._records_by_vector_id:
                continue

            entry = self._records_by_vector_id[vector_id]

            # 1. Deterministic User Ownership Scope
            if user_id_filter is not None and entry.user_id != user_id_filter:
                continue

            # 2. Record Status Constraint
            if entry.status in ("rejected", "archived", "deleted"):
                continue

            # 3. Accepted Document Types Filter
            if accepted_document_types and entry.document_type not in accepted_document_types:
                continue

            # 4. Category Filter
            if category_filter and entry.category != category_filter:
                continue

            # Clamp cosine score to [0.0, 1.0]
            sim_score = max(0.0, min(1.0, float(score)))

            if sim_score >= min_similarity:
                results.append((entry, round(sim_score, 3)))

            if len(results) >= top_k:
                break

        # Sort descending by score
        results.sort(key=lambda x: x[1], reverse=True)
        return results
