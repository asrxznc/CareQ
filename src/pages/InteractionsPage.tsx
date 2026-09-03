import React, { useState } from 'react';
import { Page, MedicineItem, DrugInteractionResult, PatientProfile } from '../types';
import { PRESET_INTERACTION_PAIRS } from '../mockData';
import { 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  Pill, 
  HelpCircle, 
  Info,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Flame,
  UserCheck
} from 'lucide-react';
import { playChimeSound } from '../lib/notifications';

interface InteractionsPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  preselectedDrug?: string;
  patientProfile: PatientProfile;
}

export const InteractionsPage: React.FC<InteractionsPageProps> = ({
  onNavigate,
  savedMedicines = [],
  preselectedDrug,
  patientProfile,
}) => {
  const [drugA, setDrugA] = useState(preselectedDrug || (savedMedicines[0]?.name || 'Warfarin'));
  const [drugB, setDrugB] = useState(savedMedicines[1]?.name || 'Aspirin');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugInteractionResult | null>(null);

  const handleCheckInteraction = async (medA = drugA, medB = drugB) => {
    if (!medA.trim() || !medB.trim()) {
      setError('Please provide two medications to check interactions.');
      return;
    }

    if (medA.trim().toLowerCase() === medB.trim().toLowerCase()) {
      setError('Please select two different medications to evaluate interaction.');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/check-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineA: medA,
          medicineB: medB,
          allergies: patientProfile.allergies,
          conditions: patientProfile.chronicConditions,
        }),
      });

      if (!response.ok) {
        throw new Error('Interaction checker failed. Please verify connection.');
      }

      const data: DrugInteractionResult = await response.json();
      setResult(data);
      if (data.severity === 'critical') {
        playChimeSound('warning');
      } else {
        playChimeSound('success');
      }
    } catch (err: any) {
      console.error('Interaction check error:', err);
      setError(err.message || 'Failed to analyze drug interaction');
      playChimeSound('warning');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePresetSelect = (pair: typeof PRESET_INTERACTION_PAIRS[0]) => {
    setDrugA(pair.drugA);
    setDrugB(pair.drugB);
    handleCheckInteraction(pair.drugA, pair.drugB);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-600',
          title: 'Critical Hazard - Immediate Contraindication',
          icon: <Flame className="w-4 h-4 text-rose-600" />,
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          title: 'Moderate Risk - Clinical Caution & Monitoring Required',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'minor':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-800',
          dot: 'bg-blue-500',
          title: 'Minor Interaction - Minimal Clinical Significance',
          icon: <Info className="w-4 h-4 text-blue-600" />,
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          title: 'Safe Combination - No Known Severe Conflict',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-800 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Pharmacovigilance & Polypharmacy Defense</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Dual Drug Interaction Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Evaluate combined drug pharmacokinetics, liver enzyme conflicts (CYP450), and additive toxicities using Gemini clinical reasoning.
        </p>
      </div>

      {/* Patient Profile Context Ribbon */}
      {(patientProfile.allergies.length > 0 || patientProfile.chronicConditions.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-teal-900">
            <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>Personalized with Health ID:</strong> Allergies ({patientProfile.allergies.join(', ')}) • Chronic Conditions ({patientProfile.chronicConditions.join(', ')})
            </span>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="text-teal-700 font-bold hover:underline shrink-0 text-left"
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* Input Form & Preset Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 space-y-5">
            <h2 className="font-display font-bold text-base text-slate-900">
              Select Medications to Compare
            </h2>

            {/* Drug A */}
            <div className="space-y-1.5">
              <label htmlFor="interaction-drug-a-input" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>First Medication (Drug A)</span>
                <span className="text-[11px] font-normal text-slate-400">Brand or Generic</span>
              </label>
              <div className="relative">
                <Pill className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
                <input
                  id="interaction-drug-a-input"
                  type="text"
                  value={drugA}
                  onChange={(e) => setDrugA(e.target.value)}
                  placeholder="e.g. Warfarin, Lisinopril, Metformin..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              {/* Saved pills quick pick */}
              {savedMedicines.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400">Quick pick:</span>
                  {savedMedicines.slice(0, 3).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setDrugA(m.name)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 transition-colors"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drug B */}
            <div className="space-y-1.5">
              <label htmlFor="interaction-drug-b-input" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Second Medication (Drug B)</span>
                <span className="text-[11px] font-normal text-slate-400">Brand or Generic</span>
              </label>
              <div className="relative">
                <Pill className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
                <input
                  id="interaction-drug-b-input"
                  type="text"
                  value={drugB}
                  onChange={(e) => setDrugB(e.target.value)}
                  placeholder="e.g. Aspirin, Ibuprofen, Potassium..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                />
              </div>

              {/* Saved pills quick pick */}
              {savedMedicines.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400">Quick pick:</span>
                  {savedMedicines.slice(1, 4).map(m => (
                    <button
                      key={m.id}
                      onClick={() => setDrugB(m.name)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="interaction-submit-btn"
              disabled={isChecking || !drugA.trim() || !drugB.trim()}
              onClick={() => handleCheckInteraction(drugA, drugB)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600 hover:opacity-95 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-teal-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cross-Referencing Interactions...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Analyze Interaction Risks</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Pairs */}
          <div className="glass-card p-5 rounded-3xl space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Common Clinical Interaction Pairs</span>
            </h3>

            <div className="space-y-2">
              {PRESET_INTERACTION_PAIRS.map((pair, idx) => (
                <div
                  key={idx}
                  id={`preset-pair-${pair.drugA.toLowerCase()}-${pair.drugB.toLowerCase()}`}
                  onClick={() => handlePresetSelect(pair)}
                  className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-400 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{pair.drugA}</span>
                    <span className="text-slate-400">+</span>
                    <span className="font-bold text-slate-900">{pair.drugB}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      pair.color === 'red' ? 'bg-rose-100 text-rose-800' :
                      pair.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      pair.color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pair.tag}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Verdict (7 cols) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6 animate-in fade-in-50 duration-300">
              
              {/* Severity Header Banner */}
              {(() => {
                const b = getSeverityBadge(result.severity);
                return (
                  <div className={`p-4 rounded-2xl border ${b.bg} flex items-start gap-3`}>
                    <div className="shrink-0 mt-0.5">{b.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${b.dot}`} />
                        <span className="font-bold text-xs uppercase tracking-wide">
                          {b.title}
                        </span>
                      </div>
                      <h2 className="font-display font-extrabold text-lg text-slate-900 mt-1">
                        {result.headline}
                      </h2>
                    </div>
                  </div>
                );
              })()}

              {/* Drugs Involved */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Subject Drugs:</span>
                  <span className="ml-1.5 font-bold text-slate-900">
                    {result.medicineA} ⚡ {result.medicineB}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Checked {new Date(result.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Plain Language Summary */}
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>Patient-Friendly Summary</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80">
                  {result.summary}
                </p>
              </div>

              {/* Pharmacological Mechanism */}
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span>Clinical Pharmacological Mechanism</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/80 font-mono text-[11px]">
                  {result.clinicalMechanism}
                </p>
              </div>

              {/* Clinical Management Recommendation */}
              <div className="space-y-1.5">
                <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Actionable Guidance for Patient & Physician</span>
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 text-xs text-emerald-950 leading-relaxed">
                  {result.managementRecommendation}
                </div>
              </div>

              {/* Safe Alternatives if any */}
              {result.safeAlternatives && result.safeAlternatives.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-700">
                    Suggested Safer Alternatives to Discuss with Your Doctor:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.safeAlternatives.map((alt, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium"
                      >
                        ✓ {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Urgency Callout */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Consultation Urgency:{' '}
                  <strong className={result.consultDoctorUrgency === 'immediate' ? 'text-rose-600' : 'text-slate-800'}>
                    {result.consultDoctorUrgency.toUpperCase()}
                  </strong>
                </span>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Ask Voice AI about this interaction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-card p-10 rounded-3xl text-center space-y-4 border border-dashed border-slate-200 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-sm">
                <h3 className="font-display font-bold text-base text-slate-900">
                  Ready to Cross-Check
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter two medications or click any preset on the left to analyze synergistic toxicity, metabolic inhibition, or therapeutic interference.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 max-w-sm text-left space-y-1">
                <span className="font-semibold text-slate-800 block">Common Dangerous Combinations:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Blood thinners (Warfarin) + NSAIDs (Aspirin/Advil) = Hemorrhage</li>
                  <li>ACE Inhibitors (Lisinopril) + Potassium = Cardiac Arrhythmia</li>
                  <li>Statins (Lipitor) + Macrolides = Muscle Breakdown (Rhabdomyolysis)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
