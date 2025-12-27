// ============================================
// FILE: src/types/index.ts
// ============================================
export interface User {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string;
  currentMedication: string;
  dietPlan: string;
}

export interface ProgressRecord {
  date: string;
  weight: string;
  bp: string;
  bloodSugar?: string;
  notes: string;
  steps?: number;
  calories?: number;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  appointments: number;
  criticalCases: number;
}