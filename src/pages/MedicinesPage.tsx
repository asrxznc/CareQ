import React, { useState } from 'react';
import { Page, MedicineItem } from '../types';
import { 
  Pill, 
  Search, 
  Plus, 
  ArrowRight, 
  Calendar, 
  Utensils, 
  Clock, 
  Info, 
  ShieldAlert,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface MedicinesPageProps {
  onNavigate: (page: Page) => void;
  savedMedicines: MedicineItem[];
  onSelectMedicineForDetails: (med: MedicineItem) => void;
  onSelectForReminder: (medName: string, dosage: string) => void;
}

export const MedicinesPage: React.FC<MedicinesPageProps> = ({
  onNavigate,
  savedMedicines = [],
  onSelectMedicineForDetails,
  onSelectForReminder,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  const filteredMedicines = savedMedicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      med.indications.some((i) => i.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCondition === 'all') return true;
    if (selectedCondition === 'diabetes') return med.indications.some((i) => i.toLowerCase().includes('diabetes'));
    if (selectedCondition === 'blood_pressure') return med.indications.some((i) => i.toLowerCase().includes('hypertension') || i.toLowerCase().includes('blood pressure'));
    if (selectedCondition === 'cholesterol') return med.indications.some((i) => i.toLowerCase().includes('cholesterol') || i.toLowerCase().includes('statin'));

    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#12A89D]">
            <Pill className="w-4 h-4 text-[#12A89D]" />
            <span>Medication Formulary &amp; Cabinet</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight mt-1">
            My Medicines
          </h1>
          <p className="text-sm text-[#6B7C93] mt-1">
            Active prescribed medications, dosage instructions, and clinical safety information.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onNavigate('scanner')}
            className="px-4 py-2.5 rounded-xl bg-[#39B54A] hover:bg-[#2E9D57] text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Scan New Prescription</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search medicines or conditions..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F6FAF8] border border-slate-200 rounded-xl text-[#243B53] focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]"
          />
        </div>

        {/* Condition Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Medicines' },
            { id: 'diabetes', label: 'Diabetes' },
            { id: 'blood_pressure', label: 'Blood Pressure' },
            { id: 'cholesterol', label: 'Cholesterol' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCondition(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedCondition === tab.id
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'bg-slate-100 text-[#6B7C93] hover:text-[#102A43]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMedicines.map((med, index) => {
          const pillColors = ['#4C8DFF', '#E05252', '#F2B84B', '#9333EA'];
          const accentColor = pillColors[index % pillColors.length];

          return (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-[#102A43] group-hover:text-[#12A89D] transition-colors">
                        {med.name}
                      </h3>
                      <p className="text-xs text-[#6B7C93] font-medium">
                        {med.genericName} • {med.strength}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#2E9D57] border border-green-200 shrink-0">
                    ● Active
                  </span>
                </div>

                {/* Primary Indications */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {med.indications.slice(0, 3).map((ind, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F6FAF8] text-[#102A43] border border-slate-200"
                    >
                      {ind}
                    </span>
                  ))}
                </div>

                {/* Administration summary */}
                <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-[#243B53] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#102A43] font-semibold">
                    <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Food Instruction: After Food</span>
                  </div>
                  <p className="text-[#6B7C93] line-clamp-2 leading-relaxed">
                    {med.howToTake}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectMedicineForDetails(med);
                    onNavigate('details');
                  }}
                  className="text-xs font-bold text-[#12A89D] hover:text-[#087F8C] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Simple English Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSelectForReminder(med.name, med.dosageForm || '1 tablet')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-[#12A89D] text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Set Reminder
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedicines.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#102A43]">No medicines match your search.</p>
          <p className="text-xs text-slate-500 mt-1">Try changing your search terms or filter.</p>
        </div>
      )}

    </div>
  );
};
