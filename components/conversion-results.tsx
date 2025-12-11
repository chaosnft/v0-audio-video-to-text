// v0-audio-video-to-text\components\conversion-results.tsx
"use client"

import { Download, ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ConversionResultsProps {
  results: any
  onStartOver: () => void
}

export default function ConversionResults({ results, onStartOver }: ConversionResultsProps) {
  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onStartOver}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Start Over
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Conversion Complete</h2>
        <p className="text-white/60 mb-6">Your files are ready to download</p>

        {/* Sắp xếp theo grid ngang, responsive, max 5 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Object.entries(results.outputs || {}).map(([format, content]) => (
            <Card
              key={format}
              className="bg-white/5 border-white/10 p-4 flex flex-col justify-between hover:bg-white/10 transition-all"
            >
              <div>
                <p className="font-semibold text-white">{format.toUpperCase()} File</p>
                <p className="text-white/60 text-sm">
                  {typeof content === "string" ? `${content.length} characters` : "Ready"}
                </p>
              </div>
              <button
                onClick={() => handleDownload(`output.${format}`, content as string)}
                className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all mt-4"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}