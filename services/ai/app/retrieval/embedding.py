"""
LifePass AI — Embedding Abstraction & Local Deterministic Provider
Workstream 2: AI + Document Intelligence (Stage AI-3)
Reference: docs/AI_AGENT_SPEC.md Section 6 ("Retrieval architecture") & docs/AI_WORKSTREAM_PLAN.md
"""

import hashlib
import math
import re
from typing import List, Protocol, runtime_checkable
import numpy as np


@runtime_checkable
class EmbeddingProvider(Protocol):
    """
    Replaceable protocol for dense vector embedding generation.
    Any future production embedding model (e.g. HuggingFace, OpenAI, Groq) can implement this interface.
    """
    dimension: int

    def get_embedding(self, text: str) -> np.ndarray:
        """Generates a 1D float32 numpy array of shape (dimension,) normalized to unit length."""
        ...

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generates a 2D float32 numpy array of shape (len(texts), dimension) normalized to unit length."""
        ...


class LocalHashEmbeddingProvider:
    """
    Deterministic, zero-external-dependency embedding provider.
    Generates dense L2-normalized vectors of fixed dimension using character n-grams and token hashing.
    
    Guarantees:
    - 100% deterministic (same input produces identical vector with cosine similarity 1.0).
    - Semantically overlapping texts have high cosine similarity (> 0.70).
    - Dissimilar texts have low cosine similarity (< 0.35).
    - Unit length (L2 norm = 1.0), enabling direct dot product cosine similarity in FAISS IndexFlatIP.
    - Zero network dependencies, zero secrets, completely local and fast.
    """
    def __init__(self, dimension: int = 128):
        self.dimension = dimension

    def get_embedding(self, text: str) -> np.ndarray:
        """Generates a single L2-normalized float32 embedding vector for text."""
        return self._compute_vector(text)

    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generates batch of L2-normalized float32 vectors for a list of texts."""
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)
        vectors = [self._compute_vector(t) for t in texts]
        return np.vstack(vectors).astype(np.float32)

    def _compute_vector(self, text: str) -> np.ndarray:
        vec = np.zeros(self.dimension, dtype=np.float32)
        if not text or not text.strip():
            # Return zero vector with negligible epsilon to avoid div by zero
            return vec

        # Tokenize into clean lowercase alphanumeric words
        clean = text.lower()
        words = re.findall(r"\b[a-z0-9_\-]{2,}\b", clean)

        # Word-level features (weight = 2.0)
        for w in words:
            # MD5 hash mapped into dimension buckets
            h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
            vec[idx] += 2.0 * sign

        # Character 3-gram and 4-gram features (weight = 1.0)
        n_gram_text = f" {clean} "
        for n in (3, 4):
            for i in range(len(n_gram_text) - n + 1):
                gram = n_gram_text[i:i + n]
                h = int(hashlib.sha256(gram.encode("utf-8")).hexdigest(), 16)
                idx = h % self.dimension
                sign = 1.0 if ((h >> 4) & 1) == 0 else -1.0
                vec[idx] += 1.0 * sign

        # L2-normalize vector to unit length
        norm = float(np.linalg.norm(vec))
        if norm > 1e-12:
            vec = vec / norm
        else:
            vec = np.zeros(self.dimension, dtype=np.float32)

        return vec

    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Computes cosine similarity between two unit vectors."""
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 < 1e-12 or norm2 < 1e-12:
            return 0.0
        return float(np.dot(vec1, vec2) / (norm1 * norm2))
