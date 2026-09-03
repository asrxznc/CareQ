/**
 * Web Audio sound synthesizer for dosage reminders and alerts
 */
export function playChimeSound(type: 'success' | 'reminder' | 'warning' = 'reminder') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5

      osc2.frequency.setValueAtTime(1046.5, now + 0.2); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.15);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else if (type === 'warning') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Gentle reminder chime (E5 -> B5 chime)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (e) {
    console.warn('AudioContext playback error:', e);
  }
}

/**
 * Check and request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

/**
 * Send a browser notification with sound chime using JavaScript Notification API
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      playChimeSound('reminder');
    } catch (e) {
      console.warn('Notification trigger error:', e);
    }
  }
}

// Track fired notifications so we don't repeat within the same minute
const firedDoseKeys = new Set<string>();

/**
 * Checks reminders every 5-10 seconds and triggers JavaScript Notification for scheduled doses
 */
export function scheduleDoseCheckWorker(reminders: Array<{
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  active: boolean;
  scheduledDate?: string;
  daysOfWeek?: number[];
  takenHistory?: Record<string, boolean>;
}>): () => void {
  const checkDoses = () => {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;
    const todayStr = now.toISOString().split('T')[0];
    const currentDayOfWeek = now.getDay();

    reminders.forEach((rem) => {
      if (!rem.active) return;

      // Date filter check
      if (rem.scheduledDate && rem.scheduledDate !== todayStr) {
        return;
      }

      // Day of week filter check if recurring
      if (rem.daysOfWeek && rem.daysOfWeek.length > 0 && !rem.scheduledDate) {
        if (!rem.daysOfWeek.includes(currentDayOfWeek)) {
          return;
        }
      }

      if (rem.time === currentTimeStr) {
        const fireKey = `${rem.id}_${todayStr}_${currentTimeStr}`;
        if (firedDoseKeys.has(fireKey)) {
          return;
        }

        const isTaken = !!rem.takenHistory?.[todayStr];
        if (!isTaken) {
          firedDoseKeys.add(fireKey);
          playChimeSound('reminder');
          sendBrowserNotification(`Time to take ${rem.medicineName}`, {
            body: `Scheduled Dose: ${rem.dosage}. Remember to take it with water.`,
          });
        }
      }
    });
  };

  // Run immediately and check every 5 seconds for responsive timing
  checkDoses();
  const intervalId = setInterval(checkDoses, 5000);
  return () => clearInterval(intervalId);
}

/**
 * Standalone JavaScript code snippet demonstrating Notification API scheduling
 */
export const JAVASCRIPT_NOTIFICATION_CODE = `/**
 * JavaScript Notification API implementation for Medicine Reminders
 * 
 * 1. Request Permission
 * 2. Store Reminder in Local Storage
 * 3. Schedule and Show Browser Notification at Scheduled Time
 */

// Step 1: Request Notification Permission
async function enableMedicineNotifications() {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Step 2: Save to LocalStorage
function saveMedicineReminderToLocalStorage(reminder) {
  const STORAGE_KEY = 'mediscan_reminders';
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  existing.push(reminder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

// Step 3: Schedule Notification at specific Date and Time
function scheduleMedicineNotification(reminder) {
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const targetDate = new Date(reminder.scheduledDate || new Date());
  targetDate.setHours(hours, minutes, 0, 0);

  const delay = targetDate.getTime() - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(\`Time to take \${reminder.medicineName}\`, {
          body: \`Scheduled dose: \${reminder.dosage}. Take with a full glass of water.\`,
          icon: '/favicon.ico'
        });
      }
    }, delay);
  }
}
`;
