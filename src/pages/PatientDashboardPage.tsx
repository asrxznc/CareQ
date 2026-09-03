import React, { useState } from 'react';
import { Page, MedicineItem, MedReminder, CaregiverPatient, PatientProfile } from '../types';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Scan, 
  Camera, 
  Upload, 
  Sparkles, 
  Pill, 
  Bell, 
  History, 
  Phone, 
  HeartHandshake, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  LogOut, 
  Coffee, 
  FileText,
  Calendar,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound, sendBrowserNotification } from '../lib/notifications';

interface PatientDashboardPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  reminders: MedReminder[];
  onToggleReminderTaken: (reminderId: string, dateStr: string) => void;
  onSelectMedicineForDetails: (med: MedicineItem) => void;
  caregivers: CaregiverPatient[];
  profile: PatientProfile | null;
  onLogout: () => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({
  onNavigate,
  savedMedicines,
  reminders,
  onToggleReminderTaken,
  onSelectMedicineForDetails,
  caregivers,
  profile,
  onLogout,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [snoozeNotice, setSnoozeNotice] = useState<string | null>(null);
  const [caretakerMessageSent, setCaretakerMessageSent] = useState(false);

  const patientName = profile?.name || 'Ramesh Kumar';
  const firstName = patientName.split(' ')[0] || 'Ramesh';

  // Primary Caregiver
  const primaryCaregiver = caregivers[0] || {
    id: 'care-anita',
    name: 'Anita Kumar',
    relationship: 'Daughter / Primary Caregiver',
    emergencyPhone: '+1 (555) 392-8810',
    emergencyContact: '+1 (555) 392-8810',
  };

  // Active reminders
  const activeReminders = reminders.filter(r => r.active);
  const pendingReminder = activeReminders.find(r => !r.takenHistory?.[todayStr]);
  const heroReminder = pendingReminder || activeReminders[0] || {
    id: 'rem-metformin-morning',
    medicineName: 'Metformin 500 mg',
    dosage: '1 tablet',
    time: '09:00',
    mealTiming: 'after',
    notes: 'After Breakfast &bull; Blood sugar support',
    takenHistory: {},
  };

  const isHeroTaken = !!heroReminder.takenHistory?.[todayStr];
  const takenCount = activeReminders.filter(r => !!r.takenHistory?.[todayStr]).length;
  const totalCount = Math.max(activeReminders.length, 3);
  const adherencePercent = Math.round((takenCount / (activeReminders.length || 1)) * 100);

  const handleTakeDose = (reminderId: string) => {
    onToggleReminderTaken(reminderId, todayStr);
    playChimeSound('success');
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#39B54A', '#12A89D', '#087F8C', '#4C8DFF'],
    });
  };

  const handleSnooze = (medName: string) => {
    setSnoozeNotice(`Reminder for ${medName} snoozed for 15 minutes. CareQ will chime softly.`);
    setTimeout(() => {
      setSnoozeNotice(null);
    }, 4000);
  };

  const handleSendCaregiverCheckin = () => {
    playChimeSound('success');
    sendBrowserNotification(`Message sent to ${primaryCaregiver.name}`, {
      body: `${firstName} logged today's medicine on time.`,
    });
    setCaretakerMessageSent(true);
    setTimeout(() => {
      setCaretakerMessageSent(false);
    }, 4000);
  };

  // 4 timeline slots
  const timelineSlots = [
    {
      id: 'morning',
      title: 'Morning',
      time: '9:00 AM',
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-emerald-50/40 border-emerald-200/80',
      medName: 'Metformin 500 mg',
      dosage: '1 tablet • After Breakfast',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('metformin'))?.id || 'rem-metformin-morning',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('metformin'))?.takenHistory?.[todayStr],
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      time: '1:00 PM',
      icon: Sun,
      iconColor: 'text-orange-400',
      bgColor: 'bg-amber-50/40 border-amber-200/80',
      medName: 'Amlodipine 5 mg',
      dosage: '1 tablet • After Lunch',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('amlodipine'))?.id || 'rem-amlodipine-afternoon',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('amlodipine'))?.takenHistory?.[todayStr],
    },
    {
      id: 'evening',
      title: 'Evening',
      time: '7:00 PM',
      icon: Sunset,
      iconColor: 'text-rose-500',
      bgColor: 'bg-orange-50/40 border-orange-200/80',
      medName: 'Atorvastatin 10 mg',
      dosage: '1 tablet • After Dinner',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('atorvastatin'))?.id || 'rem-atorvastatin-evening',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('atorvastatin'))?.takenHistory?.[todayStr],
    },
    {
      id: 'night',
      title: 'Night',
      time: '10:00 PM',
      icon: Moon,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-slate-50 border-slate-200',
      medName: 'Vitamin D3 1000 IU',
      dosage: '1 tablet • Bedtime',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('vitamin'))?.id || 'rem-vitamind3-night',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('vitamin'))?.takenHistory?.[todayStr],
    }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* 1. WELCOME MESSAGE & HEADER */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#39B54A]" />
              <span>Patient Health Companion &bull; Safe &amp; Simplified</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102A43] tracking-tight">
              Good Morning, {firstName} 👋
            </h1>

            <p className="mt-1.5 text-sm sm:text-base text-[#6B7C93] max-w-2xl">
              Today is <span className="font-semibold text-slate-800">Wednesday, 3 September 2026</span>. You have taken <span className="font-bold text-[#12A89D]">{takenCount} of {activeReminders.length || 3}</span> scheduled medicines today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="patient-scan-action-btn"
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39B54A] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Medicine / Prescription</span>
            </button>

            <button
              id="patient-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              title="Logout of Patient Dashboard"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Snooze feedback */}
        {snoozeNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{snoozeNotice}</span>
            </div>
            <button onClick={() => setSnoozeNotice(null)} className="text-amber-700 hover:text-amber-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Caregiver message feedback */}
        {caretakerMessageSent && (
          <div className="mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#12A89D]" />
              <span>Notification sent to {primaryCaregiver.name}!</span>
            </div>
            <button onClick={() => setCaretakerMessageSent(false)} className="text-teal-700 hover:text-teal-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* 2. UPCOMING DOSE (PROMINENT HERO CARD) */}
      <section id="upcoming-dose-section" className="bg-gradient-to-br from-white to-teal-50/40 border-2 border-[#12A89D]/40 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4 sm:gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
              isHeroTaken 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-teal-500 text-white border-teal-600'
            }`}>
              {isHeroTaken ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8 animate-pulse" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#12A89D] text-white uppercase tracking-wide">
                  {isHeroTaken ? 'Completed Dose' : 'Upcoming Dose'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#087F8C]">
                  {heroReminder.time} &bull; Scheduled Today
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A43] mt-2">
                {heroReminder.medicineName}
              </h2>

              <p className="text-sm sm:text-base text-[#486581] font-medium mt-1">
                Take <span className="font-bold text-[#102A43]">{heroReminder.dosage}</span> &bull; {heroReminder.notes}
              </p>

              <div className="flex items-center gap-2 text-xs text-[#087F8C] font-semibold mt-2">
                <Coffee className="w-4 h-4 text-[#12A89D]" />
                <span>Instructions: Take right after meals with a full glass of water.</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            {isHeroTaken ? (
              <button
                onClick={() => handleTakeDose(heroReminder.id)}
                className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm flex items-center gap-2 shadow-xs cursor-pointer hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Marked as Taken (Undo)</span>
              </button>
            ) : (
              <button
                id="btn-take-hero-dose"
                onClick={() => handleTakeDose(heroReminder.id)}
                className="px-6 py-3.5 rounded-2xl bg-[#39B54A] hover:bg-emerald-600 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>✓ I’ve Taken This Medicine</span>
              </button>
            )}

            {!isHeroTaken && (
              <button
                onClick={() => handleSnooze(heroReminder.medicineName)}
                className="px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Remind in 15 Mins</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. MEDICINE RECOGNITION (PROMINENT AI SCANNER HERO) */}
      <section id="medicine-recognition-section" className="bg-gradient-to-r from-[#102A43] to-[#087F8C] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Background decorative pill circle */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold mb-3 border border-white/20">
              <Scan className="w-3.5 h-3.5 text-[#39B54A]" />
              <span>AI Medicine &amp; Prescription Recognition</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Instant Medicine &amp; Prescription Scanner
            </h2>

            <p className="mt-2 text-sm sm:text-base text-teal-50/90 leading-relaxed font-normal">
              Point your camera or upload a photo of your prescription slip, medicine box, or tablet strip. CareQ uses AI vision to extract the medicine name, dosage instructions, and auto-generates your daily reminders.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-teal-100/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39B54A]" />
                Reads Doctor Handwritings &amp; Packaging
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39B54A]" />
                Simple Plain English Explanations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39B54A]" />
                1-Click Schedule Setup
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              id="open-scanner-button"
              onClick={() => onNavigate('scanner')}
              className="px-6 py-3.5 rounded-2xl bg-[#39B54A] hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Scan Medicine Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Prescription Photo</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. TODAY'S MEDICINES (DAILY TIMELINE) */}
      <section id="todays-medicines-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#12A89D]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102A43]">
                Today’s Medicines
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7C93] mt-0.5">
              Check off your medicines as you take them. Your family caregiver is automatically updated.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            {takenCount} of {timelineSlots.length} doses logged
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timelineSlots.map((slot) => {
            const SlotIcon = slot.icon;
            return (
              <div
                key={slot.id}
                className={`p-5 rounded-2xl border transition-all ${
                  slot.isTaken
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SlotIcon className={`w-5 h-5 ${slot.iconColor}`} />
                    <span className="font-bold text-sm text-[#102A43]">{slot.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{slot.time}</span>
                </div>

                <h4 className="font-bold text-base text-[#102A43] line-clamp-1">{slot.medName}</h4>
                <p className="text-xs text-[#6B7C93] mt-1">{slot.dosage}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleTakeDose(slot.reminderId)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      slot.isTaken
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-[#12A89D] hover:bg-[#087F8C] text-white'
                    }`}
                  >
                    {slot.isTaken ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Taken ✓</span>
                      </>
                    ) : (
                      <span>Mark as Taken</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MY PRESCRIPTIONS & MEDICINE REMINDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* MY PRESCRIPTIONS */}
        <section id="my-prescriptions-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#12A89D]" />
              <h3 className="font-display text-xl font-bold text-[#102A43]">My Prescriptions</h3>
            </div>
            <button
              onClick={() => onNavigate('scanner')}
              className="text-xs font-bold text-[#12A89D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Add Rx</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    Active Prescription
                  </span>
                  <h4 className="font-bold text-sm text-[#102A43] mt-1.5">Dr. Sarah Jenkins, MD</h4>
                  <p className="text-xs text-slate-500">Cardiology Health Center &bull; Aug 28, 2026</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">3 Medicines</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                Metformin 500 mg, Amlodipine 5 mg, Atorvastatin 10 mg
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    Refill Prescription
                  </span>
                  <h4 className="font-bold text-sm text-[#102A43] mt-1.5">Dr. Michael Vance, MD</h4>
                  <p className="text-xs text-slate-500">St. Jude Endocrinology &bull; Jul 14, 2026</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">1 Medicine</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 font-medium">
                Vitamin D3 1000 IU (1 capsule nightly)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('medicines')}
            className="w-full py-2.5 text-center text-xs font-bold text-[#12A89D] hover:bg-teal-50 rounded-xl transition-colors cursor-pointer border border-dashed border-teal-200"
          >
            View All {savedMedicines.length} Prescribed Medicines &rarr;
          </button>
        </section>

        {/* MEDICINE REMINDERS */}
        <section id="medicine-reminders-patient-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#12A89D]" />
              <h3 className="font-display text-xl font-bold text-[#102A43]">Medicine Reminders</h3>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs font-bold text-[#12A89D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Alarms &rarr;</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeReminders.slice(0, 3).map((rem) => {
              const isDone = !!rem.takenHistory?.[todayStr];
              return (
                <div key={rem.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#12A89D] font-bold text-xs flex items-center justify-center shrink-0">
                      {rem.time}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#102A43]">{rem.medicineName}</p>
                      <p className="text-xs text-[#6B7C93]">{rem.dosage} &bull; {rem.mealTiming === 'after' ? 'After food' : 'Before food'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTakeDose(rem.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isDone ? 'Taken ✓' : 'Mark Taken'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center gap-2.5 text-xs text-[#087F8C]">
            <Bell className="w-4 h-4 shrink-0 text-[#12A89D]" />
            <span>Sound alerts and gentle chimes are enabled on your device.</span>
          </div>
        </section>
      </div>

      {/* 6. MEDICATION HISTORY & CARETAKER INFORMATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* MEDICATION HISTORY */}
        <section id="medication-history-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#39B54A]" />
              <h3 className="font-display text-xl font-bold text-[#102A43]">Medication History</h3>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-[#12A89D] hover:underline cursor-pointer"
            >
              Full History &rarr;
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900">7-Day Adherence Streak</span>
              <span className="text-sm font-extrabold text-[#39B54A]">{adherencePercent}% On-Time</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-emerald-200 overflow-hidden">
              <div className="h-full bg-[#39B54A] rounded-full" style={{ width: `${Math.max(adherencePercent, 60)}%` }} />
            </div>
            <p className="text-xs text-emerald-800 mt-2">
              🔥 5-day continuous adherence. Keep up the good work taking your medicines on time!
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-800">Metformin 500 mg</span>
              <span className="text-emerald-700 font-semibold">Taken 9:02 AM Today</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-800">Atorvastatin 10 mg</span>
              <span className="text-emerald-700 font-semibold">Taken 7:15 PM Yesterday</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="font-medium text-slate-800">Amlodipine 5 mg</span>
              <span className="text-emerald-700 font-semibold">Taken 1:10 PM Yesterday</span>
            </div>
          </div>
        </section>

        {/* CARETAKER INFORMATION */}
        <section id="caretaker-info-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#12A89D]" />
              <h3 className="font-display text-xl font-bold text-[#102A43]">Caretaker Information</h3>
            </div>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
              Connected &bull; Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#12A89D] to-[#39B54A] text-white font-bold text-lg flex items-center justify-center shrink-0">
                {primaryCaregiver.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base text-[#102A43]">{primaryCaregiver.name}</h4>
                <p className="text-xs text-[#6B7C93]">{primaryCaregiver.relationship}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Connected Phone: <span className="font-semibold text-slate-800">{primaryCaregiver.emergencyPhone || '+1 (555) 392-8810'}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B7C93] mt-3 border-t border-slate-200/70 pt-2.5">
              {primaryCaregiver.name} automatically receives a confirmation whenever you mark a dose as taken.
            </p>

            <div className="mt-3.5 flex items-center gap-3">
              <a
                href={`tel:${primaryCaregiver.emergencyPhone || '5553928810'}`}
                className="flex-1 py-2 px-3 rounded-xl bg-[#102A43] hover:bg-[#087F8C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {primaryCaregiver.name.split(' ')[0]}</span>
              </a>

              <button
                onClick={handleSendCaregiverCheckin}
                className="py-2 px-3 rounded-xl border border-[#12A89D] text-[#12A89D] hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Send &ldquo;I&rsquo;m OK&rdquo;</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 7. PROFILE & LOGOUT SECTION */}
      <section id="patient-profile-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-[#12A89D] font-bold text-xl flex items-center justify-center shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-[#102A43]">{patientName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                  Patient Profile
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B7C93] mt-1">
                Age {profile?.age || 71} &bull; Blood {profile?.bloodGroup || 'B+'} &bull; Primary Doctor: <span className="font-semibold text-slate-700">{profile?.doctorName || 'Dr. Sarah Jenkins, MD'}</span>
              </p>
              <p className="text-xs text-rose-700 font-medium mt-1">
                Allergies: {profile?.allergies?.join(', ') || 'Penicillin, Sulfa drugs'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Manage Medical Profile
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

    </div>
  );
};
