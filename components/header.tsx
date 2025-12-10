"use client"

import { Info } from "lucide-react"

interface HeaderProps {
  onSetupClick: () => void
}

export default function Header({ onSetupClick }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Media to Text Converter</h1>
          <p className="text-white/60 mt-1 text-sm">Convert audio and video files to text using OpenAI Whisper</p>
        </div>
        <button
          onClick={onSetupClick}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
        >
          <Info className="w-4 h-4" />
          Setup Guide
        </button>
      </div>
    </header>
  )
}
