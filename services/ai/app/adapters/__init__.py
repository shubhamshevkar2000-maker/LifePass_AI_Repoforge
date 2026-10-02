"""
LifePass AI — Adapters Package
Workstream 2: AI + Document Intelligence (Stage AI-4)
"""

from app.adapters.protocols import (
    AuthorizedRecordProvider,
    MatchingAdapterProtocol,
    RequirementProfileProvider,
)
from app.adapters.memory import (
    InMemoryRecordProvider,
    InMemoryRequirementProvider,
)
from app.adapters.matching import BackendMatchingAdapter

__all__ = [
    "AuthorizedRecordProvider",
    "MatchingAdapterProtocol",
    "RequirementProfileProvider",
    "InMemoryRecordProvider",
    "InMemoryRequirementProvider",
    "BackendMatchingAdapter",
]
