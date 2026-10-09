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
  TableQR
} from '../types';

export const initialSettings: RestaurantSettings = {
  id: 'settings-1',
  name: 'The Royal Spice',
  tagline: 'An authentic royal Indian dining experience',
  description: 'The Royal Spice offers a contemporary approach to classic Indian cooking, focusing on authentic spices and an extensive curated menu of regional delicacies.',
  address: '124 Culinary Avenue',
  city: 'Metropolis',
  phone: '+91 98765 43210',
  email: 'reservations@royalspice.demo',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 5.0,
  serviceCharge: 10,
  openingHours: [
    { day: 'monday', isOpen: false, openTime: '17:00', closeTime: '22:00' },
    { day: 'tuesday', isOpen: true, openTime: '17:00', closeTime: '22:00', lastReservation: '21:00' },
    { day: 'wednesday', isOpen: true, openTime: '17:00', closeTime: '22:00', lastReservation: '21:00' },
    { day: 'thursday', isOpen: true, openTime: '17:00', closeTime: '22:00', lastReservation: '21:00' },
    { day: 'friday', isOpen: true, openTime: '17:00', closeTime: '23:00', lastReservation: '21:30' },
    { day: 'saturday', isOpen: true, openTime: '17:00', closeTime: '23:00', lastReservation: '21:30' },
    { day: 'sunday', isOpen: true, openTime: '17:00', closeTime: '21:00', lastReservation: '20:00' },
  ],
  slotIntervalMinutes: 30,
  reservationDurationMinutes: 120,
  bookingBufferMinutes: 15,
  maxAdvanceBookingDays: 30,
  minPartySize: 1,
  maxPartySize: 8,
  menuVisible: true,
  allowOnlineReservations: true,
  reservationPolicy: 'Cancellations must be made at least 24 hours in advance.',
  socialLinks: { instagram: '@maisonember' },
  updatedAt: new Date().toISOString(),
};

