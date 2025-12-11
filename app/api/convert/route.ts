import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import os from "os"

const execAsync = promisify(exec)

// Helper to validate file duration
async function getFileDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:nokey=1 "${filePath}"`,
    )
    return Number.parseFloat(stdout.trim())
  } catch {
    throw new Error("Could not determine file duration. Make sure FFmpeg is installed.")
  }
}

// Helper: Extract audio từ video (nếu cần)
async function extractAudioIfVideo(filePath: string, tempDir: string): Promise<string> {
  const stats = await fs.stat(filePath)
  if (stats.size > 25 * 1024 * 1024) {
    throw new Error("File too large (max 25MB)")
  }

  // Kiểm tra nếu là video (mime type hoặc extension)
  const ext = path.extname(filePath).toLowerCase()
  if (!['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) {
    return filePath  // Đã là audio, không cần extract
  }

  console.log("[v0] Extracting audio from video...")
  const audioPath = path.join(tempDir, `audio-${Date.now()}.mp3`)
  await execAsync(
    `ffmpeg -i "${filePath}" -vn -acodec libmp3lame -ar 16000 -ac 1 "${audioPath}" -y -loglevel quiet`,
    // Params: -vn (no video), 16kHz mono (tối ưu Whisper), quiet log
  )
  console.log("[v0] Audio extracted to:", audioPath)
  return audioPath
}

// Helper functions cho formatting (dùng cho OpenAI)
function generateSRT(segments: any[]): string {
  return segments
    .map((s, i) => `${i + 1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${s.text.trim()}\n`)
    .join("\n")
}

function generateVTT(segments: any[]): string {
  return `WEBVTT\n\n${segments
    .map((s) => `${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${s.text.trim()}\n`)
    .join("\n")}`
}

function generateTSV(segments: any[]): string {
  return "start\tduration\ttext\n" + segments.map((s) => `${s.start}\t${s.end - s.start}\t${s.text.trim()}`).join("\n")
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toFixed(3).padStart(6, "0")}`
}

// Helper: Convert với OpenAI API (dùng stream để tiết kiệm memory)
async function convertWithOpenAIWhisper(inputPath: string, formats: string[]): Promise<Record<string, string>> {
  try {
    const { default: OpenAI } = await import("openai")  // Dynamic import để tránh load nếu không dùng
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    })

    console.time("[v0] OpenAI Whisper API total time")

    console.log("[v0] Starting OpenAI Whisper API conversion")

    // Gọi API với stream (không load full buffer)
    const transcription = await openai.audio.transcriptions.create({
      file: require('fs').createReadStream(inputPath),  // Stream thay buffer
      model: "whisper-1",
      response_format: "verbose_json",  // Có segments
      temperature: 0,
      language: "en",  // Hoặc bỏ để auto-detect
    })

    const segments = transcription.segments || [{ start: 0, end: 0, text: transcription.text }]
    const fullText = transcription.text

    const outputs: Record<string, string> = {}

    for (const format of formats) {
      let content = ""
      if (format === "txt") {
        content = fullText
      } else if (format === "srt") {
        content = generateSRT(segments)
      } else if (format === "vtt") {
        content = generateVTT(segments)
      } else if (format === "tsv") {
        content = generateTSV(segments)
      } else if (format === "json") {
        content = JSON.stringify({ text: fullText, segments }, null, 2)
      }
      outputs[format] = content
      console.log(`[v0] Generated ${format}: ${content.length} characters`)
    }

    console.log("[v0] OpenAI API conversion completed")
    return outputs
  } catch (error: any) {
    console.error("[v0] OpenAI API error:", error.message || error)
    throw new Error(`OpenAI transcription failed: ${error.message}`)
  } finally {
    console.timeEnd("[v0] OpenAI Whisper API total time")
  }
}

// Helper: Convert với faster-whisper (nếu có)
async function convertWithFasterWhisper(inputPath: string, formats: string[]): Promise<Record<string, string>> {
  console.time("[v0] Faster Whisper total time");
  const outputDir = path.join(os.tmpdir(), `whisper-${Date.now()}`);
  await fs.mkdir(outputDir, { recursive: true });
  const outputs: Record<string, string> = {};
  const baseName = path.parse(inputPath).name;

  try {
    console.log("[v0] Starting faster-whisper conversion");
    // Updated command: Use whisper-ctranslate2 instead of faster-whisper
    const command = `whisper-ctranslate2 "${inputPath}" --model tiny --device cpu --compute_type int8 --output_format all --output_dir "${outputDir}" --language en`;

    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    if (stderr) console.warn(`[v0] Faster-whisper stderr:`, stderr.trim());
    console.log(`[v0] Faster-whisper stdout:`, stdout.trim());

    // Read outputs (same as before)
    for (const format of formats) {
      const outputFilePath = path.join(outputDir, `${baseName}.${format}`);
      try {
        const content = await fs.readFile(outputFilePath, "utf-8");
        outputs[format] = content;
        console.log(`[v0] Read ${format}: ${content.length} characters`);
      } catch (readErr) {
        console.log(`[v0] Format ${format} not generated: ${readErr}`);
      }
    }

    if (Object.keys(outputs).length === 0) {
      throw new Error("Faster-whisper failed to generate any output");
    }

    console.log("[v0] Faster-whisper completed");
    return outputs;
  } finally {
    console.timeEnd("[v0] Faster Whisper total time");
    // Cleanup
    try {
      await fs.rm(outputDir, { recursive: true });
    } catch { }
  }
}

