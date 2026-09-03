import React, { useState } from 'react';
import { CareQLogo } from '../components/CareQLogo';
import { UserRole } from '../types';
import { ShieldCheck, HeartHandshake, User, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: 'caretaker' | 'patient', userEmail: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Default to patient, or auto-detect based on input
  const [selectedRole, setSelectedRole] = useState<'caretaker' | 'patient'>('patient');
  const [userManuallySelectedRole, setUserManuallySelectedRole] = useState(false);

  // Modals for Forgot Password and Sign Up
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpRole, setSignUpRole] = useState<'caretaker' | 'patient'>('patient');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState('');

  // Auto-detect role as user types (DO NOT match "care" on domain @careq.com!)
  const detectRole = (inputEmail: string, inputPass: string): 'caretaker' | 'patient' => {
    const cleanEmail = inputEmail.trim().toLowerCase();
    const cleanPass = inputPass.trim().toLowerCase();
    
    // 1. Patient signals always take priority if "patient" or "ramesh" is in email or password
    if (
      cleanEmail.includes('patient') || 
      cleanPass.includes('patient') ||
      cleanEmail.includes('ramesh') ||
      cleanPass.includes('ramesh')
    ) {
      return 'patient';
    }

    // 2. Caretaker signals: check ONLY the username part before '@' to prevent matching "@careq.com"
    const usernamePart = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    if (
      usernamePart.includes('care') || 
      usernamePart.includes('nurse') || 
      usernamePart.includes('doctor') || 
      usernamePart.includes('anita') || 
      usernamePart.includes('admin') ||
      cleanPass.includes('care') ||
      cleanPass.includes('admin')
    ) {
      return 'caretaker';
    }

    // 3. Default any general user ID (e.g., personal email or username) to patient
    return 'patient';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (errorMessage) setErrorMessage('');
    
    // Auto-switch role if user has not explicitly forced a selection
    if (!userManuallySelectedRole && val.length >= 2) {
      setSelectedRole(detectRole(val, password));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (errorMessage) setErrorMessage('');
    
    if (!userManuallySelectedRole && val.length >= 2) {
      setSelectedRole(detectRole(email, val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email or user ID');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Final role is the selectedRole (either manually chosen or auto-detected)
    const targetRole = userManuallySelectedRole ? selectedRole : detectRole(email, password);

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(targetRole, email.trim());
    }, 350);
  };

  // Quick fill demo helper
  const handleQuickFill = (role: 'caretaker' | 'patient') => {
    setUserManuallySelectedRole(true);
    setSelectedRole(role);
    if (role === 'caretaker') {
      setEmail('caretaker@careq.com');
      setPassword('care123');
    } else {
      setEmail('patient@careq.com');
      setPassword('patient123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#38b2ac] via-[#48c6b7] to-[#7bd8bf] antialiased">
      
      {/* Subtle ambient light shapes */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#285e61]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top brand header */}
      <header className="pt-6 sm:pt-8 px-4 flex justify-center z-10">
        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 flex items-center gap-2 text-white text-xs sm:text-sm font-medium shadow-xs">
          <CareQLogo variant="dark" layout="inline" size="sm" showTagline={false} />
          <span className="opacity-80">|</span>
          <span className="tracking-wide">The Right Medicine. The Right Time.</span>
        </div>
      </header>

      {/* Main Login Card - High Fidelity to reference image */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-7 sm:p-10 w-full max-w-[420px] border border-slate-100/80 transition-all duration-200 animate-in fade-in zoom-in-95">
          
          {/* Title - exactly matching reference styling */}
          <h1 className="text-2xl sm:text-3xl font-normal sm:font-medium text-[#00796b] text-center mb-5 tracking-tight font-display">
            Login
          </h1>

          {/* Direct Role Selector: allows instant 1-tap choice or reflects auto-detection */}
          <div className="flex items-center justify-center p-1 bg-slate-100/90 rounded-lg mb-6 border border-slate-200">
            <button
              type="button"
              id="role-select-patient-btn"
              onClick={() => {
                setSelectedRole('patient');
                setUserManuallySelectedRole(true);
                if (errorMessage) setErrorMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-white text-[#00796b] shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              id="role-select-caretaker-btn"
              onClick={() => {
                setSelectedRole('caretaker');
                setUserManuallySelectedRole(true);
                if (errorMessage) setErrorMessage('');
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRole === 'caretaker'
                  ? 'bg-[#00897b] text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Caretaker</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error banner if validation fails */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-sm flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email or User ID"
                autoComplete="email"
                required
                className="w-full px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-[#00897b] focus:ring-1 focus:ring-[#00897b] transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-[#00897b] focus:ring-1 focus:ring-[#00897b] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Show Password Checkbox & Active Redirection target */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 text-[#00897b] border-slate-300 rounded focus:ring-[#00897b] cursor-pointer accent-[#00897b]"
                />
                <span className="text-xs text-slate-600">Show Password</span>
              </label>

              {/* Explicit Target Destination */}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#00796b] border border-teal-200/80 animate-in fade-in">
                {selectedRole === 'caretaker' ? (
                  <>
                    <HeartHandshake className="w-3 h-3 text-[#00897b]" />
                    Opens Caretaker
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-[#00897b]" />
                    Opens Patient
                  </>
                )}
              </span>
            </div>

            {/* Sign In Button - centered teal pill/rounded */}
            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                id="login-submit-btn"
                className="w-36 py-2.5 bg-[#00897b] hover:bg-[#00796b] active:bg-[#00695c] text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>

            {/* Links section below button */}
            <div className="pt-4 text-center space-y-2 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-slate-600 hover:text-[#00897b] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Username / Password?
                </button>
              </div>

              <div>
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setShowSignUpModal(true)}
                  className="text-[#00897b] font-medium hover:underline transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </div>

          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              1-Click Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('caretaker')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 rounded text-xs transition-colors cursor-pointer"
                title="Log in as Caretaker (Anita Kumar)"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#00897b]" />
                <span className="truncate">Caretaker Demo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('patient')}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 rounded text-xs transition-colors cursor-pointer"
                title="Log in as Patient (Ramesh Kumar)"
              >
                <User className="w-3.5 h-3.5 text-[#00897b]" />
                <span className="truncate">Patient Demo</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer info */}
      <footer className="py-4 px-4 text-center text-xs text-white/80 z-10">
        <p>© {new Date().getFullYear()} CareQ Health. Intelligent Medication Management.</p>
      </footer>

      {/* Forgot Username / Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
            <div className="flex items-center gap-2.5 text-[#00796b] mb-3">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-display font-bold text-base text-slate-800">
                CareQ Demo Accounts
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Use either of the built-in demo credentials to immediately access the respective dashboard:
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 mb-5">
              <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-lg">
                <p className="font-bold text-[#00796b] flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" /> Caretaker Role
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-600">Email: caretaker@careq.com</p>
                <p className="font-mono text-[11px] text-slate-600">Password: care123</p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" /> Patient Role
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-600">Email: patient@careq.com</p>
                <p className="font-mono text-[11px] text-slate-600">Password: patient123</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickFill('caretaker');
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2 bg-[#00897b] text-white text-xs font-medium rounded hover:bg-[#00796b] transition-colors cursor-pointer"
              >
                Fill Caretaker
              </button>
              <button
                type="button"
                onClick={() => {
                  handleQuickFill('patient');
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Fill Patient
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-slate-100">
            <h3 className="font-display font-bold text-lg text-slate-800 mb-1">
              Create a CareQ Account
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select your primary role and enter your details to sign up.
            </p>

            {signUpSuccessMsg ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#00897b] mx-auto" />
                <p className="text-sm font-semibold text-slate-800">{signUpSuccessMsg}</p>
                <p className="text-xs text-slate-600">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!signUpEmail || !signUpPassword) return;
                  setSignUpSuccessMsg(`Account created for ${signUpRole === 'caretaker' ? 'Caretaker' : 'Patient'}!`);
                  setTimeout(() => {
                    setShowSignUpModal(false);
                    onLoginSuccess(signUpRole, signUpEmail);
                  }, 800);
                }}
                className="space-y-4"
              >
                {/* Role selection toggle */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    I am signing up as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignUpRole('caretaker')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        signUpRole === 'caretaker'
                          ? 'bg-teal-50 border-[#00897b] text-[#00796b]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <HeartHandshake className="w-4 h-4" /> Caretaker
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignUpRole('patient')}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        signUpRole === 'patient'
                          ? 'bg-teal-50 border-[#00897b] text-[#00796b]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4" /> Patient
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#00897b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#00897b]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#00897b] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-[#00796b] transition-colors cursor-pointer"
                  >
                    CREATE ACCOUNT
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSignUpModal(false)}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
