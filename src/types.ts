export interface VideoStream {
  codec_name: string;
  width: number;
  height: number;
  r_frame_rate: string;
  bit_rate: string;
  pix_fmt: string;
  display_aspect_ratio: string;
}

export interface AudioStream {
  codec_name: string;
  channels: number;
  channel_layout: string;
  sample_rate: string;
  bit_rate: string;
}

export interface Metadata {
  format: {
    filename: string;
    nb_streams: number;
    format_name: string;
    duration: string;
    size: string;
    bit_rate: string;
  };
  streams: (VideoStream | AudioStream | any)[];
  
  // Semantic Layer (Operator-Grade)
  analysis?: {
    orientation: "landscape" | "portrait" | "square";
    is_hd: boolean;
    is_4k: boolean;
    fps_category: "low" | "standard" | "high";
    bitrate_category: "low" | "medium" | "high";
    audio_present: boolean;
    signage_compatibility_score: number; // 0-100
  };

  validation?: {
    status: "pass" | "warning" | "error";
    score: number;
    rules: {
      id: string;
      severity: "info" | "warning" | "error";
      message: string;
      recommendation: string;
    }[];
  };

  preset_fit?: {
    recommended_id: string;
    reason: string[];
    deltas: {
      field: string;
      source: string | number;
      target: string | number;
      status: "match" | "increase" | "decrease" | "change";
    }[];
  };

  advanced?: {
    gop?: {
      keyframe_interval: number;
      b_frames: number;
      seekability: "excellent" | "good" | "poor";
    };
    network?: {
      estimated_bandwidth_mbps: number;
      recommended_use: string[];
      risk: "low" | "medium" | "high";
    };
    playback?: {
      startup_delay_estimate_ms: number;
      buffer_risk: "low" | "medium" | "high";
      cpu_load_estimate: "low" | "medium" | "high";
    };
  };
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  outputContainer: string;
  video: {
    codec?: string;
    bitrate?: string;
    fps?: number;
    width?: number;
    height?: number;
  };
  audio: {
    codec?: string;
    bitrate?: string;
    channels?: number;
  };
}

export interface Job {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  priority: "low" | "standard" | "high";
  testId?: string;
  preset: Preset;
  outputFilename: string;
  thumbnailUrl?: string;
  thumbnailStrip?: string[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface Asset {
  assetId: string;
  filename: string;
  originalName: string;
  size: number;
  thumbnailUrl?: string;
}
