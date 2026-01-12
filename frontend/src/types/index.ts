export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  MEMBER = 'member',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank_transfer',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface User {
  _id?: string;
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Member {
  _id?: string;
  id: string;
  userId: User;
  personalInfo: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: Gender;
    goal?: string;
    medicalConditions?: string;
  };
  assignedTrainer?: Trainer;
  currentSubscription?: Subscription;
  subscriptionHistory: Subscription[];
  joinDate: string;
}

export interface Trainer {
  _id?: string;
  id: string;
  userId: User;
  specialization: string[];
  experience: number;
  certifications: string[];
  assignedMembers: Member[];
  availability: {
    [key: string]: string[];
  };
  joinDate: string;
}

export interface Subscription {
  _id?: string;
  id: string;
  plan: {
    name: string;
    duration: number;
    price: number;
  };
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface Plan {
  _id?: string;
  name: string;
  duration: number;
  price: number;
}

export interface Payment {
  _id?: string;
  id: string;
  memberId: string;
  subscriptionId?: string;
  amount: number;
  method: PaymentMethod;
  status: string;
  transactionId?: string;
  invoiceNumber?: string;
  paymentDate: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}
