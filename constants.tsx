
import { UserRole, BusinessCategory, SubscriptionPlan, User, Business, Unit, Booking, BookingStatus, Transaction, AdCampaign, AuditLog, VerificationStatus, AppNotification } from './types';

export const APP_NAME = "SEULANGA";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zian Ali', email: 'admin@seulanga.com', role: UserRole.SUPER_ADMIN, avatar: 'https://i.pravatar.cc/150?u=u1', createdAt: '2024-01-01' },
  { id: 'u2', name: 'John Doe', email: 'john@hotel.com', role: UserRole.BUSINESS_OWNER, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u2', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Sarah Staff', email: 'sarah@hotel.com', role: UserRole.ADMIN_STAFF, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u3', createdAt: '2024-02-10' },
  { 
    id: 'u4', 
    name: 'Alice Guest', 
    email: 'alice@gmail.com', 
    role: UserRole.GUEST, 
    avatar: 'https://i.pravatar.cc/150?u=u4', 
    createdAt: '2024-03-01',
    verificationStatus: VerificationStatus.VERIFIED,
    phoneNumber: '+62 812 3456 7890',
    wishlist: ['b1', 'b3']
  },
  { id: 'u5', name: 'Budi Santoso', email: 'budi@reception.com', role: UserRole.ADMIN_STAFF, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u15', createdAt: '2024-04-12' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'not1', title: 'Reservasi Baru!', message: 'Alice Guest baru saja memesan Deluxe Suite 201.', type: 'booking', isRead: false, createdAt: '2 min ago' },
  { id: 'not2', title: 'Pembayaran Diterima', message: 'Invoice #INV-9022 senilai Rp 3.000.000 telah lunas.', type: 'payment', isRead: false, createdAt: '15 min ago' },
  { id: 'not3', title: 'Update Sistem', message: 'Fitur AI Insights sekarang tersedia di dashboard Anda.', type: 'system', isRead: true, createdAt: '2 hours ago' },
  { id: 'not4', title: 'Pesan Baru', message: 'Anda memiliki pesan baru dari Manajemen Seulanga.', type: 'message', isRead: true, createdAt: '1 day ago' },
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
    tags: ['Luxury', 'Business', 'City Center']
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
  },
  {
    id: 'b3',
    name: 'Syariah Boarding House',
    category: BusinessCategory.KOST,
    ownerId: 'u6',
    description: 'Modern, secure, and affordable boarding house for students and professionals.',
    address: 'Jl. Syiah Kuala, Banda Aceh',
    status: 'active',
    subscription: SubscriptionPlan.BASIC,
    images: ['https://images.unsplash.com/photo-1555854817-5b2260d1bd04?q=80&w=2070'],
    rating: 4.2,
    location: { lat: 5.5700, lng: 95.3400 },
    commissionRate: 5,
    serviceFee: 10000,
    tags: ['Student', 'Affordable', 'Strategic']
  },
  {
    id: 'b4',
    name: 'Seulanga Residence Phase 1',
    category: BusinessCategory.SALES,
    ownerId: 'u7',
    description: 'Exclusive housing complex with minimalist modern design and green environment.',
    address: 'Ulee Kareng, Banda Aceh',
    status: 'active',
    subscription: SubscriptionPlan.PREMIUM,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'],
    rating: 4.9,
    location: { lat: 5.5300, lng: 95.3600 },
    commissionRate: 2,
    serviceFee: 0,
    tags: ['Investment', 'Modern', 'Secure']
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
    amenities: ['WiFi', 'AC', 'Breakfast', 'Pool Access'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070']
  },
  {
    id: 'un2',
    businessId: 'b1',
    name: 'Executive Room 305',
    type: 'Room',
    price: 2500000,
    capacity: 2,
    available: false,
    amenities: ['WiFi', 'AC', 'Mini Bar', 'City View'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070']
  },
  {
    id: 'un_kost1',
    businessId: 'b3',
    name: 'Standard Room - Male',
    type: 'Kost Room',
    price: 1200000,
    capacity: 1,
    available: true,
    amenities: ['WiFi', 'AC', 'Laundry'],
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071']
  },
  {
    id: 'un_house1',
    businessId: 'b4',
    name: 'Type 45/90 - Unit A1',
    type: 'House',
    price: 650000000,
    capacity: 4,
    available: true,
    amenities: ['Garden', 'Carport', '2 Bedrooms'],
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070']
  }
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
    createdAt: '2024-12-20'
  },
  {
    id: 'bk_past',
    businessId: 'b1',
    unitId: 'un1',
    guestId: 'u4',
    checkIn: '2024-05-10',
    checkOut: '2024-05-12',
    totalPrice: 3000000,
    status: BookingStatus.COMPLETED,
    createdAt: '2024-05-01'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'subscription', amount: 1200000, status: 'completed', businessId: 'b1', description: 'Enterprise Premium Subscription', createdAt: '2024-10-01' },
  { id: 'tx2', type: 'commission', amount: 150000, status: 'completed', businessId: 'b1', guestId: 'u4', description: 'Commission for #BK1', createdAt: '2024-12-20' },
  { id: 'tx3', type: 'service_fee', amount: 25000, status: 'completed', businessId: 'b1', guestId: 'u4', description: 'Platform Service Fee for #BK1', createdAt: '2024-12-20' },
];

export const MOCK_ADS: AdCampaign[] = [
  { id: 'ad1', businessId: 'b1', type: 'featured', startDate: '2024-12-01', endDate: '2025-01-01', status: 'active', budget: 5000000 },
  { id: 'ad2', businessId: 'b2', type: 'priority_search', startDate: '2024-12-15', endDate: '2025-01-15', status: 'active', budget: 2000000 },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log1', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Updated Subscription Tier', target: 'Enterprise Premium', type: 'financial', timestamp: '2024-10-25 10:15:00' },
  { id: 'log2', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Approved Business', target: 'Grand Seulanga Hotel', type: 'management', timestamp: '2024-10-25 11:30:00' },
  { id: 'log3', actorId: 'u2', actorName: 'John Doe', actorRole: UserRole.BUSINESS_OWNER, action: 'Modified Unit Pricing', target: 'Deluxe Suite 201', type: 'management', timestamp: '2024-10-25 12:45:00' },
];
