"use client"

import type React from "react"

import { useRef } from "react"
import { Upload } from "lucide-react"
import { Card } from "@/components/ui/card"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isDragActive = false

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSelectFile(file)
    }
  }

  const validateAndSelectFile = (file: File) => {
    const validTypes = ["audio/mpeg", "audio/mp3", "video/mp4", "audio/wav", "audio/ogg", "video/webm"]
    const maxSize = 5 * 60 * 1024 * 1024 // Estimated max for 5 min file

    if (!validTypes.includes(file.type)) {
      alert("Please upload an MP3, MP4, WAV, OGG, or WebM file")
      return
    }

    if (file.size > maxSize) {
      alert("File size exceeds limit. Please upload files up to 5 minutes long.")
      return
    }

    onFileSelect(file)
  }

  return (
    <Card className="bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40 transition-all p-12">
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,video/mp4,audio/wav,audio/ogg,video/webm"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full flex flex-col items-center justify-center cursor-pointer"
      >
        <Upload className="w-12 h-12 text-white/60 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          {selectedFile ? selectedFile.name : "Drop your file here"}
        </h3>
        <p className="text-white/60 text-sm">{selectedFile ? "Click to change file" : "or click to browse"}</p>
        <p className="text-white/40 text-xs mt-2">MP3, MP4, WAV, OGG, or WebM • Max 5 minutes</p>
      </button>
    </Card>
  )
}
