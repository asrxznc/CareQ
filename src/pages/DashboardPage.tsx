import React, { useState } from 'react';
import { Page, MedicineItem, MedReminder, CaregiverPatient } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Camera, 
  FileText, 
  Sun, 
  Sunset, 
  Moon, 
  Users, 
  Info, 
  Bell, 
  Check, 
  AlertCircle,
  Calendar,
  Sparkles,
  Pill,
  Coffee,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../lib/notifications';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  reminders: MedReminder[];
  onToggleReminderTaken: (reminderId: string, dateStr: string) => void;
  onSelectMedicineForDetails: (med: MedicineItem) => void;
  caregivers: CaregiverPatient[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  savedMedicines = [],
  reminders = [],
  onToggleReminderTaken,
  onSelectMedicineForDetails,
  caregivers = [],
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [remindLaterNotice, setRemindLaterNotice] = useState<string | null>(null);

  // Active reminders calculation
  const activeReminders = reminders.filter(r => r.active);
  const takenTodayCount = activeReminders.filter(r => !!r.takenHistory?.[todayStr]).length;
  const totalTodayCount = Math.max(activeReminders.length, 3);
  const adherencePercentage = Math.round((takenTodayCount / (activeReminders.length || 1)) * 100);

  // Identify next medicine
  // Priority: 1st pending dose, or fallback to the first active medicine
  const pendingReminder = activeReminders.find(r => !r.takenHistory?.[todayStr]);
  const heroReminder = pendingReminder || activeReminders[0] || {
    id: 'rem-metformin-morning',
    medicineName: 'Metformin 500 mg',
    dosage: '1 tablet',
    time: '09:00',
    mealTiming: 'after',
    notes: 'After Breakfast',
    takenHistory: {},
  };

  const isHeroTaken = !!heroReminder.takenHistory?.[todayStr];

  const handleTakenClick = (reminderId: string) => {
    onToggleReminderTaken(reminderId, todayStr);
    playChimeSound('success');
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#39B54A', '#12A89D', '#087F8C', '#4C8DFF'],
    });
  };

  const handleRemindMeLater = (medName: string) => {
    setRemindLaterNotice(`Snoozed ${medName} for 15 minutes. A gentle alert will chime.`);
    setTimeout(() => {
      setRemindLaterNotice(null);
    }, 4000);
  };

  // 4 Daily Timeline Slots
  const timelineSlots = [
    {
      id: 'morning',
      title: 'Morning',
      time: '9:00 AM',
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-emerald-50/40 border-emerald-200/70',
      medName: 'Metformin 500 mg',
      dosage: '1 tablet • After Food',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('metformin'))?.id || 'rem-metformin-morning',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('metformin'))?.takenHistory?.[todayStr],
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      time: '1:00 PM',
      icon: Sun,
      iconColor: 'text-orange-400',
      bgColor: 'bg-amber-50/40 border-amber-200/70',
      medName: 'Amlodipine 5 mg',
      dosage: '1 tablet • After Food',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('amlodipine'))?.id || 'rem-amlodipine-afternoon',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('amlodipine'))?.takenHistory?.[todayStr],
    },
    {
      id: 'evening',
      title: 'Evening',
      time: '7:00 PM',
      icon: Sunset,
      iconColor: 'text-rose-500',
      bgColor: 'bg-orange-50/40 border-orange-200/70',
      medName: 'Atorvastatin 10 mg',
      dosage: '1 tablet • After Food',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('atorvastatin'))?.id || 'rem-atorvastatin-evening',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('atorvastatin'))?.takenHistory?.[todayStr],
    },
    {
      id: 'night',
      title: 'Night',
      time: '10:00 PM',
      icon: Moon,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50/40 border-indigo-200/70',
      medName: 'Vitamin D3 1000 IU',
      dosage: '1 tablet • After Food',
      reminderId: reminders.find(r => r.medicineName.toLowerCase().includes('vitamin'))?.id || 'rem-vitamind3-night',
      isTaken: !!reminders.find(r => r.medicineName.toLowerCase().includes('vitamin'))?.takenHistory?.[todayStr],
    },
  ];

  // Colors reference strip for bottom
  const colorPalette = [
    { code: '#39B54A', name: 'Primary Green' },
    { code: '#12A89D', name: 'Teal' },
    { code: '#087F8C', name: 'Deep Teal' },
    { code: '#102A43', name: 'Navy' },
    { code: '#F6FAF8', name: 'Background' },
    { code: '#FFFFFF', name: 'Surface White' },
    { code: '#243B53', name: 'Text' },
    { code: '#6B7C93', name: 'Muted' },
    { code: '#2E9D57', name: 'Success' },
    { code: '#F2B84B', name: 'Warning' },
    { code: '#D9534F', name: 'Alert' },
    { code: '#4C8DFF', name: 'Medicine Accent' },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* Snooze/Notice Banner */}
      {remindLaterNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between text-sm shadow-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{remindLaterNotice}</span>
          </div>
          <button
            onClick={() => setRemindLaterNotice(null)}
            className="text-xs font-bold text-amber-700 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          ROW 1: Next Medicine Hero | Today's Adherence | Caregiver Status
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Next Medicine Hero Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle top border accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#39B54A] via-[#12A89D] to-[#087F8C]" />
          
          <div>
            {/* Header bar */}
            <div className="flex items-center justify-between gap-2 pb-4">
              <div className="flex items-center gap-2 text-[#102A43] font-bold text-base sm:text-lg">
                <Clock className="w-5 h-5 text-[#39B54A]" />
                <span>Next Medicine</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#12A89D] border border-teal-200/70">
                {isHeroTaken ? 'Dose Completed' : 'Time to Take'}
              </span>
            </div>

            {/* Medicine Body */}
            <div className="flex items-center gap-4 sm:gap-5 my-2">
              {/* Medicine Capsule Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#E6F0FF] flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#4C8DFF] flex items-center justify-center text-white shadow-md shadow-blue-500/30 transform -rotate-45">
                  <Pill className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>

              {/* Medicine Details */}
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#102A43] tracking-tight truncate">
                  {heroReminder.medicineName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6B7C93] mt-1 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-slate-400" />
                    {heroReminder.dosage}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-amber-600" />
                    {heroReminder.notes || 'After Food'}
                  </span>
                </div>
              </div>

              {/* Big Scheduled Time */}
              <div className="text-right shrink-0">
                <div className="font-display text-xl sm:text-2xl font-black text-[#102A43]">
                  {heroReminder.time === '09:00' ? '9:00 AM' : heroReminder.time}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 mt-2 border-t border-slate-100">
            {isHeroTaken ? (
              <button
                id="hero-taken-btn"
                onClick={() => handleTakenClick(heroReminder.id)}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Mark as Pending</span>
              </button>
            ) : (
              <button
                id="hero-taken-btn"
                onClick={() => handleTakenClick(heroReminder.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#39B54A] hover:bg-[#2E9D57] active:scale-98 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-green-600/30 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>TAKEN</span>
              </button>
            )}

            <button
              id="hero-remind-later-btn"
              onClick={() => handleRemindMeLater(heroReminder.medicineName)}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#243B53] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Remind Me Later</span>
            </button>
          </div>
        </div>

        {/* Today's Adherence Metric Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="font-bold text-base text-[#102A43]">Today&apos;s Adherence</h3>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-[#2E9D57] border border-green-200">
              <Check className="w-3 h-3" />
              <span>{adherencePercentage}% On Track</span>
            </span>
          </div>

          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center py-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#E2E8F0"
                  strokeWidth="9"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#2E9D57"
                  strokeWidth="9"
                  strokeDasharray="238.7"
                  strokeDashoffset={238.7 - (238.7 * Math.min(adherencePercentage, 100)) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-3xl font-extrabold text-[#102A43] leading-none">
                  {takenTodayCount}/{totalTodayCount}
                </span>
                <span className="text-xs font-semibold text-[#6B7C93] mt-0.5">Taken</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-[#6B7C93] font-medium pt-2 border-t border-slate-100">
            Great job, Ramesh! Keep going for better health.
          </p>
        </div>

        {/* Caregiver Status Card (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 font-bold text-base text-[#102A43]">
              <Users className="w-5 h-5 text-[#12A89D]" />
              <span>Caregiver Status</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6FAF8] border border-slate-100 my-2">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-[#2E9D57] font-bold text-sm shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#102A43] truncate">Anita (Daughter)</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E9D57]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2E9D57]" />
                  Connected
                </span>
              </div>
            </div>

            <p className="text-xs text-[#6B7C93] leading-relaxed mt-2 font-medium">
              Can view your medication progress and reminder status.
            </p>
          </div>

          <button
            onClick={() => onNavigate('caregiver')}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#12A89D] hover:text-[#087F8C] transition-colors cursor-pointer group"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: Today's Medication Timeline (Wide) | Prescription Scanner
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Today's Medication Timeline (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#12A89D]" />
              <h3 className="font-display font-bold text-base sm:text-lg text-[#102A43]">
                Today&apos;s Medication Timeline
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F6FAF8] text-[#102A43] border border-slate-200">
              Wed, 3 Sep
            </span>
          </div>

          {/* 4 Time Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 my-4">
            {timelineSlots.map((slot) => {
              const Icon = slot.icon;
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    slot.isTaken 
                      ? 'bg-emerald-50/50 border-emerald-300/80 shadow-2xs' 
                      : 'bg-[#F6FAF8] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-4 h-4 ${slot.iconColor}`} />
                        <span className="font-bold text-xs text-[#102A43]">{slot.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#6B7C93]">{slot.time}</span>
                    </div>

                    {/* Medicine name */}
                    <div className="mt-3">
                      <p className="font-bold text-sm text-[#102A43] leading-snug line-clamp-1">
                        {slot.medName}
                      </p>
                      <p className="text-[11px] text-[#6B7C93] mt-0.5">{slot.dosage}</p>
                    </div>
                  </div>

                  {/* Status Button / Badge */}
                  <div className="mt-4 pt-2 border-t border-slate-100/80">
                    {slot.isTaken ? (
                      <button
                        onClick={() => handleTakenClick(slot.reminderId)}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#2E9D57] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs hover:bg-emerald-700 transition-colors cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Taken</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTakenClick(slot.reminderId)}
                        className="w-full py-1.5 px-2 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        title="Click to mark as Taken"
                      >
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Pending</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#6B7C93] border-t border-slate-100">
            <span>Tap any status button to mark a dose as Taken or Pending.</span>
            <button
              onClick={() => onNavigate('reminders')}
              className="font-semibold text-[#12A89D] hover:underline cursor-pointer"
            >
              Full Schedule →
            </button>
          </div>
        </div>

        {/* Prescription Scanner Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 font-bold text-base text-[#102A43]">
              <FileText className="w-5 h-5 text-[#39B54A]" />
              <span>Prescription Scanner</span>
            </div>

            <p className="text-xs text-[#6B7C93] leading-relaxed">
              Upload or scan your prescription, and let CareQ read &amp; schedule your medicines.
            </p>

            {/* Two Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
              <button
                id="dash-upload-rx-btn"
                onClick={() => onNavigate('scanner')}
                className="py-2.5 px-3 rounded-xl bg-[#39B54A] hover:bg-[#2E9D57] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-green-600/20 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Prescription</span>
              </button>

              <button
                id="dash-camera-rx-btn"
                onClick={() => onNavigate('scanner')}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#102A43] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#12A89D]" />
                <span>Scan Prescription</span>
              </button>
            </div>

            {/* Recent Prescription Document Box */}
            <div className="mt-4 p-3 rounded-xl bg-[#F6FAF8] border border-slate-200/80">
              <p className="text-[11px] font-bold text-[#6B7C93] uppercase tracking-wider mb-2">
                Recent Prescription
              </p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#4C8DFF] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-[#102A43] truncate">Prescription_Sept.pdf</p>
                    <p className="text-[10px] text-[#6B7C93]">Uploaded on 28 Aug 2026</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#2E9D57] shrink-0 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  Processed
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('scanner')}
            className="mt-3 text-xs font-bold text-[#12A89D] hover:text-[#087F8C] transition-colors cursor-pointer text-left"
          >
            Review Prescription Medicines →
          </button>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: My Medicines Overview | Medicine Information | Upcoming Reminders
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* My Medicines Overview Table (6 cols on lg) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-base text-[#102A43]">
                <Pill className="w-5 h-5 text-[#4C8DFF]" />
                <span>My Medicines Overview</span>
              </div>
              <button
                onClick={() => onNavigate('medicines')}
                className="text-xs font-bold text-[#12A89D] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Manage Medicines</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto my-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#6B7C93] border-b border-slate-100 font-semibold">
                    <th className="py-2.5 pr-3">Medicine</th>
                    <th className="py-2.5 px-2">Dosage</th>
                    <th className="py-2.5 px-2">Frequency</th>
                    <th className="py-2.5 px-2">Food Instructions</th>
                    <th className="py-2.5 px-2">Duration</th>
                    <th className="py-2.5 pl-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#243B53]">
                  {savedMedicines.slice(0, 3).map((med, idx) => {
                    const pillColors = ['#4C8DFF', '#E05252', '#F2B84B', '#9333EA'];
                    const color = pillColors[idx % pillColors.length];
                    return (
                      <tr 
                        key={med.id} 
                        onClick={() => {
                          onSelectMedicineForDetails(med);
                          onNavigate('details');
                        }}
                        className="hover:bg-[#F6FAF8] transition-colors cursor-pointer"
                      >
                        <td className="py-3 pr-3 font-bold text-[#102A43] flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate max-w-[130px]">{med.name}</span>
                        </td>
                        <td className="py-3 px-2 text-[#6B7C93]">{med.dosageForm || '1 tablet'}</td>
                        <td className="py-3 px-2">Once daily</td>
                        <td className="py-3 px-2 text-[#6B7C93]">After Food</td>
                        <td className="py-3 px-2 text-[#6B7C93]">{idx === 1 ? '2 months' : '3 months'}</td>
                        <td className="py-3 pl-2 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#2E9D57] border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E9D57]" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#6B7C93] flex items-center justify-between border-t border-slate-100">
            <span>Showing primary active prescriptions</span>
            <span className="font-semibold text-[#102A43]">{savedMedicines.length} total medicines</span>
          </div>
        </div>

        {/* Medicine Information Educational Card (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 font-bold text-base text-[#102A43]">
              <Info className="w-5 h-5 text-[#12A89D]" />
              <span>Medicine Information</span>
            </div>

            {/* Medicine Header */}
            <div className="flex items-center gap-2.5 mt-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#4C8DFF]">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#102A43]">Metformin 500 mg</p>
                <p className="text-[11px] text-[#6B7C93]">Diabetes (Blood Sugar Control)</p>
              </div>
            </div>

            {/* Common Side Effects */}
            <div className="space-y-1.5 my-3">
              <p className="text-xs font-bold text-[#102A43]">Common Side Effects:</p>
              <ul className="text-xs text-[#6B7C93] space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#2E9D57] shrink-0" />
                  <span>Mild stomach upset</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#2E9D57] shrink-0" />
                  <span>Nausea (usually goes away)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-[#2E9D57] shrink-0" />
                  <span>Loose motions</span>
                </li>
              </ul>
            </div>

            {/* Tip Box */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs mt-3 flex items-start gap-2">
              <span className="text-sm">💡</span>
              <p className="font-medium leading-snug">
                <strong>Tip:</strong> Take after food to avoid stomach upset.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const metformin = savedMedicines.find(m => m.name.toLowerCase().includes('metformin')) || savedMedicines[0];
              if (metformin) {
                onSelectMedicineForDetails(metformin);
                onNavigate('details');
              }
            }}
            className="mt-4 text-xs font-bold text-[#12A89D] hover:underline cursor-pointer"
          >
            Learn More About Metformin →
          </button>
        </div>

        {/* Upcoming Reminders Card (3 cols on lg) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-base text-[#102A43]">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>Upcoming Reminders</span>
              </div>
              <button
                onClick={() => onNavigate('reminders')}
                className="text-xs font-bold text-[#12A89D] hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 my-2">
              <div className="py-2.5 flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E05252] mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B7C93]">Today, 1:00 PM</p>
                  <p className="font-bold text-xs text-[#102A43]">Amlodipine 5 mg</p>
                  <p className="text-[10px] text-slate-500">1 tablet • After Food</p>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B] mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B7C93]">Today, 7:00 PM</p>
                  <p className="font-bold text-xs text-[#102A43]">Atorvastatin 10 mg</p>
                  <p className="text-[10px] text-slate-500">1 tablet • After Food</p>
                </div>
              </div>

              <div className="py-2.5 flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4C8DFF] mt-1 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#6B7C93]">Today, 10:00 PM</p>
                  <p className="font-bold text-xs text-[#102A43]">Vitamin D3 1000 IU</p>
                  <p className="text-[10px] text-slate-500">1 tablet • After Food</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reminders')}
            className="mt-2 w-full py-2 bg-[#F6FAF8] hover:bg-slate-100 rounded-xl text-center text-xs font-bold text-[#102A43] border border-slate-200 cursor-pointer"
          >
            Manage All Reminders
          </button>
        </div>
      </div>

      {/* =========================================================================
          Color Palette Reference Bar (As in Design Reference Image)
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#102A43]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#12A89D]" />
            CareQ System Color Palette Reference
          </span>
          <span className="text-[#6B7C93] font-normal text-[11px]">Primary Healthcare Design System</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {colorPalette.map((col) => (
            <div 
              key={col.code}
              className="flex flex-col items-center text-center p-1.5 rounded-xl border border-slate-100 hover:scale-105 transition-transform"
            >
              <div 
                className="w-full h-7 rounded-lg shadow-2xs border border-black/5"
                style={{ backgroundColor: col.code }}
              />
              <span className="text-[10px] font-mono font-bold text-[#102A43] mt-1">{col.code}</span>
              <span className="text-[9px] text-[#6B7C93] font-medium truncate w-full">{col.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
