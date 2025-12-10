// components/header.tsx
"use client"

import Link from "next/link"
import { Info, User, DollarSign, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onGuideClick: () => void
}

export default function Header({ onGuideClick }: HeaderProps) {
  const { data: session, status } = useSession()

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <div className="w-40 h-10 bg-white/10 rounded flex items-center justify-center font-bold text-white text-lg transition-all hover:bg-white/20">
              Media2Text
            </div>
          </Link>
          <p className="text-white/60 text-sm hidden md:block">AI-Powered Audio/Video Transcription</p>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGuideClick}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/20"
          >
            <Info className="w-4 h-4 mr-2" />
            Guide
          </Button>

          <Link href="/pricing">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/20"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </Button>
          </Link>

          {status === "loading" ? (
            <div className="w-8 h-8 border border-white/20 rounded-full animate-spin" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/20"
                >
                  <User className="w-4 h-4 mr-2" />
                  {session.user?.name || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/30 backdrop-blur-xs border-white/10 text-white w-48">
                <DropdownMenuLabel className="text-white/80">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full cursor-pointer hover:bg-white/10">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="text-black bg-white hover:bg-white/90 font-medium">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}