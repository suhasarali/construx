"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLocked, setIsLocked] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    const handleMouseEnter = () => {
        if (!isLocked) setIsOpen(true)
    }

    const handleMouseLeave = () => {
        if (!isLocked) setIsOpen(false)
    }

    const handleClick = () => {
        setIsLocked(!isLocked)
        setIsOpen(true) // Ensure it opens/stays open when clicked
    }

    // Close when an option is selected
    const handleSelect = (newTheme: string) => {
        setTheme(newTheme)
        setIsLocked(false)
        setIsOpen(false)
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={handleClick}
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 focus:outline-none ${isLocked ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Laptop size={20} />}
            </button>

            {(isOpen || isLocked) && (
                <div className="absolute right-0 top-12 z-50 flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={() => handleSelect("light")}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                    >
                        <Sun size={16} />
                        <span>Light</span>
                    </button>
                    <button
                        onClick={() => handleSelect("dark")}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                    >
                        <Moon size={16} />
                        <span>Dark</span>
                    </button>
                    <button
                        onClick={() => handleSelect("system")}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${theme === 'system' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                    >
                        <Laptop size={16} />
                        <span>System</span>
                    </button>
                </div>
            )}
        </div>
    )
}
