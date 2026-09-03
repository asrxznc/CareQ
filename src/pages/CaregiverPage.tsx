import React, { useState } from 'react';
import { Page, CaregiverPatient } from '../types';
import { 
  Users, 
  UserPlus, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Heart, 
  Calendar, 
  Clock, 
  Pill, 
  ShieldCheck, 
  Plus, 
  X,
  Share2,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound, sendBrowserNotification } from '../lib/notifications';

interface CaregiverPageProps {
  onNavigate: (page: Page) => void;
  caregivers: CaregiverPatient[];
  onAddCaregiver: (patient: CaregiverPatient) => void;
}

export const CaregiverPage: React.FC<CaregiverPageProps> = ({
  onNavigate,
  caregivers,
  onAddCaregiver,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(caregivers[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [nudgeSentMap, setNudgeSentMap] = useState<Record<string, boolean>>({});

  // New dependent form
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Mother');
  const [age, setAge] = useState('72');
  const [conditions, setConditions] = useState('Hypertension, Arthritis');
  const [phone, setPhone] = useState('+1 (555) 329-8812');

  const selectedPatient = caregivers.find(p => p.id === selectedPatientId) || caregivers[0];

  const handleSendNudge = (patient: CaregiverPatient) => {
    playChimeSound('reminder');
    sendBrowserNotification(`Caregiver Nudge sent to ${patient.name}`, {
      body: `Dose reminder transmitted to ${patient.name}'s phone.`,
    });
    setNudgeSentMap(prev => ({ ...prev, [patient.id]: true }));
    setTimeout(() => {
      setNudgeSentMap(prev => ({ ...prev, [patient.id]: false }));
    }, 4000);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient: CaregiverPatient = {
      id: `pat-${Date.now()}`,
      name: name.trim(),
      relationship: relation.trim(),
      age: parseInt(age) || 70,
      adherenceRate: 90,
      medicationCount: 3,
      emergencyContact: phone.trim(),
      conditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
      recentLogs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'taken',
          message: 'Profile registered in MediScan Caregiver Network.',
        }
      ]
    };

    onAddCaregiver(newPatient);
    setSelectedPatientId(newPatient.id);
    setShowAddModal(false);
    setName('');
    playChimeSound('success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-purple-800 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Family & Senior Care Coordination</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Caregiver Network Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Remotely monitor adherence, review prescription regimens, and send gentle dosage nudges to elderly loved ones.
          </p>
        </div>

        <button
          id="caregiver-add-dependent-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Dependent</span>
        </button>
      </div>

      {/* Main Grid: Dependent Cards & Selected Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Dependent Switcher (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
            Connected Loved Ones ({caregivers.length})
          </h2>

          <div className="space-y-3">
            {caregivers.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              return (
                <div
                  key={patient.id}
                  id={`caregiver-patient-card-${patient.id}`}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-card border-purple-400 shadow-md ring-2 ring-purple-400/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                      {patient.relationship} • Age {patient.age}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {patient.adherenceRate}% Adherence
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900">
                    {patient.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {patient.conditions.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${patient.adherenceRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Dependent Live Telemetry (8 cols) */}
        <div className="lg:col-span-8">
          {selectedPatient ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
              
              {/* Header profile summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-display text-xl font-bold flex items-center justify-center shadow-md shadow-purple-500/20">
                    {selectedPatient.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-slate-900">
                        {selectedPatient.name}
                      </h2>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800">
                        {selectedPatient.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.conditions.join(', ')} • {selectedPatient.medicationCount} Active Prescriptions
                    </p>
                  </div>
                </div>

                {/* Send Nudge button */}
                <button
                  id={`btn-nudge-${selectedPatient.id}`}
                  onClick={() => handleSendNudge(selectedPatient)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    nudgeSentMap[selectedPatient.id]
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                  <span>{nudgeSentMap[selectedPatient.id] ? 'Nudge Sent via Push!' : 'Send Dosage Nudge'}</span>
                </button>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Adherence Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-2xl font-extrabold text-purple-700">
                      {selectedPatient.adherenceRate}%
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">High Tier</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Calculated over past 30 days</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Today's Regimen
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-2xl font-extrabold text-slate-900">
                      2 of 3
                    </span>
                    <span className="text-[11px] text-slate-500">Doses Taken</span>
                  </div>
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">Evening dose scheduled 07:00 PM</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    Emergency Contact
                  </span>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-mono font-bold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>{selectedPatient.emergencyContact}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Direct physician / nurse line</p>
                </div>
              </div>

              {/* Patient Recent Event Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Real-time Medication Adherence Log</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Live Device Sync</span>
                </div>

                <div className="space-y-2">
                  {(selectedPatient.recentLogs || []).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {log.type === 'taken' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : log.type === 'missed' ? (
                          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="text-slate-800 font-medium">{log.message}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>HIPAA encrypted telecare relay active</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playChimeSound('success');
                      alert(`Emergency physician report generated for ${selectedPatient.name}.`);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    Export Clinical PDF
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl text-center text-slate-400">
              No caregiver profiles connected.
            </div>
          )}
        </div>
      </div>

      {/* Add Dependent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Register Dependent
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Relationship
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Child">Child</option>
                    <option value="Patient">Patient</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chronic Diagnoses (Comma separated)
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Emergency Phone Contact
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                >
                  Add Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
