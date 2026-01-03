
import React from 'react';
import { UserRole, BusinessCategory, SubscriptionPlan, User, Business, Unit, Booking, BookingStatus } from './types';

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
    location: { lat: 5.5483, lng: 95.3238 }
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
    location: { lat: 4.6212, lng: 96.8447 }
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
