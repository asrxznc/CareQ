import React, { useState, useEffect } from 'react';
import { Page, MedicineItem, MedReminder, PatientProfile, CaregiverPatient, ExtractedMedicine } from './types';
import { 
  loadMedicines, 
  saveMedicines, 
  loadReminders, 
  saveReminders, 
  loadProfile, 
  saveProfile, 
  loadCaregivers, 
  saveCaregivers,
  resetAllStorage 
} from './lib/storage';
import { scheduleDoseCheckWorker, playChimeSound } from './lib/notifications';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';

import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { ScannerPage } from './pages/ScannerPage';
import { RemindersPage } from './pages/RemindersPage';
import { HistoryPage } from './pages/HistoryPage';
import { DetailsPage } from './pages/DetailsPage';
import { InteractionsPage } from './pages/InteractionsPage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { CaregiverPage } from './pages/CaregiverPage';
import { ProfilePage } from './pages/ProfilePage';
import { LandingPage } from './pages/LandingPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { LoginPage } from './pages/LoginPage';
import { CaretakerDashboardPage } from './pages/CaretakerDashboardPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { UserRole } from './types';
import confetti from 'canvas-confetti';

export default function App() {
  // Check URL pathname or saved preference for initial role & page
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/caretaker-dashboard') return 'caretaker';
      if (window.location.pathname === '/patient-dashboard') return 'patient';
      const saved = localStorage.getItem('careq_user_role');
      if (saved === 'caretaker' || saved === 'patient') return saved;
    }
    return null;
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('careq_user_email') || '';
    }
    return '';
  });

  // Default first screen of CareQ is the OG Login page
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/caretaker-dashboard') return 'caretaker-dashboard';
      if (window.location.pathname === '/patient-dashboard') return 'patient-dashboard';
      if (window.location.pathname === '/role-selection') return 'role-selection';
    }
    return 'login';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // State loaded from LocalStorage
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [reminders, setReminders] = useState<MedReminder[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [caregivers, setCaregivers] = useState<CaregiverPatient[]>([]);

  // Cross-page navigation context state
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(null);
  const [interactionTargetDrug, setInteractionTargetDrug] = useState<string | undefined>(undefined);
  const [prefilledReminderName, setPrefilledReminderName] = useState<string | undefined>(undefined);
  const [prefilledReminderDosage, setPrefilledReminderDosage] = useState<string | undefined>(undefined);

  // Initialize data on mount
  useEffect(() => {
    const loadedMeds = loadMedicines();
    const loadedRems = loadReminders();
    const loadedProf = loadProfile();
    const loadedCare = loadCaregivers();

    setMedicines(loadedMeds);
    setReminders(loadedRems);
    setProfile(loadedProf);
    setCaregivers(loadedCare);
    if (loadedMeds.length > 0) {
      setSelectedMedicine(loadedMeds[0]);
    }

    // Schedule background dose checking worker
    const stopWorker = scheduleDoseCheckWorker(loadedRems);
    return () => {
      stopWorker();
    };
  }, []);

  // Update schedule worker whenever reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      const stopWorker = scheduleDoseCheckWorker(reminders);
      return () => {
        stopWorker();
      };
    }
  }, [reminders]);

  // Synchronize browser history / popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/caretaker-dashboard') {
        setUserRole('caretaker');
        setCurrentPage('caretaker-dashboard');
      } else if (path === '/patient-dashboard') {
        setUserRole('patient');
        setCurrentPage('patient-dashboard');
      } else if (path === '/role-selection') {
        setCurrentPage('role-selection');
      } else if (path === '/' || path === '' || path === '/login') {
        setCurrentPage('login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler to navigate and scroll to top with clean URL reflection
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sync direct URL paths for requirements: /caretaker-dashboard & /patient-dashboard
    if (page === 'caretaker-dashboard') {
      window.history.pushState({}, '', '/caretaker-dashboard');
    } else if (page === 'patient-dashboard') {
      window.history.pushState({}, '', '/patient-dashboard');
    } else if (page === 'role-selection') {
      window.history.pushState({}, '', '/role-selection');
    } else if (page === 'login') {
      window.history.pushState({}, '', '/');
    }
  };

  // Login handler: redirects based on email and password role detection
  const handleLoginSuccess = (role: 'caretaker' | 'patient', email: string) => {
    setUserRole(role);
    setUserEmail(email);
    try {
      localStorage.setItem('careq_user_role', role);
      localStorage.setItem('careq_user_email', email);
    } catch {
      // ignore
    }
    if (role === 'caretaker') {
      handleNavigate('caretaker-dashboard');
    } else {
      handleNavigate('patient-dashboard');
    }
  };

  // Role Selection entry handler
  const handleSelectRole = (role: 'caretaker' | 'patient') => {
    setUserRole(role);
    try {
      localStorage.setItem('careq_user_role', role);
    } catch {
      // ignore
    }
    if (role === 'caretaker') {
      handleNavigate('caretaker-dashboard');
    } else {
      handleNavigate('patient-dashboard');
    }
  };

  // Logout handler returning immediately to the OG Login Page
  const handleLogout = () => {
    setUserRole(null);
    setUserEmail('');
    try {
      localStorage.removeItem('careq_user_role');
      localStorage.removeItem('careq_user_email');
    } catch {
      // ignore
    }
    handleNavigate('login');
  };

  // Medicine persistence handlers
  const handleSaveMedicine = (newMed: MedicineItem) => {
    const existingIndex = medicines.findIndex(m => m.id === newMed.id || m.name.toLowerCase() === newMed.name.toLowerCase());
    let updated: MedicineItem[];
    if (existingIndex >= 0) {
      updated = [...medicines];
      updated[existingIndex] = newMed;
    } else {
      updated = [newMed, ...medicines];
    }
    setMedicines(updated);
    saveMedicines(updated);
    setSelectedMedicine(newMed);
  };

  // Prescription Confirmation & Auto-Schedule Generation Handler (Section 10 & 11)
  const handleConfirmPrescription = (extractedMedicines: ExtractedMedicine[]) => {
    // 1. Convert ExtractedMedicine to MedicineItem records
    const newMeds: MedicineItem[] = extractedMedicines.map((m, idx) => ({
      id: `med-${Date.now()}-${idx}`,
      name: `${m.name} ${m.strength}`.trim(),
      genericName: m.name,
      strength: m.strength,
      dosageForm: m.quantity || '1 tablet',
      manufacturer: 'Prescribed Formulation',
      indications: ['Prescribed Medical Therapy'],
      howToTake: `${m.quantity} ${m.frequency} ${m.foodInstruction}. ${m.specialInstructions || ''}`.trim(),
      commonSideEffects: ['Mild gastrointestinal sensitivity', 'Transient nausea'],
      seriousSideEffects: ['Consult physician if allergic rash or breathing changes occur'],
      contraindications: [],
      foodInteractions: [m.foodInstruction || 'After Food'],
      storageAdvice: 'Store at room temperature below 25°C away from direct sunlight.',
      missedDoseGuidance: 'Take as soon as remembered unless close to the next scheduled dose.',
      scannedAt: new Date().toISOString(),
      category: 'Prescription Medication',
      confidenceScore: 98,
      simpleEnglishGuide: {
        medicineName: `${m.name} ${m.strength}`,
        genericName: m.name,
        uses: ['Prescribed by your physician for health management'],
        dosage: `${m.quantity} ${m.frequency} ${m.foodInstruction}`,
        sideEffects: ['Mild stomach fullness', 'Temporary nausea'],
        foodInstructions: m.foodInstruction || 'Take after food with water',
        warning: 'Follow your doctor’s prescribed dosage and do not skip doses.',
        missedDoseAdvice: 'Take when remembered with food. Never double up.',
      }
    }));

    // 2. Generate daily schedule reminders based on extracted times
    const newRems: MedReminder[] = [];
    extractedMedicines.forEach((m, idx) => {
      const times = m.times && m.times.length > 0 ? m.times : ['09:00'];
      times.forEach((timeStr, tIdx) => {
        newRems.push({
          id: `rem-${Date.now()}-${idx}-${tIdx}`,
          medicineId: `med-${Date.now()}-${idx}`,
          medicineName: `${m.name} ${m.strength}`.trim(),
          dosage: m.quantity || '1 tablet',
          time: timeStr,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          mealTiming: m.foodInstruction?.toLowerCase().includes('before') ? 'before' : 'after',
          active: true,
          notes: `${m.foodInstruction || 'After Food'}${m.specialInstructions ? ` • ${m.specialInstructions}` : ''}`,
          takenHistory: {},
        });
      });
    });

    // Merge into state and persist
    const updatedMeds = [...newMeds, ...medicines];
    setMedicines(updatedMeds);
    saveMedicines(updatedMeds);

    const updatedRems = [...newRems, ...reminders];
    setReminders(updatedRems);
    saveReminders(updatedRems);

    playChimeSound('success');
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#39B54A', '#12A89D', '#087F8C', '#4C8DFF'],
    });

    // Navigate to reminders page to show newly generated schedule
    handleNavigate('reminders');
  };

  // Reminder persistence handlers
  const handleAddReminder = (newRem: MedReminder) => {
    const updated = [...reminders, newRem];
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const handleToggleReminderTaken = (reminderId: string, dateStr: string) => {
    const updated = reminders.map(r => {
      if (r.id === reminderId) {
        const currentHistory = r.takenHistory || {};
        const isCurrentlyTaken = !!currentHistory[dateStr];
        const newHistory = { ...currentHistory };
        if (isCurrentlyTaken) {
          delete newHistory[dateStr];
        } else {
          newHistory[dateStr] = true;
        }
        return {
          ...r,
          takenHistory: newHistory,
        };
      }
      return r;
    });

    setReminders(updated);
    saveReminders(updated);
  };

  // Caregiver persistence handlers
  const handleAddCaregiver = (newCare: CaregiverPatient) => {
    const updated = [...caregivers, newCare];
    setCaregivers(updated);
    saveCaregivers(updated);
  };

  // Profile persistence handler
  const handleUpdateProfile = (newProfile: PatientProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  // Reset entire application demo storage
  const handleResetData = () => {
    resetAllStorage();
    const loadedMeds = loadMedicines();
    const loadedRems = loadReminders();
    const loadedProf = loadProfile();
    const loadedCare = loadCaregivers();
    setMedicines(loadedMeds);
    setReminders(loadedRems);
    setProfile(loadedProf);
    setCaregivers(loadedCare);
    setSelectedMedicine(loadedMeds[0] || null);
  };

  // Pre-fill routing helpers
  const handleSelectForInteraction = (drugName: string) => {
    setInteractionTargetDrug(drugName);
    handleNavigate('interactions');
  };

  const handleSelectForReminder = (medName: string, dosage: string) => {
    setPrefilledReminderName(medName);
    setPrefilledReminderDosage(dosage);
    handleNavigate('reminders');
  };

  const currentProfile = profile || {
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@careq.health',
    phone: '+1 (555) 392-8801',
    age: 71,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension', 'High Cholesterol'],
    emergencyContactName: 'Anita Kumar (Daughter)',
    emergencyContactPhone: '+1 (555) 392-8810',
    doctorName: 'Dr. Sarah Jenkins, MD',
    doctorPhone: '+1 (555) 234-9000',
    hospitalPreference: 'St. Jude Memorial Health Center',
    notificationsEnabled: true,
    soundAlertsEnabled: true,
    notes: 'Requires large readable text and simple after-food reminders.',
  };

  // 1. ENTRY PAGE: OG Login page as primary entry screen of CareQ
  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Alternative Role-Selection Page
  if (currentPage === 'role-selection') {
    return <RoleSelectionPage onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen bg-[#F6FAF8] text-[#243B53] antialiased selection:bg-[#12A89D] selection:text-white flex flex-col">
      
      {/* Left Navigation Sidebar (Navy #102A43) */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenVoiceAssistant={() => handleNavigate('assistant')}
        userRole={userRole || 'patient'}
        onLogout={handleLogout}
      />

      {/* Main App Workspace (Offset by Sidebar on md+) */}
      <div className="md:pl-64 lg:pl-72 flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <TopBar
          onNavigate={handleNavigate}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          patientName={currentProfile.name.split(' ')[0] || 'Ramesh'}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          medicinesList={medicines}
          onSelectMedicine={(med) => setSelectedMedicine(med)}
          userRole={userRole || 'patient'}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
          {/* CARETAKER DASHBOARD (/caretaker-dashboard) */}
          {currentPage === 'caretaker-dashboard' && (
            <CaretakerDashboardPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              reminders={reminders}
              caregivers={caregivers}
              onAddCaregiver={handleAddCaregiver}
              onAddReminder={handleAddReminder}
              onToggleReminderTaken={handleToggleReminderTaken}
              onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
              caretakerName="Anita Kumar"
              onLogout={handleLogout}
            />
          )}

          {/* PATIENT DASHBOARD (/patient-dashboard) */}
          {currentPage === 'patient-dashboard' && (
            <PatientDashboardPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              reminders={reminders}
              onToggleReminderTaken={handleToggleReminderTaken}
              onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
              caregivers={caregivers}
              profile={currentProfile}
              onLogout={handleLogout}
            />
          )}

          {/* Standard dashboard fallback according to active role */}
          {currentPage === 'dashboard' && (
            userRole === 'caretaker' ? (
              <CaretakerDashboardPage
                onNavigate={handleNavigate}
                savedMedicines={medicines}
                reminders={reminders}
                caregivers={caregivers}
                onAddCaregiver={handleAddCaregiver}
                onAddReminder={handleAddReminder}
                onToggleReminderTaken={handleToggleReminderTaken}
                onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
                caretakerName="Anita Kumar"
                onLogout={handleLogout}
              />
            ) : (
              <PatientDashboardPage
                onNavigate={handleNavigate}
                savedMedicines={medicines}
                reminders={reminders}
                onToggleReminderTaken={handleToggleReminderTaken}
                onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
                caregivers={caregivers}
                profile={currentProfile}
                onLogout={handleLogout}
              />
            )
          )}

          {currentPage === 'medicines' && (
            <MedicinesPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
              onSelectForReminder={handleSelectForReminder}
            />
          )}

          {currentPage === 'scanner' && (
            <ScannerPage
              onNavigate={handleNavigate}
              onSaveMedicine={handleSaveMedicine}
              onConfirmPrescription={handleConfirmPrescription}
              onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
              onSelectForInteraction={handleSelectForInteraction}
              onSelectForReminder={handleSelectForReminder}
            />
          )}

          {currentPage === 'reminders' && (
            <RemindersPage
              onNavigate={handleNavigate}
              reminders={reminders}
              savedMedicines={medicines}
              onAddReminder={handleAddReminder}
              onDeleteReminder={handleDeleteReminder}
              onToggleReminderTaken={handleToggleReminderTaken}
              prefilledMedicineName={prefilledReminderName}
              prefilledDosage={prefilledReminderDosage}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              onNavigate={handleNavigate}
              reminders={reminders}
              onToggleReminderTaken={handleToggleReminderTaken}
            />
          )}

          {currentPage === 'details' && (
            <DetailsPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              selectedMedicine={selectedMedicine}
              onSelectMedicine={(med) => setSelectedMedicine(med)}
              onSaveMedicine={handleSaveMedicine}
              onSelectForInteraction={handleSelectForInteraction}
              onSelectForReminder={handleSelectForReminder}
            />
          )}

          {currentPage === 'interactions' && (
            <InteractionsPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              preselectedDrug={interactionTargetDrug}
              patientProfile={currentProfile}
            />
          )}

          {currentPage === 'assistant' && (
            <VoiceAssistantPage
              onNavigate={handleNavigate}
              patientProfile={currentProfile}
              savedMedicines={medicines}
            />
          )}

          {currentPage === 'caregiver' && (
            <CaregiverPage
              onNavigate={handleNavigate}
              caregivers={caregivers}
              onAddCaregiver={handleAddCaregiver}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              onNavigate={handleNavigate}
              profile={currentProfile}
              onUpdateProfile={handleUpdateProfile}
              onResetData={handleResetData}
            />
          )}

          {currentPage === 'landing' && (
            <LandingPage
              onNavigate={handleNavigate}
              savedMedicines={medicines}
              onSelectMedicineForDetails={(med) => setSelectedMedicine(med)}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} userRole={userRole || 'patient'} />
      </div>

    </div>
  );
}
