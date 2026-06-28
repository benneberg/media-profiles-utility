# MMM MediaMetaManagement - TODO & Progress

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
    - **Rule-Based System**: Unique IDs and severity levels for all checks.
- **Semantic Layer (Operator-Grade)**:
    - **Derived Fields**: Orientation (landscape/portrait), HD/4K tags, FPS categories.
    - **Decision Layer**: "Ready for Signage" summary (Layer 1 UI).
    - **Signage Compatibility Score**: 0-100% score based on rules.
- **Advanced Insights**:
    - **GOP Analysis**: Keyframe interval and seekability metrics.
    - **Network Suitability**: Estimated bandwidth and caching recommendations.
    - **Playback Risk Model**: CPU load and startup delay estimates.
- **Preset Intelligence**:
    - **Preset Fit Analysis**: Automatically recommend the best preset for a source.
    - **Delta View**: Show exactly what will change (e.g., "Bitrate: Increase").
- **Pipeline & Automation API**:
    - **Bulk Processing**: `/api/bulk-jobs` and `/api/jobs` with priority support.
    - **Webhooks**: Real-time notifications for external services.
    - **API Documentation**: Integrated documentation for system integration.
- **Visual Intelligence**:
    - **Thumbnail Strip**: Multi-point visual timeline for spot-checking.
- **Infrastructure Foundations**:
    - **Asset Library**: Manage multiple uploaded assets for bulk workflows.
    - **Cloud Storage Config**: UI for S3/GCS integration.
- **UI/UX Restoration**:
    - **Fixed Navigation**: Integrated About and Documentation modals.
    - **Pro Branding**: Polished, engineering-focused interface.

## 🚀 Upcoming / Not Yet Included

### 1. Visual Intelligence
- [ ] **Timeline-Based Comparison**: Frame-by-frame visual diffing between source and variant.
- [ ] **Waveform/Vectorscope**: Basic visual analysis of color and luminance.

### 2. Infrastructure & Scale
- [ ] **Distributed Workers**: Architecture for scaling transcoding across multiple nodes.
- [ ] **User Auth & Teams**: Multi-user support for collaborative media management.


## Notes:
Integrate a lightweight video preview component within the AssetLibrary to allow users to play back their uploaded assets before starting a transcoding job. Add an 'Export Metadata' button to the MetadataViewer component that allows users to download the current metadata as a JSON or CSV file. Add a search bar to the MetadataViewer component to filter and find specific video metadata fields quickly when inspecting large files. In the MetadataViewer component, add a toggle to visually highlight differences when comparing the current asset's metadata against a saved preset's requirements. Implement a thumbnail generation feature. When a video is processed, extract a keyframe (e.g., at the 10-second mark or mid-point) and save it as a JPEG image. Display these thumbnails in the UI where video assets are listed.

Implement batch processing functionality. Users should be able to select multiple video files and apply the same preset to all of them in a single job request. The UI should clearly indicate batch job status and provide per-file output details.

Implement a user authentication system. Users should be able to sign up with email and password, log in, and log out. Store user data securely and protect against common vulnerabilities like XSS and CSRF.