
import { UserRole, BusinessCategory, SystemModule, CategoryModuleConfig, SubscriptionPlan, User, Business, Unit, Booking, BookingStatus, Transaction, AuditLog, VerificationStatus, AppNotification, Review, Promotion, UnitStatus, MaintenanceTicket } from './types';

export const APP_NAME = "SEULANGA";

export const DEFAULT_CATEGORY_MODULE_MAP: CategoryModuleConfig = {
  [BusinessCategory.HOTEL]: [SystemModule.BOOKING, SystemModule.PAYMENT, SystemModule.REVIEWS, SystemModule.MAINTENANCE, SystemModule.MARKETING, SystemModule.INVENTORY, SystemModule.FINANCE, SystemModule.TEAM],
  [BusinessCategory.HOMESTAY]: [SystemModule.BOOKING, SystemModule.PAYMENT, SystemModule.REVIEWS, SystemModule.MAINTENANCE, SystemModule.MARKETING, SystemModule.INVENTORY],
  [BusinessCategory.KOST]: [SystemModule.BOOKING, SystemModule.PAYMENT, SystemModule.MAINTENANCE, SystemModule.INVENTORY, SystemModule.FINANCE],
  [BusinessCategory.RENTAL]: [SystemModule.BOOKING, SystemModule.PAYMENT, SystemModule.MAINTENANCE, SystemModule.INVENTORY],
  [BusinessCategory.SALES]: [SystemModule.MARKETING, SystemModule.INVENTORY, SystemModule.TEAM],
  [BusinessCategory.HOUSING_COMPLEX]: [SystemModule.MAINTENANCE, SystemModule.INVENTORY, SystemModule.TEAM],
};

export const TRANSLATIONS = {
  id: {
    dashboard: "Dasbor",
    marketplace: "Pasar Properti",
    governance: "Pusat Tata Kelola",
    business_hub: "Pusat Bisnis",
    ops_desk: "Meja Operasional",
    my_bookings: "Pesanan Saya",
    ecosystem: "Ekosistem",
    analytics: "Analitik",
    tenants: "Penyewa",
    treasury: "Perbendaharaan",
    settings: "Pengaturan",
    search_placeholder: "Cari kluster, node, atau entitas mitra...",
    get_started: "Mulai Sekarang",
    log_in: "Masuk",
    terminate: "Keluar Sesi",
    identity_verified: "Identitas Terverifikasi",
    absolute_authority: "Otoritas Mutlak",
    active_tenants: "Tenant Aktif",
    revenue_net: "Pendapatan Bersih",
    platform_gtv: "Total Nilai Transaksi",
    security_health: "Kesehatan Keamanan"
  },
  en: {
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    governance: "Governance Hub",
    business_hub: "Business Hub",
    ops_desk: "Ops Desk",
    my_bookings: "My Bookings",
    ecosystem: "Ecosystem",
    analytics: "Analytics",
    tenants: "Tenants",
    treasury: "Treasury",
    settings: "Settings",
    search_placeholder: "Search cluster, nodes, or partner entities...",
    get_started: "Get Started",
    log_in: "Log In",
    terminate: "Terminate",
    identity_verified: "Identity Verified",
    absolute_authority: "Absolute Authority",
    active_tenants: "Active Tenants",
    revenue_net: "Revenue Net",
    platform_gtv: "Platform GTV",
    security_health: "Security Health"
  }
};

