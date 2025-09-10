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
  pastReports?: any[]; // Array of past medical reports
  family?: any[]; // Array of family members/medical history
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

// Simplified registration interface (only required fields for initial registration)
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  // Additional fields based on user type (optional for initial registration)
  phone?: string;
  address?: string;
  specialization?: string; // for doctors
  licenseNumber?: string; // for doctors
  hospitalName?: string; // for hospitals
  pharmacyName?: string; // for pharmacies
}
