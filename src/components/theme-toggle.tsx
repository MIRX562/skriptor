import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleTheme}
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          theme === 'dark' ? 'hidden' : ''
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          theme === 'dark' ? '' : 'hidden'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}