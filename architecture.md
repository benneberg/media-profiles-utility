# MMM MediaMetaManagement - Architecture Document

## 1. Overview
A queue-driven media processing system designed for large file handling, deterministic validation, and scalable transcoding.

## 2. High-Level Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Zustand
- **API**: Express.js (Node.js)
- **Processing**: FFmpeg + ffprobe + MediaInfo
- **Storage**: Local File System (Simulated S3)

## 3. Core Principles
- Stateless API
- Async processing
- Direct file transfer
- Provider abstraction

## 4. Backend Services

### API Layer
- Auth, ingest, profiles, jobs, results

### Metadata Service
- ffprobe + MediaInfo
- Canonical normalization
- **Semantic Layer**: Derived fields (orientation, categories, scores)

### Validation Service
- Rule engine
- Deterministic output
- Severity scoring

### Transformation Service
- FFmpeg-based
- Provider abstraction

### Comparison Service
- Metadata + validation diff
- Numeric deltas

## 5. Data Model (Core Entities)
- **Assets**: Source files and metadata
- **Jobs**: Transcoding tasks and progress
- **Presets**: Reusable processing profiles
- **Validation Results**: Rule-based compliance reports

## 6. Processing Flow
1. **Ingest**: Upload → store → create asset
2. **Analyze**: ffprobe → normalize → **Semantic Analysis**
3. **Validate**: Apply rules → store result
4. **Transform**: Queue → FFmpeg → store variant

## 7. Scaling Strategy
Scale independently:
- API
- Metadata workers
- Validation workers
- Transcode workers
