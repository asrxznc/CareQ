import React from 'react';
import { CareQLogo } from '../components/CareQLogo';
import { 
  HeartHandshake, 
  User, 
  ArrowRight, 
  Users, 
  Pill, 
  Bell, 
  Scan, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Heart
} from 'lucide-react';

interface RoleSelectionPageProps {
  onSelectRole: (role: 'caretaker' | 'patient') => void;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F6FAF8] text-[#243B53] flex flex-col justify-between selection:bg-[#12A89D]/20 selection:text-[#102A43]">
      {/* Top subtle decorative bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#12A89D] via-[#39B54A] to-[#087F8C]" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        
        {/* Top Branding Section */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* CareQ Logo */}
          <div className="mb-4">
            <CareQLogo
              variant="light"
              layout="stacked"
              size="lg"
              showTagline={false}
              className="drop-shadow-xs"
            />
          </div>

          {/* Tagline */}
          <p className="text-sm sm:text-base font-semibold text-[#12A89D] tracking-wide uppercase mt-1 mb-6 flex items-center gap-2">
            <span className="w-6 h-[1.5px] bg-[#12A89D]/40 rounded-full inline-block" />
            The Right Medicine. The Right Time.
            <span className="w-6 h-[1.5px] bg-[#12A89D]/40 rounded-full inline-block" />
          </p>

          {/* Heading */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] tracking-tight max-w-2xl leading-tight">
            How are you using CareQ?
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#6B7C93] max-w-xl font-normal">
            Choose your profile to enter your tailored medication workspace.
          </p>
        </div>

        {/* Two Large Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          
          {/* CARD 1 — CARETAKER */}
          <div
            id="role-card-caretaker"
            onClick={() => onSelectRole('caretaker')}
            className="group relative bg-white border-2 border-slate-200/90 hover:border-[#12A89D] rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left"
          >
            {/* Top Badge & Caregiver Icon */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#12A89D] group-hover:scale-110 group-hover:bg-[#12A89D] group-hover:text-white transition-all duration-200 shadow-xs">
                  <HeartHandshake className="w-8 h-8 transition-colors" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#087F8C] border border-teal-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12A89D]" />
                  Care Coordinator
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43] group-hover:text-[#087F8C] transition-colors">
                Caretaker
              </h2>
              <p className="mt-2 text-base text-[#6B7C93] font-medium leading-relaxed">
                Manage patients, medicines &amp; reminders
              </p>

              {/* Feature Highlights */}
              <ul className="mt-6 space-y-2.5 text-sm text-[#486581] border-t border-slate-100 pt-5">
                <li className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#12A89D] shrink-0" />
                  <span>Monitor family members &amp; dependents</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Pill className="w-4 h-4 text-[#12A89D] shrink-0" />
                  <span>Manage prescriptions &amp; medical regimens</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-[#12A89D] shrink-0" />
                  <span>Receive missed dose alerts &amp; send nudges</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-2">
              <button
                type="button"
                id="btn-continue-caretaker"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('caretaker');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#102A43] hover:bg-[#087F8C] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 transition-all duration-150 group-hover:bg-[#12A89D] cursor-pointer"
              >
                <span>Continue as Caretaker</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* CARD 2 — PATIENT */}
          <div
            id="role-card-patient"
            onClick={() => onSelectRole('patient')}
            className="group relative bg-white border-2 border-slate-200/90 hover:border-[#39B54A] rounded-3xl p-7 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left"
          >
            {/* Top Badge & Patient Icon */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#39B54A] group-hover:scale-110 group-hover:bg-[#39B54A] group-hover:text-white transition-all duration-200 shadow-xs">
                  <User className="w-8 h-8 transition-colors" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-[#39B54A]" />
                  Self Care
                </span>
              </div>

              {/* Title & Description */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43] group-hover:text-[#39B54A] transition-colors">
                Patient
              </h2>
              <p className="mt-2 text-base text-[#6B7C93] font-medium leading-relaxed">
                View medicines, prescriptions &amp; reminders
              </p>

              {/* Feature Highlights */}
              <ul className="mt-6 space-y-2.5 text-sm text-[#486581] border-t border-slate-100 pt-5">
                <li className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#39B54A] shrink-0" />
                  <span>Today’s schedule with clear meal timings</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Scan className="w-4 h-4 text-[#39B54A] shrink-0" />
                  <span>AI Medicine &amp; Prescription Scanner</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-[#39B54A] shrink-0" />
                  <span>One-tap dose tracking &amp; caretaker connect</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-2">
              <button
                type="button"
                id="btn-continue-patient"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('patient');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#12A89D] hover:bg-[#39B54A] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 transition-all duration-150 cursor-pointer"
              >
                <span>Continue as Patient</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Prototype & Quick Switch Note */}
        <div className="mt-10 sm:mt-12 text-center">
          <p className="text-xs text-slate-500 font-medium">
            💡 Immediate 1-click access • You can switch between Caretaker and Patient modes at any time.
          </p>
        </div>

      </main>

      {/* Clean Healthcare Footer */}
      <footer className="py-5 border-t border-slate-200/70 bg-white/70 text-center px-4">
        <p className="text-xs text-[#6B7C93] font-medium">
          CareQ &mdash; Safe, simple medicine guidance for seniors and family caregivers.
        </p>
      </footer>
    </div>
  );
};
