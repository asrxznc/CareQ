import { MedicineItem, MedReminder, CaregiverPatient, PatientProfile, CaregiverLog } from '../types';
import { 
  INITIAL_SAVED_MEDICINES, 
  INITIAL_REMINDERS, 
  INITIAL_CAREGIVER_PATIENTS, 
  INITIAL_CAREGIVER_LOGS, 
  INITIAL_PATIENT_PROFILE 
} from '../mockData';

const KEYS = {
  MEDICINES: 'mediscan_saved_medicines',
  REMINDERS: 'mediscan_reminders',
  CAREGIVERS: 'mediscan_caregiver_patients',
  LOGS: 'mediscan_caregiver_logs',
  PROFILE: 'mediscan_patient_profile',
};

export function getStoredMedicines(): MedicineItem[] {
  try {
    const raw = localStorage.getItem(KEYS.MEDICINES);
    if (!raw) {
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify(INITIAL_SAVED_MEDICINES));
      return INITIAL_SAVED_MEDICINES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read medicines from localStorage', e);
    return INITIAL_SAVED_MEDICINES;
  }
}

export function saveMedicines(items: MedicineItem[]): void {
  try {
    localStorage.setItem(KEYS.MEDICINES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write medicines to localStorage', e);
  }
}

export function addOrUpdateMedicine(med: MedicineItem): MedicineItem[] {
  const current = getStoredMedicines();
  const index = current.findIndex(m => m.id === med.id || m.name.toLowerCase() === med.name.toLowerCase());
  let updated: MedicineItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...med };
  } else {
    updated = [med, ...current];
  }
  saveMedicines(updated);
  return updated;
}

export function deleteMedicine(id: string): MedicineItem[] {
  const current = getStoredMedicines();
  const updated = current.filter(m => m.id !== id);
  saveMedicines(updated);
  return updated;
}

export function getStoredReminders(): MedReminder[] {
  try {
    const raw = localStorage.getItem(KEYS.REMINDERS);
    if (!raw) {
      localStorage.setItem(KEYS.REMINDERS, JSON.stringify(INITIAL_REMINDERS));
      return INITIAL_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read reminders from localStorage', e);
    return INITIAL_REMINDERS;
  }
}

export function saveReminders(items: MedReminder[]): void {
  try {
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write reminders to localStorage', e);
  }
}

export function getStoredCaregivers(): CaregiverPatient[] {
  try {
    const raw = localStorage.getItem(KEYS.CAREGIVERS);
    if (!raw) {
      localStorage.setItem(KEYS.CAREGIVERS, JSON.stringify(INITIAL_CAREGIVER_PATIENTS));
      return INITIAL_CAREGIVER_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CAREGIVER_PATIENTS;
  }
}

export function saveCaregivers(items: CaregiverPatient[]): void {
  try {
    localStorage.setItem(KEYS.CAREGIVERS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write caregivers to localStorage', e);
  }
}

export function getStoredLogs(): CaregiverLog[] {
  try {
    const raw = localStorage.getItem(KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_CAREGIVER_LOGS));
      return INITIAL_CAREGIVER_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CAREGIVER_LOGS;
  }
}

export function saveLogs(logs: CaregiverLog[]): void {
  try {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

export function getStoredProfile(): PatientProfile {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PATIENT_PROFILE));
      return INITIAL_PATIENT_PROFILE;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PATIENT_PROFILE;
  }
}

export function saveProfile(profile: PatientProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function resetAllStorage(): void {
  try {
    localStorage.setItem(KEYS.MEDICINES, JSON.stringify(INITIAL_SAVED_MEDICINES));
    localStorage.setItem(KEYS.REMINDERS, JSON.stringify(INITIAL_REMINDERS));
    localStorage.setItem(KEYS.CAREGIVERS, JSON.stringify(INITIAL_CAREGIVER_PATIENTS));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_CAREGIVER_LOGS));
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PATIENT_PROFILE));
  } catch (e) {
    console.error('Failed to reset localStorage', e);
  }
}

// Aliases for convenience
export const loadMedicines = getStoredMedicines;
export const loadReminders = getStoredReminders;
export const loadProfile = getStoredProfile;
export const loadCaregivers = getStoredCaregivers;
