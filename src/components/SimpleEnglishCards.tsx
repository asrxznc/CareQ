import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Utensils, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { SimpleEnglishMedicineGuide } from '../types';
import { JAVASCRIPT_GEMINI_EXPLAINER_CODE } from '../lib/geminiExplainer';

interface SimpleEnglishCardsProps {
  guide: SimpleEnglishMedicineGuide;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const SimpleEnglishCards: React.FC<SimpleEnglishCardsProps> = ({
  guide,
  isLoading = false,
  onRefresh,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeSpeechCard, setActiveSpeechCard] = useState<string | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(JAVASCRIPT_GEMINI_EXPLAINER_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const speakText = (cardKey: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (activeSpeechCard === cardKey) {
      window.speechSynthesis.cancel();
      setActiveSpeechCard(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setActiveSpeechCard(null);
    utterance.onerror = () => setActiveSpeechCard(null);

    setActiveSpeechCard(cardKey);
    window.speechSynthesis.speak(utterance);
  };

  const cardsData = [
    {
      id: 'card-uses',
      title: 'Uses',
      subtitle: 'What this medicine helps with',
      icon: CheckCircle2,
      badge: 'Approved Use',
      theme: {
        border: 'border-teal-200/80',
        bg: 'bg-gradient-to-br from-teal-50/70 to-emerald-50/40',
        headerText: 'text-teal-950',
        iconBg: 'bg-teal-100 text-teal-700',
        badgeBg: 'bg-teal-100/90 text-teal-800 border-teal-200',
        bulletDot: 'bg-teal-500',
      },
      content: (
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
          {guide.uses.map((use, index) => (
            <li key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
              <span>{use}</span>
            </li>
          ))}
        </ul>
      ),
      speechContent: `Uses of ${guide.medicineName}: ${guide.uses.join('. ')}`,
    },
    {
      id: 'card-dosage',
      title: 'Dosage',
      subtitle: 'How much and how to take it',
      icon: Clock,
      badge: 'Schedule & Intake',
      theme: {
        border: 'border-blue-200/80',
        bg: 'bg-gradient-to-br from-blue-50/70 to-sky-50/40',
        headerText: 'text-blue-950',
        iconBg: 'bg-blue-100 text-blue-700',
        badgeBg: 'bg-blue-100/90 text-blue-800 border-blue-200',
        bulletDot: 'bg-blue-500',
      },
      content: (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {guide.dosage}
          </p>
          <div className="p-2.5 rounded-xl bg-white/70 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-1.5">
            <span>💧 Take with a full glass of clean water unless advised otherwise.</span>
          </div>
        </div>
      ),
      speechContent: `Dosage for ${guide.medicineName}: ${guide.dosage}`,
    },
    {
      id: 'card-side-effects',
      title: 'Side Effects',
      subtitle: 'Common symptoms to watch for',
      icon: AlertCircle,
      badge: 'Safety Signals',
      theme: {
        border: 'border-amber-200/80',
        bg: 'bg-gradient-to-br from-amber-50/70 to-orange-50/40',
        headerText: 'text-amber-950',
        iconBg: 'bg-amber-100 text-amber-700',
        badgeBg: 'bg-amber-100/90 text-amber-800 border-amber-200',
        bulletDot: 'bg-amber-500',
      },
      content: (
        <div className="space-y-2">
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
            {guide.sideEffects.map((effect, index) => (
              <li key={index} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{effect}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-500 italic pt-1">
            *Most side effects are mild and subside as your body adjusts.
          </p>
        </div>
      ),
      speechContent: `Side effects for ${guide.medicineName}: ${guide.sideEffects.join('. ')}`,
    },
    {
      id: 'card-food-instructions',
      title: 'Food Instructions',
      subtitle: 'Meal timing & dietary directions',
      icon: Utensils,
      badge: 'Diet & Meals',
      theme: {
        border: 'border-emerald-200/80',
        bg: 'bg-gradient-to-br from-emerald-50/70 to-green-50/40',
        headerText: 'text-emerald-950',
        iconBg: 'bg-emerald-100 text-emerald-700',
        badgeBg: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
        bulletDot: 'bg-emerald-500',
      },
      content: (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {guide.foodInstructions}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-white/70 p-2 rounded-xl border border-emerald-100">
            <span>🥗 Healthy meals and hydration aid effective absorption.</span>
          </div>
        </div>
      ),
      speechContent: `Food instructions for ${guide.medicineName}: ${guide.foodInstructions}`,
    },
    {
      id: 'card-warning',
      title: 'Warning',
      subtitle: 'Important precautions & red flags',
      icon: ShieldAlert,
      badge: 'Urgent Care',
      theme: {
        border: 'border-rose-200/80',
        bg: 'bg-gradient-to-br from-rose-50/70 to-red-50/40',
        headerText: 'text-rose-950',
        iconBg: 'bg-rose-100 text-rose-700',
        badgeBg: 'bg-rose-100/90 text-rose-800 border-rose-200',
        bulletDot: 'bg-rose-500',
      },
      content: (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-white/80 border border-rose-200 text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
            {guide.warning}
          </div>
          <p className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
            ⚠️ Seek emergency care immediately if you experience hives or swelling.
          </p>
        </div>
      ),
      speechContent: `Warning for ${guide.medicineName}: ${guide.warning}`,
    },
    {
      id: 'card-missed-dose',
      title: 'Missed Dose Advice',
      subtitle: 'What to do if you forgot a dose',
      icon: RotateCcw,
      badge: 'Recovery Protocol',
      theme: {
        border: 'border-indigo-200/80',
        bg: 'bg-gradient-to-br from-indigo-50/70 to-violet-50/40',
        headerText: 'text-indigo-950',
        iconBg: 'bg-indigo-100 text-indigo-700',
        badgeBg: 'bg-indigo-100/90 text-indigo-800 border-indigo-200',
        bulletDot: 'bg-indigo-500',
      },
      content: (
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {guide.missedDoseAdvice}
          </p>
          <div className="p-2 rounded-xl bg-white/70 border border-indigo-100 text-[11px] text-indigo-800 font-medium">
            ⏱️ Golden rule: Never double up doses to compensate for a missed one.
          </div>
        </div>
      ),
      speechContent: `Missed dose advice for ${guide.medicineName}: ${guide.missedDoseAdvice}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Prompt Badge and Code Viewer Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Gemini Simple English
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Prompt: "Explain this medicine in simple English."
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
            {guide.medicineName} {guide.genericName ? `(${guide.genericName})` : ''}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Patient-friendly medical explanation generated by Gemini AI with structured clinical advice.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View JavaScript code sending medicine name to Gemini"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-600" />
            <span>JavaScript Code</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onRefresh}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Explaining...' : 'Re-Prompt Gemini'}</span>
            </button>
          )}
        </div>
      </div>

      {/* The 6 Animated Cards Grid with Icons */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        {cardsData.map((card) => {
          const Icon = card.icon;
          const isSpeaking = activeSpeechCard === card.id;

          return (
            <motion.div
              key={card.id}
              id={card.id}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.35, ease: 'easeOut' },
                },
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-3xl p-5 sm:p-6 border ${card.theme.border} ${card.theme.bg} shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div>
                {/* Card Top Row: Icon + Title + Badge + Audio button */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${card.theme.iconBg} shadow-xs shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-base sm:text-lg ${card.theme.headerText}`}>
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakText(card.id, card.speechContent)}
                      title={isSpeaking ? 'Stop speaking' : `Listen to ${card.title}`}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="pt-1 pb-2">
                  {card.content}
                </div>
              </div>

              {/* Card Footer Badge */}
              <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${card.theme.badgeBg}`}>
                  {card.badge}
                </span>
                <span className="text-slate-400 font-medium">
                  Patient Guide
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-teal-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    JavaScript: Send Medicine Name to Gemini API
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Prompts Gemini to explain medicine in simple English returning the 6 structured cards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950/80">
              <pre className="overflow-x-auto whitespace-pre">
                {JAVASCRIPT_GEMINI_EXPLAINER_CODE}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
              <span>Endpoints: <code className="text-teal-400">POST /api/gemini/explain-medicine</code></span>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
