"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"

interface SetupModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SetupModal({ isOpen, onClose }: SetupModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const commands = [
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
          <h2 className="text-2xl font-bold text-white">Setup Instructions</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Installation Required</h3>
            <p className="text-white/70 leading-relaxed">
              This media converter requires two key components to be installed on your system:
            </p>
            <ul className="mt-4 space-y-2 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>
                  <strong>FFmpeg:</strong> Used for video/audio processing and duration validation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white mt-1">•</span>
                <span>
                  <strong>OpenAI Whisper:</strong> Python package for converting audio to text
                </span>
              </li>
            </ul>
          </div>

          {/* Installation Steps */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 1: Install FFmpeg</h3>
            <p className="text-white/70 text-sm mb-4">
              FFmpeg is a free and open-source project consisting of a vast suite of libraries and programs for handling
              video, audio, and other multimedia files.
            </p>

            <div className="space-y-3">
              {commands.slice(0, 3).map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white text-sm">{item.label}</p>
                  </div>
                  <p className="text-white/60 text-xs mb-3">{item.description}</p>
                  <div className="flex items-center gap-2 bg-black/40 rounded p-3">
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
            </div>

            <details className="mt-4 cursor-pointer">
              <summary className="text-white/70 text-sm font-medium hover:text-white transition-colors">
                Don't have a package manager? Manual installation →
              </summary>
              <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-4 text-white/70 text-sm space-y-2">
                <p>
                  <strong>Windows:</strong> Download from{" "}
                  <a
                    href="https://ffmpeg.org/download.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
                  >
                    ffmpeg.org
                  </a>{" "}
                  and add to PATH
                </p>
                <p>
                  <strong>macOS (without Homebrew):</strong> Download from{" "}
                  <a
                    href="https://ffmpeg.org/download.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-white/80"
                  >
                    ffmpeg.org
                  </a>{" "}
                  and add to PATH
                </p>
                <p>
                  <strong>Linux:</strong> Use your distribution's package manager or compile from source
                </p>
              </div>
            </details>
          </div>

          {/* Whisper Installation */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 2: Install OpenAI Whisper</h3>
            <p className="text-white/70 text-sm mb-4">
              Whisper is an open-source speech recognition model developed by OpenAI. It requires Python to be
              installed.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="font-medium text-white text-sm mb-3">Python Package Installation</p>
              <p className="text-white/60 text-xs mb-3">Make sure you have Python 3.7+ installed, then run:</p>
              <div className="flex items-center gap-2 bg-black/40 rounded p-3">
                <code className="text-white/80 text-xs font-mono flex-1 break-all">{commands[3].command}</code>
                <button
                  onClick={() => copyToClipboard(commands[3].command, 3)}
                  className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                >
                  {copiedIndex === 3 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Verify Installation</h3>
            <p className="text-white/70 text-sm mb-4">
              After installing both FFmpeg and Whisper, verify they're working:
            </p>

            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Check FFmpeg:</p>
                <div className="flex items-center gap-2 bg-black/40 rounded p-3">
                  <code className="text-white/80 text-xs font-mono">ffmpeg -version</code>
                  <button
                    onClick={() => copyToClipboard("ffmpeg -version", 4)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {copiedIndex === 4 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-white/60 text-sm mb-2">Check Whisper:</p>
                <div className="flex items-center gap-2 bg-black/40 rounded p-3">
                  <code className="text-white/80 text-xs font-mono">whisper --version</code>
                  <button
                    onClick={() => copyToClipboard("whisper --version", 5)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {copiedIndex === 5 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-white/5 border-l-2 border-white/30 rounded-r-lg p-4">
            <p className="text-white/70 text-sm">
              <strong>Note:</strong> These are system-level dependencies that must be installed separately. They are not
              installed as npm packages. The conversion will happen on your server, not in the browser.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-all"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  )
}
