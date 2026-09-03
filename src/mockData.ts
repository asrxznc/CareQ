import { MedicineItem, MedReminder, CaregiverPatient, PatientProfile, CaregiverLog } from './types';

// Today's date string YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

export const INITIAL_SAVED_MEDICINES: MedicineItem[] = [
  {
    id: 'med-metformin-500',
    name: 'Metformin 500 mg',
    genericName: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosageForm: 'Film-coated Tablet',
    manufacturer: 'Merck Healthcare / Sun Pharma',
    indications: ['Type 2 Diabetes (Blood Sugar Control)', 'Insulin Resistance'],
    howToTake: 'Take 1 tablet after breakfast with a full glass of water. Always take after meals to avoid mild stomach upset.',
    commonSideEffects: [
      'Mild stomach upset',
      'Nausea (usually goes away)',
      'Loose motions / mild diarrhea'
    ],
    seriousSideEffects: [
      'Lactic acidosis (very rare: extreme fatigue, muscle weakness, slow breathing)',
      'Severe hypoglycemia when skipped meals'
    ],
    contraindications: ['Severe renal impairment', 'Acute metabolic acidosis'],
    foodInteractions: ['Take after food to protect stomach lining', 'Avoid excessive alcohol'],
    storageAdvice: 'Store below 25°C in a dry place away from heat and direct sunlight.',
    missedDoseGuidance: 'Take as soon as remembered with food. If close to your next meal, skip the missed dose. Never take a double dose.',
    expiryDate: '10/2028',
    batchNumber: 'MT-88410',
    scannedAt: '2026-08-28T09:30:00Z',
    category: 'Antidiabetic / Blood Sugar',
    confidenceScore: 98,
    simpleEnglishGuide: {
      medicineName: 'Metformin 500 mg',
      genericName: 'Metformin Hydrochloride',
      uses: ['Controls blood sugar for Type 2 Diabetes', 'Helps your body respond better to insulin naturally'],
      dosage: '1 tablet once or twice daily right after meals with water',
      sideEffects: ['Mild stomach upset', 'Temporary nausea', 'Metallic taste in mouth'],
      foodInstructions: 'Always take after food to avoid an upset stomach',
      warning: 'Do not take on an empty stomach. Drink plenty of water throughout the day.',
      missedDoseAdvice: 'Take it with your next meal if you remember. Do not take two tablets together.',
    }
  },
  {
    id: 'med-amlodipine-5',
    name: 'Amlodipine 5 mg',
    genericName: 'Amlodipine Besylate',
    strength: '5 mg',
    dosageForm: 'Tablet',
    manufacturer: 'Pfizer / Cipla',
    indications: ['Hypertension (High Blood Pressure)', 'Coronary Artery Disease', 'Angina Prevention'],
    howToTake: 'Take 1 tablet in the afternoon after lunch with a glass of water. Try taking it around the same time daily.',
    commonSideEffects: [
      'Mild ankle swelling',
      'Flushing or warmth in face',
      'Dizziness when standing quickly'
    ],
    seriousSideEffects: [
      'Rapid or pounding heartbeat',
      'Severe chest pain or shortness of breath'
    ],
    contraindications: ['Severe hypotension', 'Cardiogenic shock'],
    foodInteractions: ['Can be taken with or without food; taking after lunch is recommended for consistency', 'Avoid grapefruit juice in large quantities'],
    storageAdvice: 'Store at room temperature 15°C–30°C in a moisture-tight container.',
    missedDoseGuidance: 'Take the dose as soon as you remember that afternoon. If more than 12 hours have passed, wait until tomorrow.',
    expiryDate: '07/2027',
    batchNumber: 'AM-40291',
    scannedAt: '2026-08-28T09:30:00Z',
    category: 'Antihypertensive / Blood Pressure',
    confidenceScore: 97,
    simpleEnglishGuide: {
      medicineName: 'Amlodipine 5 mg',
      genericName: 'Amlodipine Besylate',
      uses: ['Lowers blood pressure gently', 'Protects your heart and blood vessels'],
      dosage: '1 tablet once daily in the afternoon after lunch',
      sideEffects: ['Mild ankle swelling', 'Feeling warm or flushed', 'Light dizziness'],
      foodInstructions: 'Take with or after lunch; avoid large amounts of grapefruit juice',
      warning: 'Stand up slowly from sitting to avoid dizziness. Do not abruptly stop taking.',
      missedDoseAdvice: 'Take as soon as you remember. If it is already night, just wait until next afternoon.',
    }
  },
  {
    id: 'med-atorvastatin-10',
    name: 'Atorvastatin 10 mg',
    genericName: 'Atorvastatin Calcium',
    strength: '10 mg',
    dosageForm: 'Film-coated Tablet',
    manufacturer: 'Viatris / Pfizer',
    indications: ['Hyperlipidemia (High Cholesterol)', 'Atherosclerosis Prevention', 'Cardiovascular Risk Reduction'],
    howToTake: 'Take 1 tablet in the evening after dinner with water. The liver produces most cholesterol at night, so evening dosing is optimal.',
    commonSideEffects: [
      'Mild muscle aches or stiffness',
      'Mild headache',
      'Transient digestive discomfort'
    ],
    seriousSideEffects: [
      'Unexplained severe muscle tenderness or dark urine (rhabdomyolysis)',
      'Yellowing of eyes or skin (liver flags)'
    ],
    contraindications: ['Active liver disease', 'Severe unexplained liver enzyme elevations'],
    foodInteractions: ['Take after dinner', 'Avoid excessive grapefruit consumption'],
    storageAdvice: 'Store below 25°C. Keep out of reach of children.',
    missedDoseGuidance: 'Take if remembered within 12 hours. If it is morning, skip and take at your regular evening time.',
    expiryDate: '03/2028',
    batchNumber: 'AT-99120',
    scannedAt: '2026-08-28T09:30:00Z',
    category: 'Statin / Cholesterol Control',
    confidenceScore: 99,
    simpleEnglishGuide: {
      medicineName: 'Atorvastatin 10 mg',
      genericName: 'Atorvastatin Calcium',
      uses: ['Reduces bad cholesterol (LDL)', 'Protects arteries and supports overall heart health'],
      dosage: '1 tablet once daily in the evening after dinner',
      sideEffects: ['Mild muscle stiffness', 'Slight headache', 'Stomach fullness'],
      foodInstructions: 'Best taken after dinner in the evening with water',
      warning: 'Call your doctor if you experience severe unexplained muscle soreness.',
      missedDoseAdvice: 'Skip the missed dose if you wake up the next morning; do not double up.',
    }
  },
  {
    id: 'med-vitamind3-1000',
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    strength: '1000 IU',
    dosageForm: 'Softgel Capsule',
    manufacturer: 'Nature Made / Abbott',
    indications: ['Vitamin D Deficiency', 'Bone Density & Osteoporosis Support', 'Immune Health'],
    howToTake: 'Take 1 softgel at night after food or before sleep with water.',
    commonSideEffects: ['Very well tolerated; mild stomach fullness occasionally'],
    seriousSideEffects: ['Hypercalcemia (only with extreme long-term overdose)'],
    contraindications: ['Severe hypercalcemia', 'Severe vitamin D toxicity'],
    foodInteractions: ['Fat-soluble vitamin; absorbs best when taken after meals containing healthy fats'],
    storageAdvice: 'Store in a cool dry place below 25°C.',
    missedDoseGuidance: 'Take whenever you remember the next day.',
    expiryDate: '12/2028',
    batchNumber: 'VD-11029',
    scannedAt: '2026-08-28T09:30:00Z',
    category: 'Vitamin Supplement / Bone Care',
    confidenceScore: 99,
    simpleEnglishGuide: {
      medicineName: 'Vitamin D3 1000 IU',
      genericName: 'Cholecalciferol',
      uses: ['Strengthens bones and joints', 'Supports immune system resilience for seniors'],
      dosage: '1 softgel once daily at night after food',
      sideEffects: ['Very safe and gentle on the stomach'],
      foodInstructions: 'Absorbs best when taken after a meal containing food',
      warning: 'Do not exceed prescribed daily dose unless instructed by your doctor.',
      missedDoseAdvice: 'Simply take the next night.',
    }
  }
];

