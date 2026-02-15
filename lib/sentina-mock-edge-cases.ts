import type { EdgeCase } from "./sentina-types"

/**
 * Generate fallback mock edge cases based on the props structure
 */
export function generateMockEdgeCases(
  props: Record<string, unknown>
): EdgeCase[] {
  const cases: EdgeCase[] = []

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string") {
      cases.push({
        id: `empty-${key}`,
        title: `Empty ${key}`,
        description: `Set "${key}" to an empty string`,
        mutation: { path: key, value: "" },
        conflictsWith: [`long-${key}`],
      })
      cases.push({
        id: `long-${key}`,
        title: `Overflow ${key}`,
        description: `Set "${key}" to an extremely long string to test overflow handling`,
        mutation: {
          path: key,
          value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10),
        },
        conflictsWith: [`empty-${key}`],
      })
    }

    if (typeof value === "number") {
      cases.push({
        id: `zero-${key}`,
        title: `Zero ${key}`,
        description: `Set "${key}" to 0`,
        mutation: { path: key, value: 0 },
        conflictsWith: [`negative-${key}`, `huge-${key}`],
      })
      cases.push({
        id: `negative-${key}`,
        title: `Negative ${key}`,
        description: `Set "${key}" to -1`,
        mutation: { path: key, value: -1 },
        conflictsWith: [`zero-${key}`, `huge-${key}`],
      })
      cases.push({
        id: `huge-${key}`,
        title: `Huge ${key}`,
        description: `Set "${key}" to 999999`,
        mutation: { path: key, value: 999999 },
        conflictsWith: [`zero-${key}`, `negative-${key}`],
      })
    }

    if (typeof value === "boolean") {
      cases.push({
        id: `toggle-${key}`,
        title: `Flip ${key}`,
        description: `Toggle "${key}" to ${!value}`,
        mutation: { path: key, value: !value },
        conflictsWith: [],
      })
    }

    if (Array.isArray(value)) {
      cases.push({
        id: `empty-arr-${key}`,
        title: `Empty ${key}`,
        description: `Set "${key}" to an empty array`,
        mutation: { path: key, value: [] },
        conflictsWith: [],
      })
    }

    if (value === null || value === undefined) {
      cases.push({
        id: `null-${key}`,
        title: `Null ${key}`,
        description: `"${key}" is already null/undefined`,
        mutation: { path: key, value: null },
        conflictsWith: [],
      })
    }
  }

  return cases
}
