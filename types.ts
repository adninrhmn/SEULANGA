
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

export enum SystemModule {
  BOOKING = 'Booking',
  PAYMENT = 'Payment',
  REVIEWS = 'Reviews',
  MAINTENANCE = 'Maintenance',
  MARKETING = 'Marketing',
  INVENTORY = 'Inventory',
  FINANCE = 'Finance',
  TEAM = 'Team'
}

export type CategoryModuleConfig = Record<BusinessCategory, SystemModule[]>;

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

export enum UnitStatus {
  READY = 'Ready',
  DIRTY = 'Dirty',
  CLEANING = 'Cleaning',
  MAINTENANCE = 'Maintenance',
  BLOCKED = 'Blocked'
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export interface Inquiry {
  id: string;
  guestId: string;
  businessId: string;
  type: 'rental' | 'purchase' | 'visit';
  status: 'pending' | 'responded' | 'closed';
  message: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  unitId: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  reportedBy: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'system' | 'payment' | 'message' | 'maintenance';
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
  subscriptionExpiry?: string;
  isTrial?: boolean;
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
  isFeaturedRequested?: boolean;
  isFeatured?: boolean;
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
  status: UnitStatus;
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
  verifiedPayment?: boolean;
}

export interface Transaction {
  id: string;
  type: 'subscription' | 'commission' | 'ad_fee' | 'service_fee' | 'payout' | 'booking_payment';
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
  type: 'security' | 'financial' | 'management' | 'system' | 'operational';
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
