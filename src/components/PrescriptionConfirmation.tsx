import React, { useState } from 'react';
import { ExtractedMedicine, ExtractedPrescriptionResult } from '../types';
import { 
  Check, 
  Edit3, 
  Trash2, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Pill,
  Utensils,
  RotateCcw
} from 'lucide-react';

interface PrescriptionConfirmationProps {
  extraction: ExtractedPrescriptionResult;
  onConfirm: (confirmedMedicines: ExtractedMedicine[]) => void;
  onCancel: () => void;
}

export const PrescriptionConfirmation: React.FC<PrescriptionConfirmationProps> = ({
  extraction,
  onConfirm,
  onCancel,
}) => {
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>(extraction.medicines || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Edit draft state
  const [editDraft, setEditDraft] = useState<ExtractedMedicine | null>(null);

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditDraft({ ...medicines[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editDraft) {
      const updated = [...medicines];
      updated[editingIndex] = editDraft;
      setMedicines(updated);
      setEditingIndex(null);
      setEditDraft(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditDraft(null);
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
  };

  const handleAddMedicine = () => {
    const newMed: ExtractedMedicine = {
      name: 'New Medicine',
      strength: '500 mg',
      quantity: '1 tablet',
      frequency: 'Once daily',
      times: ['09:00'],
      timeOfDay: 'morning',
      foodInstruction: 'After Food',
      duration: '30 days',
      specialInstructions: '',
    };
    setMedicines([...medicines, newMed]);
    setEditingIndex(medicines.length);
    setEditDraft(newMed);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-[#39B54A] font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#39B54A]" />
          <span>Step 2 of 2: Medical Review &amp; Confirmation</span>
        </div>
        
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A43] mt-1 tracking-tight">
          Please review your prescription information
        </h2>
        
        <p className="text-sm text-[#6B7C93] mt-1.5 leading-relaxed max-w-2xl">
          CareQ has extracted the following medicines from your prescription. Please verify each entry against your original prescription before generating your daily medication schedule.
        </p>

        {/* Doctor & Clinic metadata if present */}
        {(extraction.doctorName || extraction.clinicOrHospital || extraction.date) && (
          <div className="mt-4 p-3 bg-[#F6FAF8] rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs text-[#243B53]">
            {extraction.doctorName && (
              <span className="font-bold">
                Doctor: <span className="font-normal text-slate-700">{extraction.doctorName}</span>
              </span>
            )}
            {extraction.clinicOrHospital && (
              <span className="font-bold">
                Clinic: <span className="font-normal text-slate-700">{extraction.clinicOrHospital}</span>
              </span>
            )}
            {extraction.date && (
              <span className="font-bold">
                Date: <span className="font-normal text-slate-700">{extraction.date}</span>
              </span>
            )}
            <span className="ml-auto text-[11px] font-semibold text-[#12A89D]">
              AI Confidence: {extraction.confidenceScore || 95}%
            </span>
          </div>
        )}
      </div>

      {/* Medicines List */}
      <div className="space-y-4">
        {medicines.map((med, index) => {
          const isEditing = editingIndex === index;

          if (isEditing && editDraft) {
            return (
              <div
                key={index}
                className="p-5 rounded-2xl bg-teal-50/40 border-2 border-[#12A89D] shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                  <span className="text-xs font-bold text-[#12A89D] uppercase tracking-wider">
                    Editing Medicine #{index + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 rounded-lg bg-[#39B54A] text-white text-xs font-bold hover:bg-[#2E9D57] cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Medicine Name</label>
                    <input
                      type="text"
                      value={editDraft.name}
                      onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Strength</label>
                    <input
                      type="text"
                      value={editDraft.strength}
                      onChange={(e) => setEditDraft({ ...editDraft, strength: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                      placeholder="e.g. 500 mg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Dose / Quantity</label>
                    <input
                      type="text"
                      value={editDraft.quantity}
                      onChange={(e) => setEditDraft({ ...editDraft, quantity: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                      placeholder="e.g. 1 tablet"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Frequency</label>
                    <input
                      type="text"
                      value={editDraft.frequency}
                      onChange={(e) => setEditDraft({ ...editDraft, frequency: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                      placeholder="e.g. Once daily, Twice daily"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Food Instruction</label>
                    <select
                      value={editDraft.foodInstruction}
                      onChange={(e) => setEditDraft({ ...editDraft, foodInstruction: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Meals">With Meals</option>
                      <option value="Empty Stomach">Empty Stomach</option>
                      <option value="No Food Restriction">No Food Restriction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#102A43] mb-1">Duration</label>
                    <input
                      type="text"
                      value={editDraft.duration || ''}
                      onChange={(e) => setEditDraft({ ...editDraft, duration: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                      placeholder="e.g. 30 days, 3 months"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block font-bold text-[#102A43] mb-1">Special Instructions</label>
                    <input
                      type="text"
                      value={editDraft.specialInstructions || ''}
                      onChange={(e) => setEditDraft({ ...editDraft, specialInstructions: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#102A43]"
                      placeholder="e.g. Take with breakfast and dinner; drink plenty of water"
                    />
                  </div>
                </div>
              </div>
            );
          }

          // Normal Display Card
          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-[#F6FAF8] border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100/70 text-[#12A89D] flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-bold text-[#102A43]">
                      {med.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#12A89D] border border-teal-200">
                      {med.strength}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200">
                      {med.quantity}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#6B7C93] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#12A89D]" />
                      <strong>Schedule:</strong> {med.frequency} ({med.times?.join(', ') || '09:00'})
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      <strong>Instruction:</strong> {med.foodInstruction}
                    </span>
                    {med.duration && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Duration:</strong> {med.duration}
                      </span>
                    )}
                  </div>

                  {med.specialInstructions && (
                    <p className="text-xs text-slate-500 italic mt-1.5">
                      Note: {med.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleStartEdit(index)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#102A43] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Edit medicine details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => handleRemoveMedicine(index)}
                  className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 cursor-pointer shadow-2xs"
                  title="Remove this medicine"
                  aria-label="Remove medicine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {medicines.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-semibold text-slate-600">No medicines in prescription list.</p>
            <button
              onClick={handleAddMedicine}
              className="mt-3 px-4 py-2 bg-[#12A89D] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Add Medicine Manually
            </button>
          </div>
        )}

        {/* Add Another Medicine Button */}
        <button
          onClick={handleAddMedicine}
          className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-[#12A89D] rounded-2xl text-xs font-bold text-[#12A89D] hover:bg-teal-50/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Medicine to Schedule</span>
        </button>
      </div>

      {/* Safety Notice & Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">
            Please verify these details against the original prescription before creating reminders.
          </p>
          <p className="text-amber-800 mt-0.5">
            CareQ assists with organization and schedule generation rather than replacing a doctor. Always adhere to your licensed physician or pharmacist&apos;s verbal instructions.
          </p>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel &amp; Re-scan
        </button>

        <button
          id="confirm-create-schedule-btn"
          onClick={() => onConfirm(medicines)}
          disabled={medicines.length === 0}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#39B54A] hover:bg-[#2E9D57] active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-green-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM &amp; CREATE SCHEDULE</span>
        </button>
      </div>

    </div>
  );
};
