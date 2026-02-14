"use client"

import type { EdgeCase, ToggleState } from "@/lib/sentina-types"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface EdgeCaseTogglesProps {
  edgeCases: EdgeCase[]
  toggleState: ToggleState
  disabledToggles: Set<string>
  onToggle: (id: string) => void
}

export function EdgeCaseToggles({
  edgeCases,
  toggleState,
  disabledToggles,
  onToggle,
}: EdgeCaseTogglesProps) {
  if (edgeCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <svg
          className="h-8 w-8 text-muted-foreground/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
        <p className="text-xs text-muted-foreground">
          Click &quot;Generate Edge Cases&quot; to start simulating
        </p>
      </div>
    )
  }

  const activeCount = Object.values(toggleState).filter(Boolean).length

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
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Edge Cases
        </span>
        {activeCount > 0 && (
          <span className="ml-auto rounded-md bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
            {activeCount} active
          </span>
        )}
      </div>
      <ScrollArea className="max-h-[300px]">
        <div className="flex flex-col gap-1 px-1">
          {edgeCases.map((edgeCase) => {
            const isDisabled = disabledToggles.has(edgeCase.id)
            const isActive = toggleState[edgeCase.id] || false

            return (
              <div
                key={edgeCase.id}
                className={cn(
                  "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isDisabled && "opacity-40",
                  isActive && "bg-primary/5"
                )}
              >
                <Switch
                  checked={isActive}
                  onCheckedChange={() => onToggle(edgeCase.id)}
                  disabled={isDisabled}
                  className="mt-0.5 shrink-0 data-[state=checked]:bg-primary"
                  aria-label={`Toggle ${edgeCase.title}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {edgeCase.title}
                    </span>
                    {isDisabled && (
                      <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Conflict
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {edgeCase.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
