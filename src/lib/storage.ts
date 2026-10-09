import { v4 as uuidv4 } from 'uuid';
import {
  RestaurantSettings,
  RestaurantZone,
  Table,
  MenuCategory,
  MenuItem,
  Reservation,
  DiningSession,
  Order,
  Bill,
  Payment,
  TableQR,
  AuditEvent
} from '../types';
import * as seed from '../data/seed';

// Storage keys
const KEYS = {
  SETTINGS: 're_settings',
  ZONES: 're_zones',
  TABLES: 're_tables',
  MENU_CATEGORIES: 're_menu_categories',
  MENU_ITEMS: 're_menu_items',
  RESERVATIONS: 're_reservations',
  SESSIONS: 're_sessions',
  ORDERS: 're_orders',
  BILLS: 're_bills',
  PAYMENTS: 're_payments',
  QRS: 're_qrs',
  AUDIT: 're_audit',
  INITIALIZED: 're_initialized_v2'
};

export const storage = {
  init() {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInitialized) {
      this.resetToSeed();
    }
  },

  resetToSeed() {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(seed.initialSettings));
    localStorage.setItem(KEYS.ZONES, JSON.stringify(seed.initialZones));
    localStorage.setItem(KEYS.TABLES, JSON.stringify(seed.initialTables));
    localStorage.setItem(KEYS.MENU_CATEGORIES, JSON.stringify(seed.initialMenuCategories));
    localStorage.setItem(KEYS.MENU_ITEMS, JSON.stringify(seed.initialMenuItems));
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(seed.initialReservations));
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(seed.initialSessions));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(seed.initialOrders));
    localStorage.setItem(KEYS.BILLS, JSON.stringify(seed.initialBills));
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(seed.initialPayments));
    localStorage.setItem(KEYS.QRS, JSON.stringify(seed.initialQRs));
    localStorage.setItem(KEYS.AUDIT, JSON.stringify([]));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
    this.notifyUpdate();
  },

  notifyUpdate() {
    window.dispatchEvent(new Event('storage-update'));
  },

  _get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },

  _set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
    this.notifyUpdate();
  },

  // Getters
  getSettings(): RestaurantSettings { return this._get(KEYS.SETTINGS, seed.initialSettings); },
  getZones(): RestaurantZone[] { return this._get(KEYS.ZONES, []); },
  getTables(): Table[] { return this._get(KEYS.TABLES, []); },
  getMenuCategories(): MenuCategory[] { return this._get(KEYS.MENU_CATEGORIES, []); },
  getMenuItems(): MenuItem[] { return this._get(KEYS.MENU_ITEMS, []); },
  getReservations(): Reservation[] { return this._get(KEYS.RESERVATIONS, []); },
  getSessions(): DiningSession[] { return this._get(KEYS.SESSIONS, []); },
  getOrders(): Order[] { return this._get(KEYS.ORDERS, []); },
  getBills(): Bill[] { return this._get(KEYS.BILLS, []); },
  getPayments(): Payment[] { return this._get(KEYS.PAYMENTS, []); },
  getQRs(): TableQR[] { return this._get(KEYS.QRS, []); },

  // Setters
  updateSettings(settings: RestaurantSettings) { this._set(KEYS.SETTINGS, settings); },
  updateZones(zones: RestaurantZone[]) { this._set(KEYS.ZONES, zones); },
  updateTables(tables: Table[]) { this._set(KEYS.TABLES, tables); },
  updateMenuCategories(cats: MenuCategory[]) { this._set(KEYS.MENU_CATEGORIES, cats); },
  updateMenuItems(items: MenuItem[]) { this._set(KEYS.MENU_ITEMS, items); },
  updateReservations(res: Reservation[]) { this._set(KEYS.RESERVATIONS, res); },
  updateSessions(sessions: DiningSession[]) { this._set(KEYS.SESSIONS, sessions); },
  updateOrders(orders: Order[]) { this._set(KEYS.ORDERS, orders); },
  updateBills(bills: Bill[]) { this._set(KEYS.BILLS, bills); },
  updatePayments(payments: Payment[]) { this._set(KEYS.PAYMENTS, payments); },
  updateQRs(qrs: TableQR[]) { this._set(KEYS.QRS, qrs); },

  // Logs
  logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const events = this._get<AuditEvent[]>(KEYS.AUDIT, []);
    events.push({
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    });
    this._set(KEYS.AUDIT, events);
  }
};
