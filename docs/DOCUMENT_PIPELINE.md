# LifePass — Document Pipeline

**Version:** 1.0  
**Status:** Frozen baseline

## 1. Goal

Turn a user's uploaded record into structured, searchable information while maintaining a strict separation between extraction and authenticity.

## 2. Pipeline

```text
Upload
  ↓
File validation
  ↓
Secure storage
  ↓
Processing job
  ↓
OCR/text extraction
  ↓
Document classification
  ↓
Metadata extraction
  ↓
Quality checks
  ↓
Index/search representation
  ↓
Requirement matching
```

## 3. File validation

Check:
- allowed MIME type
- file size
- readable file
- basic corruption
- supported extension/content mismatch

Reject unsupported or unsafe files.

## 4. Storage

Original files are stored in Supabase Storage.

Database stores:
- storage path
- metadata
- processing state
- ownership
- timestamps

Storage access must not be public for private records.

## 5. OCR

OCR extracts observable text.

OCR output is treated as extracted content, not authoritative truth.

OCR failure:
- mark processing failed/needs review
- do not fabricate text

## 6. Document classification

Examples:
- identity proof
- address proof
- academic certificate
- transcript
- admission letter
- income proof
- employment record

Classification should return confidence.

Low confidence:
`needs_review`

## 7. Metadata extraction

Possible fields:
- holder name
- issuer name
- issue date
- expiry date
- document number
- academic year
- configured domain-specific fields

Only fields actually detected should be stored.

## 8. Verification boundary

LifePass may display an external verification status if received from an authoritative source.

It must never infer:

`OCR looks correct -> document is authentic`

That inference is prohibited.

## 9. Duplicate detection

Possible duplicate signals:
- file hash
- normalized metadata
- document identifiers when available

Duplicate detection is a warning, not an authenticity decision.

## 10. Search/indexing

Records can be represented for:
- semantic retrieval
- metadata filtering

FAISS is used for candidate retrieval when needed.

Final matching requires deterministic metadata/rule checks.

## 11. Expiry

Expiry is checked only when:
- an expiry field exists
- the requirement specifies expiry rules

No expiry date must not automatically mean invalid.

## 12. Processing states

```text
uploaded
  ↓
processing
  ↓
processed
  ↓
ready_for_matching

or

processing
  ↓
needs_review

or

processing
  ↓
failed
```

## 13. Security

Document content must only be processed for an authorized user/request.

Temporary processing access must not become permanent public access.

## 14. Prototype scope

The MVP should support a small set of reliable document categories rather than pretending to support every document type.
