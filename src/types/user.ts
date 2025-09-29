// User types for the healthcare platform
export enum UserType {
  PATIENT = "patient",
  DOCTOR = "doctor", 
  HOSPITAL = "hospital",
  PHARMACY = "pharmacy"
}

// Collection mapping for each user type
export const COLLECTION_MAPPING = {
  [UserType.PATIENT]: "patients",
  [UserType.DOCTOR]: "doctors", 
  [UserType.HOSPITAL]: "hospitals",
  [UserType.PHARMACY]: "pharmacy"
} as const;

// --- FIX: Define specific interfaces for complex array types ---
export interface PastReport {
  id: string;
  date: string; // or Date
  title: string;
  summary?: string;
  fileUrl?: string;
}

export interface FamilyMember {
  fullName: string;
  relation: string;
  age: number | null;
  medicalCondition: string;
}

// Patient specific interface
export interface PatientData {
  name: string;
  email: string;
  mobileNumber?: string;
  age?: number;
  gender?: string;
  role?: string;
  address?: string;
  bloodGroup?: string;
  // --- FIX: Use the specific interfaces instead of any[] ---
  pastReports?: PastReport[];
  family?: FamilyMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Doctor specific interface
export interface DoctorData {
  name: string;
  email: string;
  specialization?: string;
  licenseNumber?: string;
}

// Hospital specific interface
export interface HospitalData {
  name: string;
  email: string;
  hospitalName?: string;
}

// Pharmacy specific interface
export interface PharmacyData {
  name: string;
  email: string;
  pharmacyName?: string;
}

// Simplified registration interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  phone?: string;
  address?: string;
  specialization?: string; // for doctors
  licenseNumber?: string; // for doctors
  hospitalName?: string; // for hospitals
  pharmacyName?: string; // for pharmacies
}