export const SAMPLE_PRESET_SCANS = [
  {
    title: "Dr. Jenkins Rx: Ramesh's Prescription (Clinic Document)",
    sampleName: 'Prescription_Sept.pdf',
    description: "Doctor's slip with Metformin 500mg, Amlodipine 5mg, Atorvastatin 10mg, and Vitamin D3",
    badge: 'Clinical Prescription',
    packagingType: 'prescription_slip',
    imagePreview: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    medicinesHint: 'Metformin 500mg twice daily, Amlodipine 5mg once daily after lunch, Atorvastatin 10mg once daily at night, Vitamin D3 1000 IU',
  },
  {
    title: 'Metformin 500mg (Foil Blister Strip)',
    sampleName: 'Metformin',
    description: 'Oral antidiabetic tablets in pharmaceutical blister foil for blood sugar control',
    badge: 'Blister Strip',
    packagingType: 'blister_strip',
    imagePreview: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    medicinesHint: 'Metformin 500mg',
  },
  {
    title: 'Amlodipine 5mg (Amber Rx Bottle)',
    sampleName: 'Amlodipine',
    description: 'Standard pharmacy prescription bottle with dosage instructions for blood pressure',
    badge: 'Rx Bottle',
    packagingType: 'bottle',
    imagePreview: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
    medicinesHint: 'Amlodipine 5mg',
  },
  {
    title: 'Blurry Glare Strip (Unreadable Test)',
    sampleName: 'Unreadable Blurry Sample',
    description: 'Test graceful unreadable image handling with tips & manual review fallback',
    badge: 'Unreadable Demo',
    packagingType: 'unknown',
    imagePreview: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=600&q=80',
    medicinesHint: 'test unreadable blurry glare',
  },
];

