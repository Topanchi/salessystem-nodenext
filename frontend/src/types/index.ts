export enum RoleName {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  OPERATIONS = 'OPERATIONS',
}

export enum ProductCategory {
  TORTA = 'TORTA',
  BANQUETERIA_DULCE = 'BANQUETERIA_DULCE',
  BANQUETERIA_SALADA = 'BANQUETERIA_SALADA',
  OTRO = 'OTRO',
}

export enum SaleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PREPARATION = 'IN_PREPARATION',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum EventType {
  CUMPLEANOS = 'CUMPLEANOS',
  MATRIMONIO = 'MATRIMONIO',
  BAUTIZO = 'BAUTIZO',
  EMPRESA = 'EMPRESA',
  OTRO = 'OTRO',
}

export enum EventStatus {
  QUOTED = 'QUOTED',
  CONFIRMED = 'CONFIRMED',
  IN_PREPARATION = 'IN_PREPARATION',
  EXECUTED = 'EXECUTED',
  INVOICED = 'INVOICED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum DocumentType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  INVOICE = 'INVOICE',
}

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: RoleName;
  createdAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string | null;
  businessName: string | null;
  rut: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; email: string } | null;
  updatedBy: { id: string; email: string } | null;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string | null;
  basePrice: number;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; email: string } | null;
  updatedBy: { id: string; email: string } | null;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string | null;
  product: Product | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  observation: string | null;
}

export interface Sale {
  id: string;
  clientId: string;
  client: Client;
  sellerId: string;
  seller: { id: string; email: string; firstName: string | null; lastName: string | null };
  status: SaleStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; email: string; firstName: string | null } | null;
  updatedBy: { id: string; email: string; firstName: string | null } | null;
  items: SaleItem[];
}

export interface Event {
  id: string;
  clientId: string;
  client: Client;
  sellerId: string;
  seller: { id: string; email: string; firstName: string | null; lastName: string | null };
  name: string;
  type: EventType;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  guestCount: number | null;
  serviceDetails: string | null;
  observations: string | null;
  status: EventStatus;
  saleId: string | null;
  sale: Sale | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; email: string; firstName: string | null } | null;
  updatedBy: { id: string; email: string; firstName: string | null } | null;
  documents: EventDocument[];
}

export interface EventDocument {
  id: string;
  eventId: string;
  documentType: DocumentType;
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedById: string | null;
  uploadedAt: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalSalesThisMonth: number;
  salesCountThisMonth: number;
  salesByStatus: { status: string; count: number }[];
  totalEventsThisMonth: number;
  eventsByStatus: { status: string; count: number }[];
  upcomingEvents: {
    id: string;
    name: string;
    date: string;
    client: string;
    phone: string | null;
    status: string;
  }[];
  confirmedAmount: number;
  topProducts: {
    productId: string | null;
    name: string;
    category: string | null;
    totalQuantity: number;
  }[];
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}