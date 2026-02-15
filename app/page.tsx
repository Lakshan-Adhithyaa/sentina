import { Suspense } from "react"
import { SentinaWorkspace } from "@/components/sentina/sentina-workspace"

export default function Page() {
  return (
    <Suspense fallback={<SentinaLoading />}>
      <SentinaWorkspace />
    </Suspense>
  )
}

function SentinaLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading Sentina...</p>
      </div>
    </div>
  )
}
