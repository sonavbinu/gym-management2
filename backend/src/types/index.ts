import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  MEMBER = 'member',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  BANK_TRANSFER = 'bank-transfer',
}
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    avatar?: string;
  };
  isActive: boolean;
  createdAt: Date;
}
export interface IMember extends Document {
  userId: Types.ObjectId;
  personalInfo: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: Gender;
    goal?: string;
    medicalConditions?: string;
  };
  assignedTrainer?: Types.ObjectId;
  currentSubscription?: Types.ObjectId;
  subscriptionHistory: Types.ObjectId[];
  joinDate: Date;
}

export interface ITrainer extends Document {
  userId: Types.ObjectId;
  specialization: string[];
  experience: number;
  certifications: string[];
  assignedMembers: Types.ObjectId[];
  availability: {
    monday?: string[];
    tuesday?: string[];
    wednesday?: string[];
    thursday?: string[];
    friday?: string[];
    saturday?: string[];
    sunday?: string[];
  };
  joinDate: Date;
}
export interface ISubscription extends Document {
  memberId: Types.ObjectId;
  plan: {
    name: string;
    duration: number;
    price: number;
  };
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  paymentId?: Types.ObjectId;
  createdAt: Date;
}

export interface IPayment extends Document {
  memberId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  invoiceNumber?: string;
  paymentDate: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
