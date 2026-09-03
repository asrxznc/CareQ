import React from 'react';
import { Page, MedicineItem } from '../types';
import { 
  Scan, 
  ShieldAlert, 
  Bell, 
  Mic, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  HeartPulse, 
  Pill, 
  FileSearch, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Volume2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines?: MedicineItem[];
  onSelectMedicineForDetails?: (med: MedicineItem) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate, 
  savedMedicines = [],
  onSelectMedicineForDetails
}) => {
  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Subtle decorative mesh gradient accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-300/20 to-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-200/25 to-cyan-300/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Next-Gen Healthcare Intelligence with Gemini 3.8 Flash</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Identify Medicines Instantly.<br />
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Prevent Dangerous Drug Interactions.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
            Upload any prescription label or pill bottle. MediScan AI extracts dosage, alerts you to severe contraindications, sets scheduled browser notifications, and keeps caregivers in sync.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <button
              id="hero-scan-cta"
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md shadow-teal-600/25 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Medicine Label</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-interactions-cta"
              onClick={() => onNavigate('interactions')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all active:scale-98 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Check Drug Interactions</span>
            </button>

            <button
              id="hero-assistant-cta"
              onClick={() => onNavigate('assistant')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100 text-blue-800 font-semibold text-sm border border-blue-200/60 shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-blue-600" />
              <span>Ask Voice Assistant</span>
            </button>
          </div>

          {/* Key Value Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-200/80">
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="font-display text-2xl font-bold text-teal-600">Gemini 3.8</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Vision OCR Model</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="font-display text-2xl font-bold text-emerald-600">&lt; 2.5s</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Fast Prescription Extraction</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="font-display text-2xl font-bold text-blue-600">100% Client</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Local Storage Privacy</div>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <div className="font-display text-2xl font-bold text-indigo-600">Real-Time</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Browser Dosage Chimes</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 Key Architectural Modules Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Complete Clinical Intelligence Suite
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Engineered with Material Design 3 guidelines and glassmorphic clarity for seamless medication adherence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Scanner */}
          <div 
            id="feature-card-scanner"
            onClick={() => onNavigate('scanner')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white mb-5 shadow-sm shadow-teal-500/20 group-hover:scale-110 transition-transform">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
                1. Gemini Vision Medicine Scanner
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Point your camera or upload a medication box. Extracts brand name, generic formulation, strength (mg/mL), and batch codes accurately.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-teal-600 gap-1 mt-2">
              <span>Try Scanner with Sample Labels</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Drug Interaction */}
          <div 
            id="feature-card-interactions"
            onClick={() => onNavigate('interactions')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white mb-5 shadow-sm shadow-rose-500/20 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2">
                2. Dual Drug Interaction Checker
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Compare two medications before taking them together. Detects dangerous bleeding hazards, serotonin syndrome, hyperkalemia, and liver risks.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-rose-600 gap-1 mt-2">
              <span>Run Interaction Analysis</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Dosage Reminders */}
          <div 
            id="feature-card-reminders"
            onClick={() => onNavigate('reminders')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-5 shadow-sm shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                3. Browser Dosage Reminders & Chimes
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Native browser Web Notifications with synthesized audio chimes. Keep track of morning, afternoon, and night regimens with compliance streaks.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-blue-600 gap-1 mt-2">
              <span>Setup Daily Medication Alarm</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: AI Medicine Details */}
          <div 
            id="feature-card-details"
            onClick={() => onNavigate('details')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-5 shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                4. AI Clinical Breakdown & Audio
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Read or listen to clear instructions on how to take each pill, what to do if you miss a dose, and food or alcohol contraindications.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1 mt-2">
              <span>Inspect Medicine Database</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Voice Assistant */}
          <div 
            id="feature-card-assistant"
            onClick={() => onNavigate('assistant')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-5 shadow-sm shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors mb-2">
                5. Voice Health Assistant
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Hands-free voice consultation. Speak your questions like "Can I take this pill with coffee?" and hear spoken answers with clinical precision.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-600 gap-1 mt-2">
              <span>Start Speaking with AI</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Caregiver Dashboard */}
          <div 
            id="feature-card-caregiver"
            onClick={() => onNavigate('caregiver')}
            className="glass-card glass-card-hover p-6 rounded-3xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-5 shadow-sm shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-2">
                6. Family & Caregiver Dashboard
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                Monitor parents or loved ones. Review adherence scores, record care notes, and access instant emergency physician contacts.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-purple-600 gap-1 mt-2">
              <span>Open Caregiver Hub</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-bl from-teal-400/10 to-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Simple 3-Step Workflow
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              How MediScan AI Safeguards Your Daily Health
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-display font-bold flex items-center justify-center text-base shadow-sm">
                1
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Snap or Upload Packaging
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Take a quick photo using your smartphone or laptop webcam. Or choose from our built-in sample medicine presets.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-display font-bold flex items-center justify-center text-base shadow-sm">
                2
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Gemini Vision Analysis
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Gemini extracts the active chemical components, strength, and automatically queries for dangerous contraindications and food interactions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-display font-bold flex items-center justify-center text-base shadow-sm">
                3
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                Save & Set Timely Reminders
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Add to your encrypted local medicine cabinet. Get browser notification alerts with custom sound chimes when it's time to take your dose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-saved Medicines Preview strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your Medicine Cabinet ({savedMedicines.length} Saved)
            </h2>
            <p className="text-xs text-slate-500">
              Stored securely in your local browser storage
            </p>
          </div>
          <button
            id="landing-view-all-cabinet-btn"
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {savedMedicines.slice(0, 4).map((med) => (
            <div
              key={med.id}
              onClick={() => {
                if (onSelectMedicineForDetails) {
                  onSelectMedicineForDetails(med);
                }
                onNavigate('details');
              }}
              className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 rounded-md">
                  {med.dosageForm || 'Oral Form'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {med.strength}
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                {med.name}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                {med.genericName}
              </p>
              <div className="text-[11px] text-slate-600 line-clamp-2">
                {med.indications?.[0] || 'Clinically active agent'}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
