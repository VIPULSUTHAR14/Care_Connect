export interface HospitalStaff {
  id: number;
  name: string;
  speciality: string;
}

export interface Hospital {
  _id?: string;
  name: string;
  address: string;
  reception_number: string;
  ambulance_number: string;
  nha_registration_number: string;
  email: string;
  password?: string; // Optional for security
  premises_image_url: string[];
  staff: HospitalStaff[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HospitalResponse {
  hospitals: Hospital[];
  total: number;
}
