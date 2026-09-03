import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Utensils, 
  Trash2,
  Calendar,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { MedReminder } from '../types';

interface MedicineTimelineProps {
  todayReminders: MedReminder[];
  todayStr: string;
  onTakeDose: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onOpenAddModal: () => void;
}

export const MedicineTimeline: React.FC<MedicineTimelineProps> = ({
  todayReminders,
  todayStr,
  onTakeDose,
  onDeleteReminder,
  onOpenAddModal,
}) => {
  // Sort today's reminders chronologically
  const sortedReminders = [...todayReminders].sort((a, b) => a.time.localeCompare(b.time));

  // Calculate current time in minutes for status determination
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getDoseStatus = (reminder: MedReminder) => {
    const isTaken = !!reminder.takenHistory?.[todayStr];
    if (isTaken) return 'taken';

    const [hours, mins] = reminder.time.split(':').map(Number);
    const reminderMinutes = hours * 60 + mins;
    const diff = reminderMinutes - currentMinutes;

    if (diff > 30) return 'upcoming';
    if (diff >= -30 && diff <= 30) return 'due_now';
    return 'overdue';
  };

  const takenCount = sortedReminders.filter(r => !!r.takenHistory?.[todayStr]).length;
  const totalCount = sortedReminders.length;
  const completionPercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Find next upcoming dose
  const nextUpcoming = sortedReminders.find(r => {
    const [h, m] = r.time.split(':').map(Number);
    const remMins = h * 60 + m;
    return !r.takenHistory?.[todayStr] && remMins >= currentMinutes;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Summary Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[11px] font-bold">
                Today's Adherence Schedule
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {todayStr}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Today's Medicine Timeline
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {totalCount === 0 
                ? 'No medications scheduled for today yet. Add a reminder to start tracking.'
                : `${takenCount} of ${totalCount} doses completed (${completionPercentage}%). ${
                    nextUpcoming 
                      ? `Next dose: ${nextUpcoming.medicineName} at ${nextUpcoming.time}`
                      : 'All scheduled doses for today are completed!'
                  }`
              }
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Circular or pill progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center font-display font-extrabold text-sm shadow-inner">
                {completionPercentage}%
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-300 block font-medium">Compliance</span>
                <span className="text-xs font-bold text-white">
                  {takenCount}/{totalCount} Taken
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>Schedule Dose</span>
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        {totalCount > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      {sortedReminders.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-800">
            No Medicines Scheduled For Today
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Schedule a dose with date, time, and meal instructions. Browser notifications will trigger right on schedule.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <span>Add Medicine Reminder</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 space-y-6">
          {sortedReminders.map((reminder, idx) => {
            const status = getDoseStatus(reminder);
            const isTaken = status === 'taken';
            const isDueNow = status === 'due_now';
            const isOverdue = status === 'overdue';

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="relative"
              >
                {/* Timeline node dot */}
                <div 
                  className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isTaken 
                      ? 'bg-emerald-500 border-white text-white shadow-xs' 
                      : isDueNow 
                        ? 'bg-amber-500 border-white text-white ring-4 ring-amber-200 animate-pulse'
                        : isOverdue 
                          ? 'bg-rose-500 border-white text-white'
                          : 'bg-white border-teal-600 text-teal-600'
                  }`}
                >
                  {isTaken ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                </div>

                {/* Timeline Card */}
                <div 
                  className={`p-5 rounded-3xl border transition-all ${
                    isTaken 
                      ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-600' 
                      : isDueNow 
                        ? 'bg-amber-50/50 border-amber-300 shadow-md ring-1 ring-amber-300/40' 
                        : isOverdue
                          ? 'bg-rose-50/30 border-rose-200/80 shadow-xs'
                          : 'bg-white border-slate-200/90 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Medicine Title & Meta */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Time badge */}
                        <span className="px-2.5 py-1 rounded-xl font-mono text-xs font-bold bg-slate-900 text-white shadow-xs">
                          {reminder.time}
                        </span>

                        {/* Status badge */}
                        {isTaken && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dose Taken
                          </span>
                        )}
                        {isDueNow && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 animate-pulse">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Due Now
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Overdue
                          </span>
                        )}
                        {!isTaken && !isDueNow && !isOverdue && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Upcoming
                          </span>
                        )}

                        {/* Specific Date Badge if single-date */}
                        {reminder.scheduledDate && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                            Scheduled: {reminder.scheduledDate}
                          </span>
                        )}
                      </div>

                      <h3 className={`font-display text-base sm:text-lg font-bold ${
                        isTaken ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {reminder.medicineName}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700">
                          {reminder.dosage}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-slate-400" />
                          {reminder.mealTiming !== 'any' ? `Take ${reminder.mealTiming} meal` : 'Take any time'}
                        </span>
                        {reminder.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 italic">
                              "{reminder.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        id={`timeline-take-btn-${reminder.id}`}
                        onClick={() => onTakeDose(reminder.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isTaken
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : isDueNow 
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20' 
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isTaken ? 'Mark as Untaken' : 'Mark as Taken'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteReminder(reminder.id)}
                        title="Delete reminder"
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
