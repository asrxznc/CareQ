import React, { useState } from 'react';
import { Page, PatientProfile } from '../types';
import { 
  User, 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  Plus, 
  X, 
  Phone, 
  Building2, 
  Stethoscope,
  Trash2
} from 'lucide-react';
import { playChimeSound } from '../lib/notifications';

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
  profile: PatientProfile;
  onUpdateProfile: (updated: PatientProfile) => void;
  onResetData: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  const [formData, setFormData] = useState<PatientProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    playChimeSound('success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    if (!formData.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
    }
    setNewAllergy('');
  };

  const handleRemoveAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy),
    });
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    if (!formData.chronicConditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        chronicConditions: [...formData.chronicConditions, newCondition.trim()],
      });
    }
    setNewCondition('');
  };

  const handleRemoveCondition = (condition: string) => {
    setFormData({
      ...formData,
      chronicConditions: formData.chronicConditions.filter(c => c !== condition),
    });
  };

  const handleExportData = () => {
    const fullBackup = {
      profile: formData,
      medicines: localStorage.getItem('mediscan_medicines'),
      reminders: localStorage.getItem('mediscan_reminders'),
      caregivers: localStorage.getItem('mediscan_caregivers'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mediscan-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playChimeSound('success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Encrypted Client-Side Health Profile</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Patient Profile & Safety Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure known drug allergies, conditions, and emergency physician records.
          </p>
        </div>

        {/* Action button */}
        <button
          id="profile-save-top-btn"
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Changes Saved!' : 'Save Health Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Personal Health Identification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Emergency Phone
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Drug Allergies & Chronic Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Allergies Card */}
          <div className="glass-card p-6 rounded-3xl border border-rose-200/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Known Drug & Substance Allergies
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                {formData.allergies.length} Logged
              </span>
            </div>

            <p className="text-xs text-slate-500">
              The Gemini scanner and interaction checker cross-reference these allergies to prevent adverse reactions.
            </p>

            {/* Existing Allergy Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-12 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              {formData.allergies.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No recorded allergies</span>
              ) : (
                formData.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-100/80 text-rose-900 text-xs font-semibold"
                  >
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Allergy Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                placeholder="Add allergy (e.g. Sulfa, NSAIDs)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Chronic Conditions Card */}
          <div className="glass-card p-6 rounded-3xl border border-blue-200/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Chronic Health Conditions
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                {formData.chronicConditions.length} Logged
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Incorporated into medication analysis to avoid disease-drug contraindications.
            </p>

            {/* Existing Condition Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-12 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              {formData.chronicConditions.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No chronic diagnoses</span>
              ) : (
                formData.chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-100/80 text-blue-900 text-xs font-semibold"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(cond)}
                      className="hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Condition Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                placeholder="Add condition (e.g. Asthma, GERD)..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200"
              >
                + Add
              </button>
            </div>
          </div>

        </div>

        {/* Primary Care Provider & Pharmacy */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Healthcare Providers & Preferred Pharmacy</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Care Physician
              </label>
              <input
                type="text"
                value={formData.primaryPhysician}
                onChange={(e) => setFormData({ ...formData, primaryPhysician: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preferred Dispensing Pharmacy
              </label>
              <input
                type="text"
                value={formData.preferredPharmacy}
                onChange={(e) => setFormData({ ...formData, preferredPharmacy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Data Portability & Local Storage Actions */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              Local Storage Portability & Backups
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All your scanned medicines and reminder histories reside purely inside your local browser storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="profile-export-btn"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              id="profile-reset-btn"
              onClick={() => {
                if (confirm('Reset all saved medicines, reminders, and profile to sample demo state?')) {
                  onResetData();
                  playChimeSound('reminder');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
