// ─── Restaurant Settings ───────────────────────────────────────────────────
export interface RestaurantSettings {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logo?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage e.g. 5 = 5%
  serviceCharge: number; // percentage e.g. 10 = 10%
  openingHours: OpeningHours[];
  slotIntervalMinutes: number; // e.g. 30
  reservationDurationMinutes: number; // e.g. 90
  bookingBufferMinutes: number; // e.g. 15
  maxAdvanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number;
  menuVisible: boolean;
  allowOnlineReservations: boolean;
  reservationPolicy: string;
  socialLinks: SocialLinks;
  updatedAt: string;
}

export interface OpeningHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string; // "HH:MM"
  closeTime: string;
  lastReservation?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tripadvisor?: string;
}

// ─── Restaurant Zone ───────────────────────────────────────────────────────
export interface RestaurantZone {
  id: string;
  name: string;
  description?: string;
  type: 'indoor' | 'outdoor' | 'private' | 'bar';
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
}

// ─── Table ─────────────────────────────────────────────────────────────────
export type TableShape = 'round' | 'square' | 'rectangle';
export type TableStatus = 'available' | 'reserved' | 'occupied' | 'unavailable';
export type SeatingType = 'indoor' | 'outdoor' | 'window' | 'private';

export interface Table {
  id: string; // stable UUID
  number: string; // display number e.g. "T-01"
  capacity: number;
  shape: TableShape;
  zoneId: string;
  seatingType: SeatingType;
  description?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  operationalStatus: 'available' | 'unavailable'; // admin-controlled
  qrCodeId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Reservation ───────────────────────────────────────────────────────────
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'arrived'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface Reservation {
  id: string;
  reference: string; // e.g. "EMB-2024-001"
  tableId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  partySize: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  endTime: string; // computed
  seatingPreference: 'indoor' | 'outdoor' | 'no-preference';
  occasion?: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusChange<ReservationStatus>[];
}

export interface StatusChange<T extends string> {
  status: T;
  timestamp: string;
  note?: string;
}

// ─── Menu ──────────────────────────────────────────────────────────────────
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  dietaryType: DietaryType;
  isAvailable: boolean;
  isFeatured: boolean;
  tags?: string[];
  allergens?: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Dining Session ────────────────────────────────────────────────────────
export type SessionStatus =
  | 'active'
  | 'finish-requested'
  | 'bill-finalized'
  | 'payment-pending'
  | 'paid'
  | 'closed'
  | 'cancelled';

export interface DiningSession {
  id: string;
  reference: string; // "SES-2024-001"
  tableId: string;
  reservationId?: string;
  partySize: number;
  status: SessionStatus;
  startedAt: string;
  finishRequestedAt?: string;
  billFinalizedAt?: string;
  closedAt?: string;
  notes?: string;
  staffNotes?: string;
  statusHistory: StatusChange<SessionStatus>[];
  createdAt: string;
  updatedAt: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string; // snapshot at time of order
  price: number; // snapshot
  quantity: number;
  notes?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  reference: string;
  sessionId: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  rejectionReason?: string;
  subtotal: number;
  placedAt: string;
  acceptedAt?: string;
  preparedAt?: string;
  servedAt?: string;
  statusHistory: StatusChange<OrderStatus>[];
  createdAt: string;
  updatedAt: string;
}

// ─── Bill ─────────────────────────────────────────────────────────────────
export type BillStatus = 'open' | 'finalized' | 'paid' | 'cancelled';
export type PaymentMethod = 'upi' | 'card' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface Bill {
  id: string;
  reference: string;
  sessionId: string;
  tableId: string;
  items: BillLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  discountAmount: number;
  discountNote?: string;
  totalAmount: number;
  status: BillStatus;
  paymentId?: string;
  finalizedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillLineItem {
  orderId: string;
  orderItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// ─── Payment ───────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  reference: string;
  billId: string;
  sessionId: string;
  tableId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  failureReason?: string;
  demoReceiptRef: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Table QR ──────────────────────────────────────────────────────────────
export type QRStatus = 'active' | 'inactive' | 'needs-setup';

export interface TableQR {
  id: string;
  tableId: string;
  tableNumber: string;
  url: string;
  status: QRStatus;
  generatedAt: string;
  revokedAt?: string;
  updatedAt: string;
}

// ─── Audit Event ───────────────────────────────────────────────────────────
export type AuditAction =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.cancelled'
  | 'session.started'
  | 'session.closed'
  | 'order.placed'
  | 'order.accepted'
  | 'order.served'
  | 'bill.finalized'
  | 'payment.completed';

export interface AuditEvent {
  id: string;
  action: AuditAction;
  entityId: string;
  entityType: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ─── Utility Types ─────────────────────────────────────────────────────────
export interface TimeSlot {
  time: string; // "HH:MM"
  label: string; // "12:30 PM"
  available: boolean;
}

export interface FloorPlanTable extends Table {
  liveStatus: TableStatus;
  currentReservation?: Reservation;
  currentSession?: DiningSession;
  qr?: TableQR;
}
