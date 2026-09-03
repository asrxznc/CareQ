import React from 'react';
import { Page, UserRole } from '../types';
import { CareQLogo } from './CareQLogo';
import { 
  Home, 
  Pill, 
  Scan, 
  Bell, 
  Clock, 
  Users, 
  Settings, 
  Mic, 
  X,
  Volume2,
  LogOut,
  HeartHandshake,
  User
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenVoiceAssistant?: () => void;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  mobileOpen = false,
  onCloseMobile,
  onOpenVoiceAssistant,
  userRole = 'patient',
  onLogout,
}) => {
  const isCaretaker = userRole === 'caretaker';
  const homeTarget: Page = isCaretaker ? 'caretaker-dashboard' : 'patient-dashboard';

  const navItems: Array<{ id: Page; label: string; icon: React.ComponentType<{ className?: string }> }> = isCaretaker
    ? [
        { id: 'caretaker-dashboard', label: 'Caretaker Home', icon: HeartHandshake },
        { id: 'caregiver', label: 'My Patients', icon: Users },
        { id: 'medicines', label: 'Medications', icon: Pill },
        { id: 'scanner', label: 'Scan Prescription', icon: Scan },
        { id: 'reminders', label: 'Dose Reminders', icon: Bell },
        { id: 'history', label: 'Dose Logs', icon: Clock },
        { id: 'profile', label: 'Settings', icon: Settings },
      ]
    : [
        { id: 'patient-dashboard', label: 'Patient Home', icon: Home },
        { id: 'medicines', label: 'My Medicines', icon: Pill },
        { id: 'scanner', label: 'Prescription Scanner', icon: Scan },
        { id: 'reminders', label: 'Reminders', icon: Bell },
        { id: 'history', label: 'History', icon: Clock },
        { id: 'caregiver', label: 'Caretaker', icon: Users },
        { id: 'profile', label: 'Profile', icon: Settings },
      ];

  const handleItemClick = (page: Page) => {
    onNavigate(page);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#102A43] text-white select-none border-r border-[#102A43]/50">
      {/* Top Logo Section */}
      <div className="p-5 pb-6 border-b border-slate-800/60 flex items-center justify-between">
        <button
          onClick={() => handleItemClick(homeTarget)}
          className="text-left focus:outline-hidden group cursor-pointer"
          title={`CareQ - ${isCaretaker ? 'Caretaker Portal' : 'Patient Portal'}`}
        >
          <CareQLogo variant="dark" layout="horizontal" size="md" showTagline={true} />
        </button>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-hidden"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Badge in Sidebar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
          {isCaretaker ? (
            <>
              <HeartHandshake className="w-3.5 h-3.5 text-[#12A89D]" />
              <span>Caretaker Portal</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-[#39B54A]" />
              <span>Patient Portal</span>
            </>
          )}
        </span>
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-[11px] text-teal-300 hover:text-white font-semibold cursor-pointer flex items-center gap-1 hover:underline"
            title="Switch role"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch</span>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === 'patient-dashboard' && (currentPage === 'dashboard' || currentPage === 'landing')) ||
            (item.id === 'caretaker-dashboard' && currentPage === 'caregiver' && isCaretaker) ||
            (item.id === 'medicines' && currentPage === 'details') ||
            (item.id === 'reminders' && currentPage === 'schedule');

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#12A89D] to-[#39B54A] text-white shadow-md shadow-teal-900/30 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Voice Assistant & Logout */}
      <div className="p-4 pt-2 border-t border-slate-800/60">
        <button
          id="sidebar-voice-btn"
          onClick={() => {
            if (onOpenVoiceAssistant) {
              onOpenVoiceAssistant();
            } else {
              handleItemClick('assistant');
            }
          }}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#39B54A] to-[#12A89D] p-3 text-white shadow-lg shadow-teal-950/40 hover:brightness-105 active:scale-98 transition-all cursor-pointer group text-left mb-2.5"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-xs leading-tight text-white">
                <span>Voice Assistant</span>
                <Volume2 className="w-3 h-3 opacity-80" />
              </div>
              <p className="text-[10px] text-teal-50/90 font-medium mt-0.5">
                Tap to Speak
              </p>
            </div>
          </div>
        </button>

        {/* Logout button in sidebar */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout / Switch Role</span>
          </button>
        )}

        {/* Small branding badge */}
        <div className="mt-2.5 px-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>CareQ &bull; {isCaretaker ? 'Caretaker' : 'Patient'}</span>
          <span className="text-[#39B54A]">● Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
