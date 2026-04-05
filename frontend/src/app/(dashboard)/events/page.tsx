"use client"

import { useEffect, useState, useRef } from "react"
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
import { formatDate, formatCurrency } from "@/lib/utils"
import { Plus, Search, Calendar, Upload, FileText, Download, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface Client {
  id: string
  firstName: string
  lastName: string | null
  businessName: string | null
}

interface EventDocument {
  id: string
  documentType: string
  originalFileName: string
  uploadedAt: string
}

interface Event {
  id: string
  name: string
  type: string
  eventDate: string
  eventTime: string | null
  location: string | null
  guestCount: number | null
  status: string
  client: { firstName: string; lastName: string | null; businessName: string | null }
  seller: { firstName: string | null; lastName: string | null }
  documents: EventDocument[]
}

const eventSchema = z.object({
  clientId: z.string().min(1, "Seleccione un cliente"),
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  eventDate: z.string().min(1, "La fecha es requerida"),
  eventTime: z.string().optional(),
  location: z.string().optional(),
  guestCount: z.coerce.number().optional(),
  serviceDetails: z.string().optional(),
  observations: z.string().optional(),
  status: z.string().optional(),
  saleId: z.string().optional(),
})

type EventForm = z.infer<typeof eventSchema>

const eventTypes = [
  { value: "CUMPLEANOS", label: "Cumpleaños" },
  { value: "MATRIMONIO", label: "Matrimonio" },
  { value: "BAUTIZO", label: "Bautizo" },
  { value: "EMPRESA", label: "Empresa" },
  { value: "OTRO", label: "Otro" },
]

const eventStatuses = [
  { value: "QUOTED", label: "Cotizado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "IN_PREPARATION", label: "En Preparación" },
  { value: "EXECUTED", label: "Ejecutado" },
  { value: "INVOICED", label: "Facturado" },
  { value: "CLOSED", label: "Cerrado" },
  { value: "CANCELLED", label: "Cancelado" },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [documentsOpen, setDocumentsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documents, setDocuments] = useState<EventDocument[]>([])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: "QUOTED" },
  })

  const fetchEvents = async () => {
    try {
      const params: any = { limit: 100 }
      if (statusFilter) params.status = statusFilter
      const response = await api.get("/events", { params })
      setEvents(response.data.data)
    } catch (error) {
      console.error("Error fetching events:", error)
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

  useEffect(() => {
    fetchEvents()
    fetchClients()
  }, [statusFilter])

  const onSubmit = async (data: EventForm) => {
    try {
      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, data)
      } else {
        await api.post("/events", data)
      }
      setIsOpen(false)
      setEditingEvent(null)
      reset({ clientId: "", name: "", type: "", eventDate: "", eventTime: "", location: "", guestCount: undefined, serviceDetails: "", observations: "", status: "QUOTED" })
      fetchEvents()
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar evento")
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    reset({
      clientId: event.clientId,
      name: event.name,
      type: event.type,
      eventDate: event.eventDate.split("T")[0],
      eventTime: event.eventTime ? event.eventTime.split("T")[1]?.slice(0,5) : "",
      location: event.location || "",
      guestCount: event.guestCount || undefined,
      serviceDetails: event.serviceDetails || "",
      observations: event.observations || "",
      status: event.status,
      saleId: event.saleId || "",
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de cancelar este evento?")) {
      try {
        await api.delete(`/events/${id}`)
        fetchEvents()
      } catch (error) {
        console.error("Error canceling event:", error)
      }
    }
  }

  const openDocuments = async (event: Event) => {
    setSelectedEvent(event)
    try {
      const response = await api.get(`/events/${event.id}/documents`)
      setDocuments(response.data)
    } catch (error) {
      console.error("Error fetching documents:", error)
      setDocuments([])
    }
    setDocumentsOpen(true)
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedEvent) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", "PURCHASE_ORDER")

      await api.post(`/events/${selectedEvent.id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const response = await api.get(`/events/${selectedEvent.id}/documents`)
      setDocuments(response.data)
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al subir documento")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc: EventDocument) => {
    if (!selectedEvent) return
    try {
      const response = await api.get(`/events/${selectedEvent.id}/documents/${doc.id}/download`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", doc.originalFileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error downloading document:", error)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedEvent) return
    if (!confirm("¿Eliminar este documento?")) return
    try {
      await api.delete(`/events/${selectedEvent.id}/documents/${docId}`)
      const response = await api.get(`/events/${selectedEvent.id}/documents`)
      setDocuments(response.data)
    } catch (error) {
      console.error("Error deleting document:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      QUOTED: "secondary",
      CONFIRMED: "default",
      IN_PREPARATION: "outline",
      EXECUTED: "success",
      INVOICED: "default",
      CLOSED: "outline",
      CANCELLED: "destructive",
    }
    const label = eventStatuses.find(s => s.value === status)?.label || status
    return <Badge variant={variants[status] || "secondary"}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestión de eventos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEvent(null); reset({ clientId: "", name: "", type: "", eventDate: "", eventTime: "", location: "", guestCount: undefined, serviceDetails: "", observations: "", status: "QUOTED" }) }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select onValueChange={(v) => setValue("clientId", v)} defaultValue={editingEvent?.clientId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.clientId && <p className="text-sm text-red-600">{errors.clientId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Nombre del Evento *</Label>
                  <Input {...register("name")} />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select onValueChange={(v) => setValue("type", v)} defaultValue={editingEvent?.type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input type="date" {...register("eventDate")} />
                  {errors.eventDate && <p className="text-sm text-red-600">{errors.eventDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" {...register("eventTime")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lugar</Label>
                  <Input {...register("location")} />
                </div>
                <div className="space-y-2">
                  <Label>Cant. Personas</Label>
                  <Input type="number" {...register("guestCount")} min="0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Servicio</Label>
                <Textarea {...register("serviceDetails")} placeholder="Detalles del servicio..." />
              </div>

              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea {...register("observations")} placeholder="Notas internas..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingEvent ? "Actualizar" : "Crear Evento"}</Button>
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
              <Input placeholder="Buscar eventos..." className="max-w-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {eventStatuses.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay eventos</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Lugar</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.client.firstName} {event.client.lastName}</TableCell>
                    <TableCell>{formatDate(event.eventDate)}</TableCell>
                    <TableCell>{event.location || "-"}</TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openDocuments(event)}>
                        <FileText className="w-4 h-4 mr-1" />
                        {event.documents?.length || 0}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>Cancelar</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={documentsOpen} onOpenChange={setDocumentsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Documentos - {selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={handleUploadDocument}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Subiendo..." : "Subir Orden de Compra"}
              </Button>
            </div>

            {documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay documentos</p>
            ) : (
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-sm">{doc.originalFileName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}