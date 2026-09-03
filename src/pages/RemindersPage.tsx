import React, { useState, useEffect } from 'react';
import { Page, MedReminder, MedicineItem } from '../types';
import { 
  Bell, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  Volume2, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Coffee,
  Sun,
  Moon,
  Sunset,
  X,
  Flame,
  Code2,
  Database,
  ExternalLink,
  Copy,
  Info,
  CalendarDays,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  requestNotificationPermission, 
  sendBrowserNotification, 
  playChimeSound,
  JAVASCRIPT_NOTIFICATION_CODE
} from '../lib/notifications';
import { MedicineTimeline } from '../components/MedicineTimeline';

interface RemindersPageProps {
  onNavigate: (page: Page) => void;
  reminders: MedReminder[];
  savedMedicines: MedicineItem[];
  onAddReminder: (reminder: MedReminder) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminderTaken: (reminderId: string, dateStr: string) => void;
  prefilledMedicineName?: string;
  prefilledDosage?: string;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  onNavigate,
  reminders = [],
  savedMedicines = [],
  onAddReminder,
  onDeleteReminder,
  onToggleReminderTaken,
  prefilledMedicineName,
  prefilledDosage,
}) => {
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');
  const [showAddModal, setShowAddModal] = useState(!!prefilledMedicineName);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'grid'>('timeline');

  // New Reminder Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [medName, setMedName] = useState(prefilledMedicineName || '');
  const [dosage, setDosage] = useState(prefilledDosage || '1 tablet');
  const [scheduleType, setScheduleType] = useState<'specific_date' | 'daily'>('specific_date');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [time, setTime] = useState('09:00');
  const [mealTiming, setMealTiming] = useState<'before' | 'after' | 'with' | 'any'>('with');
  const [notes, setNotes] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPerm(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPerm(perm);
    if (perm === 'granted') {
      sendBrowserNotification('Medication Reminders Active', {
        body: 'JavaScript Notification API enabled. You will receive real-time alerts for scheduled doses.',
      });
      playChimeSound('success');
    }
  };

  const handleTestNotification = () => {
    playChimeSound('reminder');
    if (notificationPerm === 'granted') {
      sendBrowserNotification('Time for your Metformin 850mg', {
        body: 'Scheduled Dose: 1 tablet. Take with breakfast and drink a full glass of water.',
      });
    } else {
      handleRequestPermission();
    }
  };

  // Quick preset helper to set time to 1 minute from now (great for instant testing)
  const setTestTimeInOneMinute = () => {
    const testDate = new Date(Date.now() + 60 * 1000);
    const h = String(testDate.getHours()).padStart(2, '0');
    const m = String(testDate.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
    setSelectedDate(todayStr);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const newReminder: MedReminder = {
      id: `rem-${Date.now()}`,
      medicineName: medName.trim(),
      dosage: dosage.trim() || '1 dose',
      time: time || '09:00',
      scheduledDate: scheduleType === 'specific_date' ? selectedDate : undefined,
      daysOfWeek: scheduleType === 'daily' ? daysOfWeek : [new Date(selectedDate).getDay()],
      mealTiming,
      active: true,
      notes: notes.trim(),
      takenHistory: {},
    };

    onAddReminder(newReminder);
    setShowAddModal(false);
    setMedName('');
    setNotes('');
    playChimeSound('success');

    // If scheduled for today and upcoming, show prompt
    if (notificationPerm !== 'granted') {
      handleRequestPermission();
    }
  };

  const handleTakeDose = (id: string) => {
    onToggleReminderTaken(id, todayStr);
    playChimeSound('success');
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#0d9488', '#10b981', '#3b82f6']
    });
  };

  const toggleDay = (dayIdx: number) => {
    if (daysOfWeek.includes(dayIdx)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter(d => d !== dayIdx));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, dayIdx].sort());
    }
  };

  const copyNotificationCode = () => {
    navigator.clipboard.writeText(JAVASCRIPT_NOTIFICATION_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayOfWeek = new Date().getDay();

  // Filter today's reminders
  const todayReminders = reminders.filter(r => {
    if (!r.active) return false;
    if (r.scheduledDate) {
      return r.scheduledDate === todayStr;
    }
    return r.daysOfWeek.includes(todayDayOfWeek);
  });

  // Categorize doses by time of day for grid view
  const morningDoses = todayReminders.filter(r => r.time >= '05:00' && r.time < '12:00');
  const afternoonDoses = todayReminders.filter(r => r.time >= '12:00' && r.time < '17:00');
  const eveningDoses = todayReminders.filter(r => r.time >= '17:00' && r.time < '21:00');
  const nightDoses = todayReminders.filter(r => r.time >= '21:00' || r.time < '05:00');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Browser Notification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>JavaScript Notification API & Local Storage</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Medicine Reminders & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Schedule medications with custom date and time, stored locally and alerted via browser notifications.
          </p>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>JS Notification Code</span>
          </button>

          <button
            id="reminders-add-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      <div className="p-4 sm:p-5 rounded-3xl glass-card border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            notificationPerm === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-slate-900">
                Browser Notification Status
              </h3>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                notificationPerm === 'granted' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {notificationPerm === 'granted' ? 'Permission Granted' : 'Permission Required'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                <Database className="w-3 h-3 text-slate-400" />
                <span>LocalStorage: {reminders.length} Saved</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {notificationPerm === 'granted' 
                ? 'Desktop & mobile notifications active. Chimes will ring and popup at the exact scheduled date and time.'
                : 'Grant permission so your browser can show notifications at scheduled times, even if you are in another tab.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {notificationPerm !== 'granted' && (
            <button
              id="reminders-enable-perm-btn"
              onClick={handleRequestPermission}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Grant Notification Permission
            </button>
          )}

          <button
            id="reminders-test-chime-btn"
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Test Notification Now</span>
          </button>
        </div>
      </div>

      {/* Adherence Streak Banner */}
      <div className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/50 to-blue-50/50 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Daily Medication Adherence
            </h3>
            <p className="text-xs text-slate-500">
              Scheduled notifications ensure optimal blood concentration levels throughout the day.
            </p>
          </div>
        </div>

        {/* 7-Day Dots */}
        <div className="flex items-center gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'].map((day, idx) => (
            <div key={day} className="text-center">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                idx < 5 || idx === 6 
                  ? 'bg-teal-600 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {idx < 5 || idx === 6 ? '✓' : '•'}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 font-medium">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Switcher: Today's Timeline vs Full Regimen Grid */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today's Medicine Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Time-of-Day Grid</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
          {todayReminders.length} doses scheduled for today
        </span>
      </div>

      {/* Mode 1: Prominent Today's Medicine Timeline */}
      {activeTab === 'timeline' && (
        <MedicineTimeline
          todayReminders={todayReminders}
          todayStr={todayStr}
          onTakeDose={handleTakeDose}
          onDeleteReminder={onDeleteReminder}
          onOpenAddModal={() => setShowAddModal(true)}
        />
      )}

      {/* Mode 2: Dosage Timetable by Time of Day */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">
              Regimen Categorized by Time of Day ({todayStr})
            </h2>
            <span className="text-xs text-slate-500">
              {todayReminders.length} total scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Morning */}
            <div className="glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <h3 className="font-display font-bold text-sm text-slate-900">Morning</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">05:00 - 12:00</span>
              </div>
              {morningDoses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No morning doses</p>
              ) : (
                morningDoses.map(rem => (
                  <ReminderItemCard
                    key={rem.id}
                    reminder={rem}
                    todayStr={todayStr}
                    onTakeDose={handleTakeDose}
                    onDelete={onDeleteReminder}
                  />
                ))
              )}
            </div>

            {/* Afternoon */}
            <div className="glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-teal-600" />
                  <h3 className="font-display font-bold text-sm text-slate-900">Afternoon</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">12:00 - 17:00</span>
              </div>
              {afternoonDoses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No afternoon doses</p>
              ) : (
                afternoonDoses.map(rem => (
                  <ReminderItemCard
                    key={rem.id}
                    reminder={rem}
                    todayStr={todayStr}
                    onTakeDose={handleTakeDose}
                    onDelete={onDeleteReminder}
                  />
                ))
              )}
            </div>

            {/* Evening */}
            <div className="glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  <h3 className="font-display font-bold text-sm text-slate-900">Evening</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">17:00 - 21:00</span>
              </div>
              {eveningDoses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No evening doses</p>
              ) : (
                eveningDoses.map(rem => (
                  <ReminderItemCard
                    key={rem.id}
                    reminder={rem}
                    todayStr={todayStr}
                    onTakeDose={handleTakeDose}
                    onDelete={onDeleteReminder}
                  />
                ))
              )}
            </div>

            {/* Night / Bedtime */}
            <div className="glass-card p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-display font-bold text-sm text-slate-900">Bedtime</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">21:00 - 05:00</span>
              </div>
              {nightDoses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No night doses</p>
              ) : (
                nightDoses.map(rem => (
                  <ReminderItemCard
                    key={rem.id}
                    reminder={rem}
                    todayStr={todayStr}
                    onTakeDose={handleTakeDose}
                    onDelete={onDeleteReminder}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Add Medicine Reminder
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves to LocalStorage & alerts via JavaScript Notification API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              
              {/* Medicine Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg, Lisinopril, Metformin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                {savedMedicines.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400">Quick select from cabinet:</span>
                    {savedMedicines.slice(0, 4).map(m => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setMedName(m.name);
                          setDosage(m.strength || '1 dose');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-medium cursor-pointer"
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Dosage Quantity
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 tablet, 2 capsules, 5 ml"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Schedule Type Selection: Specific Date vs Recurring Daily */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Schedule Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleType('specific_date')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      scheduleType === 'specific_date'
                        ? 'bg-teal-50 text-teal-800 border-teal-400 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
                    <span>Specific Date</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('daily')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      scheduleType === 'daily'
                        ? 'bg-teal-50 text-teal-800 border-teal-400 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Recurring Daily</span>
                  </button>
                </div>
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheduleType === 'specific_date' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(todayStr)}
                        className="text-[10px] text-teal-700 hover:underline"
                      >
                        Today
                      </button>
                      <span className="text-[10px] text-slate-400">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const tmrw = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                          setSelectedDate(tmrw);
                        }}
                        className="text-[10px] text-teal-700 hover:underline"
                      >
                        Tomorrow
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Days of Week
                    </label>
                    <div className="flex justify-between gap-1 pt-1">
                      {dayLabels.map((lbl, idx) => (
                        <button
                          type="button"
                          key={lbl}
                          onClick={() => toggleDay(idx)}
                          className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
                            daysOfWeek.includes(idx)
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {lbl[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Scheduled Time (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 font-mono"
                  />
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={setTestTimeInOneMinute}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold hover:bg-amber-100 flex items-center gap-0.5 cursor-pointer"
                      title="Set to 1 minute from now to test notification trigger"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-600" />
                      <span>+1 min test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime('08:00')}
                      className="text-[10px] text-slate-500 hover:text-slate-800"
                    >
                      08:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime('13:00')}
                      className="text-[10px] text-slate-500 hover:text-slate-800"
                    >
                      13:00
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime('20:00')}
                      className="text-[10px] text-slate-500 hover:text-slate-800"
                    >
                      20:00
                    </button>
                  </div>
                </div>
              </div>

              {/* Meal Timing */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Food & Meal Relationship
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['with', 'before', 'after', 'any'] as const).map(timing => (
                    <button
                      type="button"
                      key={timing}
                      onClick={() => setMealTiming(timing)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                        mealTiming === timing
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {timing} meal
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Special Notes / Doctor Instructions
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take with a full glass of water, avoid grapefruit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Will persist to LocalStorage</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Save & Schedule
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JavaScript Notification API Code Inspector Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full text-slate-100 shadow-2xl border border-slate-800 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                <h3 className="font-display font-bold text-base text-white">
                  JavaScript Notification API Implementation
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              This code powers the browser notifications in MediScan. It requests permission using <code className="text-teal-300">Notification.requestPermission()</code>, saves records to <code className="text-teal-300">localStorage</code>, and triggers scheduled popups via <code className="text-teal-300">new Notification(...)</code>.
            </p>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-teal-200 overflow-x-auto max-h-80 leading-relaxed">
                {JAVASCRIPT_NOTIFICATION_CODE}
              </pre>

              <button
                type="button"
                onClick={copyNotificationCode}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Native Web API • Works in Chrome, Edge, Safari, Firefox
              </span>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

interface ReminderItemCardProps {
  reminder: MedReminder;
  todayStr: string;
  onTakeDose: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReminderItemCard: React.FC<ReminderItemCardProps> = ({
  reminder,
  todayStr,
  onTakeDose,
  onDelete,
}) => {
  const isTaken = !!reminder.takenHistory?.[todayStr];

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isTaken 
        ? 'bg-emerald-50/50 border-emerald-200 text-slate-500' 
        : 'bg-white border-slate-200/80 shadow-xs hover:border-teal-400'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
          {reminder.time}
        </span>
        <button
          onClick={() => onDelete(reminder.id)}
          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
          title="Delete Reminder"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <h4 className={`font-bold text-xs mt-2 ${isTaken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
        {reminder.medicineName}
      </h4>
      <p className="text-[11px] text-slate-500 mt-0.5">
        {reminder.dosage} • {reminder.mealTiming !== 'any' ? `${reminder.mealTiming} food` : 'any time'}
      </p>

      {reminder.scheduledDate && (
        <span className="inline-block text-[10px] text-slate-400 mt-1 bg-slate-100 px-1.5 py-0.2 rounded">
          📅 {reminder.scheduledDate}
        </span>
      )}

      {reminder.notes && (
        <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">
          {reminder.notes}
        </p>
      )}

      <button
        id={`reminder-btn-take-${reminder.id}`}
        onClick={() => onTakeDose(reminder.id)}
        className={`w-full mt-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isTaken
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'border border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700'
        }`}
      >
        <Check className="w-3.5 h-3.5" />
        <span>{isTaken ? 'Taken Today' : 'Mark Dose Taken'}</span>
      </button>
    </div>
  );
};
