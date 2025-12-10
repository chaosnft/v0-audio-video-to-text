"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Upload } from "lucide-react"
import { Card } from "@/components/ui/card"

interface UploadZoneProps {
  onFileSelect: (file: File, duration?: number) => void  // Thêm duration
  selectedFile: File | null
  duration?: number | null  // Để hiển thị nếu cần
}

export default function UploadZone({ onFileSelect, selectedFile, duration }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoadingDuration, setIsLoadingDuration] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await validateAndSelectFile(file)
    }
  }

  const validateAndSelectFile = async (file: File) => {
    const validTypes = ["audio/mpeg", "audio/mp3", "video/mp4", "audio/wav", "audio/ogg", "video/webm"]
    const maxSize = 5 * 60 * 1024 * 1024  // Giữ size check

    if (!validTypes.includes(file.type)) {
      alert("Please upload an MP3, MP4, WAV, OGG, or WebM file")
      return
    }

    if (file.size > maxSize) {
      alert("File size exceeds estimated limit. Checking duration...")
    }

    // Client-side duration check
    setIsLoadingDuration(true)
    let fileDuration: number | undefined = undefined
    try {
      const blobUrl = URL.createObjectURL(file)
      const video = document.createElement('video')  // Dùng video cho cả audio/video
      video.src = blobUrl

      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          fileDuration = video.duration
          URL.revokeObjectURL(blobUrl)
          resolve(true)
        }, { once: true })
        video.addEventListener('error', reject, { once: true })
        video.load()
      })

      if (fileDuration && fileDuration > 300) {
        alert(`File exceeds 5-minute limit (${Math.round(fileDuration)} seconds). Please choose a shorter file.`)
        setIsLoadingDuration(false)
        return
      }
    } catch (err) {
      console.warn("Could not check duration client-side:", err)
      // Fallback: Chỉ size check, backend sẽ handle
    } finally {
      setIsLoadingDuration(false)
    }

    onFileSelect(file, fileDuration)
  }

  return (
    <Card className="bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 transition-all p-12">
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,video/mp4,audio/wav,audio/ogg,video/webm"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoadingDuration}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoadingDuration}
        className="w-full flex flex-col items-center justify-center cursor-pointer disabled:opacity-50"
      >
        <Upload className="w-12 h-12 text-white/60 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {selectedFile ? selectedFile.name : "Drop your file here"}
          {isLoadingDuration && " (Checking duration...)"}
        </h3>
        <p className="text-white/60 text-sm">{selectedFile ? "Click to change file" : "or click to browse"}</p>
        {duration && <p className="text-white/40 text-xs mt-2">Duration: {Math.round(duration)}s</p>}
        <p className="text-white/40 text-xs mt-2">MP3, MP4, WAV, OGG, or WebM • Max 5 minutes</p>
      </button>
    </Card>
  )
}