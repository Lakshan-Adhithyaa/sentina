"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import type { SentinaComponent } from "@/lib/sentina-types"
import { formatJson } from "@/lib/sentina-helpers"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
  resetKey: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Sentina] Component render error:", error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

interface PreviewPanelProps {
  selectedComponent: SentinaComponent | null
  mutatedProps: Record<string, unknown>
  activeCount: number
}

export function PreviewPanel({
  selectedComponent,
  mutatedProps,
  activeCount,
}: PreviewPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <svg
            className="h-10 w-10 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">No Component Selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a component from the sidebar to preview it
          </p>
        </div>
      </div>
    )
  }

  const Comp = selectedComponent.component
  const resetKey = JSON.stringify(mutatedProps)

  const errorFallback = (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
      <svg
        className="h-8 w-8 text-destructive"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <div>
        <h4 className="text-sm font-semibold text-destructive">Render Error</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          The component crashed with the current props
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Component Simulation</h2>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {selectedComponent.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {activeCount} mutation{activeCount !== 1 ? "s" : ""} active
            </span>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-xl">
          <ErrorBoundary
            resetKey={resetKey}
            fallback={errorFallback}
          >
            <Comp {...mutatedProps} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Props Inspector */}
      <div className="border-t border-border">
        <details className="group">
          <summary className="flex cursor-pointer items-center gap-2 px-6 py-3 text-xs text-muted-foreground hover:text-foreground">
            <svg
              className="h-3.5 w-3.5 transition-transform group-open:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Current Props
          </summary>
          <div className="max-h-[200px] overflow-auto border-t border-border bg-background px-6 py-3">
            <pre className="font-mono text-xs leading-relaxed text-muted-foreground">
              {formatJson(mutatedProps)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  )
}
