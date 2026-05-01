# MMM - MediaMetaManagement

A professional video metadata inspection and transcoding tool engineered for digital signage, broadcast, and high-performance web workflows.

## Features

- **Deep Metadata Inspection**: extract complete stream information using `ffprobe`.
- **Signage Compliance Score**: Automated analysis of video files against digital signage playback standards (SoC, hardware players).
- **Custom Transcoding**: Precise control over GOP, bitrates, and containers via a Neobrutalist design interface.
- **A/B Testing**: Side-by-side comparison of different transcoding variants to find the perfect quality/size balance.
- **Asset Library**: Track and manage your media assets locally.
- **Webhooks**: Automated notifications for job completion or failure.
- **Cloud Sync**: (Configurable) Sync outputs to S3, GCS, or Azure.

## Technical Stack

- **Frontend**: React 19, Vite, Tailwind CSS (Neobrutalist & Glassmorphic UI), Framer Motion.
- **Backend**: Node.js, Express, Multer, Fluent-FFMPEG.
- **State Management**: Zustand.

## Getting Started

1. **Upload**: Drag and drop a video file.
2. **Analyze**: Review the technical metadata and compatibility score.
3. **Transcode**: Select a preset or create custom settings.
4. **Compare**: Use the A/B testing tool to compare variants.

## Current Status

- **UI/UX**: Fully redesigned with a Neobrutalist aesthetic, optimized for both desktop and mobile.
- **Performance**: Support for large file uploads (up to 500MB).
- **Stability**: Hardened upload process with better error handling and increased timeouts for deep file analysis.
