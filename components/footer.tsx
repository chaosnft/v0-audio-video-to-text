"use client"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-white mb-3">About</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Fast and accurate media transcription powered by OpenAI's Whisper model. Convert your audio and video
              files to text with multiple output formats.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-white mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Support for MP3, MP4, WAV, OGG, WebM</li>
              <li>• Multiple output formats (TXT, SRT, VTT, TSV, JSON)</li>
              <li>• Up to 5 minutes of audio/video</li>
              <li>• Powered by OpenAI Whisper</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-3">Information</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Maximum file duration: 5 minutes</li>
              <li>• Supported formats: MP3, MP4, WAV, OGG, WebM</li>
              <li>• Local processing for privacy</li>
              <li>• No file size upload limits beyond 5 min duration</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/40 text-sm">Built with Next.js and OpenAI Whisper</p>
          <p className="text-white/40 text-sm mt-4 md:mt-0">{new Date().getFullYear()} Media to Text Converter</p>
        </div>
      </div>
    </footer>
  )
}
