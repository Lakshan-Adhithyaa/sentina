import type { EdgeCase, ToggleState } from "./sentina-types"

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Set a value at a dot-notation path in an object
 */
export function setAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const keys = path.split(".")
  const result = deepClone(obj)
  let current: Record<string, unknown> = result

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (
      current[key] === undefined ||
      current[key] === null ||
      typeof current[key] !== "object"
    ) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

/**
 * Apply all active mutations to the base props
 */
export function applyMutations(
  baseProps: Record<string, unknown>,
  edgeCases: EdgeCase[],
  toggleState: ToggleState
): Record<string, unknown> {
  let result = deepClone(baseProps)

  for (const edgeCase of edgeCases) {
    if (toggleState[edgeCase.id]) {
      result = setAtPath(result, edgeCase.mutation.path, edgeCase.mutation.value)
    }
  }

  return result
}

/**
 * Resolve which toggles are disabled due to conflicts
 */
export function resolveConflicts(
  edgeCases: EdgeCase[],
  toggleState: ToggleState
): Set<string> {
  const disabled = new Set<string>()

  for (const edgeCase of edgeCases) {
    if (toggleState[edgeCase.id]) {
      for (const conflictId of edgeCase.conflictsWith) {
        if (!toggleState[conflictId]) {
          disabled.add(conflictId)
        }
      }
    }
  }

  return disabled
}

/**
 * Safely parse JSON with error recovery
 */
export function safeJsonParse(text: string): { data: unknown; error: string | null } {
  try {
    const data = JSON.parse(text)
    return { data, error: null }
  } catch {
    // Attempt repair: strip markdown code fences
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    try {
      const data = JSON.parse(cleaned)
      return { data, error: null }
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Invalid JSON",
      }
    }
  }
}

/**
 * Format JSON with indentation
 */
export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}
