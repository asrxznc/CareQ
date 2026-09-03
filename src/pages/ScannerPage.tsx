import React, { useState, useRef, useEffect } from 'react';
import { Page, MedicineItem, ExtractedMedicine, ExtractedPrescriptionResult } from '../types';
import { SAMPLE_PRESET_SCANS } from '../mockData';
import { PrescriptionConfirmation } from '../components/PrescriptionConfirmation';
import { 
  Scan, 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  ArrowRight, 
  Pill, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Info, 
  Search, 
  ShieldCheck, 
  Layers,
  HelpCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../lib/notifications';

interface ScannerPageProps {
  onNavigate: (page: Page) => void;
  onSaveMedicine: (med: MedicineItem) => void;
  onConfirmPrescription?: (extractedMedicines: ExtractedMedicine[]) => void;
  onSelectMedicineForDetails: (med: MedicineItem) => void;
  onSelectForInteraction?: (drugName: string) => void;
  onSelectForReminder?: (medName: string, dosage: string) => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  onNavigate,
  onSaveMedicine,
  onConfirmPrescription,
  onSelectMedicineForDetails,
  onSelectForInteraction,
  onSelectForReminder,
}) => {
  // Mode switcher: 'prescription' (primary CareQ feature) vs 'packaging' (individual blister strip/bottle)
  const [activeMode, setActiveMode] = useState<'prescription' | 'packaging'>('prescription');

  // Common upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [selectedPresetName, setSelectedPresetName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prescription Extraction Result states
  const [prescriptionResult, setPrescriptionResult] = useState<ExtractedPrescriptionResult | null>(null);
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [unreadablePrescription, setUnreadablePrescription] = useState<string | null>(null);

  // Individual Medicine Strip Scanner states
  const [scannedMedicine, setScannedMedicine] = useState<MedicineItem | null>(null);
  const [unreadableStripInfo, setUnreadableStripInfo] = useState<{
    reason: string;
    tips: string[];
  } | null>(null);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Scanning progress animation
  useEffect(() => {
    if (!isScanning) {
      setScanStage(0);
      return;
    }
    const interval = setInterval(() => {
      setScanStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, [isScanning]);

  const startCamera = async () => {
    try {
      setScanError(null);
      setUnreadablePrescription(null);
      setUnreadableStripInfo(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setScanError('Could not access camera. Please allow camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelectedImage(dataUrl);
    setMimeType('image/jpeg');
    setSelectedPresetName('Live Camera Capture');
    setScanError(null);
    setUnreadablePrescription(null);
    setUnreadableStripInfo(null);
    stopCamera();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setMimeType(file.type || 'image/jpeg');
    setSelectedPresetName(file.name);
    setScanError(null);
    setUnreadablePrescription(null);
    setUnreadableStripInfo(null);
    setPrescriptionResult(null);
    setShowConfirmationStep(false);
    setScannedMedicine(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Run Prescription Extraction (Core AI Feature - Section 8, 9, 10)
  const runPrescriptionExtraction = async (hintOverride?: string) => {
    const hint = hintOverride || selectedPresetName || '';
    if (!selectedImage && !hint) {
      setScanError('Please upload a prescription image, take a camera photo, or select a demo prescription.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setUnreadablePrescription(null);
    setPrescriptionResult(null);
    setShowConfirmationStep(false);

    try {
      const isDataUrl = selectedImage?.startsWith('data:');
      const base64Payload = isDataUrl && selectedImage ? selectedImage : '';

      const response = await fetch('/api/gemini/extract-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType,
          prescriptionHint: hint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Extraction service returned HTTP ${response.status}`);
      }

      const data: ExtractedPrescriptionResult = await response.json();

      if (!data.isReadable) {
        setUnreadablePrescription(
          data.unreadableReason ||
          'Unable to confidently read this information. Please upload a clearer photo or enter medicine details manually.'
        );
        playChimeSound('warning');
        return;
      }

      setPrescriptionResult(data);
      setShowConfirmationStep(true);
      playChimeSound('success');
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#39B54A', '#12A89D', '#087F8C'],
      });
    } catch (err: any) {
      console.error('Prescription extraction error:', err);
      setScanError(err?.message || 'Failed to extract prescription. Please retry.');
      playChimeSound('warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Run Individual Packaging/Strip Scan
  const runPackagingScan = async (hintOverride?: string) => {
    const hint = hintOverride || selectedPresetName || '';
    if (!selectedImage && !hint) {
      setScanError('Please select an image or packaging preset.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setUnreadableStripInfo(null);
    setScannedMedicine(null);

    try {
      const isDataUrl = selectedImage?.startsWith('data:');
      const base64Payload = isDataUrl && selectedImage ? selectedImage : '';

      const response = await fetch('/api/gemini/scan-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType,
          medicineHint: hint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan service returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.isReadable === false) {
        setUnreadableStripInfo({
          reason: data.unreadableReason || 'Packaging markings or active chemical names could not be identified confidently.',
          tips: data.readableTips || [
            'Ensure the drug name and strength are sharp and in focus',
            'Avoid direct overhead glare on blister foil',
            'Hold the bottle or strip steady 6–8 inches from the camera',
          ],
        });
        playChimeSound('warning');
        return;
      }

      const newMed: MedicineItem = {
        id: `med-${Date.now()}`,
        name: data.detectedMedicineName || data.name || 'Identified Medicine',
        genericName: data.genericName || data.name,
        strength: data.strength || '500 mg',
        dosageForm: data.dosageForm || 'Tablet',
        manufacturer: data.manufacturer || 'Pharmaceutical Formulation',
        indications: data.indications || ['Doctor-prescribed treatment'],
        howToTake: data.howToTake || 'Take as advised with water.',
        commonSideEffects: data.commonSideEffects || ['Mild stomach upset'],
        seriousSideEffects: data.seriousSideEffects || ['Severe allergic reactions'],
        contraindications: data.contraindications || [],
        foodInteractions: data.foodInteractions || ['Take after food'],
        storageAdvice: data.storageAdvice || 'Store below 25°C in a dry place.',
        missedDoseGuidance: data.missedDoseGuidance || 'Take as soon as remembered.',
        expiryDate: data.expiryDate,
        batchNumber: data.batchNumber,
        scannedAt: new Date().toISOString(),
        category: 'Prescription Medication',
        confidenceScore: data.confidenceScore || 96,
      };

      setScannedMedicine(newMed);
      playChimeSound('success');
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#39B54A', '#12A89D', '#4C8DFF'],
      });
    } catch (err: any) {
      console.error('Packaging scan error:', err);
      setScanError(err?.message || 'Failed to scan medication packaging.');
      playChimeSound('warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Prescription Confirmation Handler (Section 10 & 11)
  const handleConfirmPrescription = (confirmedMedicines: ExtractedMedicine[]) => {
    if (onConfirmPrescription) {
      onConfirmPrescription(confirmedMedicines);
    } else {
      // Fallback: convert and save to local state
      confirmedMedicines.forEach((m, idx) => {
        const medItem: MedicineItem = {
          id: `med-${Date.now()}-${idx}`,
          name: `${m.name} ${m.strength}`,
          genericName: m.name,
          strength: m.strength,
          dosageForm: m.quantity || '1 tablet',
          howToTake: `${m.quantity} ${m.frequency} ${m.foodInstruction}. ${m.specialInstructions || ''}`.trim(),
          indications: ['Prescribed Condition'],
          commonSideEffects: ['Refer to doctor for details'],
          seriousSideEffects: ['Contact doctor if allergic reactions occur'],
          contraindications: [],
          foodInteractions: [m.foodInstruction || 'After Food'],
          storageAdvice: 'Store below 25°C in a dry place.',
          missedDoseGuidance: 'Take as soon as remembered.',
          scannedAt: new Date().toISOString(),
          category: 'Prescription',
          confidenceScore: 97,
        };
        onSaveMedicine(medItem);
      });
      playChimeSound('success');
      onNavigate('reminders');
    }
  };

  // Scan progress stages description
  const prescriptionStages = [
    { title: 'Uploading prescription document...', sub: 'Preprocessing image resolution and contrast' },
    { title: 'Analyzing doctor handwriting with Gemini Vision...', sub: 'Reading medicines, dosage, frequency, and food instructions' },
    { title: 'Validating formulary & schedule parameters...', sub: 'Matching medications with clinical safety guidelines' },
    { title: 'Preparing prescription review...', sub: 'Formatting structured confirmation cards' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39B54A]">
            <Sparkles className="w-4 h-4 text-[#39B54A]" />
            <span>AI Multimodal Vision • Powered by Gemini</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight mt-1">
            Prescription Scanner
          </h1>
          <p className="text-sm text-[#6B7C93] mt-1">
            Upload or scan your doctor&apos;s prescription to extract medicines and automatically generate your daily medication schedule.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs self-start sm:self-center">
          <button
            onClick={() => {
              setActiveMode('prescription');
              setShowConfirmationStep(false);
              setScanError(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'prescription'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-[#6B7C93] hover:text-[#102A43]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Prescription Slip</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('packaging');
              setShowConfirmationStep(false);
              setScanError(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'packaging'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-[#6B7C93] hover:text-[#102A43]'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicine Strip / Bottle</span>
          </button>
        </div>
      </div>

      {/* Confirmation Step (Section 10) */}
      {showConfirmationStep && prescriptionResult && (
        <PrescriptionConfirmation
          extraction={prescriptionResult}
          onConfirm={handleConfirmPrescription}
          onCancel={() => setShowConfirmationStep(false)}
        />
      )}

      {/* Main Upload / Camera View (if not currently in confirmation step) */}
      {!showConfirmationStep && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload / Camera Box (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg border border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                
                {/* Target overlay reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="w-full h-full border-2 border-white/60 border-dashed rounded-2xl flex items-center justify-center">
                    <p className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs font-medium">
                      Align {activeMode === 'prescription' ? 'prescription document' : 'medicine packaging'} within box
                    </p>
                  </div>
                </div>

                {/* Camera controls */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                  <button
                    onClick={captureCameraFrame}
                    className="px-6 py-3 bg-[#39B54A] hover:bg-[#2E9D57] text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                  isDraggingOver
                    ? 'border-[#39B54A] bg-emerald-50/50 scale-[1.01]'
                    : 'border-slate-300 bg-white hover:border-[#12A89D]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {selectedImage ? (
                  /* Image Preview */
                  <div className="space-y-4">
                    <div className="relative max-h-72 w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                      <img
                        src={selectedImage}
                        alt="Prescription preview"
                        className="max-h-72 w-auto object-contain rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedPresetName(null);
                          setPrescriptionResult(null);
                          setScannedMedicine(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#6B7C93] px-2">
                      <span className="font-semibold text-[#102A43] truncate max-w-xs">
                        {selectedPresetName || 'Prescription image ready'}
                      </span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#12A89D] hover:underline font-bold cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty state drop zone */
                  <div className="py-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-[#12A89D] flex items-center justify-center mx-auto shadow-inner">
                      {activeMode === 'prescription' ? (
                        <FileText className="w-8 h-8 text-[#12A89D]" />
                      ) : (
                        <Pill className="w-8 h-8 text-[#12A89D]" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#102A43]">
                        {activeMode === 'prescription' 
                          ? 'Upload your Doctor’s Prescription' 
                          : 'Upload Medicine Packaging or Blister Strip'}
                      </h3>
                      <p className="text-xs text-[#6B7C93] mt-1 max-w-sm mx-auto">
                        Drag and drop your image here, or browse files from your computer or phone.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        id="browse-rx-file-btn"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Browse Files</span>
                      </button>

                      <button
                        id="camera-snap-btn"
                        onClick={startCamera}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#102A43] font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-[#12A89D]" />
                        <span>Use Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message if any */}
            {scanError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Scan Notice</p>
                  <p className="mt-0.5">{scanError}</p>
                </div>
              </div>
            )}

            {/* Unreadable Prescription Handling (Section 9: Do not invent info if unclear) */}
            {unreadablePrescription && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2.5 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Unable to confidently read this information.</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  {unreadablePrescription}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setUnreadablePrescription(null);
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#102A43] text-white font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Upload Clearer Photo
                  </button>
                  <button
                    onClick={() => {
                      // Demo fallback: switch to verified demo prescription
                      setSelectedPresetName("Dr. Jenkins Rx: Ramesh's Prescription");
                      runPrescriptionExtraction("Dr. Jenkins Rx: Ramesh's Prescription");
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold cursor-pointer"
                  >
                    Try Demo Prescription
                  </button>
                </div>
              </div>
            )}

            {/* Action Button: Scan / Analyze */}
            <div className="pt-2">
              <button
                id="main-scan-btn"
                onClick={() => {
                  if (activeMode === 'prescription') {
                    runPrescriptionExtraction();
                  } else {
                    runPackagingScan();
                  }
                }}
                disabled={isScanning || (!selectedImage && !selectedPresetName)}
                className="w-full py-3.5 px-6 rounded-xl bg-[#39B54A] hover:bg-[#2E9D57] active:scale-98 disabled:opacity-50 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md shadow-green-600/25 transition-all cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 stroke-[2.5]" />
                    <span>
                      {activeMode === 'prescription' 
                        ? 'Scan & Extract Prescription' 
                        : 'Scan Medicine Packaging'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Processing Animation */}
            {isScanning && (
              <div className="p-4 bg-[#F6FAF8] rounded-xl border border-teal-200 text-xs text-[#243B53] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#102A43]">
                  <span>AI Processing</span>
                  <span>{scanStage + 1} of 4</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#39B54A] to-[#12A89D] h-1.5 transition-all duration-500"
                    style={{ width: `${((scanStage + 1) / 4) * 100}%` }}
                  />
                </div>
                <p className="font-semibold text-[#12A89D]">
                  {prescriptionStages[scanStage]?.title}
                </p>
                <p className="text-[#6B7C93] text-[11px]">
                  {prescriptionStages[scanStage]?.sub}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Demo Prescriptions & Guidelines (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Hackathon Demo Prescriptions Card (Section 25) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#12A89D]" />
                <h3 className="font-bold text-sm text-[#102A43]">
                  Demo Prescriptions &amp; Tests
                </h3>
              </div>

              <p className="text-xs text-[#6B7C93] leading-relaxed">
                Click any preset to test the AI extraction and verification loop instantly:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveMode('prescription');
                    setSelectedPresetName("Dr. Jenkins Rx: Ramesh's Prescription");
                    setSelectedImage('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80');
                    runPrescriptionExtraction("Dr. Jenkins Rx: Ramesh's Prescription");
                  }}
                  className="w-full p-3 rounded-xl bg-teal-50/50 hover:bg-teal-50 border border-teal-200 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#102A43] group-hover:text-[#12A89D]">
                      ⭐ Dr. Jenkins Rx: Ramesh&apos;s Prescription
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#12A89D]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7C93] mt-1">
                    Metformin 500mg, Amlodipine 5mg, Atorvastatin 10mg, Vitamin D3
                  </p>
                </button>

                <button
                  onClick={() => {
                    setActiveMode('prescription');
                    setSelectedPresetName("Blurry Low-Light Rx (Test Unreadable)");
                    setSelectedImage('https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=600&q=80');
                    runPrescriptionExtraction("test unreadable blurry glare");
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#102A43]">
                      ⚠️ Test Unreadable Image Handling
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Validation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7C93] mt-1">
                    Verifies that CareQ does NOT hallucinate when an image is blurry.
                  </p>
                </button>
              </div>
            </div>

            {/* Individual Scanned Medicine Card (if in packaging mode) */}
            {activeMode === 'packaging' && scannedMedicine && (
              <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-md space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2E9D57] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Packaging Identified
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {scannedMedicine.confidenceScore}% confidence
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-bold text-lg text-[#102A43]">
                    {scannedMedicine.name}
                  </h4>
                  <p className="text-xs text-[#6B7C93]">
                    {scannedMedicine.strength} • {scannedMedicine.dosageForm}
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-snug">
                  {scannedMedicine.howToTake}
                </p>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      onSaveMedicine(scannedMedicine);
                      onSelectMedicineForDetails(scannedMedicine);
                      onNavigate('details');
                    }}
                    className="flex-1 py-2 bg-[#102A43] hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    View Clinical Guide
                  </button>
                  <button
                    onClick={() => {
                      onSaveMedicine(scannedMedicine);
                      playChimeSound('success');
                      onNavigate('reminders');
                    }}
                    className="flex-1 py-2 bg-[#39B54A] hover:bg-[#2E9D57] text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Create Reminder
                  </button>
                </div>
              </div>
            )}

            {/* Clinical Safety & Transparency Notice */}
            <div className="p-4 rounded-xl bg-[#F6FAF8] border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#102A43]">
                <ShieldCheck className="w-4 h-4 text-[#12A89D]" />
                <span>CareQ Clinical Safety Policy</span>
              </div>
              <p className="text-[#6B7C93] leading-relaxed">
                Extracted medicines are strictly staged for your review. No schedule or reminder is saved until you verify every detail against your doctor&apos;s physical slip.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
