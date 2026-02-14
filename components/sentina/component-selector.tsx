"use client"

import type { SentinaComponent } from "@/lib/sentina-types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComponentSelectorProps {
  components: SentinaComponent[]
  selected: string | null
  onSelect: (name: string) => void
}

export function ComponentSelector({
  components,
  selected,
  onSelect,
}: ComponentSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 px-3 pb-2">
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
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Components
        </span>
        <span className="ml-auto rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
          {components.length}
        </span>
      </div>
      <ScrollArea className="max-h-[200px]">
        <div className="flex flex-col gap-0.5 px-1">
          {components.map((comp) => (
            <button
              key={comp.name}
              onClick={() => onSelect(comp.name)}
              className={cn(
                "flex flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors",
                selected === comp.name
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span className="text-sm font-medium">{comp.name}</span>
              <span className="font-mono text-xs opacity-60">{comp.fileName}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
