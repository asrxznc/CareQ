import React, { useState } from 'react';
import { Page } from '../types';
import { 
  Scan, 
  Home, 
  Activity, 
  FileText, 
  ShieldAlert, 
  Bell, 
  Mic, 
  Users, 
  User, 
  Menu, 
  X, 
  PhoneCall, 
  Sparkles,
  HeartPulse,
  Bot
} from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  activeRemindersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, activeRemindersCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { page: Page; label: string; icon: React.ReactNode; badge?: number }[] = [
    { page: 'landing', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { page: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { page: 'scanner', label: 'Scanner', icon: <Scan className="w-4 h-4" /> },
    { page: 'details', label: 'Details', icon: <FileText className="w-4 h-4" /> },
    { page: 'interactions', label: 'Interactions', icon: <ShieldAlert className="w-4 h-4" /> },
    { page: 'reminders', label: 'Reminders', icon: <Bell className="w-4 h-4" />, badge: activeRemindersCount },
    { page: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { page: 'caregiver', label: 'Caregiver', icon: <Users className="w-4 h-4" /> },
    { page: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo */}
          <div 
            id="nav-brand-logo"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  MediScan<span className="text-teal-600">.ai</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200/60 uppercase tracking-wide">
                  Gemini Vision
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Clinical Pharmacological Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-item-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700 shadow-xs border border-teal-200/70 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-teal-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-[9px] left-3 right-3 h-[2px] bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="nav-quick-scan-btn"
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm shadow-teal-600/20 hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan Medicine</span>
            </button>

            <button
              id="nav-emergency-help-btn"
              onClick={() => onNavigate('caregiver')}
              title="Emergency & Caregiver Contact"
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 text-xs font-medium transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden md:inline">SOS / Caregiver</span>
            </button>
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              id="nav-mobile-scan-btn"
              onClick={() => onNavigate('scanner')}
              className="p-2 rounded-lg bg-teal-600 text-white text-xs font-medium sm:hidden"
            >
              <Scan className="w-4 h-4" />
            </button>
            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  id={`mobile-nav-${item.page}`}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-teal-600'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-teal-800' : 'bg-teal-600 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 3.8 Flash Vision Ready
            </span>
            <button 
              onClick={() => handleNavClick('caregiver')} 
              className="text-rose-600 font-semibold hover:underline"
            >
              Emergency Helpline
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
