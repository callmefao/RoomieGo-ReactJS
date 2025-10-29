"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorOverlayContextValue {
  showError: (message: string, options?: { duration?: number; title?: string }) => void
}

const ErrorOverlayContext = createContext<ErrorOverlayContextValue | null>(null)

interface ErrorOverlayProviderProps {
  children: ReactNode
}

export default function ErrorOverlayProvider({ children }: ErrorOverlayProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [title, setTitle] = useState<string>("Đã xảy ra lỗi")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearOverlayTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const hideOverlay = useCallback(() => {
    clearOverlayTimeout()
    setIsOpen(false)
    setMessage("")
    setTitle("Đã xảy ra lỗi")
  }, [clearOverlayTimeout])

  const showError = useCallback(
    (errorMessage: string, options?: { duration?: number; title?: string }) => {
      const resolvedMessage = errorMessage?.trim() || "Đã xảy ra lỗi không xác định."

      clearOverlayTimeout()
      setMessage(resolvedMessage)
      setTitle(options?.title?.trim() || "Đã xảy ra lỗi")
      setIsOpen(true)

      const displayDuration = options?.duration ?? 5000
      if (displayDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideOverlay()
        }, displayDuration)
      }
    },
    [clearOverlayTimeout, hideOverlay],
  )

  useEffect(() => {
    return () => {
      clearOverlayTimeout()
    }
  }, [clearOverlayTimeout])

  const contextValue = useMemo<ErrorOverlayContextValue>(() => ({ showError }), [showError])

  return (
    <ErrorOverlayContext.Provider value={contextValue}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-background shadow-2xl">
            <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-destructive">{title}</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{message}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={hideOverlay}
                className="min-w-[120px] cursor-pointer hover:bg-muted/70"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </ErrorOverlayContext.Provider>
  )
}

export function useErrorOverlay(): ErrorOverlayContextValue {
  const context = useContext(ErrorOverlayContext)
  if (!context) {
    throw new Error("useErrorOverlay must be used within an ErrorOverlayProvider")
  }
  return context
}
