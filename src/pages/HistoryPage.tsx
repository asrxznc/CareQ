import React, { useState } from 'react';
import { Page, MedReminder } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  ArrowLeft, 
  Award, 
  Check, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../lib/notifications';

interface HistoryPageProps {
  onNavigate: (page: Page) => void;
  reminders: MedReminder[];
  onToggleReminderTaken: (reminderId: string, dateStr: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onNavigate,
  reminders = [],
  onToggleReminderTaken,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filter active reminders
  const activeReminders = reminders.filter((r) => r.active);
  const takenCount = activeReminders.filter((r) => !!r.takenHistory?.[selectedDate]).length;
  const totalCount = activeReminders.length || 1;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  // Past 7 days calculation
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTaken = activeReminders.filter((r) => !!r.takenHistory?.[dateStr]).length;
    return {
      dateStr,
      dayName,
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      taken: dayTaken,
      total: activeReminders.length,
      isPerfect: dayTaken === activeReminders.length && activeReminders.length > 0,
    };
  });

  const handleToggle = (reminderId: string) => {
    onToggleReminderTaken(reminderId, selectedDate);
    playChimeSound('success');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#12A89D]">
          <Clock className="w-4 h-4 text-[#12A89D]" />
          <span>Adherence Log &amp; Records</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight mt-1">
          Medication History
        </h1>
        <p className="text-sm text-[#6B7C93] mt-1">
          Visual and simple tracking for elderly patients and caregivers.
        </p>
      </div>

      {/* Simple Elderly-Friendly Adherence Hero (Section 13) */}
      <div className="bg-gradient-to-br from-[#102A43] to-[#12A89D] rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
              Today&apos;s Medication Progress
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black mt-1">
              You took {takenCount} of {totalCount} medicines today!
            </h2>
            <p className="text-teal-100 text-sm mt-1">
              {adherenceRate >= 100
                ? '🌟 Perfect adherence! All daily doses completed.'
                : adherenceRate >= 50
                ? '👍 Good job! Keep on track for your afternoon & evening doses.'
                : '🔔 Morning medicines scheduled. Remember to take after food.'}
            </p>
          </div>

          <div className="text-right sm:text-center shrink-0 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
            <span className="text-3xl sm:text-4xl font-black text-white">{adherenceRate}%</span>
            <p className="text-xs text-teal-100 font-semibold mt-0.5">Adherence</p>
          </div>
        </div>

        {/* 7-Day Quick Strip */}
        <div className="pt-4 border-t border-white/15 grid grid-cols-7 gap-2">
          {pastDays.reverse().map((day) => (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                selectedDate === day.dateStr
                  ? 'bg-white text-[#102A43] font-bold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <p className="text-[10px] uppercase font-bold">{day.dayName}</p>
              <p className="text-xs font-black mt-0.5">{day.taken}/{day.total}</p>
              {day.isPerfect && <span className="text-[9px] text-[#39B54A]">●</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Doses Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#12A89D]" />
            <h3 className="font-bold text-base text-[#102A43]">
              Schedule for {selectedDate === todayStr ? 'Today (3 Sep 2026)' : selectedDate}
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#6B7C93]">
            {takenCount} of {totalCount} Taken
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeReminders.map((rem) => {
            const isTaken = !!rem.takenHistory?.[selectedDate];

            return (
              <div
                key={rem.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isTaken
                        ? 'bg-emerald-100 text-[#2E9D57]'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isTaken ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#102A43]">{rem.medicineName}</h4>
                    <p className="text-xs text-[#6B7C93]">
                      {rem.time} • {rem.dosage} • {rem.notes || 'After Food'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(rem.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isTaken
                      ? 'bg-green-100 text-[#2E9D57] hover:bg-green-200'
                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                  }`}
                >
                  {isTaken ? '✓ Taken' : 'Mark Taken'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
