import React, { useState, useEffect, useRef } from 'react';
import { Page, ChatMessage, PatientProfile, MedicineItem } from '../types';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle,
  Stethoscope,
  Pill,
  Trash2,
  HeartHandshake,
  ShieldCheck,
  Type,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { playChimeSound } from '../lib/notifications';

interface HealthcareAssistantPageProps {
  onNavigate: (page: Page) => void;
  patientProfile: PatientProfile;
  savedMedicines: MedicineItem[];
}

export const VoiceAssistantPage: React.FC<HealthcareAssistantPageProps> = ({
  onNavigate,
  patientProfile,
  savedMedicines = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-mediscan',
      sender: 'assistant',
      text: `Hello! I am MediScan AI, your medicine safety assistant for elderly patients.\n\nI am here to answer your medicine-related questions simply and clearly. You can type your question in the box below or tap the microphone icon to speak to me. What can I help you with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'Can I take my medicine with milk or food?',
        'What should I do if I forgot my morning pill?',
        'Can I take aspirin if I have high blood pressure?',
        'Why does my medicine make me feel dizzy?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isVoiceAudioEnabled, setIsVoiceAudioEnabled] = useState(true);
  const [isLargeText, setIsLargeText] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom when messages or loading state changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!isVoiceAudioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown characters for pleasant senior speech cadence
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92; // Slightly slower, calm cadence for elderly seniors
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('Microphone speech recognition is not supported in this browser. Please type your medicine question in the box below.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        playChimeSound('reminder');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputQuery(transcript);

        // If it's a final transcript, auto send
        if (event.results[0].isFinal) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (err.error !== 'no-speech') {
          setSpeechError(`Microphone notice: ${err.error === 'not-allowed' ? 'Please allow microphone access in your browser.' : err.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError('Could not start microphone. Please check your browser audio settings.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleSendMessage = async (queryText = inputQuery) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoadingAI) return;

    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputQuery('');
    setIsLoadingAI(true);
    setSpeechError(null);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newHistory.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          patientContext: {
            allergies: patientProfile.allergies,
            conditions: patientProfile.chronicConditions,
            cabinetMedicines: savedMedicines.map(m => `${m.name} (${m.strength || ''})`),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Healthcare Assistant API error');
      }

      const data = await response.json();
      const replyText = data.reply || 'I am MediScan AI, here to answer your medicine questions simply and safely.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: data.suggestedFollowUps,
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(replyText);
      playChimeSound('success');
    } catch (err: any) {
      console.error('AI chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `Hello, I am MediScan AI. Regarding your question about "${trimmed}", remember to always take your medicines with water as written on your prescription bottle. If you feel unwell or have any doubts, please rest and talk with your doctor, pharmacist, or caregiver right away.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Should I take this with food?',
          'What if I forgot my medicine?',
          'Are there foods I should avoid?',
        ],
      };
      setMessages(prev => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoadingAI(false);
      inputRef.current?.focus();
    }
  };

  const handleClearHistory = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Hello! I am MediScan AI, your medicine safety assistant for elderly patients.\n\nHow can I help you with your medicines today? You can type or tap the microphone.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Can I take my pill with milk or food?',
          'What should I do if I forgot a dose?',
          'Can I take pain relievers with my blood pressure pill?',
        ],
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
            <span>MediScan AI • Medicine Safety Assistant for Elderly Patients</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Healthcare AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Friendly, simple, and plain-English answers to all your medication safety questions.
          </p>
        </div>

        {/* Accessibility Controls: Senior Text Size, Voice Audio & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Senior Font Size Switch */}
          <button
            id="assistant-font-size-btn"
            type="button"
            onClick={() => setIsLargeText(!isLargeText)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isLargeText
                ? 'bg-amber-100 border border-amber-300 text-amber-900 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle larger font size for easier reading"
          >
            <Type className="w-3.5 h-3.5 text-amber-600" />
            <span>{isLargeText ? 'Large Text: ON' : 'Normal Text'}</span>
          </button>

          {/* Voice Narration Audio Toggle */}
          <button
            id="assistant-tts-btn"
            type="button"
            onClick={() => {
              if (isVoiceAudioEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setIsVoiceAudioEnabled(!isVoiceAudioEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isVoiceAudioEnabled
                ? 'bg-teal-50 border border-teal-200 text-teal-800 shadow-xs'
                : 'bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
            title="Read answers out loud"
          >
            {isVoiceAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice: {isVoiceAudioEnabled ? 'Reading Aloud' : 'Muted'}</span>
          </button>

          {/* Clear Chat Button */}
          <button
            id="assistant-clear-btn"
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Prompt & Senior Safety Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-emerald-50/70 to-blue-50/80 border border-teal-200/70 text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-teal-900 block sm:inline mr-1.5">
              System Instruction Active:
            </span>
            <span className="text-slate-600 italic">
              "You are MediScan AI, a medicine safety assistant for elderly patients. Answer medicine-related questions simply."
            </span>
          </div>
        </div>

        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200 self-start sm:self-auto shrink-0">
          Powered by Gemini API
        </span>
      </div>

      {/* Microphone Error Banner */}
      {speechError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button 
            onClick={() => setSpeechError(null)}
            className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Microphone Active Indicator (Live Speech Recognition) */}
      {isListening && (
        <div className="p-4 rounded-3xl border-2 border-teal-400 bg-teal-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-pulse shadow-md shadow-rose-600/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                  Listening to your voice...
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Speak your medicine question clearly into your device's microphone.
              </p>
            </div>
          </div>

          <button
            id="assistant-stop-mic-btn"
            type="button"
            onClick={stopListening}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Stop Microphone
          </button>
        </div>
      )}

      {/* CHAT BUBBLES CONTAINER */}
      <div 
        id="assistant-chat-container"
        className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-200/90 min-h-[420px] max-h-[580px] overflow-y-auto space-y-5 shadow-sm bg-white/70"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in-50 duration-200`}
          >
            <div className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar Icon */}
              {msg.sender === 'assistant' ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs ring-2 ring-teal-100">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs ring-2 ring-slate-200">
                  <User className="w-4 h-4" />
                </div>
              )}

              {/* Chat Bubble Box */}
              <div
                className={`p-4 sm:p-5 rounded-3xl leading-relaxed shadow-xs transition-all ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                } ${isLargeText ? 'text-base sm:text-lg leading-relaxed' : 'text-xs sm:text-sm leading-relaxed'}`}
              >
                {/* Assistant Label for Elderly Clarity */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] font-bold text-teal-800">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>MediScan AI • Senior Safety Guide</span>
                    </span>
                    <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                  </div>
                )}

                {/* Bubble Text */}
                <p className="whitespace-pre-wrap font-normal">
                  {msg.text}
                </p>
                
                {/* User Message Footer */}
                {msg.sender === 'user' && (
                  <div className="text-[10px] text-teal-100 text-right mt-1.5 pt-1">
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Assistant Audio Action Bar */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-teal-50 transition-colors"
                      title="Read this answer aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Read Aloud</span>
                    </button>

                    <span className="text-[11px] text-slate-400">
                      Simplified Medical Guidance
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Follow-up Question Chips */}
            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
              <div className="mt-2.5 ml-11 flex flex-wrap gap-2">
                <span className="text-[11px] font-semibold text-slate-500 self-center">
                  Ask next:
                </span>
                {msg.suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(question)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 hover:border-teal-400 text-slate-700 hover:text-teal-900 border border-slate-200 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="text-teal-600">💬</span>
                    <span>{question}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing / Thinking Indicator Bubble */}
        {isLoadingAI && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-3xl rounded-tl-xs shadow-xs flex items-center gap-3 text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-semibold text-slate-600">
                MediScan AI is checking medicine safety instructions...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* QUICK SUGGESTION PILLS FOR ELDERLY PATIENTS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          Senior Safety Topics:
        </span>
        {[
          'Can I take with milk or juice?',
          'What if I missed my morning dose?',
          'Can I take aspirin with my blood pressure pill?',
          'Safe pain relievers for sensitive stomach',
        ].map((topic, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(topic)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 text-[11px] font-medium border border-slate-200 shrink-0 transition-colors cursor-pointer"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* BOTTOM INPUT BAR: Chat bubbles above, Microphone icon, Text input, Send button */}
      <div className="p-2.5 sm:p-3 rounded-3xl bg-white border-2 border-slate-200 shadow-sm flex items-center gap-2.5 focus-within:border-teal-500 transition-colors">
        
        {/* MICROPHONE ICON BUTTON */}
        <button
          id="assistant-mic-btn"
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-3 sm:p-3.5 rounded-2xl transition-all flex items-center justify-center cursor-pointer shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
              : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 shadow-2xs hover:scale-105 active:scale-95'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak into Microphone'}
          aria-label="Microphone input"
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* TEXT INPUT FIELD */}
        <input
          id="assistant-text-input"
          ref={inputRef}
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }
          }}
          placeholder={
            isListening 
              ? 'Listening to your speech... (you can also edit here)' 
              : 'Ask a medicine question (e.g., Can I take this with food?)...'
          }
          className={`flex-1 px-3 py-2 bg-transparent border-none focus:outline-hidden text-slate-800 placeholder:text-slate-400 font-medium ${
            isLargeText ? 'text-base' : 'text-xs sm:text-sm'
          }`}
          aria-label="Medicine question input"
        />

        {/* SEND BUTTON */}
        <button
          id="assistant-send-btn"
          type="button"
          disabled={!inputQuery.trim() || isLoadingAI}
          onClick={() => handleSendMessage(inputQuery)}
          className={`px-4 sm:px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 text-xs sm:text-sm ${
            !inputQuery.trim() || isLoadingAI
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 active:scale-95'
          }`}
          title="Send Question"
          aria-label="Send medicine question"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Safety Notice for Elderly Care */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>MediScan AI provides simple guidance. Never change prescription doses without consulting your doctor or pharmacist.</span>
        </p>

        <span className="font-semibold text-slate-400">
          Emergency? Call 911 or your doctor
        </span>
      </div>

    </div>
  );
};

export const HealthcareAssistantPage = VoiceAssistantPage;
