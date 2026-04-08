"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  DollarSign, 
  ShoppingCart, 
  Calendar, 
  TrendingUp,
  Users,
  Package
} from "lucide-react"

interface DashboardSummary {
  totalSalesThisMonth: number
  salesCountThisMonth: number
  salesByStatus: { status: string; count: number }[]
  totalEventsThisMonth: number
  eventsByStatus: { status: string; count: number }[]
  upcomingEvents: {
    id: string
    name: string
    date: string
    client: string
    phone: string | null
    status: string
  }[]
  confirmedAmount: number
  topProducts: {
    productId: string | null
    name: string
    category: string | null
    totalQuantity: number
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/dashboard/summary")
        setData(response.data)
      } catch (error) {
        console.error("Error fetching dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default'
      case 'PENDING': return 'secondary'
      case 'IN_PREPARATION': return 'outline'
      case 'DELIVERED': return 'success'
      case 'CANCELLED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totalSalesThisMonth || 0)}</div>
            <p className="text-xs text-muted-foreground">{data?.salesCountThisMonth || 0} ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monto Confirmado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.confirmedAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalEventsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.upcomingEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Próximos 5 eventos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.upcomingEvents?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay eventos próximos</p>
            ) : (
              <div className="space-y-4">
                {data?.upcomingEvents?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.client}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topProducts?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay datos</p>
            ) : (
              <div className="space-y-4">
                {data?.topProducts?.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{product.totalQuantity} units</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.salesByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{item.status}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.eventsByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{item.status}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}