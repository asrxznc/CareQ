import React, { useState } from 'react';
import { Page, MedicineItem, MedReminder, CaregiverPatient, PatientProfile } from '../types';
import { 
  Users, 
  HeartHandshake, 
  UserPlus, 
  Pill, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  FileText, 
  Plus, 
  X, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  Calendar, 
  ChevronRight, 
  Activity, 
  LogOut, 
  Search, 
  ExternalLink,
  Scan,
  User,
  Heart,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound, sendBrowserNotification } from '../lib/notifications';

interface CaretakerDashboardPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  reminders: MedReminder[];
  caregivers: CaregiverPatient[];
  onAddCaregiver: (patient: CaregiverPatient) => void;
  onAddReminder: (reminder: MedReminder) => void;
  onToggleReminderTaken: (reminderId: string, dateStr: string) => void;
  onSelectMedicineForDetails: (med: MedicineItem) => void;
  caretakerName?: string;
  onLogout: () => void;
}

export const CaretakerDashboardPage: React.FC<CaretakerDashboardPageProps> = ({
  onNavigate,
  savedMedicines,
  reminders,
  caregivers,
  onAddCaregiver,
  onAddReminder,
  onToggleReminderTaken,
  onSelectMedicineForDetails,
  caretakerName = 'Anita Kumar',
  onLogout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Default initial patients list if empty
  const defaultPatients: CaregiverPatient[] = caregivers.length > 0 ? caregivers : [
    {
      id: 'pat-ramesh',
      name: 'Ramesh Kumar',
      relationship: 'Father',
      age: 71,
      gender: 'Male',
      bloodGroup: 'B+',
      conditions: ['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
      emergencyContact: '+1 (555) 392-8801',
      emergencyPhone: '+1 (555) 392-8801',
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorPhone: '+1 (555) 234-9000',
      adherenceRate: 88,
      medicationCount: savedMedicines.length || 4,
      notes: 'Takes morning Metformin after breakfast; needs reminders for evening statin.',
      recentLogs: [
        { id: 'l-1', date: '09:02 AM Today', type: 'taken', message: 'Metformin 500 mg confirmed taken after breakfast.' },
        { id: 'l-2', date: 'Yesterday 07:15 PM', type: 'taken', message: 'Atorvastatin 10 mg taken after dinner.' },
      ]
    },
    {
      id: 'pat-margaret',
      name: 'Margaret Chen',
      relationship: 'Mother-in-Law',
      age: 69,
      gender: 'Female',
      bloodGroup: 'O+',
      conditions: ['Mild Osteoporosis', 'Joint Pain'],
      emergencyContact: '+1 (555) 481-9920',
      emergencyPhone: '+1 (555) 481-9920',
      doctorName: 'Dr. Robert Blake, MD',
      doctorPhone: '+1 (555) 234-8811',
      adherenceRate: 94,
      medicationCount: 2,
      notes: 'Takes Calcium and Vitamin D supplements with morning tea.',
      recentLogs: [
        { id: 'l-3', date: '08:30 AM Today', type: 'taken', message: 'Calcium Citrate 600mg taken with morning tea.' }
      ]
    }
  ];

  const [patients, setPatients] = useState<CaregiverPatient[]>(defaultPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatients[0]?.id || 'pat-ramesh');
  const [nudgeStatus, setNudgeStatus] = useState<string | null>(null);

  // Modals state
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // New patient form
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientRelation, setNewPatientRelation] = useState('Mother');
  const [newPatientAge, setNewPatientAge] = useState('72');
  const [newPatientConditions, setNewPatientConditions] = useState('Hypertension, Arthritis');
  const [newPatientPhone, setNewPatientPhone] = useState('+1 (555) 329-8812');

  // New reminder form
  const [newMedName, setNewMedName] = useState('');
  const [newDose, setNewDose] = useState('1 tablet');
  const [newTime, setNewTime] = useState('09:00');
  const [newTiming, setNewTiming] = useState<'before' | 'after' | 'with'>('after');

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Calculate high-level caretaker metrics
  const activeReminders = reminders.filter(r => r.active);
  const takenCountToday = activeReminders.filter(r => !!r.takenHistory?.[todayStr]).length;
  const pendingCountToday = activeReminders.filter(r => !r.takenHistory?.[todayStr]).length;

  // Mock missed dose alert for demonstration
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Prescriptions on file
  const activePrescriptions = [
    {
      id: 'rx-1',
      doctorName: 'Dr. Sarah Jenkins, MD',
      clinic: 'Cardiology & Internal Health Clinic',
      date: 'Aug 28, 2026',
      medicinesCount: 3,
      medicines: ['Metformin 500 mg', 'Amlodipine 5 mg', 'Atorvastatin 10 mg'],
      status: 'Active • Verified by Caretaker',
    },
    {
      id: 'rx-2',
      doctorName: 'Dr. Michael Vance, MD',
      clinic: 'St. Jude Endocrinology Associates',
      date: 'Jul 14, 2026',
      medicinesCount: 1,
      medicines: ['Vitamin D3 1000 IU'],
      status: 'Active Refill',
    }
  ];

  const handleSendNudge = (patientName: string) => {
    playChimeSound('reminder');
    sendBrowserNotification(`Caregiver Nudge sent to ${patientName}`, {
      body: `Dose notification sent to ${patientName}'s CareQ app and phone.`,
    });
    setNudgeStatus(`Gentle dose reminder sent to ${patientName}! A chime was sounded.`);
    setTimeout(() => {
      setNudgeStatus(null);
    }, 4000);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newPat: CaregiverPatient = {
      id: `pat-${Date.now()}`,
      name: newPatientName.trim(),
      relationship: newPatientRelation.trim(),
      age: parseInt(newPatientAge) || 70,
      adherenceRate: 90,
      medicationCount: 2,
      emergencyContact: newPatientPhone.trim(),
      emergencyPhone: newPatientPhone.trim(),
      conditions: newPatientConditions.split(',').map(c => c.trim()).filter(Boolean),
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          date: 'Just now',
          type: 'taken',
          message: 'Enrolled in Caretaker Network.',
        }
      ]
    };

    setPatients([newPat, ...patients]);
    onAddCaregiver(newPat);
    setSelectedPatientId(newPat.id);
    setShowAddPatientModal(false);
    setNewPatientName('');
    playChimeSound('success');
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newRem: MedReminder = {
      id: `rem-${Date.now()}`,
      medicineName: newMedName.trim(),
      dosage: newDose.trim(),
      time: newTime,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      mealTiming: newTiming,
      active: true,
      notes: `${newTiming === 'before' ? 'Before Food' : 'After Food'} • Set by Caretaker`,
      takenHistory: {},
    };

    onAddReminder(newRem);
    setShowAddReminderModal(false);
    setNewMedName('');
    playChimeSound('success');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#12A89D', '#39B54A', '#087F8C'],
    });
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. WELCOME MESSAGE & TOP HEADER */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#087F8C] text-xs font-bold mb-3">
              <HeartHandshake className="w-3.5 h-3.5 text-[#12A89D]" />
              <span>Caretaker Portal &bull; Live Monitoring</span>
            </div>
            
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102A43] tracking-tight">
              Welcome back, {caretakerName}
            </h1>
            
            <p className="mt-1.5 text-sm sm:text-base text-[#6B7C93] max-w-2xl">
              You are actively overseeing care schedules and prescriptions for <span className="font-semibold text-[#102A43]">{patients.length} family patients</span>.
            </p>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12A89D] hover:bg-[#087F8C] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Prescription for Patient</span>
            </button>

            <button
              id="caretaker-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              title="Logout of Caretaker Dashboard"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Nudge Confirmation Toast */}
        {nudgeStatus && (
          <div className="mt-5 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-sm font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12A89D]" />
              <span>{nudgeStatus}</span>
            </div>
            <button onClick={() => setNudgeStatus(null)} className="text-teal-700 hover:text-teal-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* 2. PATIENT OVERVIEW (KEY METRICS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Patients Under Care</span>
            <Users className="w-4 h-4 text-[#12A89D]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-[#102A43]">{patients.length}</span>
            <span className="text-xs text-slate-500 font-medium">Family Members</span>
          </div>
          <p className="text-xs text-[#12A89D] font-semibold mt-2">● All connected &amp; active</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Overall Adherence</span>
            <Activity className="w-4 h-4 text-[#39B54A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-[#102A43]">{currentPatient.adherenceRate}%</span>
            <span className="text-xs text-[#39B54A] font-bold">Excellent</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on last 7 days of dose logs</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Medicines</span>
            <Pill className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-[#102A43]">{savedMedicines.length || 4}</span>
            <span className="text-xs text-slate-500 font-medium">Prescriptions</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{activeReminders.length} daily reminder alarms</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Missed Dose Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-[#D9534F]">{alertDismissed ? '0' : '1'}</span>
            <span className="text-xs text-amber-600 font-bold">{alertDismissed ? 'All caught up' : 'Needs attention'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Afternoon dose alert</p>
        </div>
      </section>

      {/* 3. MISSED DOSE ALERTS SECTION */}
      {!alertDismissed && (
        <section id="missed-dose-alerts-section" className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900 uppercase tracking-wide">
                    Missed Dose Alert
                  </span>
                  <span className="text-xs text-amber-800 font-medium">Today 1:30 PM (30 min overdue)</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Amlodipine 5 mg was not confirmed for {currentPatient.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                  Scheduled for 1:00 PM after lunch. You can send a direct chime nudge or call the patient.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:self-center">
              <button
                onClick={() => handleSendNudge(currentPatient.name)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Dose Nudge</span>
              </button>

              <a
                href={`tel:${currentPatient.emergencyContact || '5553928801'}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>Call Patient</span>
              </a>

              <button
                onClick={() => {
                  setAlertDismissed(true);
                  playChimeSound('success');
                }}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. MY PATIENTS (PATIENT MANAGEMENT & SELECTOR) */}
      <section id="my-patients-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
              My Patients
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7C93]">
              Select a dependent to review their medication plan, logs, and schedule.
            </p>
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#12A89D] text-[#12A89D] hover:bg-teal-50 text-xs sm:text-sm font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Dependent Patient</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {patients.map((pat) => {
            const isSelected = pat.id === selectedPatientId;
            return (
              <div
                key={pat.id}
                onClick={() => setSelectedPatientId(pat.id)}
                className={`bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-[#12A89D] ring-2 ring-[#12A89D]/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#12A89D] to-[#39B54A] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                      {pat.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-[#102A43]">{pat.name}</h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7C93] font-medium">
                        {pat.relationship} &bull; Age {pat.age} &bull; Blood {pat.bloodGroup || 'B+'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#39B54A] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                      {pat.adherenceRate}% Adherence
                    </span>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pat.conditions.map((cond, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                      {cond}
                    </span>
                  ))}
                </div>

                {/* Patient Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${pat.emergencyPhone || '5553928801'}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#12A89D] font-bold hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{pat.emergencyPhone || '+1 (555) 392-8801'}</span>
                    </a>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNudge(pat.name);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#087F8C] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Nudge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MEDICINE MANAGEMENT FOR CURRENT PATIENT */}
      <section id="medicine-management-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#12A89D]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                Medicine Management &bull; {currentPatient.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7C93] mt-0.5">
              Review active prescribed therapies, instructions, and adherence safety guidance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-[#087F8C] hover:bg-teal-100 font-bold text-xs transition-colors cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan New Rx</span>
            </button>

            <button
              onClick={() => onNavigate('medicines')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#102A43] text-white hover:bg-[#087F8C] font-bold text-xs transition-colors cursor-pointer"
            >
              <span>View Full Clinical Catalog &rarr;</span>
            </button>
          </div>
        </div>

        {/* Medicines Table / Cards */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {savedMedicines.map((med) => (
            <div key={med.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#12A89D] shrink-0 font-bold text-xs mt-0.5">
                  Rx
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-[#102A43]">{med.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {med.dosageForm || 'Tablet'}
                    </span>
                    <span className="text-xs text-teal-700 font-semibold">
                      {med.category || 'Prescription'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7C93] mt-1 line-clamp-1">
                    <span className="font-semibold text-slate-700">Directions:</span> {med.howToTake}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    Food guidance: {med.foodInteractions?.[0] || 'Take after meals with water'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => {
                    onSelectMedicineForDetails(med);
                    onNavigate('details');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Clinical Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PRESCRIPTIONS ON FILE */}
      <section id="prescriptions-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#12A89D]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                Prescriptions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7C93] mt-0.5">
              Verified clinical prescriptions and scanned doctor orders for {currentPatient.name}.
            </p>
          </div>

          <button
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12A89D] hover:bg-[#087F8C] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Scan className="w-4 h-4" />
            <span>Upload / Scan New Prescription</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {activePrescriptions.map((rx) => (
            <div key={rx.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    {rx.status}
                  </span>
                  <h3 className="font-bold text-base text-[#102A43] mt-2">{rx.doctorName}</h3>
                  <p className="text-xs text-[#6B7C93]">{rx.clinic}</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{rx.date}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70">
                <p className="text-xs font-bold text-slate-700 mb-1.5">
                  Prescribed Items ({rx.medicinesCount}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {rx.medicines.map((m, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prescription Verified
                </span>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="text-[#12A89D] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Re-scan / Review</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. MEDICINE REMINDERS SCHEDULE */}
      <section id="medicine-reminders-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#12A89D]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                Medicine Reminders &bull; Daily Schedule
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7C93] mt-0.5">
              Timed reminders configured to chime on {currentPatient.name}&rsquo;s device.
            </p>
          </div>

          <button
            onClick={() => setShowAddReminderModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102A43] hover:bg-[#087F8C] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeReminders.map((rem) => {
            const isTaken = !!rem.takenHistory?.[todayStr];
            return (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isTaken 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#12A89D]" />
                    <span className="font-bold text-sm text-[#102A43]">{rem.time}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isTaken ? 'Dose Taken' : 'Pending'}
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#102A43]">{rem.medicineName}</h4>
                <p className="text-xs text-[#6B7C93] mt-0.5">{rem.dosage} &bull; {rem.notes}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onToggleReminderTaken(rem.id, todayStr)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isTaken
                        ? 'text-emerald-700 hover:bg-emerald-100'
                        : 'bg-[#12A89D] text-white hover:bg-[#087F8C]'
                    }`}
                  >
                    {isTaken ? '✓ Logged Taken' : 'Mark as Taken'}
                  </button>

                  <button
                    onClick={() => handleSendNudge(currentPatient.name)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Send Nudge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CARETAKER PROFILE & EMERGENCY CONTACTS */}
      <section id="profile-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-[#12A89D] font-bold text-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-[#102A43]">{caretakerName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/60">
                  Primary Family Caretaker
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7C93] mt-1">
                Connected Phone: <span className="font-semibold text-slate-700">+1 (555) 392-8810</span> &bull; Email: <span className="font-semibold text-slate-700">anita.kumar@careq.health</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Notifications active via In-App Chime &amp; Push Alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Caretaker Preferences
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#D9534F] text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </section>

      {/* MODAL: ADD DEPENDENT PATIENT */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#12A89D]" />
                <h3 className="font-bold text-lg text-[#102A43]">Add Dependent Patient</h3>
              </div>
              <button onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={newPatientRelation}
                    onChange={(e) => setNewPatientRelation(e.target.value)}
                    placeholder="Father, Mother, Spouse"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    placeholder="71"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Health Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={newPatientConditions}
                  onChange={(e) => setNewPatientConditions(e.target.value)}
                  placeholder="Diabetes, Hypertension"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  placeholder="+1 (555) 392-8801"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#12A89D] hover:bg-[#087F8C] text-white font-bold text-xs shadow-xs"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REMINDER */}
      {showAddReminderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#12A89D]" />
                <h3 className="font-bold text-lg text-[#102A43]">Schedule Reminder for {currentPatient.name}</h3>
              </div>
              <button onClick={() => setShowAddReminderModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Metformin 500 mg"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newDose}
                    onChange={(e) => setNewDose(e.target.value)}
                    placeholder="1 tablet"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Meal Timing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['after', 'before', 'with'] as const).map((timing) => (
                    <button
                      key={timing}
                      type="button"
                      onClick={() => setNewTiming(timing)}
                      className={`py-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                        newTiming === timing
                          ? 'bg-teal-50 border-[#12A89D] text-[#12A89D]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {timing} Food
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#12A89D] hover:bg-[#087F8C] text-white font-bold text-xs shadow-xs"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
