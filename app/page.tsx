// v0-audio-video-to-text\app\page.tsx
"use client"

import { useState } from "react"
import UploadZone from "@/components/upload-zone"
import ConversionResults from "@/components/conversion-results"
import Header from "@/components/header"
import Footer from "@/components/footer"
import GuideModal from "@/components/guide-modal" 
import ProgressModal from "@/components/progress-modal"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [fileDuration, setFileDuration] = useState<number | null>(null)  // Thêm state duration
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["txt"])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)  // Đổi từ showSetup

  const handleFileSelect = (selectedFile: File, duration?: number) => {  // Nhận duration từ child
    if (duration && duration > 300) {
      alert(`File exceeds 5-minute limit (${Math.round(duration)} seconds). Please choose a shorter file.`)
      return
    }
    setFile(selectedFile)
    setFileDuration(duration || null)
    setError(null)
  }

  const handleConvert = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("formats", JSON.stringify(selectedFormats))

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Conversion failed")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header onGuideClick={() => setShowGuide(true)} />  {/* Đổi prop */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {!results ? (
            <div className="space-y-6">
              {/* Upload Zone - Pass handleFileSelect với duration */}
              <UploadZone 
                onFileSelect={handleFileSelect} 
                selectedFile={file}
                duration={fileDuration}  // Để hiển thị nếu cần
              />

              {/* Format Selection - Chỉnh grid và size button */}
              <Card className="bg-white/5 border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Output Formats</h2>
                <div className="grid grid-cols-5 gap-2">  {/* 5 cols ngang */}
                  {["txt", "srt", "vtt", "tsv", "json"].map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        setSelectedFormats((prev) =>
                          prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
                        )
                      }}
                      className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${  // Nhỏ hơn
                        selectedFormats.includes(format)
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      .{format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">{error}</div>
              )}

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={!file || isProcessing || selectedFormats.length === 0}
                className="w-full bg-white text-black py-3 px-6 rounded-lg font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? "Converting..." : "Convert to Text"}
              </button>
            </div>
          ) : (
            <ConversionResults results={results} onStartOver={() => setResults(null)} />
          )}
        </div>
      </div>

      <Footer />
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <ProgressModal isOpen={isProcessing} onClose={() => {}} /> 
    </main>
  )
}