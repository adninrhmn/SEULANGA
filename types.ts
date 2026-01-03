
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  avatar?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  ownerId: string;
  description: string;
  address: string;
  status: 'active' | 'pending' | 'suspended';
  subscription: SubscriptionPlan;
  logo?: string;
  images: string[];
  rating: number;
  location: { lat: number; lng: number };
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
  paymentProof?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
