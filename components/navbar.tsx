"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { Menu, User, LogOut } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const closeSheet = () => setIsOpen(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <Link href="/" className="text-xl font-bold" onClick={closeSheet}>
                  AI Recognition
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link
                    href="/"
                    className={`text-sm font-medium ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
                    onClick={closeSheet}
                  >
                    Home
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link
                        href="/dashboard"
                        className={`text-sm font-medium ${
                          isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={closeSheet}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/face-recognition"
                        className={`text-sm font-medium ${
                          isActive("/face-recognition") ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={closeSheet}
                      >
                        Face Recognition
                      </Link>
                      <Link
                        href="/text-analysis"
                        className={`text-sm font-medium ${
                          isActive("/text-analysis") ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={closeSheet}
                      >
                        Text Analysis
                      </Link>
                      <Link
                        href="/voice-recognition"
                        className={`text-sm font-medium ${
                          isActive("/voice-recognition") ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={closeSheet}
                      >
                        Voice Recognition
                      </Link>
                      <Link
                        href="/video-processing"
                        className={`text-sm font-medium ${
                          isActive("/video-processing") ? "text-primary" : "text-muted-foreground"
                        }`}
                        onClick={closeSheet}
                      >
                        Video Processing
                      </Link>
                    </>
                  )}
                  <Link
                    href="/contact"
                    className={`text-sm font-medium ${isActive("/contact") ? "text-primary" : "text-muted-foreground"}`}
                    onClick={closeSheet}
                  >
                    Contact
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-xl font-bold hidden md:block">
            AI Recognition
          </Link>
          <Link href="/" className="text-xl font-bold md:hidden">
            AI Rec
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium ${
                    isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/face-recognition"
                  className={`text-sm font-medium ${
                    isActive("/face-recognition") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Face
                </Link>
                <Link
                  href="/text-analysis"
                  className={`text-sm font-medium ${
                    isActive("/text-analysis") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Text
                </Link>
                <Link
                  href="/voice-recognition"
                  className={`text-sm font-medium ${
                    isActive("/voice-recognition") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Voice
                </Link>
                <Link
                  href="/video-processing"
                  className={`text-sm font-medium ${
                    isActive("/video-processing") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Video
                </Link>
              </>
            )}
            <Link
              href="/contact"
              className={`text-sm font-medium ${
                isActive("/contact") ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

