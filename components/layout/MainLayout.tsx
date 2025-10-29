import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-full px-4 sm:px-6 md:w-[90%] md:max-w-[90%] lg:w-[80%] lg:max-w-[80%] lg:px-0",
        className,
      )}
    >
      {children}
    </div>
  )
}
