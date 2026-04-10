# VideoMeta Pro - TODO & Progress

## ✅ Included So Far

### Core Features
- **Upload & Analysis**: Drag-and-drop upload with instant technical probing.
- **Technical Analysis**: Detailed view of video, audio, and container metadata.
- **Transcoding Engine**: FFmpeg-powered processing with real-time progress tracking.
- **Preset System**: Library of Digital Signage and Web presets.
- **Custom Presets**: Full editor for creating and managing project-specific profiles.

### New "Pro" Capabilities
- **A/B Testing & Variant Comparison**:
    - **Side-by-Side Analysis**: Select multiple jobs to compare results.
    - **Technical Deltas**: Compare thumbnails, codecs, and specs.
- **Advanced Metadata Engineering**:
    - **JSON/Formatted Toggle**: Switch between UI and raw ffprobe output.
    - **Export Options**: Download analysis as JSON or CSV.
    - **Clone Settings**: Create presets directly from source video specs.
- **Compliance & Validation Engine**:
    - **Auto-Detection**: Flagging non-standard pixel formats, bitrates, and FPS.
    - **Enlightened Recommendations**: Actionable fixes for every violation.
- **Pipeline & Automation API**:
    - **Bulk Processing**: `/api/bulk-jobs` endpoint for automation.
- **UI/UX Restoration**:
    - **Fixed Navigation**: Integrated About and Documentation modals.
    - **Pro Branding**: Polished, engineering-focused interface.

## 🚀 Upcoming / Not Yet Included

### 1. Semantic Layer (Operator-Grade)
- [ ] **Derived Fields**: Orientation (landscape/portrait), HD/4K tags, FPS categories.
- [ ] **Decision Layer**: "Ready for Signage" summary (Layer 1 UI).
- [ ] **Signage Compatibility Score**: 0-100% score based on rules.

### 2. Rule-Based Validation Upgrade
- [ ] **Rule IDs**: Unique identifiers for every validation rule.
- [ ] **Detailed Rule Engine**: Move from hardcoded checks to a structured rule set.
- [ ] **Anomaly Detection**: Flagging suspicious bitrates (e.g., 2kbps audio).

### 3. Preset Intelligence
- [ ] **Preset Fit Analysis**: Automatically recommend the best preset for a source.
- [ ] **Delta View**: Show exactly what will change (e.g., "Bitrate: Increase").

### 4. Advanced Insights
- [ ] **GOP Analysis**: Keyframe interval and seekability metrics.
- [ ] **Network Suitability**: Estimated bandwidth and caching recommendations.
- [ ] **Playback Risk Model**: CPU load and startup delay estimates.

### 5. Infrastructure & Scale
- [ ] **Webhooks**: Notify external services when jobs complete.
- [ ] **Cloud Storage**: Integration with S3/GCS.
- [ ] **Visual Comparison**: Timeline-based visual diffing.