export const initialZones: RestaurantZone[] = [
  { id: 'zone-1', name: 'Main Dining', type: 'indoor', color: '#faefd8', position: { x: 0, y: 0 }, size: { width: 800, height: 600 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'zone-2', name: 'Patio', type: 'outdoor', color: '#e8e5e2', position: { x: 820, y: 0 }, size: { width: 400, height: 600 }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const initialTables: Table[] = [
  { id: 'table-1', number: '1', capacity: 2, shape: 'square', zoneId: 'zone-1', seatingType: 'window', position: { x: 50, y: 50 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-2', number: '2', capacity: 2, shape: 'square', zoneId: 'zone-1', seatingType: 'window', position: { x: 50, y: 150 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-3', number: '3', capacity: 4, shape: 'rectangle', zoneId: 'zone-1', seatingType: 'indoor', position: { x: 200, y: 100 }, size: { width: 100, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-4', number: '4', capacity: 4, shape: 'rectangle', zoneId: 'zone-1', seatingType: 'indoor', position: { x: 200, y: 200 }, size: { width: 100, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-5', number: '5', capacity: 6, shape: 'round', zoneId: 'zone-1', seatingType: 'indoor', position: { x: 400, y: 150 }, size: { width: 100, height: 100 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-6', number: '6', capacity: 2, shape: 'square', zoneId: 'zone-1', seatingType: 'indoor', position: { x: 550, y: 50 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-7', number: '7', capacity: 2, shape: 'square', zoneId: 'zone-1', seatingType: 'indoor', position: { x: 550, y: 150 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-8', number: '8', capacity: 8, shape: 'rectangle', zoneId: 'zone-1', seatingType: 'private', position: { x: 50, y: 400 }, size: { width: 140, height: 80 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-9', number: '9', capacity: 4, shape: 'round', zoneId: 'zone-2', seatingType: 'outdoor', position: { x: 50, y: 50 }, size: { width: 80, height: 80 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-10', number: '10', capacity: 4, shape: 'round', zoneId: 'zone-2', seatingType: 'outdoor', position: { x: 50, y: 180 }, size: { width: 80, height: 80 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-11', number: '11', capacity: 2, shape: 'square', zoneId: 'zone-2', seatingType: 'outdoor', position: { x: 200, y: 50 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'table-12', number: '12', capacity: 2, shape: 'square', zoneId: 'zone-2', seatingType: 'outdoor', position: { x: 200, y: 150 }, size: { width: 60, height: 60 }, operationalStatus: 'available', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const initialMenuCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Starters', sortOrder: 1, isVisible: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-2', name: 'Curries & Mains', sortOrder: 2, isVisible: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-3', name: 'Breads & Rice', sortOrder: 3, isVisible: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-4', name: 'Desserts', sortOrder: 4, isVisible: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const initialMenuItems: MenuItem[] = [
  { id: 'item-1', categoryId: 'cat-1', name: 'Paneer Tikka', description: 'Cottage cheese marinated in yogurt and Indian spices, cooked in a tandoor.', price: 350, dietaryType: 'veg', isAvailable: true, isFeatured: true, sortOrder: 1, image: 'https://images.unsplash.com/photo-1599487405270-b28c2e6c608f?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-2', categoryId: 'cat-1', name: 'Samosa Chaat', description: 'Crispy samosa topped with yogurt, tamarind chutney, and sev.', price: 250, dietaryType: 'veg', isAvailable: true, isFeatured: false, sortOrder: 2, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-3', categoryId: 'cat-1', name: 'Chicken Tikka', description: 'Succulent chicken chunks marinated in spices and grilled to perfection.', price: 450, dietaryType: 'non-veg', isAvailable: true, isFeatured: false, sortOrder: 3, image: 'https://images.unsplash.com/photo-1599487405270-b28c2e6c608f?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  { id: 'item-4', categoryId: 'cat-2', name: 'Butter Chicken', description: 'Tender chicken simmered in a rich, creamy tomato gravy.', price: 650, dietaryType: 'non-veg', isAvailable: true, isFeatured: true, sortOrder: 1, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-5', categoryId: 'cat-2', name: 'Dal Makhani', description: 'Black lentils slow-cooked overnight with butter and cream.', price: 450, dietaryType: 'veg', isAvailable: true, isFeatured: true, sortOrder: 2, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-6', categoryId: 'cat-2', name: 'Mutton Rogan Josh', description: 'Aromatic lamb dish of Persian origin, cooked with Kashmiri chilies.', price: 750, dietaryType: 'non-veg', isAvailable: true, isFeatured: false, sortOrder: 3, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-7', categoryId: 'cat-2', name: 'Palak Paneer', description: 'Fresh spinach puree cooked with cottage cheese and spices.', price: 550, dietaryType: 'veg', isAvailable: true, isFeatured: false, sortOrder: 4, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  { id: 'item-8', categoryId: 'cat-3', name: 'Garlic Naan', description: 'Soft flatbread topped with minced garlic and butter.', price: 120, dietaryType: 'veg', isAvailable: true, isFeatured: false, sortOrder: 1, image: 'https://images.unsplash.com/photo-1605856191969-70bd651a2386?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-9', categoryId: 'cat-3', name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with marinated chicken and saffron.', price: 550, dietaryType: 'non-veg', isAvailable: true, isFeatured: false, sortOrder: 2, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  { id: 'item-10', categoryId: 'cat-4', name: 'Gulab Jamun', description: 'Deep-fried milk dumplings soaked in cardamom-flavored sugar syrup.', price: 180, dietaryType: 'veg', isAvailable: true, isFeatured: true, sortOrder: 1, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-11', categoryId: 'cat-4', name: 'Rasmalai', description: 'Soft paneer discs soaked in thickened, sweetened, and saffron-flavored milk.', price: 220, dietaryType: 'veg', isAvailable: true, isFeatured: false, sortOrder: 2, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const initialReservations: Reservation[] = [];
export const initialSessions: DiningSession[] = [];
export const initialOrders: Order[] = [];
export const initialBills: Bill[] = [];
export const initialPayments: Payment[] = [];
export const initialQRs: TableQR[] = initialTables.map(t => ({
  id: `qr-${t.id}`,
  tableId: t.id,
  tableNumber: t.number,
  url: `/table/${t.id}`,
  status: 'active',
  generatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));
