"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import type { EdgeCase, ToggleState } from "@/lib/sentina-types"
import { demoComponents } from "@/lib/sentina-demo-components"
import { applyMutations, resolveConflicts, deepClone } from "@/lib/sentina-helpers"
import { ComponentSelector } from "./component-selector"
import { JsonEditor } from "./json-editor"
import { EdgeCaseToggles } from "./edge-case-toggles"
import { PreviewPanel } from "./preview-panel"
import { Separator } from "@/components/ui/separator"

export function SentinaWorkspace() {
  const searchParams = useSearchParams()
  const autorunProcessed = useRef(false)
  const [autoEnableToggles, setAutoEnableToggles] = useState(false)

  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [editedProps, setEditedProps] = useState<Record<string, unknown>>({})
  const [edgeCases, setEdgeCases] = useState<EdgeCase[]>([])
  const [toggleState, setToggleState] = useState<ToggleState>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiWarning, setApiWarning] = useState<string | null>(null)
  const [apiSource, setApiSource] = useState<string | null>(null)

  const selectedComponent = useMemo(
    () => demoComponents.find((c) => c.name === selectedName) ?? null,
    [selectedName]
  )

  const handleSelectComponent = useCallback(
    (name: string) => {
      const comp = demoComponents.find((c) => c.name === name)
      if (comp) {
        setSelectedName(name)
        setEditedProps(deepClone(comp.defaultProps))
        setEdgeCases([])
        setToggleState({})
        setApiWarning(null)
        setApiSource(null)
      }
    },
    []
  )

  const handlePropsChange = useCallback((newProps: Record<string, unknown>) => {
    setEditedProps(newProps)
  }, [])

  const handleToggle = useCallback(
    (id: string) => {
      setToggleState((prev) => ({
        ...prev,
        [id]: !prev[id],
      }))
    },
    []
  )

  const disabledToggles = useMemo(
    () => resolveConflicts(edgeCases, toggleState),
    [edgeCases, toggleState]
  )

  const mutatedProps = useMemo(
    () => applyMutations(editedProps, edgeCases, toggleState),
    [editedProps, edgeCases, toggleState]
  )

  const activeCount = useMemo(
    () => Object.values(toggleState).filter(Boolean).length,
    [toggleState]
  )

  const handleGenerateEdgeCases = useCallback(async () => {
    if (!selectedComponent) return

    setIsGenerating(true)
    setApiWarning(null)
    setApiSource(null)

    try {
      const response = await fetch("/api/generate-edge-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ props: editedProps }),
      })

      const data = await response.json()

      if (data.error) {
        setApiWarning(data.error)
        return
      }

      if (data.warning) {
        setApiWarning(data.warning)
      }

      if (data.source) {
        setApiSource(data.source)
      }

      if (data.edgeCases && Array.isArray(data.edgeCases)) {
        setEdgeCases(data.edgeCases)
        // Set toggles: all enabled if autorun, all disabled otherwise
        const newToggles: ToggleState = {}
        for (const ec of data.edgeCases) {
          newToggles[ec.id] = autoEnableToggles
        }
        setToggleState(newToggles)
        // Reset autoEnableToggles after applying
        if (autoEnableToggles) {
          setAutoEnableToggles(false)
        }
      }
    } catch (err) {
      setApiWarning(
        `Request failed: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setIsGenerating(false)
    }
  }, [selectedComponent, editedProps, autoEnableToggles])

  // ── Autorun from URL params: ?component=X&autorun=true ──
  useEffect(() => {
    if (autorunProcessed.current) return
    const componentParam = searchParams.get("component")
    const autorunParam = searchParams.get("autorun")

    if (!componentParam) return

    // Case-insensitive match against known demo components
    const matched = demoComponents.find(
      (c) => c.name.toLowerCase() === componentParam.toLowerCase()
    )
    if (!matched) return

    autorunProcessed.current = true

    // Select the component
    handleSelectComponent(matched.name)

    // If autorun is requested, trigger generation with auto-enable
    if (autorunParam === "true") {
      setAutoEnableToggles(true)
      // Small delay to ensure state is settled after component selection
      setTimeout(() => {
        // We need to call generate with the matched component's props directly
        // because the state update from handleSelectComponent may not have flushed yet
        setIsGenerating(true)
        setApiWarning(null)
        setApiSource(null)

        fetch("/api/generate-edge-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ props: matched.defaultProps }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setApiWarning(data.error)
              return
            }
            if (data.warning) setApiWarning(data.warning)
            if (data.source) setApiSource(data.source)

            if (data.edgeCases && Array.isArray(data.edgeCases)) {
              setEdgeCases(data.edgeCases)
              // Auto-enable ALL toggles
              const newToggles: ToggleState = {}
              for (const ec of data.edgeCases) {
                newToggles[ec.id] = true
              }
              setToggleState(newToggles)
            }
          })
          .catch((err) => {
            setApiWarning(
              `Request failed: ${err instanceof Error ? err.message : "Unknown error"}`
            )
          })
          .finally(() => {
            setIsGenerating(false)
            setAutoEnableToggles(false)
          })
      }, 100)
    }

    // Clean URL params to prevent re-triggering on HMR
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("component")
      url.searchParams.delete("autorun")
      window.history.replaceState({}, "", url.pathname)
    }
  }, [searchParams, handleSelectComponent])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              className="h-4 w-4 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">Sentina</h1>
            <p className="text-[11px] text-muted-foreground">UI Integrity Simulator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {apiSource && (
            <span
              className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                apiSource === "gemini"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {apiSource === "gemini" ? "Gemini AI" : "Mock Data"}
            </span>
          )}
          <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-mono text-muted-foreground">
            v1.0.0
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside className="flex w-[380px] shrink-0 flex-col border-r border-border bg-card">
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1 py-4">
              {/* Component Selector */}
              <ComponentSelector
                components={demoComponents}
                selected={selectedName}
                onSelect={handleSelectComponent}
              />

              {selectedComponent && (
                <>
                  <div className="px-3 py-2">
                    <Separator />
                  </div>

                  {/* JSON Editor */}
                  <JsonEditor
                    value={editedProps}
                    onChange={handlePropsChange}
                  />

                  <div className="px-3 py-2">
                    <Separator />
                  </div>

                  {/* Generate Button */}
                  <div className="px-4">
                    <button
                      onClick={handleGenerateEdgeCases}
                      disabled={isGenerating}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                            />
                          </svg>
                          Generate Edge Cases
                        </>
                      )}
                    </button>
                  </div>

                  {/* Warning */}
                  {apiWarning && (
                    <div className="mx-4 mt-2 flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2">
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <p className="text-[11px] leading-relaxed text-warning">
                        {apiWarning}
                      </p>
                    </div>
                  )}

                  <div className="px-3 py-2">
                    <Separator />
                  </div>

                  {/* Edge Case Toggles */}
                  <EdgeCaseToggles
                    edgeCases={edgeCases}
                    toggleState={toggleState}
                    disabledToggles={disabledToggles}
                    onToggle={handleToggle}
                  />
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel - Preview */}
        <main className="flex-1 overflow-hidden bg-background">
          <PreviewPanel
            selectedComponent={selectedComponent}
            mutatedProps={mutatedProps}
            activeCount={activeCount}
          />
        </main>
      </div>
    </div>
  )
}
