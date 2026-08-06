export type ServiceType = 'pickleball' | 'tennis';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'aba' | 'card' | 'other';
export type EnquiryStatus = 'new' | 'contacted' | 'scheduled' | 'closed';

export interface Court {
  id: string;
  name: string;
  service: ServiceType;
  active: boolean;
  environment?: 'indoor' | 'outdoor';
  surface?: string;
  lighting?: boolean;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
  image?: string;
  gallery?: string[];
  description?: string;
  capacity?: number;
  amenities?: string[];
  rules?: string[];
  locationLabel?: string;
  featured?: boolean;
}

export interface CourtSchedule {
  id: string;
  name: string;
  service: ServiceType;
  environment?: 'indoor' | 'outdoor';
  surface?: string;
  lighting?: boolean;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
  image?: string;
}

export interface ScheduleSlot {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
}

export interface BookingPeriod {
  courtId: string;
  startTime: string;
  endTime: string;
}

export interface BlockedPeriodItem {
  courtId: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface Settings {
  openingTime: string;
  closingTime: string;
  slotMinutes: number;
  allowedDurations: number[];
  pickleballPricePerHour: number;
  tennisPricePerHour: number;
  currency: 'USD';
  courts: Court[];
}

export interface Booking {
  id: string;
  reference: string;
  service: ServiceType;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  price: number;
  selectedSlotIds?: string[];
  blockCount?: number;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  checkedInAt?: string;
  checkedOutAt?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  staffNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  service: 'class' | 'coaching';
  preferredDate: string;
  preferredTime: string;
  people: number;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  status?: EnquiryStatus;
  assignedCoach?: string;
  staffNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BlockedPeriod {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdAt?: string;
}
