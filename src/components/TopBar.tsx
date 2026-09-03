import React, { useState } from 'react';
import { Page, MedicineItem, UserRole } from '../types';
import { 
  Search, 
  PhoneCall, 
  Bell, 
  Menu, 
  X,
  AlertCircle,
  Calendar,
  CheckCircle2,
  LogOut,
  HeartHandshake,
  User
} from 'lucide-react';

interface TopBarProps {
  onNavigate: (page: Page) => void;
  onToggleMobileSidebar: () => void;
  patientName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  medicinesList: MedicineItem[];
  onSelectMedicine: (med: MedicineItem) => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNavigate,
  onToggleMobileSidebar,
  patientName = 'Ramesh',
  searchQuery,
  onSearchChange,
  medicinesList,
  onSelectMedicine,
  userRole = 'patient',
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const isCaretaker = userRole === 'caretaker';
  const displayName = isCaretaker ? 'Anita (Caretaker)' : patientName;
  const initial = isCaretaker ? 'A' : patientName.charAt(0) || 'R';

  // Filter search dropdown results if user types
  const searchResults = searchQuery.trim()
    ? medicinesList.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.indications.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const notifications = [
    {
      id: 'notif-1',
      title: 'Afternoon Dose Upcoming',
      message: 'Amlodipine 5 mg scheduled for 1:00 PM after lunch.',
      time: '12:45 PM',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Caregiver Update',
      message: 'Anita verified your morning Metformin dose.',
      time: '09:05 AM',
      unread: true,
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3 md:gap-6">
        
        {/* Left Section: Mobile Menu + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-2xl font-bold text-[#102A43] flex items-center gap-1.5 tracking-tight">
                <span>{isCaretaker ? 'Caretaker Portal' : `Good Morning, ${displayName}`}</span>
                <span className="text-xl sm:text-2xl">{isCaretaker ? '🤝' : '👋'}</span>
              </h1>
              <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isCaretaker ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {isCaretaker ? 'Caretaker Mode' : 'Patient Mode'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7C93] font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#12A89D]" />
              <span>Wednesday, 3 September 2026</span>
            </p>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="topbar-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isCaretaker ? "Search patients, medications..." : "Search medicines / help..."}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F6FAF8] border border-slate-200/90 rounded-xl text-[#243B53] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#12A89D]/40 focus:border-[#12A89D] transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => {
                      onSelectMedicine(med);
                      onNavigate('details');
                      onSearchChange('');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F6FAF8] flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#102A43]">{med.name}</p>
                      <p className="text-xs text-[#6B7C93]">{med.strength} • {med.howToTake}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#12A89D]">View Details →</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No medicines found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Emergency / Help Button */}
          <button
            id="emergency-help-btn"
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-[#D9534F] text-[#D9534F] hover:bg-[#D9534F]/5 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden xs:inline whitespace-nowrap">Emergency</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="topbar-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 relative focus:outline-hidden cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 text-[#243B53]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D9534F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                2
              </span>
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-[#102A43]">Notifications</h3>
                  <span className="text-[11px] font-semibold text-[#12A89D]">2 unread</span>
                </div>
                <div className="divide-y divide-slate-100 mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-xs text-[#102A43]">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-[#12A89D] hover:bg-teal-50 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* User Avatar Circle */}
          <button
            onClick={() => onNavigate('profile')}
            id="topbar-user-avatar-btn"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#12A89D] to-[#39B54A] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs border-2 border-white hover:ring-2 hover:ring-[#12A89D] cursor-pointer"
            title={`${displayName} (Profile)`}
          >
            {initial}
          </button>

          {/* Logout / Switch Role Top Bar Button */}
          {onLogout && (
            <button
              id="topbar-logout-btn"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Logout to Role Selection"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Emergency Contact Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#D9534F] font-bold text-lg">
                <AlertCircle className="w-5 h-5" />
                <span>Emergency Contact & Help</span>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <p className="text-sm text-slate-600">
                If you are experiencing severe difficulty breathing, sudden chest pain, or a medical emergency, call emergency services immediately:
              </p>

              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-900 uppercase tracking-wide">Emergency Services</p>
                  <p className="text-lg font-extrabold text-red-700">911</p>
                </div>
                <a
                  href="tel:911"
                  className="px-4 py-2 bg-[#D9534F] text-white font-bold rounded-lg text-xs shadow-xs hover:bg-red-700"
                >
                  Call Now
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#102A43]">Anita (Daughter / Caregiver)</p>
                  <p className="text-sm font-semibold text-[#12A89D]">+1 (555) 392-8810</p>
                </div>
                <a
                  href="tel:+15553928810"
                  className="px-3.5 py-1.5 bg-[#102A43] text-white font-semibold rounded-lg text-xs shadow-xs hover:bg-slate-800"
                >
                  Call Anita
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#102A43]">Dr. Sarah Jenkins, MD (Clinic)</p>
                  <p className="text-sm font-semibold text-[#12A89D]">+1 (555) 234-9000</p>
                </div>
                <a
                  href="tel:+15552349000"
                  className="px-3.5 py-1.5 bg-slate-700 text-white font-semibold rounded-lg text-xs shadow-xs hover:bg-slate-800"
                >
                  Call Clinic
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full mt-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
