// Types for the Individual Service Purchase System

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: Date;
}

export interface Consultant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  hourly_rate: number;
  bio?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration_hours: number;
  is_active: boolean;
  created_at: Date;
  consultants?: Consultant[];
}

export interface Package {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: Date;
  services?: Service[];
}

export interface ConsultantAvailability {
  id: number;
  consultant_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Purchase {
  id: number;
  user_id: number;
  purchase_type: 'package' | 'service';
  package_id?: number;
  service_id?: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  package?: Package;
  service?: Service;
}

export interface Reservation {
  id: number;
  user_id: number;
  consultant_id: number;
  service_id: number;
  purchase_id: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: Date;
  consultant?: Consultant;
  service?: Service;
  user?: User;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailableSlot {
  date: string;
  slots: TimeSlot[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface ServicePurchaseForm {
  service_id: number;
  consultant_id: number;
  reservation_date: string;
  start_time: string;
}

export interface PackagePurchaseForm {
  package_id: number;
  selected_services: {
    service_id: number;
    consultant_id: number;
    reservation_date: string;
    start_time: string;
  }[];
}