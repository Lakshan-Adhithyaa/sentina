"use client"

import type { SentinaComponent } from "./sentina-types"

// ---- UserCard Component ----
function UserCard(props: Record<string, unknown>) {
  const {
    name = "John Doe",
    email = "john@example.com",
    role = "Developer",
    avatar = "",
    isActive = true,
    postsCount = 42,
    bio = "A passionate developer who loves building things.",
  } = props as {
    name: string
    email: string
    role: string
    avatar: string
    isActive: boolean
    postsCount: number
    bio: string
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 font-sans">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground">
          {avatar ? (
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {typeof name === "string" ? name.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {String(name)}
            </h3>
            <span
              className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="truncate text-sm text-muted-foreground">{String(email)}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{String(bio)}</p>
      <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">
          Role: <span className="text-foreground">{String(role)}</span>
        </span>
        <span className="text-muted-foreground">
          Posts: <span className="text-foreground">{String(postsCount)}</span>
        </span>
      </div>
    </div>
  )
}

const userCardDefaultProps = {
  name: "Sarah Chen",
  email: "sarah.chen@company.io",
  role: "Senior Engineer",
  avatar: "",
  isActive: true,
  postsCount: 128,
  bio: "Full-stack engineer focused on developer tools and infrastructure.",
}

// ---- PricingCard Component ----
function PricingCard(props: Record<string, unknown>) {
  const {
    planName = "Pro",
    price = 29,
    currency = "$",
    billingPeriod = "month",
    features = [],
    isPopular = false,
    ctaText = "Get Started",
    discount = 0,
  } = props as {
    planName: string
    price: number
    currency: string
    billingPeriod: string
    features: string[]
    isPopular: boolean
    ctaText: string
    discount: number
  }

  const displayPrice = typeof price === "number" && typeof discount === "number"
    ? Math.max(0, price - discount)
    : price

  return (
    <div
      className={`relative flex flex-col gap-6 rounded-lg border p-6 font-sans ${
        isPopular
          ? "border-emerald-500/50 bg-emerald-500/5"
          : "border-border bg-card"
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950">
          Popular
        </span>
      )}
      <div>
        <h3 className="text-lg font-semibold text-foreground">{String(planName)}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {String(currency)}{String(displayPrice)}
          </span>
          <span className="text-sm text-muted-foreground">/{String(billingPeriod)}</span>
        </div>
        {discount > 0 && (
          <p className="mt-1 text-xs text-emerald-400">
            Save {String(currency)}{String(discount)} per {String(billingPeriod)}
          </p>
        )}
      </div>
      <ul className="flex flex-col gap-2">
        {Array.isArray(features) && features.length > 0 ? (
          features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {String(feature)}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground/50 italic">No features listed</li>
        )}
      </ul>
      <button className="mt-auto w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
        {String(ctaText)}
      </button>
    </div>
  )
}

const pricingCardDefaultProps = {
  planName: "Pro",
  price: 29,
  currency: "$",
  billingPeriod: "month",
  features: ["Unlimited projects", "Priority support", "Custom domains", "Analytics dashboard"],
  isPopular: true,
  ctaText: "Start Free Trial",
  discount: 0,
}

// ---- NotificationBanner Component ----
function NotificationBanner(props: Record<string, unknown>) {
  const {
    type = "info",
    title = "Update Available",
    message = "A new version is available.",
    dismissible = true,
    actionLabel = "",
    timestamp = "2 min ago",
  } = props as {
    type: string
    title: string
    message: string
    dismissible: boolean
    actionLabel: string
    timestamp: string
  }

  const typeStyles: Record<string, string> = {
    info: "border-blue-500/30 bg-blue-500/10",
    warning: "border-amber-500/30 bg-amber-500/10",
    error: "border-red-500/30 bg-red-500/10",
    success: "border-emerald-500/30 bg-emerald-500/10",
  }

  const typeIcons: Record<string, string> = {
    info: "text-blue-400",
    warning: "text-amber-400",
    error: "text-red-400",
    success: "text-emerald-400",
  }

  const style = typeStyles[String(type)] || typeStyles.info
  const iconColor = typeIcons[String(type)] || typeIcons.info

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 font-sans ${style}`}>
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{String(title)}</h4>
          <span className="shrink-0 text-xs text-muted-foreground">{String(timestamp)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{String(message)}</p>
        {actionLabel && (
          <button className="mt-2 text-sm font-medium text-primary hover:underline">
            {String(actionLabel)}
          </button>
        )}
      </div>
      {dismissible && (
        <button className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

const notificationBannerDefaultProps = {
  type: "info",
  title: "System Update",
  message: "Version 2.4.0 is now available with new features and bug fixes.",
  dismissible: true,
  actionLabel: "View changelog",
  timestamp: "5 min ago",
}

// ---- DataTable Component ----
function DataTable(props: Record<string, unknown>) {
  const {
    title = "Recent Orders",
    columns = [],
    rows = [],
    showHeader = true,
    emptyMessage = "No data available",
  } = props as {
    title: string
    columns: string[]
    rows: Record<string, string>[]
    showHeader: boolean
    emptyMessage: string
  }

  return (
    <div className="rounded-lg border border-border bg-card font-sans">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{String(title)}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {showHeader && Array.isArray(columns) && columns.length > 0 && (
            <thead>
              <tr className="border-b border-border">
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                    {String(col)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.isArray(rows) && rows.length > 0 ? (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {Array.isArray(columns) &&
                    columns.map((col, j) => (
                      <td key={j} className="px-4 py-2.5 text-foreground">
                        {row && typeof row === "object" ? String(row[col] ?? "-") : "-"}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Array.isArray(columns) ? columns.length : 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {String(emptyMessage)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const dataTableDefaultProps = {
  title: "Recent Orders",
  columns: ["ID", "Customer", "Amount", "Status"],
  rows: [
    { ID: "#1024", Customer: "Alice Johnson", Amount: "$249.00", Status: "Shipped" },
    { ID: "#1025", Customer: "Bob Smith", Amount: "$89.50", Status: "Processing" },
    { ID: "#1026", Customer: "Carol White", Amount: "$1,200.00", Status: "Delivered" },
  ],
  showHeader: true,
  emptyMessage: "No orders found",
}

// ---- Registry ----
export const demoComponents: SentinaComponent[] = [
  {
    name: "UserCard",
    fileName: "user-card.sentina.tsx",
    component: UserCard as unknown as React.ComponentType<Record<string, unknown>>,
    defaultProps: userCardDefaultProps,
  },
  {
    name: "PricingCard",
    fileName: "pricing-card.sentina.tsx",
    component: PricingCard as unknown as React.ComponentType<Record<string, unknown>>,
    defaultProps: pricingCardDefaultProps,
  },
  {
    name: "NotificationBanner",
    fileName: "notification-banner.sentina.tsx",
    component: NotificationBanner as unknown as React.ComponentType<Record<string, unknown>>,
    defaultProps: notificationBannerDefaultProps,
  },
  {
    name: "DataTable",
    fileName: "data-table.sentina.tsx",
    component: DataTable as unknown as React.ComponentType<Record<string, unknown>>,
    defaultProps: dataTableDefaultProps,
  },
]
