// v0-audio-video-to-text\components\progress-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void 
}

const progressSteps = [
  "Uploading and validating file...",
  "Analyzing duration and extracting audio...",
  "Detecting language ...",
  "Transcribing with Whisper AI...",
  "Generating selected formats...",
  "Finalizing outputs..."
]

export default function ProgressModal({ isOpen }: ProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    let stepIndex = 0
    let charIndex = 0
    let isPaused = false

    const stepTimes = [1000, 2000, 3000, 60000, 2000, 1000]  // ms for each step

    const advanceStep = () => {
      if (stepIndex >= progressSteps.length) {
        // Complete
        return
      }

      setCurrentStep(stepIndex)
      setIsTyping(true)
      setDisplayedText("")
      charIndex = 0

      const typeText = () => {
        if (charIndex < progressSteps[stepIndex].length && isTyping) {
          setDisplayedText((prev) => prev + progressSteps[stepIndex][charIndex])
          charIndex++
          setTimeout(typeText, 30)  // Smoother typing: 30ms/char
        } else {
          setIsTyping(false)
          // Pause for step duration, then next step
          setTimeout(() => {
            stepIndex++
            advanceStep()
          }, stepTimes[stepIndex])
        }
      }

      typeText()
    }

    advanceStep()

    return () => {
      isPaused = true
    }
  }, [isOpen])

  useEffect(() => {
    // Smooth scroll to bottom when new step added
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [currentStep, displayedText])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header with Shimmer Effect */}
        <div className="sticky top-0 bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between relative overflow-hidden">
          <div className="relative">
            <h2 className="text-xl font-bold text-white">Processing</h2>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-75">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow" />
            </div>
          </div>
          <button className="text-white/60 hover:text-white transition-colors" disabled>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps List - Smooth slide in */}
        <div ref={containerRef} className="p-6 space-y-4 flex flex-col overflow-y-auto">
          {progressSteps.slice(0, currentStep + 1).map((step, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 transform transition-all duration-500 ease-out ${
                idx === currentStep
                  ? "opacity-100 translate-y-0"
                  : "opacity-100 translate-y-0 delay-${idx * 100}ms"
              }`}
              style={{
                animationDelay: `${idx * 200}ms`, // Staggered entrance
              }}
            >
              <div className="w-2 h-2 bg-white/40 rounded-full mt-2 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className={`text-white/80 text-sm leading-relaxed ${
                  idx === currentStep && isTyping ? "typing-text" : ""
                }`}>
                  {idx === currentStep ? displayedText : step}
                  {idx === currentStep && isTyping && <span className="inline-block w-1 ml-1 bg-white animate-blink" />}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite linear;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .typing-text {
          overflow: hidden;
          border-right: 2px solid transparent;
        }
      `}</style>
    </div>
  )
}