// Helper: Convert với original openai-whisper CLI (fallback cuối)
async function convertWithOpenAIWhisperCLI(inputPath: string, formats: string[]): Promise<Record<string, string>> {
  console.time("[v0] Original Whisper CLI total time")

  const outputDir = path.join(os.tmpdir(), `whisper-${Date.now()}`)
  await fs.mkdir(outputDir, { recursive: true })

  const outputs: Record<string, string> = {}
  const baseName = path.parse(inputPath).name

  try {
    console.log("[v0] Starting original openai-whisper CLI conversion")

    const command = `whisper "${inputPath}" --model tiny --output_dir "${outputDir}" --fp16 False --output_format all --language en`

    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    })

    if (stderr) console.warn(`[v0] Whisper CLI stderr:`, stderr.trim())
    console.log(`[v0] Whisper CLI stdout:`, stdout.trim())

    // Đọc outputs
    for (const format of formats) {
      const outputFilePath = path.join(outputDir, `${baseName}.${format}`)
      try {
        const content = await fs.readFile(outputFilePath, "utf-8")
        outputs[format] = content
        console.log(`[v0] Read ${format}: ${content.length} characters`)
      } catch (readErr) {
        console.log(`[v0] Format ${format} not generated: ${readErr}`)
      }
    }

    if (Object.keys(outputs).length === 0) {
      throw new Error("Original Whisper CLI failed to generate any output")
    }

    console.log("[v0] Original Whisper CLI completed")
    return outputs
  } finally {
    console.timeEnd("[v0] Original Whisper CLI total time")
    // Cleanup
    try {
      await fs.rm(outputDir, { recursive: true })
    } catch { }
  }
}

// Fallback chain: OpenAI API -> faster-whisper -> original whisper CLI -> error
async function convertWithWhisperFallback(inputPath: string, formats: string[]): Promise<Record<string, string>> {
  // Toggle qua env: USE_OPENAI=true/false (default true nếu có key)
  const useOpenAI = process.env.USE_OPENAI !== 'false' && !!process.env.OPENAI_API_KEY

  if (useOpenAI) {
    try {
      return await convertWithOpenAIWhisper(inputPath, formats)
    } catch (error: any) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.warn("[v0] OpenAI quota exceeded, trying faster-whisper...")
      } else {
        console.warn("[v0] OpenAI error, trying faster-whisper:", error.message)
      }
    }
  }

  // Thử faster-whisper
  try {
    return await convertWithFasterWhisper(inputPath, formats)
  } catch (error: any) {
    if (error.message.includes('not recognized') || error.message.includes('command not found')) {
      console.warn("[v0] faster-whisper not installed, falling back to original whisper CLI")
    } else {
      console.warn("[v0] faster-whisper error, trying original whisper CLI:", error.message)
    }
  }

  // Fallback cuối: original whisper CLI
  return await convertWithOpenAIWhisperCLI(inputPath, formats)
}

export async function POST(request: NextRequest) {
  let tempFilePath: string  // Declare ngoài để scope cleanup
  let audioPath: string | null = null  // Để cleanup nếu extract

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const formatsJson = formData.get("formats") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    let formats: string[] = []
    try {
      formats = JSON.parse(formatsJson)
    } catch {
      formats = ["txt"]
    }

    console.log("[v0] File received:", file.name, "- size:", file.size, "- type:", file.type)

    // Save temp file
    const buffer = await file.arrayBuffer()
    const tempDir = os.tmpdir()
    tempFilePath = path.join(tempDir, `upload-${Date.now()}-${file.name}`)

    await fs.writeFile(tempFilePath, Buffer.from(buffer))
    console.log("[v0] File saved to:", tempFilePath)

    try {
      // Check duration
      const duration = await getFileDuration(tempFilePath)
      console.log("[v0] File duration:", duration, "seconds")

      if (duration > 300) {
        return NextResponse.json(
          { error: `File exceeds 5-minute limit (${Math.round(duration)} seconds)` },
          { status: 400 },
        )
      }

      // Extract audio nếu video
      const processPath = await extractAudioIfVideo(tempFilePath, tempDir)
      audioPath = processPath === tempFilePath ? null : processPath  // Track nếu mới tạo

      // Convert với fallback chain
      const outputs = await convertWithWhisperFallback(processPath, formats)

      if (Object.keys(outputs).length === 0) {
        return NextResponse.json(
          { error: "Conversion failed. Ensure at least one method (OpenAI, faster-whisper, or openai-whisper) is available." },
          { status: 500 },
        )
      }

      console.log("[v0] Conversion successful, generated formats:", Object.keys(outputs))

      return NextResponse.json({ outputs })
    } finally {
      // Cleanup
      try {
        await fs.unlink(tempFilePath)
      } catch { }
      if (audioPath) {
        try {
          await fs.unlink(audioPath)
        } catch { }
      }
    }
  } catch (error) {
    console.error("[v0] Conversion error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Conversion failed",
        message: "Setup: For local, run 'pip install -U openai-whisper' (or 'faster-whisper' for speed). For Railway, add to nixpacks.toml. Video files are auto-extracted.",
      },
      { status: 500 },
    )
  }
}