export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
  NONE = 'NONE',
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface User {
  _id: string;
  email: string;
  role: 'ADMIN' | 'TRAINER' | 'MEMBER';
  profile: UserProfile;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  key?: string;
}

export interface Subscription {
  planId?: SubscriptionPlan | string;
  startDate?: string;
  endDate?: string;
  status: SubscriptionStatus | string;
}

export interface Member {
  _id: string;
  userId: User;
  joinDate: string;
  subscription?: Subscription;
  assignedTrainer?: Trainer;
  physicalStats?: {
    height?: number;
    weight?: number;
    goal?: string;
  };
  // Optional fields for compatibility
  user?: User;
  createdAt?: string;
}

export interface Trainer {
  _id: string;
  userId: User;
  specialization: string[];
  experience: number;
  isAvailable: boolean;
  assignedMembers: string[];
  // Optional fields for compatibility
  user?: User;
  joinDate?: string;
  createdAt?: string;
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  phone?: string;
}
