export type UserRole = 'caretaker' | 'patient' | null;

export type Page = 
  | 'login'
  | 'role-selection'
  | 'caretaker-dashboard'
  | 'patient-dashboard'
  | 'landing'
  | 'dashboard'
  | 'scanner'
  | 'medicines'
  | 'details'
  | 'schedule'
  | 'reminders'
  | 'history'
  | 'caregiver'
  | 'profile'
  | 'assistant'
  | 'interactions';

export interface ExtractedMedicine {
  id?: string;
  name: string;
  strength: string;
  quantity: string;
  frequency: string;
  times: string[]; // e.g. ["09:00", "21:00"]
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  foodInstruction: string; // e.g. "After Food", "Before Food"
  duration: string; // e.g. "30 days", "3 months"
  specialInstructions?: string;
  status?: 'taken' | 'pending' | 'skipped';
}

export interface ExtractedPrescriptionResult {
  isReadable: boolean;
  doctorName?: string;
  clinicOrHospital?: string;
  date?: string;
  patientName?: string;
  medicines: ExtractedMedicine[];
  unreadableReason?: string;
  confidenceScore?: number;
  extractedAt: string;
  rawNotes?: string;
}

export interface SimpleEnglishMedicineGuide {
  medicineName: string;
  genericName?: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  foodInstructions: string;
  warning: string;
  missedDoseAdvice: string;
  note?: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  indications: string[];
  howToTake: string;
  commonSideEffects: string[];
  seriousSideEffects?: string[];
  contraindications?: string[];
  foodInteractions?: string[];
  storageAdvice?: string;
  missedDoseGuidance?: string;
  expiryDate?: string;
  batchNumber?: string;
  scannedAt: string;
  imageUrl?: string;
  notes?: string;
  category?: string;
  confidenceScore?: number;
  detectedPackagingType?: string;
  visibleTextSnippet?: string;
  simpleEnglishGuide?: SimpleEnglishMedicineGuide;
}

export interface ScanResultResponse {
  isReadable: boolean;
  detectedMedicineName?: string;
  name?: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  indications?: string[];
  howToTake?: string;
  commonSideEffects?: string[];
  seriousSideEffects?: string[];
  contraindications?: string[];
  foodInteractions?: string[];
  storageAdvice?: string;
  missedDoseGuidance?: string;
  expiryDate?: string;
  batchNumber?: string;
  confidenceScore?: number;
  detectedPackagingType?: string;
  visibleTextSnippet?: string;
  unreadableReason?: string;
  readableTips?: string[];
  note?: string;
}

export interface DrugInteractionResult {
  medicineA: string;
  medicineB: string;
  severity: 'critical' | 'moderate' | 'minor' | 'safe';
  headline: string;
  summary: string;
  clinicalMechanism: string;
  managementRecommendation: string;
  safeAlternatives?: string[];
  consultDoctorUrgency: 'immediate' | 'routine' | 'not_needed';
  checkedAt: string;
}

export interface MedReminder {
  id: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  time: string; // "HH:MM" 24h
  scheduledDate?: string; // e.g. "YYYY-MM-DD" for specific scheduled date
  startDate?: string; // start of regimen
  endDate?: string; // end of regimen
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  mealTiming: 'before' | 'after' | 'with' | 'any';
  active: boolean;
  notes: string;
  takenHistory: Record<string, boolean>; // e.g. "2026-09-02": true
}

export interface CaregiverLog {
  id: string;
  timestamp: string;
  type: 'taken' | 'missed' | 'alert' | 'note';
  medicineName?: string;
  note: string;
  author: string;
}

export interface CaregiverPatient {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  doctorName?: string;
  doctorPhone?: string;
  adherenceRate: number;
  medicationCount: number;
  notes?: string;
  recentLogs?: Array<{
    id: string;
    date: string;
    type: 'taken' | 'missed' | 'refill' | 'alert';
    message: string;
  }>;
}

export interface PatientProfile {
  name: string;
  email?: string;
  phone?: string;
  age: number;
  gender?: string;
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryPhysician?: string;
  doctorName?: string;
  doctorPhone?: string;
  preferredPharmacy?: string;
  hospitalPreference?: string;
  notificationsEnabled?: boolean;
  soundAlertsEnabled?: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}
