import { GlobeExplorer } from "@/components/globe-explorer"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="absolute right-4 top-4 z-10">
          <ModeToggle />
        </div>
        <GlobeExplorer />
      </main>
    </ThemeProvider>
  )
}