export const INITIAL_REMINDERS: MedReminder[] = [
  {
    id: 'rem-metformin-morning',
    medicineId: 'med-metformin-500',
    medicineName: 'Metformin 500 mg',
    dosage: '1 tablet',
    time: '09:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    mealTiming: 'after',
    active: true,
    notes: 'After Breakfast • Blood sugar control',
    takenHistory: {
      [getTodayStr()]: true, // Already taken today!
      '2026-09-02': true,
      '2026-09-01': true,
    },
  },
  {
    id: 'rem-amlodipine-afternoon',
    medicineId: 'med-amlodipine-5',
    medicineName: 'Amlodipine 5 mg',
    dosage: '1 tablet',
    time: '13:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    mealTiming: 'after',
    active: true,
    notes: 'After Lunch • Blood pressure management',
    takenHistory: {
      '2026-09-02': true,
      '2026-09-01': true,
    },
  },
  {
    id: 'rem-atorvastatin-evening',
    medicineId: 'med-atorvastatin-10',
    medicineName: 'Atorvastatin 10 mg',
    dosage: '1 tablet',
    time: '19:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    mealTiming: 'after',
    active: true,
    notes: 'After Dinner • Cholesterol support',
    takenHistory: {
      '2026-09-02': true,
      '2026-09-01': true,
    },
  },
  {
    id: 'rem-vitamind3-night',
    medicineId: 'med-vitamind3-1000',
    medicineName: 'Vitamin D3 1000 IU',
    dosage: '1 tablet',
    time: '22:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    mealTiming: 'after',
    active: true,
    notes: 'After Dinner / Night • Bone & immune strength',
    takenHistory: {
      '2026-09-02': true,
      '2026-09-01': true,
    },
  },
];

export const INITIAL_CAREGIVER_PATIENTS: CaregiverPatient[] = [
  {
    id: 'care-anita',
    name: 'Anita (Daughter)',
    relationship: 'Daughter / Primary Caregiver',
    age: 44,
    gender: 'Female',
    bloodGroup: 'B+',
    allergies: ['None'],
    conditions: ['Caregiver for Ramesh Kumar'],
    emergencyPhone: '+1 (555) 392-8810',
    emergencyContact: '+1 (555) 392-8810',
    doctorName: 'Dr. Sarah Jenkins, MD (Cardiology)',
    doctorPhone: '+1 (555) 234-9000',
    adherenceRate: 87,
    medicationCount: 4,
    notes: 'Anita checks Ramesh’s medication log daily and helps review new prescriptions.',
    recentLogs: [
      { id: 'log-1', date: '09:02 AM Today', type: 'taken', message: 'Metformin 500 mg confirmed taken after breakfast.' },
      { id: 'log-2', date: 'Yesterday 07:15 PM', type: 'taken', message: 'Atorvastatin 10 mg taken after dinner.' },
      { id: 'log-3', date: 'Yesterday 01:10 PM', type: 'taken', message: 'Amlodipine 5 mg taken after lunch.' },
    ],
  },
];

export const INITIAL_CAREGIVER_LOGS: CaregiverLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-03T09:02:00Z',
    type: 'taken',
    medicineName: 'Metformin 500 mg',
    note: 'Ramesh took morning dose right after breakfast.',
    author: 'Ramesh (Self)',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-02T19:15:00Z',
    type: 'taken',
    medicineName: 'Atorvastatin 10 mg',
    note: 'Evening dose confirmed after dinner.',
    author: 'Ramesh (Self)',
  },
  {
    id: 'log-3',
    timestamp: '2026-09-02T13:10:00Z',
    type: 'taken',
    medicineName: 'Amlodipine 5 mg',
    note: 'Afternoon blood pressure dose logged on time.',
    author: 'Ramesh (Self)',
  },
];

export const INITIAL_PATIENT_PROFILE: PatientProfile = {
  name: 'Ramesh Kumar',
  email: 'ramesh.kumar@careq.health',
  phone: '+1 (555) 392-8801',
  age: 71,
  gender: 'Male',
  bloodGroup: 'B+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension', 'High Cholesterol'],
  emergencyContactName: 'Anita Kumar (Daughter)',
  emergencyContactPhone: '+1 (555) 392-8810',
  doctorName: 'Dr. Sarah Jenkins, MD',
  doctorPhone: '+1 (555) 234-9000',
  hospitalPreference: 'St. Jude Memorial Health Center',
  notificationsEnabled: true,
  soundAlertsEnabled: true,
  notes: 'Requires large readable text and simple after-food reminders.',
};

export const PRESET_INTERACTION_PAIRS = [
  { drugA: 'Metformin', drugB: 'Alcohol', label: 'Metformin + Alcohol', risk: 'High', color: 'orange', tag: 'Lactic Acidosis Risk' },
  { drugA: 'Amlodipine', drugB: 'Grapefruit', label: 'Amlodipine + Grapefruit', risk: 'Moderate', color: 'amber', tag: 'CYP3A4 Inhibition' },
  { drugA: 'Warfarin', drugB: 'Aspirin', label: 'Warfarin + Aspirin', risk: 'Severe', color: 'red', tag: 'Severe Bleeding Risk' },
  { drugA: 'Atorvastatin', drugB: 'Clarithromycin', label: 'Atorvastatin + Clarithromycin', risk: 'High', color: 'orange', tag: 'Myopathy Risk' },
];
