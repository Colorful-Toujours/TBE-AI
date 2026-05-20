"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-violet-200">
              TBE
            </div>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            产品
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            解决方案
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            价格
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            关于我们
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
          <Button asChild variant="ghost" className="text-sm font-medium rounded-full px-5">
            <Link href="/login">登录</Link>
          </Button>
          <Button
            asChild
            className="text-sm font-medium rounded-full px-5 bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/login">免费试用</Link>
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border/50">
          <div className="space-y-1 px-6 py-4">
            <Link
              href="#features"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              产品
            </Link>
            <Link
              href="#how-it-works"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              解决方案
            </Link>
            <Link
              href="#pricing"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              价格
            </Link>
            <Link
              href="#testimonials"
              className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              关于我们
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild variant="ghost" className="w-full justify-center rounded-full">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  登录
                </Link>
              </Button>
              <Button asChild className="w-full justify-center rounded-full bg-foreground text-background">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  免费试用
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
