"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { Plus, Search, Package } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, "El precio debe ser positivo"),
  notes: z.string().optional(),
})

type ProductForm = z.infer<typeof productSchema>

const categories = [
  { value: "TORTA", label: "Torta" },
  { value: "BANQUETERIA_DULCE", label: "Banquetería Dulce" },
  { value: "BANQUETERIA_SALADA", label: "Banquetería Salada" },
  { value: "OTRO", label: "Otro" },
]

interface Product {
  id: string
  name: string
  category: string
  description: string | null
  basePrice: number
  active: boolean
  notes: string | null
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const fetchProducts = async () => {
    try {
      const params: any = { limit: 100 }
      if (search) params.search = search
      if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter
      const response = await api.get("/products", { params })
      setProducts(response.data.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, categoryFilter])

  const onSubmit = async (data: ProductForm) => {
    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, data)
      } else {
        await api.post("/products", data)
      }
      setIsOpen(false)
      setEditingProduct(null)
      reset()
      fetchProducts()
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar producto")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    reset({
      name: product.name,
      category: product.category,
      description: product.description || "",
      basePrice: product.basePrice,
      notes: product.notes || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de eliminar este producto?")) {
      try {
        await api.delete(`/products/${id}`)
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Catálogo de productos y servicios</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProduct(null); reset() }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea {...register("description")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Precio Base *</Label>
                <Input {...register("basePrice")} type="number" min="0" step="100" />
                {errors.basePrice && (
                  <p className="text-sm text-red-600">{errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea {...register("notes")} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? "Actualizar" : "Crear"}
                </Button>
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
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No hay productos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.basePrice)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                          Eliminar
                        </Button>
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