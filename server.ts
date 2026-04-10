import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, "uploads");
const OUTPUTS_DIR = path.join(__dirname, "outputs");
const THUMBS_DIR = path.join(__dirname, "thumbnails");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR);
if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({ storage });

const jobs = new Map<string, any>();

// Helper to generate thumbnail
async function generateThumbnail(inputPath: string, outputDir: string, filename: string, time = "50%") {
  return new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Thumbnail generation timed out"));
    }, 15000); // 15 second timeout

    ffmpeg(inputPath)
      .screenshots({
        timestamps: [time],
        filename: filename,
        folder: outputDir,
        size: "320x?",
      })
      .on("end", () => {
        clearTimeout(timeout);
        resolve(filename);
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use("/thumbnails", express.static(THUMBS_DIR));

  // Global error handler for the app
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  // API Routes
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const assetId = req.file.filename.split(".")[0];
    const thumbFilename = `${assetId}.jpg`;
    
    // Generate thumbnail asynchronously to avoid blocking the upload response
    generateThumbnail(req.file.path, THUMBS_DIR, thumbFilename, "00:00:01").catch((err) => {
      console.error("Failed to generate source thumbnail:", err);
    });

    res.json({
      assetId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      thumbnailUrl: `/thumbnails/${thumbFilename}`,
    });
  });

  app.get("/api/metadata/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return res.status(500).json({ error: "Failed to extract metadata", details: err.message });
      }

      // Rule-Based Validation Engine
      const rules: { id: string; severity: "info" | "warning" | "error"; message: string; recommendation: string }[] = [];
      let score = 100;
      
      const videoStream = metadata.streams.find((s) => s.codec_type === "video");
      const audioStream = metadata.streams.find((s) => s.codec_type === "audio");
      
      // 1. Semantic Analysis
      const analysis: any = {
        orientation: "landscape",
        is_hd: false,
        is_4k: false,
        fps_category: "standard",
        bitrate_category: "medium",
        audio_present: !!audioStream,
        signage_compatibility_score: 100,
      };

      if (videoStream) {
        // Orientation
        if (videoStream.width > videoStream.height) analysis.orientation = "landscape";
        else if (videoStream.width < videoStream.height) analysis.orientation = "portrait";
        else analysis.orientation = "square";

        // Resolution categories
        if (videoStream.width >= 3840 || videoStream.height >= 3840) analysis.is_4k = true;
        if (videoStream.width >= 1920 || videoStream.height >= 1920) analysis.is_hd = true;

        // FPS parsing
        let fps = 30;
        if (videoStream.r_frame_rate) {
          const parts = videoStream.r_frame_rate.split("/");
          fps = parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : parseFloat(videoStream.r_frame_rate);
        }
        if (fps < 24) analysis.fps_category = "low";
        else if (fps > 60) analysis.fps_category = "high";

        // Bitrate categories
        const bitrate = parseInt(videoStream.bit_rate || "0");
        if (bitrate < 1000000) analysis.bitrate_category = "low";
        else if (bitrate > 25000000) analysis.bitrate_category = "high";

        // 2. Validation Rules
        // Pixel Format
        if (videoStream.pix_fmt && !["yuv420p", "yuvj420p"].includes(videoStream.pix_fmt)) {
          rules.push({
            id: "pix_fmt_non_standard",
            severity: "warning",
            message: `Non-standard pixel format: ${videoStream.pix_fmt}`,
            recommendation: "Use yuv420p for maximum hardware compatibility.",
          });
          score -= 15;
        }

        // Bitrate
        if (bitrate > 50000000) {
          rules.push({
            id: "bitrate_extreme",
            severity: "warning",
            message: "Extremely high bitrate detected (>50Mbps)",
            recommendation: "Consider reducing bitrate to 15-25Mbps for SoC players.",
          });
          score -= 20;
        }

        // FPS
        if (fps > 60) {
          rules.push({
            id: "fps_high",
            severity: "error",
            message: `High frame rate: ${fps.toFixed(2)} fps`,
            recommendation: "Most signage players cap at 60fps. Transcode to 30 or 60 fps.",
          });
          score -= 30;
        }

        // Audio Anomaly
        if (audioStream) {
          const audioBitrate = parseInt(audioStream.bit_rate || "0");
          if (audioBitrate > 0 && audioBitrate < 32000) {
            rules.push({
              id: "audio_bitrate_low",
              severity: "warning",
              message: `Audio bitrate unusually low (${(audioBitrate/1000).toFixed(1)} kbps)`,
              recommendation: "Check source audio quality or transcode to 128kbps+.",
            });
            score -= 10;
          }
        } else {
          rules.push({
            id: "no_audio",
            severity: "info",
            message: "No audio stream detected",
            recommendation: "Recommended for silent signage displays.",
          });
        }
      }

      analysis.signage_compatibility_score = Math.max(0, score);

      // 3. Advanced Insights (Simulated for now based on probe data)
      const bitRateStr = String(metadata.format.bit_rate || "0");
      const advanced = {
        gop: {
          keyframe_interval: 60,
          b_frames: 2,
          seekability: "good" as "excellent" | "good" | "poor",
        },
        network: {
          estimated_bandwidth_mbps: (parseInt(bitRateStr) / 1000000) * 1.2,
          recommended_use: ["LAN", "cached playback"],
          risk: (parseInt(bitRateStr) > 20000000 ? "medium" : "low") as "low" | "medium" | "high",
        },
        playback: {
          startup_delay_estimate_ms: 150,
          buffer_risk: "low" as "low" | "medium" | "high",
          cpu_load_estimate: (analysis.is_4k ? "high" : "medium") as "low" | "medium" | "high",
        }
      };

      res.json({
        ...metadata,
        analysis,
        validation: {
          status: rules.some(r => r.severity === "error") ? "error" : rules.some(r => r.severity === "warning") ? "warning" : "pass",
          score: analysis.signage_compatibility_score,
          rules,
        },
        advanced
      });
    });
  });

  app.post("/api/jobs", (req, res) => {
    const { assetId, filename, preset } = req.body;
    const jobId = uuidv4();
    const inputPath = path.join(UPLOADS_DIR, filename);
    const outputFilename = `${jobId}_${preset.name.replace(/\s+/g, "_")}.${preset.outputContainer || "mp4"}`;
    const outputPath = path.join(OUTPUTS_DIR, outputFilename);
    const thumbFilename = `thumb_${jobId}.jpg`;

    const job: {
      id: string;
      status: string;
      progress: number;
      preset: any;
      outputFilename: string;
      thumbnailUrl?: string;
      createdAt: string;
      error?: string;
      completedAt?: string;
    } = {
      id: jobId,
      status: "queued",
      progress: 0,
      preset,
      outputFilename,
      createdAt: new Date().toISOString(),
    };

    jobs.set(jobId, job);

    // Start processing asynchronously
    const command = ffmpeg(inputPath);

    // Apply preset settings
    if (preset.video) {
      if (preset.video.codec) command.videoCodec(preset.video.codec);
      if (preset.video.bitrate) command.videoBitrate(preset.video.bitrate);
      if (preset.video.fps) command.fps(preset.video.fps);
      if (preset.video.width && preset.video.height) {
        command.size(`${preset.video.width}x${preset.video.height}`);
      }
    }

    if (preset.audio) {
      if (preset.audio.codec) command.audioCodec(preset.audio.codec);
      if (preset.audio.bitrate) command.audioBitrate(preset.audio.bitrate);
      if (preset.audio.channels) command.audioChannels(preset.audio.channels);
    }

    if (preset.outputContainer) {
      command.format(preset.outputContainer);
    }

    command
      .on("start", () => {
        job.status = "processing";
      })
      .on("progress", (progress) => {
        job.progress = Math.round(progress.percent || 0);
      })
      .on("error", (err) => {
        console.error(`Job ${jobId} failed:`, err.message);
        job.status = "failed";
        job.error = err.message;
      })
      .on("end", async () => {
        job.status = "completed";
        job.progress = 100;
        job.completedAt = new Date().toISOString();
        
        // Generate thumbnail for output
        try {
          await generateThumbnail(outputPath, THUMBS_DIR, thumbFilename);
          job.thumbnailUrl = `/thumbnails/${thumbFilename}`;
        } catch (err) {
          console.error(`Failed to generate thumbnail for job ${jobId}:`, err);
        }
      })
      .save(outputPath);

    res.json({ jobId });
  });

  app.get("/api/jobs/:jobId", (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  });

  app.get("/api/download/:jobId", (req, res) => {
    const job = jobs.get(req.params.jobId);
    if (!job || job.status !== "completed") {
      return res.status(404).json({ error: "Output not ready or job not found" });
    }
    const filePath = path.join(OUTPUTS_DIR, job.outputFilename);
    res.download(filePath, job.outputFilename);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bulk Job Creation
  app.post("/api/bulk-jobs", (req, res) => {
    const { filenames, preset } = req.body;

    if (!filenames || !Array.isArray(filenames) || !preset) {
      return res.status(400).json({ error: "Missing filenames array or preset" });
    }

    const jobIds: string[] = [];

    filenames.forEach((filename) => {
      const jobId = uuidv4();
      const inputPath = path.join(UPLOADS_DIR, filename);
      const outputFilename = `transcoded-${jobId}-${filename.split(".")[0]}.${preset.outputContainer}`;
      const outputPath = path.join(OUTPUTS_DIR, outputFilename);

      if (!fs.existsSync(inputPath)) return;

      const job = {
        id: jobId,
        status: "queued",
        progress: 0,
        preset,
        outputFilename,
        createdAt: new Date().toISOString(),
      };

      jobs.set(jobId, job);
      jobIds.push(jobId);

      // Start processing
      const command = ffmpeg(inputPath);

      // Apply preset settings
      if (preset.video.codec) command.videoCodec(preset.video.codec);
      if (preset.video.bitrate) command.videoBitrate(preset.video.bitrate);
      if (preset.video.fps) command.fps(preset.video.fps);
      if (preset.video.width && preset.video.height) {
        command.size(`${preset.video.width}x${preset.video.height}`);
      }

      if (preset.audio) {
        if (preset.audio.codec) command.audioCodec(preset.audio.codec);
        if (preset.audio.bitrate) command.audioBitrate(preset.audio.bitrate);
        if (preset.audio.channels) command.audioChannels(preset.audio.channels);
      }

      command
        .on("start", () => {
          jobs.set(jobId, { ...jobs.get(jobId)!, status: "processing" });
        })
        .on("progress", (progress) => {
          jobs.set(jobId, { ...jobs.get(jobId)!, progress: Math.round(progress.percent || 0) });
        })
        .on("end", async () => {
          const thumbnailFilename = `thumb-${jobId}.jpg`;
          
          try {
            await generateThumbnail(outputPath, THUMBS_DIR, thumbnailFilename);
            jobs.set(jobId, {
              ...jobs.get(jobId)!,
              status: "completed",
              progress: 100,
              thumbnailUrl: `/thumbnails/${thumbnailFilename}`,
            });
          } catch (err) {
            jobs.set(jobId, { ...jobs.get(jobId)!, status: "completed", progress: 100 });
          }
        })
        .on("error", (err) => {
          console.error(`Job ${jobId} failed:`, err.message);
          jobs.set(jobId, { ...jobs.get(jobId)!, status: "failed" });
        })
        .save(outputPath);
    });

    res.json({ jobIds });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Handle process-level errors to prevent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

startServer();
