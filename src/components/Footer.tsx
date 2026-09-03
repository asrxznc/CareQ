import React from 'react';
import { Page, UserRole } from '../types';
import { CareQLogo } from './CareQLogo';
import { ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: Page) => void;
  userRole?: UserRole;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, userRole = 'patient' }) => {
  const homeTarget: Page = userRole === 'caretaker' ? 'caretaker-dashboard' : 'patient-dashboard';

  return (
    <footer className="mt-16 bg-white border-t border-slate-200/80 text-slate-600 text-xs">
      {/* Medical Disclaimer Banner (Mandated by Section 10 & 22) */}
      <div className="bg-amber-50/80 border-b border-amber-200/60 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong>Clinical Safety Disclaimer:</strong> CareQ is an AI-assisted medication companion designed to assist with prescription organization, daily schedules, and caregiver coordination. CareQ does not provide medical diagnosis, prescribe drugs, or replace consultation with licensed physicians and pharmacists. In any medical emergency, please call 911 immediately.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* CareQ Brand */}
          <div className="space-y-2 text-center md:text-left">
            <CareQLogo variant="light" size="sm" showTagline={true} />
            <p className="text-[#6B7C93] text-xs max-w-md">
              AI-assisted prescription scanning, simplified schedules, elderly-friendly reminders, and remote caregiver peace of mind.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#102A43]">
            <button
              onClick={() => onNavigate(homeTarget)}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('medicines')}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              My Medicines
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('scanner')}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              Prescription Scanner
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('reminders')}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              Reminders
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('history')}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              History
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('caregiver')}
              className="hover:text-[#12A89D] transition-colors cursor-pointer"
            >
              Caregiver
            </button>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-[#2E9D57]" />
            <span>Encrypted Client-Side Storage</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6B7C93] gap-2">
          <span>&copy; 2026 CareQ Inc. All rights reserved. &ldquo;The Right Medicine. The Right Time.&rdquo;</span>
          <span>Healthcare Hackathon MVP Edition</span>
        </div>
      </div>
    </footer>
  );
};
