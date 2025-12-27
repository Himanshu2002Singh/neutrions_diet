// ============================================
// FILE: src/data/mockData.ts
// ============================================
import { User, ProgressRecord, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Raj Kumar',
    age: 28,
    weight: '75 kg',
    height: '5\'8"',
    phone: '+91 98765 43210',
    email: 'raj@email.com',
    address: 'Mumbai, Maharashtra',
    medicalHistory: 'Diabetes Type 2',
    currentMedication: 'Metformin 500mg',
    dietPlan: 'Low carb diet'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    age: 32,
    weight: '62 kg',
    height: '5\'4"',
    phone: '+91 98765 43211',
    email: 'priya@email.com',
    address: 'Delhi, India',
    medicalHistory: 'Hypertension',
    currentMedication: 'Amlodipine 5mg',
    dietPlan: 'DASH diet'
  },
  {
    id: 3,
    name: 'Amit Patel',
    age: 45,
    weight: '82 kg',
    height: '5\'10"',
    phone: '+91 98765 43212',
    email: 'amit@email.com',
    address: 'Ahmedabad, Gujarat',
    medicalHistory: 'Obesity',
    currentMedication: 'None',
    dietPlan: 'Weight loss diet'
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    age: 26,
    weight: '58 kg',
    height: '5\'5"',
    phone: '+91 98765 43213',
    email: 'sneha@email.com',
    address: 'Hyderabad, Telangana',
    medicalHistory: 'Thyroid',
    currentMedication: 'Levothyroxine',
    dietPlan: 'Balanced diet'
  }
];

export const mockProgressData: ProgressRecord[] = [
  { date: '2024-12-18', weight: '76 kg', bp: '120/80', bloodSugar: '110', notes: 'Good progress', steps: 8000, calories: 1800 },
  { date: '2024-12-19', weight: '75.5 kg', bp: '118/78', bloodSugar: '105', notes: 'Following diet', steps: 9500, calories: 1750 },
  { date: '2024-12-20', weight: '75 kg', bp: '120/80', bloodSugar: '108', notes: 'Regular exercise', steps: 10000, calories: 1700 },
  { date: '2024-12-21', weight: '74.8 kg', bp: '119/79', bloodSugar: '102', notes: 'Excellent', steps: 11000, calories: 1650 },
  { date: '2024-12-22', weight: '74.5 kg', bp: '118/78', bloodSugar: '100', notes: 'Maintaining well', steps: 10500, calories: 1700 },
  { date: '2024-12-23', weight: '74.2 kg', bp: '117/77', bloodSugar: '98', notes: 'Great improvement', steps: 12000, calories: 1600 },
  { date: '2024-12-24', weight: '74 kg', bp: '118/78', bloodSugar: '100', notes: 'Stable', steps: 9800, calories: 1750 },
];

export const dashboardStats: DashboardStats = {
  totalPatients: 156,
  activePatients: 124,
  appointments: 18,
  criticalCases: 3
};