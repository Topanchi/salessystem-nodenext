"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search, ShoppingCart, Trash2 } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface Client {
  id: string
  firstName: string
  lastName: string | null
  businessName: string | null
}

interface Product {
  id: string
  name: string
  category: string
  basePrice: number
}

interface SaleItem {
  productId: string
  description: string
  quantity: number
  unitPrice: number
  observation: string
}

const saleItemSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, "Mínimo 1"),
  unitPrice: z.coerce.number().min(0),
  observation: z.string().optional(),
})

const saleSchema = z.object({
  clientId: z.string().min(1, "Seleccione un cliente"),
  status: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Agregue al menos un item"),
  discountAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

type SaleForm = z.infer<typeof saleSchema>

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "IN_PREPARATION", label: "En Preparación" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
]

interface Sale {
  id: string
  client: { firstName: string; lastName: string | null; businessName: string | null }
  seller: { firstName: string | null; lastName: string | null }
  status: string
  subtotal: number
  discountAmount: number
  total: number
  notes: string | null
  items: any[]
  createdAt: string
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, observation: "" }],
      discountAmount: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")

  const fetchSales = async () => {
    try {
      const params: any = { limit: 100 }
      if (statusFilter) params.status = statusFilter
      const response = await api.get("/sales", { params })
      setSales(response.data.data)
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await api.get("/clients/active")
      setClients(response.data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/active")
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    fetchSales()
    fetchClients()
    fetchProducts()
  }, [statusFilter])

  const calculateSubtotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setValue(`items.${index}.unitPrice`, product.basePrice)
    }
  }

  const onSubmit = async (data: SaleForm) => {
    try {
      if (editingSale) {
        await api.patch(`/sales/${editingSale.id}`, data)
      } else {
        await api.post("/sales", data)
      }
      setIsOpen(false)
      setEditingSale(null)
      reset({
        clientId: "",
        status: "PENDING",
        items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, observation: "" }],
        discountAmount: 0,
        notes: "",
      })
      fetchSales()
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar venta")
    }
  }

  const handleEdit = async (sale: Sale) => {
    setEditingSale(sale)
    reset({
      clientId: sale.clientId,
      status: sale.status,
      items: sale.items.map(item => ({
        productId: item.productId || "",
        description: item.description || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        observation: item.observation || "",
      })),
      discountAmount: sale.discountAmount,
      notes: sale.notes || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de cancelar esta venta?")) {
      try {
        await api.delete(`/sales/${id}`)
        fetchSales()
      } catch (error) {
        console.error("Error canceling sale:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find(s => s.value === status)
    const variants: Record<string, any> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      IN_PREPARATION: "outline",
      DELIVERED: "success",
      CANCELLED: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{opt?.label || status}</Badge>
  }

  const subtotal = calculateSubtotal(watchedItems || [])
  const discount = watch("discountAmount") || 0
  const total = subtotal - discount

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">Gestión de ventas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSale(null); reset({
              clientId: "",
              status: "PENDING",
              items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, observation: "" }],
              discountAmount: 0,
              notes: "",
            })}}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSale ? "Editar Venta" : "Nueva Venta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select onValueChange={(value) => setValue("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} {client.businessName && `(${client.businessName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && <p className="text-sm text-red-600">{errors.clientId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select onValueChange={(value) => setValue("status", value)} defaultValue="PENDING">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Items de la Venta</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0, observation: "" })}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar Item
                  </Button>
                </div>

                {errors.items && typeof errors.items === "object" && "message" in errors.items && (
                  <p className="text-sm text-red-600 mb-2">{errors.items.message as string}</p>
                )}

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <Select 
                          {...register(`items.${index}.productId`)} 
                          onValueChange={(value) => { setValue(`items.${index}.productId`, value); handleProductChange(index, value); }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>{product.name} ({formatCurrency(product.basePrice)})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Input type="number" {...register(`items.${index}.quantity`)} min="1" placeholder="Cant" />
                      </div>
                      <div className="w-28">
                        <Input type="number" {...register(`items.${index}.unitPrice`)} placeholder="Precio" />
                      </div>
                      <div className="w-24 text-right py-2 font-medium">
                        {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0))}
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal: {formatCurrency(subtotal)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Label className="text-sm">Descuento:</Label>
                      <Input type="number" {...register("discountAmount")} className="w-24 h-8" min="0" />
                    </div>
                    <p className="text-lg font-bold mt-1">Total: {formatCurrency(total)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea {...register("notes")} placeholder="Observaciones de la venta..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingSale ? "Actualizar" : "Crear Venta"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4" />
              <Input placeholder="Buscar ventas..." className="max-w-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : sales.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay ventas registradas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-xs">{sale.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      {sale.client.firstName} {sale.client.lastName}
                      {sale.client.businessName && <span className="text-xs text-muted-foreground ml-1">({sale.client.businessName})</span>}
                    </TableCell>
                    <TableCell>{sale.seller.firstName} {sale.seller.lastName}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>{getStatusBadge(sale.status)}</TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(sale)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(sale.id)}>Cancelar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}