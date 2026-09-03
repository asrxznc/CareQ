import React, { useState, useEffect } from 'react';
import { Page, MedicineItem, SimpleEnglishMedicineGuide } from '../types';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Pill, 
  HeartPulse, 
  Save, 
  ArrowRight,
  Share2,
  RefreshCw,
  LayoutGrid,
  FileCheck2,
  Check
} from 'lucide-react';
import { playChimeSound } from '../lib/notifications';
import { SimpleEnglishCards } from '../components/SimpleEnglishCards';
import { sendDetectedMedicineToGemini } from '../lib/geminiExplainer';

interface DetailsPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  selectedMedicine: MedicineItem | null;
  onSelectMedicine: (med: MedicineItem) => void;
  onSaveMedicine: (med: MedicineItem) => void;
  onSelectForInteraction: (drugName: string) => void;
  onSelectForReminder: (medName: string, dosage: string) => void;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({
  onNavigate,
  savedMedicines = [],
  selectedMedicine,
  onSelectMedicine,
  onSaveMedicine,
  onSelectForInteraction,
  onSelectForReminder,
}) => {
  const [currentMed, setCurrentMed] = useState<MedicineItem>(
    selectedMedicine || savedMedicines[0] || {
      id: 'default-med',
      name: 'Amoxicillin Trihydrate',
      genericName: 'Amoxicillin',
      strength: '500 mg',
      dosageForm: 'Capsule',
      indications: ['Bacterial Respiratory Infections', 'Bronchitis', 'Ear, Nose & Throat Infections', 'Dental Abscess'],
      howToTake: 'Take 1 capsule every 8 hours with or without food. Drink a full glass of water and complete the full prescribed course.',
      commonSideEffects: ['Mild nausea', 'Diarrhea', 'Mild stomach ache', 'Headache'],
      seriousSideEffects: ['Severe skin rash or hives', 'Difficulty breathing or throat swelling'],
      contraindications: ['Known penicillin or cephalosporin hypersensitivity'],
      foodInteractions: ['Can be taken with or without food', 'Drink plenty of fluids', 'Limit alcohol consumption'],
      storageAdvice: 'Store below 25°C away from moisture, heat, and direct sunlight.',
      missedDoseGuidance: 'Take as soon as you remember. If it is almost time for your next dose, skip the missed dose and resume your regular schedule. Never double up doses.',
      scannedAt: new Date().toISOString(),
    }
  );

  const [activeTab, setActiveTab] = useState<'cards' | 'clinical'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSavedInCabinet, setIsSavedInCabinet] = useState(false);

  // Audio Speech Synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (selectedMedicine) {
      setCurrentMed(selectedMedicine);
    }
  }, [selectedMedicine]);

  useEffect(() => {
    const isAlreadySaved = savedMedicines.some(
      (m) => m.name.toLowerCase() === currentMed.name.toLowerCase()
    );
    setIsSavedInCabinet(isAlreadySaved);
  }, [currentMed, savedMedicines]);

  // Stop audio on unmount or med change
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [currentMed]);

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const simpleGuide: SimpleEnglishMedicineGuide = currentMed.simpleEnglishGuide || {
    medicineName: currentMed.name,
    genericName: currentMed.genericName,
    uses: (currentMed.indications && currentMed.indications.length > 0)
      ? currentMed.indications
      : ['Treats bacterial infections', 'Condition management and recovery'],
    dosage: currentMed.howToTake || 'Take as directed on your prescription label with a full glass of water.',
    sideEffects: (currentMed.commonSideEffects && currentMed.commonSideEffects.length > 0)
      ? currentMed.commonSideEffects
      : ['Mild nausea', 'Temporary stomach sensitivity', 'Headache'],
    foodInstructions: (currentMed.foodInteractions && currentMed.foodInteractions.length > 0)
      ? currentMed.foodInteractions.join('. ')
      : 'Take with or after meals to protect your stomach lining, and stay well hydrated.',
    warning: (currentMed.contraindications && currentMed.contraindications.length > 0)
      ? `${currentMed.contraindications.join('. ')}. Seek immediate emergency medical care if hives or facial swelling occur.`
      : 'Do not use if allergic. Consult your doctor if pregnant, nursing, or taking other medications.',
    missedDoseAdvice: currentMed.missedDoseGuidance || 'Take the missed dose as soon as you remember. Skip it if your next dose is due soon. Never take two doses at once.',
    note: currentMed.notes,
  };

  const toggleSpeechSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    window.speechSynthesis.cancel();

    const summaryText = activeTab === 'cards'
      ? `Here is the simple English guide for ${simpleGuide.medicineName}. Uses: ${simpleGuide.uses.join('. ')}. Dosage: ${simpleGuide.dosage}. Food instructions: ${simpleGuide.foodInstructions}. Important warning: ${simpleGuide.warning}. Missed dose advice: ${simpleGuide.missedDoseAdvice}.`
      : `${currentMed.name}, generic name ${currentMed.genericName}. Strength: ${currentMed.strength || ''}. Primary indications include ${currentMed.indications?.join(', ')}. How to take: ${currentMed.howToTake}. Important precautions: ${currentMed.contraindications?.join(', ') || 'Consult doctor before use'}.`;

    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSearchExplainMedicine = async (nameToSearch: string) => {
    if (!nameToSearch.trim()) return;
    setIsSearchingAI(true);
    setSearchError(null);
    stopAudio();

    try {
      // Send detected/entered medicine name to Gemini API
      const guideData = await sendDetectedMedicineToGemini(nameToSearch);

      const generatedMed: MedicineItem = {
        id: `med-${Date.now()}`,
        name: guideData.medicineName || nameToSearch,
        genericName: guideData.genericName || nameToSearch,
        strength: currentMed.name === nameToSearch ? currentMed.strength : 'As prescribed',
        dosageForm: currentMed.name === nameToSearch ? currentMed.dosageForm : 'Oral Formulation',
        category: 'Therapeutic Health Agent',
        manufacturer: 'Clinical Formulation',
        indications: guideData.uses,
        howToTake: guideData.dosage,
        commonSideEffects: guideData.sideEffects,
        seriousSideEffects: ['Severe rash or hives', 'Shortness of breath'],
        contraindications: [guideData.warning],
        foodInteractions: [guideData.foodInstructions],
        storageAdvice: 'Store below 25°C in a dry location away from direct sunlight.',
        missedDoseGuidance: guideData.missedDoseAdvice,
        scannedAt: new Date().toISOString(),
        confidenceScore: 98,
        simpleEnglishGuide: guideData,
        notes: guideData.note,
      };

      setCurrentMed(generatedMed);
      onSelectMedicine(generatedMed);
      playChimeSound('success');
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'Failed to explain medicine with Gemini');
      playChimeSound('warning');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleSaveCurrentMedicine = () => {
    onSaveMedicine(currentMed);
    setIsSavedInCabinet(true);
    playChimeSound('success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Gemini AI Medicine Explainer</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Medicine Explanation in Simple English
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Clear, patient-friendly guidance on Uses, Dosage, Side Effects, Food, Warnings, and Missed Dose Advice.
          </p>
        </div>

        {/* Search any medicine */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="details-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchExplainMedicine(searchQuery)}
              placeholder="Search or explain any medicine (e.g. Lisinopril, Metformin)..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-xs"
            />
          </div>
          <button
            id="details-search-ai-btn"
            disabled={!searchQuery.trim() || isSearchingAI}
            onClick={() => handleSearchExplainMedicine(searchQuery)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isSearchingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Explain with Gemini</span>
          </button>
        </div>
      </div>

      {searchError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{searchError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleSearchExplainMedicine(currentMed.name)}
            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Select from Saved Medicines Selector Strip */}
      {savedMedicines.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">
            Saved Cabinet:
          </span>
          {savedMedicines.map((med) => (
            <button
              key={med.id}
              id={`details-select-saved-${med.id}`}
              onClick={() => {
                setCurrentMed(med);
                onSelectMedicine(med);
                stopAudio();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                currentMed.id === med.id
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {med.name}
            </button>
          ))}
        </div>
      )}

      {/* Top Drug Hero Bar */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {currentMed.dosageForm || 'Oral Dosage Form'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              {currentMed.strength || 'Standard Dosage'}
            </span>
            {currentMed.category && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                {currentMed.category}
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {currentMed.name}
          </h2>
          <p className="text-sm font-semibold text-teal-700 italic mt-0.5">
            Active Chemical Entity: {currentMed.genericName}
          </p>
        </div>

        {/* Action cluster: Voice Reader, Save to Cabinet, Reminder & Interaction */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="details-audio-speech-btn"
            onClick={toggleSpeechSummary}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-600 text-white shadow-rose-500/20 animate-pulse'
                : 'bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 text-teal-800 hover:from-teal-100'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
            <span>{isPlayingAudio ? 'Stop Narration' : 'Listen to Audio'}</span>
          </button>

          <button
            id="details-save-cabinet-btn"
            onClick={handleSaveCurrentMedicine}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
              isSavedInCabinet
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            {isSavedInCabinet ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4 text-slate-500" />}
            <span>{isSavedInCabinet ? 'Saved in Cabinet' : 'Save to Cabinet'}</span>
          </button>

          <button
            id="details-set-reminder-btn"
            onClick={() => {
              onSelectForReminder(currentMed.name, currentMed.strength || '1 dose');
              onNavigate('reminders');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 text-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Add Reminder</span>
          </button>

          <button
            id="details-check-interaction-btn"
            onClick={() => {
              onSelectForInteraction(currentMed.name);
              onNavigate('interactions');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Check Interaction</span>
          </button>
        </div>
      </div>

      {/* View Mode Switch Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Simple English Cards (6 Sections)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'clinical'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Clinical Monograph</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-block">
          Powered by Gemini AI Multi-Model Vision & Reasoning
        </span>
      </div>

      {/* Tab 1: Simple English Animated Cards */}
      {activeTab === 'cards' && (
        <SimpleEnglishCards
          guide={simpleGuide}
          isLoading={isSearchingAI}
          onRefresh={() => handleSearchExplainMedicine(currentMed.name)}
        />
      )}

      {/* Tab 2: Full Clinical Monograph */}
      {activeTab === 'clinical' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-8 animate-in fade-in-50">
          
          {/* 4-Section Clinical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Indications & Usage */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Approved Clinical Indications
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Prescribed for managing or treating the following primary conditions:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentMed.indications?.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Section 2: Administration Regimen */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  How to Take & Dosing Instructions
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentMed.howToTake}
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                💡 Always complete the prescribed duration to prevent resistance and recurrence.
              </div>
            </div>

            {/* Section 3: Side Effects Profile */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Info className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Side Effects Profile
                </h3>
              </div>
              <div>
                <span className="font-bold text-xs text-slate-700 block mb-1">
                  Common (Typically Mild & Transient):
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentMed.commonSideEffects?.join(', ') || 'Nausea, mild headache, temporary fatigue'}
                </p>
              </div>
              {currentMed.seriousSideEffects && currentMed.seriousSideEffects.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-xs text-rose-700 block mb-1">
                    Urgent Symptoms (Contact Doctor Immediately):
                  </span>
                  <p className="text-xs text-rose-600 leading-relaxed">
                    {currentMed.seriousSideEffects.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Section 4: Contraindications & Precautions */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Contraindications & Warnings
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 leading-relaxed">
                {currentMed.contraindications?.join(', ') || 'Do not take if hypersensitive to active component.'}
              </div>
              <p className="text-[11px] text-slate-500">
                Notify your physician if you are pregnant, planning to become pregnant, or nursing before starting.
              </p>
            </div>
          </div>

          {/* Supplementary Guidance Rows: Dietary, Missed Dose, Storage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                🥗 Food & Alcohol
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {currentMed.foodInteractions?.join(', ') || 'Take with water. Limit alcohol to safeguard liver metabolism.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                ⏱️ Missed Dose Protocol
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {currentMed.missedDoseGuidance || 'Take as soon as remembered. Skip if near next dose. Never take two doses together.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                🌡️ Storage & Safe Keeping
              </h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {currentMed.storageAdvice || 'Store at room temperature below 25°C away from humidity and children.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
