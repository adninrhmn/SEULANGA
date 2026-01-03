
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN_STAFF = 'ADMIN_STAFF',
  GUEST = 'GUEST'
}

export enum BusinessCategory {
  HOTEL = 'Hotel',
  HOMESTAY = 'Homestay',
  KOST = 'Boarding House',
  RENTAL = 'Rental House',
  SALES = 'Property Sales',
  HOUSING_COMPLEX = 'Housing Complex'
}

export enum SubscriptionPlan {
  BASIC = 'Basic',
  PRO = 'Pro',
  PREMIUM = 'Premium'
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'Checked In',
  CHECKED_OUT = 'Checked Out',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}

export enum VerificationStatus {
  UNVERIFIED = 'Unverified',
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'payment' | 'message';
  isRead: boolean;
  createdAt: string;
  targetRole?: UserRole;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  avatar?: string;
  createdAt: string;
  verificationStatus?: VerificationStatus;
  phoneNumber?: string;
  wishlist?: string[];
  permissions?: string[];
}

export type BusinessStatus = 'active' | 'pending' | 'suspended' | 'rejected' | 'info_requested';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  ownerId: string;
  description: string;
  address: string;
  status: BusinessStatus;
  subscription: SubscriptionPlan;
  logo?: string;
  images: string[];
  rating: number;
  location: { lat: number; lng: number };
  commissionRate?: number;
  serviceFee?: number;
  tags?: string[];
  registrationDate?: string;
  contactEmail?: string;
  contactPhone?: string;
  socials?: {
    instagram?: string;
    website?: string;
  };
}

export interface Unit {
  id: string;
  businessId: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  available: boolean;
  amenities: string[];
  images: string[];
  description?: string;
  blockedDates?: string[];
  policies?: {
    cancellation: string;
    checkIn: string;
  };
}

export interface Booking {
  id: string;
  businessId: string;
  unitId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  paymentProof?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'subscription' | 'commission' | 'ad_fee' | 'service_fee' | 'payout';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  businessId?: string;
  guestId?: string;
  description: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  businessId: string;
  code: string;
  discountValue: number;
  type: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  type: 'security' | 'financial' | 'management' | 'system';
  timestamp: string;
}

export interface Review {
  id: string;
  businessId: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  flags?: string[];
  createdAt: string;
  response?: string;
}
