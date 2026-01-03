
import { UserRole, BusinessCategory, SubscriptionPlan, User, Business, Unit, Booking, BookingStatus, Transaction, AdCampaign, AuditLog } from './types';

export const APP_NAME = "SEULANGA";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Zian Ali', email: 'admin@seulanga.com', role: UserRole.SUPER_ADMIN, avatar: 'https://i.pravatar.cc/150?u=u1', createdAt: '2024-01-01' },
  { id: 'u2', name: 'John Doe', email: 'john@hotel.com', role: UserRole.BUSINESS_OWNER, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u2', createdAt: '2024-01-05' },
  { id: 'u3', name: 'Sarah Staff', email: 'sarah@hotel.com', role: UserRole.ADMIN_STAFF, businessId: 'b1', avatar: 'https://i.pravatar.cc/150?u=u3', createdAt: '2024-02-10' },
  { id: 'u4', name: 'Alice Guest', email: 'alice@gmail.com', role: UserRole.GUEST, avatar: 'https://i.pravatar.cc/150?u=u4', createdAt: '2024-03-01' },
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'Grand Seulanga Hotel',
    category: BusinessCategory.HOTEL,
    ownerId: 'u2',
    description: 'Luxurious hotel in the heart of the city with modern amenities.',
    address: 'Jl. Merdeka No. 1, Banda Aceh',
    status: 'active',
    subscription: SubscriptionPlan.PREMIUM,
    images: ['https://picsum.photos/seed/h1/800/600', 'https://picsum.photos/seed/h2/800/600'],
    rating: 4.8,
    location: { lat: 5.5483, lng: 95.3238 },
    commissionRate: 10,
    serviceFee: 25000
  },
  {
    id: 'b2',
    name: 'Pine Hill Guesthouse',
    category: BusinessCategory.HOMESTAY,
    ownerId: 'u5',
    description: 'Cozy and quiet guesthouse perfect for family vacations.',
    address: 'Jl. Pinus No. 12, Takengon',
    status: 'active',
    subscription: SubscriptionPlan.PRO,
    images: ['https://picsum.photos/seed/g1/800/600'],
    rating: 4.5,
    location: { lat: 4.6212, lng: 96.8447 },
    commissionRate: 12,
    serviceFee: 15000
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'subscription', amount: 1200000, status: 'completed', businessId: 'b1', description: 'Premium Annual Renewal', createdAt: '2024-10-01' },
  { id: 't2', type: 'commission', amount: 150000, status: 'completed', businessId: 'b1', description: 'Commission for Booking #BK1', createdAt: '2024-10-05' },
  { id: 't3', type: 'ad_fee', amount: 500000, status: 'pending', businessId: 'b2', description: 'Featured Listing Placement (30 days)', createdAt: '2024-10-10' },
];

export const MOCK_ADS: AdCampaign[] = [
  { id: 'ad1', businessId: 'b1', propertyId: 'un1', type: 'featured', startDate: '2024-10-01', endDate: '2024-10-31', status: 'active', budget: 500000 },
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
    images: ['https://picsum.photos/seed/r1/800/600']
  },
  {
    id: 'un2',
    businessId: 'b1',
    name: 'Executive Room 305',
    type: 'Room',
    price: 2500000,
    capacity: 2,
    available: true,
    amenities: ['WiFi', 'AC', 'Mini Bar', 'City View'],
    images: ['https://picsum.photos/seed/r2/800/600']
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
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log1', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Updated Subscription Tier', target: 'Enterprise Premium', type: 'financial', timestamp: '2024-10-25 10:15:00' },
  { id: 'log2', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Approved Business', target: 'Grand Seulanga Hotel', type: 'management', timestamp: '2024-10-25 11:30:00' },
  { id: 'log3', actorId: 'u2', actorName: 'John Doe', actorRole: UserRole.BUSINESS_OWNER, action: 'Modified Unit Pricing', target: 'Deluxe Suite 201', type: 'management', timestamp: '2024-10-25 12:45:00' },
  { id: 'log4', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Global System Backup Initiated', target: 'Cloud Storage Node-A1', type: 'system', timestamp: '2024-10-25 13:00:00' },
  { id: 'log5', actorId: 'u3', actorName: 'Sarah Staff', actorRole: UserRole.ADMIN_STAFF, action: 'Confirmed Guest Payment', target: 'Booking #BK1', type: 'financial', timestamp: '2024-10-26 09:12:00' },
  { id: 'log6', actorId: 'u2', actorName: 'John Doe', actorRole: UserRole.BUSINESS_OWNER, action: 'Added New Receptionist', target: 'Staff ID: s442', type: 'management', timestamp: '2024-10-26 14:22:00' },
  { id: 'log7', actorId: 'u1', actorName: 'Zian Ali', actorRole: UserRole.SUPER_ADMIN, action: 'Changed Platform Security Policy', target: 'MFA Requirements', type: 'security', timestamp: '2024-10-27 08:00:00' },
];
