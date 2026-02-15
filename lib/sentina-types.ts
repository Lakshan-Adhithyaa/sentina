export interface EdgeCase {
  id: string
  title: string
  description: string
  mutation: {
    path: string
    value: unknown
  }
  conflictsWith: string[]
}

export interface SentinaComponent {
  name: string
  fileName: string
  component: React.ComponentType<Record<string, unknown>>
  defaultProps: Record<string, unknown>
}

export interface ToggleState {
  [id: string]: boolean
}
