"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const setupCommands = [  // Giữ setup ngắn gọn ở cuối
    {
      label: "macOS (Homebrew)",
      command: "brew install ffmpeg",
      description: "Install FFmpeg on macOS using Homebrew",
    },
    {
      label: "Ubuntu/Debian",
      command: "sudo apt-get install ffmpeg",
      description: "Install FFmpeg on Ubuntu or Debian",
    },
    {
      label: "Windows (Chocolatey)",
      command: "choco install ffmpeg",
      description: "Install FFmpeg on Windows using Chocolatey",
    },
    {
      label: "Install Whisper (Python)",
      command: "pip install -U openai-whisper",
      description: "Install OpenAI Whisper Python package",
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">User Guide</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Welcome to Media to Text Converter</h3>
            <p className="text-white/70 leading-relaxed">
              Easily convert your audio and video files to text transcripts using AI-powered OpenAI Whisper.
            </p>
          </div>

          {/* Usage Steps */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
            <ol className="space-y-4 text-white/70 text-sm">
              <li>
                <strong>Step 1: Upload File</strong><br />
                Click the upload zone or drag & drop your MP3, MP4, WAV, OGG, or WebM file (max 5 minutes).
              </li>
              <li>
                <strong>Step 2: Select Formats</strong><br />
                Choose output formats like TXT (plain text), SRT (subtitles), VTT, TSV, or JSON. You can select multiple.
              </li>
              <li>
                <strong>Step 3: Convert</strong><br />
                Click "Convert to Text". A progress modal will show the steps (uploading, analyzing, transcribing, etc.).
              </li>
              <li>
                <strong>Step 4: Download</strong><br />
                Once complete, download your files directly from the results cards.
              </li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Tips</h3>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>• For best accuracy, use clear audio in supported languages (e.g., English, Vietnamese).</li>
              <li>• Files over 5 minutes will be rejected to ensure quick processing.</li>
              <li>• Processing time: ~1-2 minutes for 5-min files on standard hardware.</li>
            </ul>
          </div>

          {/* Setup (ngắn gọn) */}
          <details className="cursor-pointer">
            <summary className="text-white/70 text-sm font-medium hover:text-white transition-colors mb-2">
              Need to set up dependencies? (FFmpeg & Whisper)
            </summary>
            <div className="space-y-3 mt-3">
              <p className="text-white/70 text-sm">Install these system tools for conversion:</p>
              {setupCommands.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 bg-black/40 rounded p-2">
                    <code className="text-white/80 text-xs font-mono flex-1 break-all">{item.command}</code>
                    <button
                      onClick={() => copyToClipboard(item.command, idx)}
                      className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-white/60 text-xs">Verify: <code>ffmpeg -version</code> & <code>whisper --version</code></p>
            </div>
          </details>

          {/* Note */}
          <div className="bg-white/5 border-l-2 border-white/30 rounded-r-lg p-4">
            <p className="text-white/70 text-sm">
              <strong>Note:</strong> Conversion runs on your local machine – ensure good hardware for faster results.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-all"
          >
            Got it, start converting
          </button>
        </div>
      </div>
    </div>
  )
}