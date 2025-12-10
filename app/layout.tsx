import type React from "react"
import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"  // Add this import

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geist as V0_Font_Geist } from 'next/font/google'  // Simplified font import

// Initialize font
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "Media to Text Converter | AI-Powered Transcription",
  description:
    "Convert MP4, MP3, and audio/video files to text with OpenAI Whisper. Get transcripts in SRT, VTT, TXT, TSV, and JSON formats.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} font-sans antialiased bg-black text-white`}>
        <SessionProvider>  {/* Wrap children here */}
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}