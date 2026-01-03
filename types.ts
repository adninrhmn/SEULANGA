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
  TEAM = 'Team',
  MONTHLY_RENTAL = 'Monthly Rental',
  SALES_PURCHASE = 'Sales & Purchase'
}

export type CategoryModuleConfig = Record<string, SystemModule[]>;

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

export interface Complaint {
  id: string;
  guestId: string;
  businessId: string;
  bookingId?: string;
  subject: string;
  message: string;
  status: 'pending' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  businessId: string;
  guestId: string;
  claimAmount: number;
  reason: string;
  status: 'open' | 'resolved_guest' | 'resolved_business' | 'rejected';
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface NotificationRule {
  id: string;
  event: string;
  target: UserRole;
  channels: ('email' | 'push' | 'sms')[];
  isEnabled: boolean;
}

export interface PaymentGateway {
  id: string;
  name: string;
  isActive: boolean;
  apiKey: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  ipAddress: string;
  device: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface IPRestriction {
  id: string;
  ip: string;
  type: 'allow' | 'block';
  description: string;
  createdAt: string;
}

export interface SystemBackup {
  id: string;
  name: string;
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: string;
}

export interface SecurityIncident {
  id: string;
  type: 'brute_force' | 'unauthorized_access' | 'data_export' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  description: string;
  createdAt: string;
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
  category: string;
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
  penaltyCount?: number;
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

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  target: string;
  type: 'management' | 'security' | 'system' | 'financial';
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

export interface Transaction {
  id: string;
  type: 'subscription' | 'commission' | 'ad_promotion' | 'service_fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  businessId: string;
  guestId?: string;
  description: string;
  createdAt: string;
}
