"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag, Clock, ChefHat, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:55079'

function headers(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

interface OrderDto {
  orderId: number
  customerId: number
  status: string
  totalAmount: number
  orderDate: string
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const QUARTERS: Record<string, number[]> = { Q1:[0,1,2], Q2:[3,4,5], Q3:[6,7,8], Q4:[9,10,11] }

const STATUS_COLORS: Record<string, string> = {
  Completed: "#22c55e",
  Pending:   "#f59e0b",
  "In Progress": "#3b82f6",
  Baking:    "#f97316",
  Decoration:"#a855f7",
  "Ready for Pickup":"#14b8a6",
  Cancelled: "#ef4444",
}

const PIE_COLORS = ["#22c55e","#f59e0b","#3b82f6","#f97316","#a855f7","#14b8a6","#ef4444"]

type Period = "year" | "Q1" | "Q2" | "Q3" | "Q4" | string  // string = month name

function filterByPeriod(orders: OrderDto[], year: number, period: Period): OrderDto[] {
  return orders.filter((o) => {
    const d = new Date(o.orderDate)
    if (d.getFullYear() !== year) return false
    if (period === "year") return true
    if (period in QUARTERS) return QUARTERS[period].includes(d.getMonth())
    return MONTHS[d.getMonth()] === period
  })
}

function buildMonthlyData(orders: OrderDto[], monthIndices: number[]) {
  return monthIndices.map((mi) => {
    const mo = orders.filter((o) => new Date(o.orderDate).getMonth() === mi)
    return {
      month: MONTHS[mi],
      revenue: mo.filter((o) => o.status === "Completed").reduce((s, o) => s + o.totalAmount, 0),
      orders:  mo.length,
      completed: mo.filter((o) => o.status === "Completed").length,
      pending:   mo.filter((o) => o.status === "Pending").length,
      cancelled: mo.filter((o) => o.status === "Cancelled").length,
    }
  })
}

function buildStatusData(orders: OrderDto[]) {
  const map: Record<string, number> = {}
  orders.forEach((o) => { map[o.status] = (map[o.status] ?? 0) + 1 })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export default function StatisticsPage() {
  const [allOrders, setAllOrders] = useState<OrderDto[]>([])
  const [loading, setLoading]     = useState(true)
  const [year, setYear]           = useState(new Date().getFullYear())
  const [period, setPeriod]       = useState<Period>("year")

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/Orders`, { headers: headers() })
      .then((r) => r.json())
      .then((data: OrderDto[]) => { setAllOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const availableYears = useMemo(() => {
    const years = [...new Set(allOrders.map((o) => new Date(o.orderDate).getFullYear()))]
    if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear())
    return years.sort((a, b) => b - a)
  }, [allOrders])

  const filtered = useMemo(() => filterByPeriod(allOrders, year, period), [allOrders, year, period])

  const monthIndices = useMemo(() => {
    if (period === "year") return [...Array(12).keys()]
    if (period in QUARTERS) return QUARTERS[period]
    const mi = MONTHS.indexOf(period)
    return mi >= 0 ? [mi] : []
  }, [period])

  const monthlyData  = useMemo(() => buildMonthlyData(filtered, monthIndices), [filtered, monthIndices])
  const statusData   = useMemo(() => buildStatusData(filtered), [filtered])

  const totalRevenue  = filtered.filter((o) => o.status === "Completed").reduce((s, o) => s + o.totalAmount, 0)
  const countOf = (s: string) => filtered.filter((o) => o.status === s).length

  const stats = [
    { label: "Total Orders",  value: filtered.length,                          icon: <ShoppingBag className="w-6 h-6" />, color: "text-primary",     bg: "bg-primary/10"     },
    { label: "Pending",       value: countOf("Pending"),                        icon: <Clock className="w-6 h-6" />,       color: "text-amber-600",   bg: "bg-amber-50"       },
    { label: "In Progress",   value: countOf("In Progress"),                    icon: <ChefHat className="w-6 h-6" />,     color: "text-blue-600",    bg: "bg-blue-50"        },
    { label: "Completed",     value: countOf("Completed"),                      icon: <CheckCircle className="w-6 h-6" />, color: "text-green-600",   bg: "bg-green-50"       },
    { label: "Cancelled",     value: countOf("Cancelled"),                      icon: <XCircle className="w-6 h-6" />,     color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Revenue",       value: `Rs. ${totalRevenue.toLocaleString()}`,    icon: <TrendingUp className="w-6 h-6" />,  color: "text-accent",      bg: "bg-accent/10"      },
  ]

  const PERIOD_OPTIONS = ["year","Q1","Q2","Q3","Q4",...MONTHS]

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">Statistics</h1>
            <p className="text-muted-foreground">Orders and revenue overview</p>
          </div>

          {/* Period controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <div className="flex flex-wrap gap-1">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`h-9 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                    period === p
                      ? "bg-accent text-white border-accent"
                      : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {p === "year" ? "Full Year" : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {stats.map((s) => (
                <Card key={s.label} className="border border-border/60 shadow-sm">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>
                      {s.icon}
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                    <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue over time */}
              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Revenue (Completed Orders)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number | undefined) => [`Rs. ${(v ?? 0).toLocaleString()}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders over time */}
              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Orders by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4,4,0,0]} />
                      <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4,4,0,0]} />
                      <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Status donut */}
              <Card className="border border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Order Status Mix</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {statusData.length === 0 ? (
                    <p className="py-16 text-sm text-muted-foreground">No data</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                            {statusData.map((entry, i) => (
                              <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number | undefined, name: string) => [v ?? 0, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                        {statusData.map((entry, i) => (
                          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? PIE_COLORS[i % PIE_COLORS.length] }} />
                            {entry.name} ({entry.value})
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Revenue vs Orders combined */}
              <Card className="border border-border/60 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Revenue vs Order Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left"  tick={{ fontSize: 11 }} tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number | undefined, name: string) => name === "Revenue" ? [`Rs. ${(v ?? 0).toLocaleString()}`, name] : [v ?? 0, name]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar yAxisId="left"  dataKey="revenue" name="Revenue"      fill="var(--color-accent)" opacity={0.85} radius={[4,4,0,0]} />
                      <Bar yAxisId="right" dataKey="orders"  name="Total Orders" fill="var(--color-primary)" opacity={0.7}  radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent orders table */}
            <h2 className="text-lg font-semibold text-foreground mb-3">Orders in Period</h2>
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No orders in this period</td></tr>
                      ) : (
                        [...filtered]
                          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                          .slice(0, 25)
                          .map((o) => (
                            <tr key={o.orderId} className="hover:bg-muted/30">
                              <td className="px-4 py-3 text-sm font-medium">#ORD-{o.orderId}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.orderDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{
                                  background: (STATUS_COLORS[o.status] ?? "#6b7280") + "20",
                                  color: STATUS_COLORS[o.status] ?? "#6b7280",
                                }}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-right">Rs. {o.totalAmount.toLocaleString()}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}

