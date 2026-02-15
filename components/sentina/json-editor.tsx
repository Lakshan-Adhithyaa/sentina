"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { formatJson, safeJsonParse } from "@/lib/sentina-helpers"

interface JsonEditorProps {
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  readOnly?: boolean
}

export function JsonEditor({ value, onChange, readOnly = false }: JsonEditorProps) {
  const [textValue, setTextValue] = useState(formatJson(value))
  const [error, setError] = useState<string | null>(null)
  const lastExternalValue = useRef(JSON.stringify(value))

  const handleChange = useCallback(
    (newText: string) => {
      setTextValue(newText)
      const { data, error: parseError } = safeJsonParse(newText)

      if (parseError) {
        setError(parseError)
      } else {
        setError(null)
        onChange(data as Record<string, unknown>)
      }
    },
    [onChange]
  )

  // Sync external value changes via useEffect instead of during render
  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized !== lastExternalValue.current) {
      lastExternalValue.current = serialized
      if (!error) {
        setTextValue(formatJson(value))
      }
    }
  }, [value, error])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 pb-1">
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Props (JSON)
        </span>
      </div>
      <div className="relative">
        <textarea
          value={textValue}
          onChange={(e) => handleChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className={`h-[280px] w-full resize-none rounded-md border bg-background px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
            error
              ? "border-destructive focus:ring-destructive"
              : "border-border focus:ring-primary"
          }`}
        />
        {error && (
          <div className="mt-1 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span className="text-xs text-destructive">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
