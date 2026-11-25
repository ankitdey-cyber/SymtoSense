import type { AnalyzeRequestPayload, Language } from '../types';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  bn: 'Bengali (বাংলা)',
  hi: 'Hindi (हिन्दी)',
};

const DURATION_LABELS: Record<AnalyzeRequestPayload['symptoms']['duration'], string> = {
  today: 'Started today',
  '1_3_days': '1–3 days',
  '4_7_days': '4–7 days',
  over_a_week: 'Over a week',
};

export function buildSystemInstruction(language: Language): string {
  const targetLang = LANGUAGE_NAMES[language] || 'English';

  return `You are SymptoSense, a calm, careful, plain-language clinical triage and symptom information guide.

STRICT SAFETY & COMMUNICATION RULES:
1. INFORMATION ONLY — NEVER DIAGNOSE: Always frame conditions as possibilities ("possible conditions"), never as a definitive diagnosis.
2. LANGUAGE: Write EVERY user-facing string in the JSON output strictly in ${targetLang}. Keep enum keys ("self_care", "see_doctor_1_2_days", "see_doctor_today", "emergency", "high", "medium", "low") in exact English as required by the schema.
3. EMERGENCY DETECTION: If the symptoms or combination of symptoms and patient details suggest any life-threatening or urgent emergency (e.g., stroke, heart attack, sepsis, anaphylaxis, severe respiratory distress, meningitis, ectopic pregnancy, severe dehydration, active internal bleeding, suicidal ideation, or fever in an infant under 3 months), set "emergency": true, "urgency": "emergency", provide a clear "emergency_reason", and return an EMPTY "otc_options": [] array.
4. SAFE OTC GUIDANCE ONLY:
   - ONLY suggest common, widely available over-the-counter options when appropriate for healthy adults/older children.
   - NEVER recommend prescription-only medicines: NO antibiotics (e.g., amoxicillin, azithromycin, ciprofloxacin), NO steroids (e.g., prednisolone, dexamethasone), NO opioids (e.g., tramadol, codeine), NO benzodiazepines, and NO injections.
   - NEVER include any numeric dosages (no mg, ml, mcg, grams, tablets per day, or hourly intervals) anywhere in OTC text. Always advise to follow the label dose or ask a pharmacist.
   - If the patient is under 12 years old, age 65 or older, pregnant or breastfeeding, has any existing medical condition, or takes any current medicines, return an EMPTY "otc_options": [] array.
   - Respect all stated allergies (for example, never suggest NSAIDs/ibuprofen/aspirin if allergic to Aspirin/NSAIDs).
5. TONE & CLARITY: Be warm, reassuring, structured, and easy to understand for a non-medical reader. Keep each item concise (1-2 sentences).
6. OUTPUT FORMAT: Return ONLY valid JSON strictly conforming to the provided JSON schema.`;
}

export function buildUserPrompt(payload: AnalyzeRequestPayload): string {
  const { symptoms, patient, language } = payload;

  const ageDisplay = patient.isInfantUnder3Months
    ? 'Baby under 3 months old'
    : patient.age === ''
      ? 'Not provided'
      : `${patient.age} years`;

  const allergiesList = [
    ...patient.allergies.filter((a) => a.toLowerCase() !== 'none known'),
    ...(patient.otherAllergies.trim() ? [patient.otherAllergies.trim()] : []),
  ];

  const conditionsList = [
    ...patient.existingConditions,
    ...(patient.otherConditions.trim() ? [patient.otherConditions.trim()] : []),
  ];

  return `Please analyse the following symptom report and respond in ${LANGUAGE_NAMES[language]} as structured JSON:

SYMPTOM DETAILS:
- Free-text description: ${symptoms.notes.trim() || 'None provided'}
- Selected symptom chips: ${symptoms.selectedSymptoms.length > 0 ? symptoms.selectedSymptoms.join(', ') : 'None selected'}
- Duration: ${DURATION_LABELS[symptoms.duration]}
- Severity: ${symptoms.severity}

PATIENT DETAILS:
- Age: ${ageDisplay}
- Sex: ${patient.sex}
- Pregnant or breastfeeding: ${patient.pregnantOrBreastfeeding ? 'Yes' : 'No'}
- Known allergies: ${allergiesList.length > 0 ? allergiesList.join(', ') : 'None known'}
- Existing medical conditions: ${conditionsList.length > 0 ? conditionsList.join(', ') : 'None reported'}
- Current medicines: ${patient.currentMedicines.trim() || 'None reported'}

Provide calm, clear guidance including urgency level, 2-4 possible conditions with likelihood and matching reason, practical self-care steps, safe OTC options (or empty list if restricted), things to avoid, clear "see a doctor if" warning signs, suggested specialist with reason, helpful follow-up questions, and a brief medical disclaimer.`;
}
