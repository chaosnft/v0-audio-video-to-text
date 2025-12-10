import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import os from "os"

const execAsync = promisify(exec)

// Helper to validate file duration (5 minutes max = 300 seconds)
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

// Helper to convert using Whisper
async function convertWithWhisper(filePath: string, formats: string[]): Promise<Record<string, string>> {
  const outputDir = path.join(os.tmpdir(), `whisper-${Date.now()}`)
  await fs.mkdir(outputDir, { recursive: true })

  const outputs: Record<string, string> = {}
  const baseName = path.parse(filePath).name  // Lấy tên file input không extension

  // Env để force UTF-8 cho Python I/O (fix Unicode error trên Windows)
  const execOptions = {
    env: {
      ...process.env,
      PYTHONIOENCODING: 'utf-8'
    }
  }

  try {
    console.log("[v0] Starting Whisper conversion (single run for all formats, filtering selected)")

    // Chạy Whisper một lần duy nhất, KHÔNG có --output_format → generate tất cả: txt, srt, vtt, tsv, json
    const command = `whisper "${filePath}" --model small --output_dir "${outputDir}" --fp16 False`  // Thêm --language vi cho tiếng Việt (tùy chọn, nhanh hơn)
    
    try {
      const { stdout, stderr } = await execAsync(command, execOptions)
      if (stderr) {
        console.warn(`[v0] Whisper stderr:`, stderr.trim())
      }
      console.log(`[v0] Whisper stdout:`, stdout.trim())
    } catch (execError: any) {
      console.error(`[v0] Whisper exec error:`, execError.message)
      console.error(`[v0] Whisper stderr:`, execError.stderr?.toString())
      // Nếu fail, return empty để handle ở ngoài
      return outputs
    }

    // Đọc chỉ những files tương ứng với formats người dùng chọn
    for (const format of formats) {
      const outputFilePath = path.join(outputDir, `${baseName}.${format}`)
      try {
        const content = await fs.readFile(outputFilePath, "utf-8")
        outputs[format] = content
        console.log(`[v0] Read selected ${format}: ${content.length} characters`)
      } catch (readErr) {
        console.log(`[v0] Selected format ${format} not generated or error: ${readErr}`)
        // Không throw, vì có thể format không hỗ trợ (nhưng với default, tất cả đều có)
      }
    }

    console.log("[v0] Whisper single run completed, selected outputs:", Object.keys(outputs))
    return outputs
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(outputDir, { recursive: true })
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function POST(request: NextRequest) {
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

    // Convert File to buffer and save temporarily
    const buffer = await file.arrayBuffer()
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${file.name}`)

    await fs.writeFile(tempFilePath, Buffer.from(buffer))
    console.log("[v0] File saved to:", tempFilePath)

    try {
      // Check file duration
      const duration = await getFileDuration(tempFilePath)
      console.log("[v0] File duration:", duration, "seconds")

      if (duration > 300) {
        return NextResponse.json(
          { error: `File exceeds 5-minute limit (${Math.round(duration)} seconds)` },
          { status: 400 },
        )
      }

      // Convert with Whisper
      const outputs = await convertWithWhisper(tempFilePath, formats)

      if (Object.keys(outputs).length === 0) {
        return NextResponse.json(
          { error: "Conversion failed. Please ensure Whisper is installed: pip install -U openai-whisper" },
          { status: 500 },
        )
      }

      console.log("[v0] Conversion successful, generated formats:", Object.keys(outputs))

      return NextResponse.json({ outputs })
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(tempFilePath)
      } catch {
        // Ignore
      }
    }
  } catch (error) {
    console.error("[v0] Conversion error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Conversion failed",
        message: "Make sure FFmpeg and Whisper are installed on your system. See the Setup Guide for instructions.",
      },
      { status: 500 },
    )
  }
}