export const MOCK_PROMOTIONS: Promotion[] = [
  { id: 'promo1', businessId: 'b1', code: 'NEWYEAR2024', discountValue: 15, type: 'percentage', startDate: '2024-01-01', endDate: '2024-01-31', isActive: true },
  { id: 'promo2', businessId: 'b1', code: 'GRANDOPEN', discountValue: 50000, type: 'fixed', startDate: '2023-12-01', endDate: '2024-02-28', isActive: true },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zian Ali', email: 'admin@seulanga.com', role: UserRole.SUPER_ADMIN, avatar: 'https://i.pravatar.cc/150?u=u1', createdAt: '2024-01-01' },
  { id: 'u2', name: 'John Doe', email: 'john@hotel.com', role: UserRole.BUSINESS_OWNER, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u2', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Sarah Staff', email: 'sarah@hotel.com', role: UserRole.ADMIN_STAFF, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u3', createdAt: '2024-02-10', permissions: ['manage_bookings', 'view_revenue'] },
  { id: 'u4', name: 'Alice Guest', email: 'alice@gmail.com', role: UserRole.GUEST, avatar: 'https://i.pravatar.cc/150?u=u4', createdAt: '2024-03-01', verificationStatus: VerificationStatus.VERIFIED, phoneNumber: '+62 812 3456 7890', wishlist: ['b1', 'b3'] },
  { id: 'u5', name: 'Budi Santoso', email: 'budi@reception.com', role: UserRole.ADMIN_STAFF, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u15', createdAt: '2024-04-12', permissions: ['manage_bookings'] },
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'Grand Seulanga Hotel',
    category: BusinessCategory.HOTEL,
    ownerId: 'u2',
    description: 'Luxurious hotel in the heart of the city with modern amenities, rooftop lounge, and infinity pool.',
    address: 'Jl. Merdeka No. 1, Banda Aceh',
    status: 'active',
    subscription: SubscriptionPlan.PREMIUM,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070'],
    rating: 4.8,
    location: { lat: 5.5483, lng: 95.3238 },
    commissionRate: 10,
    serviceFee: 25000,
    tags: ['Luxury', 'Business', 'City Center'],
    contactEmail: 'contact@grandseulanga.com',
    contactPhone: '+62 812 7777 9999',
    socials: { instagram: '@grandseulangahotel', website: 'https://grandseulanga.com' }
  },
  {
    id: 'b2',
    name: 'Pine Hill Guesthouse',
    category: BusinessCategory.HOMESTAY,
    ownerId: 'u5',
    description: 'Cozy and quiet guesthouse perfect for family vacations in the highlands.',
    address: 'Jl. Pinus No. 12, Takengon',
    status: 'active',
    subscription: SubscriptionPlan.PRO,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070'],
    rating: 4.5,
    location: { lat: 4.6212, lng: 96.8447 },
    commissionRate: 12,
    serviceFee: 15000,
    tags: ['Nature', 'Family', 'Quiet']
  }
];

export const MOCK_UNITS: Unit[] = [
  {
    id: 'un1',
    businessId: 'b1',
    name: 'Deluxe Suite 201',
    type: 'Room',
    price: 1500000,
    capacity: 2,
    available: true,
    status: UnitStatus.READY,
    amenities: ['WiFi', 'AC', 'Breakfast', 'Pool Access'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070'],
    description: 'Spacious deluxe suite with king size bed and city view.',
    policies: { cancellation: 'Flexible', checkIn: 'Standard ID Required' }
  },
  {
    id: 'un2',
    businessId: 'b1',
    name: 'Executive Room 305',
    type: 'Room',
    price: 2500000,
    capacity: 2,
    available: false,
    status: UnitStatus.MAINTENANCE,
    amenities: ['WiFi', 'AC', 'Mini Bar', 'City View'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070'],
    description: 'Premium executive room on high floor.'
  },
  {
    id: 'un3',
    businessId: 'b1',
    name: 'Standard Twin 102',
    type: 'Room',
    price: 800000,
    capacity: 2,
    available: true,
    status: UnitStatus.DIRTY,
    amenities: ['WiFi', 'AC'],
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070'],
    description: 'Clean and simple standard room.'
  }
];

export const MOCK_MAINTENANCE: MaintenanceTicket[] = [
  { id: 'm1', unitId: 'un2', issue: 'AC cooling unit failure', priority: 'high', status: 'open', reportedBy: 'u3', createdAt: '2024-12-25' },
  { id: 'm2', unitId: 'un3', issue: 'Replace minibar lightbulb', priority: 'low', status: 'resolved', reportedBy: 'u5', createdAt: '2024-12-26' }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk1',
    businessId: 'b1',
    unitId: 'un1',
    guestId: 'u4',
    checkIn: '2024-12-24',
    checkOut: '2024-12-26',
    totalPrice: 3000000,
    status: BookingStatus.CONFIRMED,
    createdAt: '2024-12-20',
    notes: 'Guest requested early check-in',
    verifiedPayment: true
  },
  {
    id: 'bk2',
    businessId: 'b1',
    unitId: 'un2',
    guestId: 'u5',
    checkIn: '2024-12-28',
    checkOut: '2024-12-30',
    totalPrice: 5000000,
    status: BookingStatus.PENDING,
    createdAt: '2024-12-25'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'subscription', amount: 1200000, status: 'completed', businessId: 'b1', description: 'Enterprise Premium Subscription', createdAt: '2024-10-01' },
  { id: 'tx2', type: 'commission', amount: 150000, status: 'completed', businessId: 'b1', guestId: 'u4', description: 'Commission for #BK1', createdAt: '2024-12-20' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log1', actorId: 'u2', actorName: 'John Doe', actorRole: UserRole.BUSINESS_OWNER, action: 'Updated Unit Pricing', target: 'Deluxe Suite 201', type: 'management', timestamp: '2024-10-25 12:45:00' },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'rv1', businessId: 'b1', guestId: 'u4', guestName: 'Alice Guest', rating: 5, comment: 'Amazing stay!', status: 'approved', createdAt: '2024-12-27' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'not1', title: 'New Reservation', message: 'Alice Guest booked Deluxe Suite 201', type: 'booking', isRead: false, createdAt: '2 min ago' },
];
