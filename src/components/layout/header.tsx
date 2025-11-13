'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/lib/constants'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: '/', label: 'Live Scores' },
    { href: '/fixtures', label: 'Schedules' },
    { href: '/standings', label: 'Standings' },
  ]

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only-focusable bg-primary text-primary-foreground sr-only fixed top-4 left-4 z-50 rounded-md px-4 py-2"
      >
        Skip to main content
      </a>

      <header className="border-b" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="hover:text-primary text-xl font-bold transition-colors"
              aria-label={`${APP_CONFIG.NAME} - Home`}
            >
              {APP_CONFIG.NAME} ⚽
            </Link>

            <nav className="flex items-center gap-6" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'hover:text-primary text-sm font-medium transition-colors',
                    pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <Sun
                  className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
                  aria-hidden="true"
                />
                <Moon
                  className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
                  aria-hidden="true"
                />
                <span className="sr-only">Toggle between light and dark mode</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
    </>
  )
}
