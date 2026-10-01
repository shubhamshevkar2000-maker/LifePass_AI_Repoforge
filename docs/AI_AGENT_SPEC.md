# LifePass — AI Agent Specification

**Version:** 1.0  
**Status:** Frozen baseline

## 1. AI philosophy

The LLM is an assistant inside a controlled system.

It is NOT the authority.

```text
LLM = understand + retrieve + explain
Backend = validate + match + authorize + calculate
Trusted source = authenticity authority
User = consent authority
Institution = final business decision authority
```

## 2. AI responsibilities

### A. Intent understanding

Input:
> "I want to apply for an education loan."

Output must be structured:

```json
{
  "intent": "loan_application",
  "task": "education_loan",
  "domain": "finance",
  "institution_type": "bank",
  "confidence": 0.94
}
```

The output must be schema-validated.

### B. Requirement retrieval

The AI retrieves from the controlled requirement knowledge base.

It must NOT invent required documents.

If no suitable requirement profile exists:
- return `unknown_requirement_profile`
- ask for clarification or route to manual configuration

### C. Document classification

Classify an uploaded record into known document types.

Example:
```json
{
  "document_type": "academic_certificate",
  "category": "education",
  "confidence": 0.96
}
```

Low confidence must result in review/attention state.

### D. Metadata extraction

Extract observable information from the document:
- name
- issuer field
- dates
- document number where appropriate
- category
- other configured fields

Extraction is not verification.

### E. Explanation

Turn deterministic system results into understandable language.

Example:
> "You have 4 of the 5 required records. Your admission letter is missing."

The explanation must use only supplied structured facts.

## 3. Hard prohibition

The AI MUST NOT:
- declare a document authentic
- claim issuer confirmation without an issuer response
- decide that extracted facts are true
- approve/reject an institutional application
- invent requirements
- invent records
- invent verification status
- fabricate API responses
- fabricate government/institution integrations

## 4. Prompt structure

Every production prompt should define:
- role
- task
- allowed inputs
- required output schema
- prohibited behavior
- uncertainty behavior

## 5. Hallucination handling

When information is unavailable:
- say it is unavailable
- return structured uncertainty
- do not guess

Example:

```json
{
  "status": "uncertain",
  "reason": "No authoritative source response available."
}
```

## 6. Retrieval architecture

```text
User request
    ↓
Intent LLM
    ↓
Structured task
    ↓
Requirement KB retrieval
    ↓
Candidate records
    ↓
FAISS semantic retrieval
    +
PostgreSQL metadata filtering
    ↓
Deterministic matching
    ↓
Explanation LLM
```

## 7. Model outputs

All important structured outputs must be Pydantic/schema validated before use.

Free-form output cannot:
- update database authorization
- change consent
- set verification status
- set final readiness
- grant institution access

## 8. AI service failures

If the LLM is unavailable:
- existing records must remain accessible
- deterministic workflows should continue where possible
- show a recoverable error
- never substitute fabricated output

## 9. Versioning

Store AI/prompt/processing version where AI-generated structured processing is persisted.

This supports debugging and reproducibility.
