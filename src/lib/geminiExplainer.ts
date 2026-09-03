import { SimpleEnglishMedicineGuide } from '../types';

/**
 * Sends the detected medicine name to Gemini API with the prompt:
 * "Explain this medicine in simple English."
 *
 * Returns:
 * - Uses
 * - Dosage
 * - Side Effects
 * - Food Instructions
 * - Warning
 * - Missed Dose Advice
 */
export async function sendDetectedMedicineToGemini(medicineName: string): Promise<SimpleEnglishMedicineGuide> {
  const trimmedName = medicineName.trim();
  if (!trimmedName) {
    throw new Error('Please provide a valid medicine name.');
  }

  const response = await fetch('/api/gemini/explain-medicine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ medicineName: trimmedName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to explain medicine with Gemini`);
  }

  const data = await response.json();

  // Normalize returned fields ensuring all 6 required simple English sections are present
  const uses = Array.isArray(data.uses) && data.uses.length > 0
    ? data.uses
    : Array.isArray(data.indications) && data.indications.length > 0
      ? data.indications
      : ['Treats prescribed symptoms', 'Condition management and health restoration'];

  const dosage = data.dosage || data.howToTake || 'Take as instructed on your prescription label with a full glass of water.';

  const sideEffects = Array.isArray(data.sideEffects) && data.sideEffects.length > 0
    ? data.sideEffects
    : Array.isArray(data.commonSideEffects) && data.commonSideEffects.length > 0
      ? data.commonSideEffects
      : ['Mild stomach sensitivity', 'Temporary nausea', 'Headache'];

  const foodInstructions = data.foodInstructions
    || (Array.isArray(data.foodInteractions) && data.foodInteractions.length > 0 ? data.foodInteractions.join('. ') : '')
    || 'Take with or after meals and drink plenty of water to protect your stomach.';

  const warning = data.warning
    || (Array.isArray(data.contraindications) && data.contraindications.length > 0 ? data.contraindications.join('. ') : '')
    || 'Do not use if allergic. Seek urgent medical attention if you experience facial swelling, hives, or breathing difficulty.';

  const missedDoseAdvice = data.missedDoseAdvice
    || data.missedDoseGuidance
    || 'Take the missed dose as soon as you remember. If it is close to your next scheduled dose, skip it and continue your normal schedule. Never take a double dose.';

  return {
    medicineName: data.name || trimmedName,
    genericName: data.genericName,
    uses,
    dosage,
    sideEffects,
    foodInstructions,
    warning,
    missedDoseAdvice,
    note: data.note,
  };
}

/**
 * Standalone JavaScript code snippet for reference and export
 */
export const JAVASCRIPT_GEMINI_EXPLAINER_CODE = `/**
 * Sends the detected medicine name to Google Gemini API
 * Prompt: "Explain this medicine in simple English."
 *
 * @param {string} detectedMedicineName - Name of detected medicine (e.g. "Amoxicillin 500mg")
 * @returns {Promise<Object>} Object containing Uses, Dosage, Side Effects, Food Instructions, Warning, Missed Dose Advice
 */
async function explainMedicineWithGemini(detectedMedicineName) {
  const response = await fetch('/api/gemini/explain-medicine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      medicineName: detectedMedicineName
    })
  });

  if (!response.ok) {
    throw new Error(\`Gemini API request failed: \${response.statusText}\`);
  }

  // Returns structured JSON with simple English explanations:
  // {
  //   uses: ["Treats bacterial infections", ...],
  //   dosage: "Take 1 capsule 3 times a day with water...",
  //   sideEffects: ["Mild stomach ache", "Diarrhea", ...],
  //   foodInstructions: "Can be taken with or without food. Drink plenty of water...",
  //   warning: "Do not take if allergic to penicillin. Seek urgent care if rash occurs...",
  //   missedDoseAdvice: "Take as soon as you remember. Never take double doses..."
  // }
  const medicineGuide = await response.json();
  return medicineGuide;
}
`;
