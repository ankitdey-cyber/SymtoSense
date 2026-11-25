import type {
  FilteredAnalysisResult,
  Language,
  OtcOption,
  PatientDetailsData,
  RawAnalysisResult,
} from '../types';

export const OTC_RESTRICTED_MESSAGES: Record<Language, string> = {
  en: 'Because of your age/health details, please ask a doctor or pharmacist before taking any medicine.',
  bn: 'আপনার বয়স বা স্বাস্থ্যগত তথ্যের কারণে যেকোনো ওষুধ খাওয়ার আগে অনুগ্রহ করে একজন ডাক্তার বা ফার্মাসিস্টের পরামর্শ নিন।',
  hi: 'आपकी उम्र या स्वास्थ्य विवरण के कारण, कोई भी दवा लेने से पहले कृपया डॉक्टर या फार्मासिस्ट से सलाह लें।',
};

export const DOSE_REPLACEMENT_TEXT = 'Follow the label dose or ask a pharmacist';

/**
 * Blocklist of prescription-only drug classes & specific names:
 * antibiotics, steroids, opioids, benzodiazepines, and any injection.
 */
const PRESCRIPTION_BLOCKLIST_PATTERNS: RegExp[] = [
  // Antibiotics
  /\b(amoxicillin|amoxycillin|augmentin|azithromycin|ciprofloxacin|doxycycline|cephalexin|cefixime|ceftriaxone|cefuroxime|metronidazole|levofloxacin|ofloxacin|norfloxacin|erythromycin|clarithromycin|penicillin|ampicillin|clindamycin|nitrofurantoin|trimethoprim|sulfamethoxazole|cotrimoxazole|co-trimoxazole|gentamicin|vancomycin|linezolid|meropenem|tetracycline|rifampicin|antibiotic|antibiotics)\b/i,
  // Steroids
  /\b(prednisolone|prednisone|dexamethasone|betamethasone|methylprednisolone|deflazacort|triamcinolone|budesonide|fluticasone|beclomethasone|mometasone|cortisone|corticosteroid|corticosteroids|steroid|steroids)\b/i,
  // Opioids
  /\b(tramadol|codeine|morphine|oxycodone|hydrocodone|fentanyl|tapentadol|pethidine|meperidine|buprenorphine|methadone|hydromorphone|pentazocine|opioid|opioids)\b/i,
  // Benzodiazepines & sedative-hypnotics
  /\b(alprazolam|diazepam|lorazepam|clonazepam|midazolam|chlordiazepoxide|etizolam|nitrazepam|temazepam|oxazepam|zolpidem|zopiclone|benzodiazepine|benzodiazepines)\b/i,
  // Any injection / parenteral route
  /\b(injection|injections|injectable|injectables|intravenous|intramuscular|subcutaneous|iv\s+drip|iv\s+fluid|iv\s+line|im\s+shot|syringe|ampoule|vial)\b/i,
];

/**
 * Matches numeric dosing expressions (mg, ml, mcg, g, tablets/capsules/pills per day, every X hours, tsp/tbsp, etc.)
 */
const NUMERIC_DOSE_PATTERNS: RegExp[] = [
  // e.g., "500 mg", "250-500mg", "10 ml", "5–10 mL", "2.5 g", "400 mcg", "1000 IU", "500mg/day"
  /\b\d+(?:\.\d+)?(?:\s*[-–to]+\s*\d+(?:\.\d+)?)?\s*(?:mg|mcg|µg|ug|g|gm|grams?|ml|mL|cc|iu|units?)(?:\s*\/\s*(?:day|dose|kg|hr|hour|h|24\s*h))?\b/gi,
  // e.g., "1-2 tablets per day", "2 tablets twice daily", "1 tablet every 6 hours", "3 capsules a day", "2 pills daily", "1 tsp 3 times daily"
  /\b\d+(?:\.\d+)?(?:\s*[-–to]+\s*\d+(?:\.\d+)?)?\s*(?:tablets?|tabs?|capsules?|caps?|pills?|lozenges?|drops?|puffs?|sprays?|sachets?|tsp|tbsp|teaspoons?|tablespoons?|doses?)(?:\s*(?:per\s+day|a\s+day|daily|twice\s+daily|once\s+daily|every\s+\d+(?:\s*[-–to]+\s*\d+)?\s*(?:hours?|hrs?|h)|\d+\s*times?\s*(?:a\s+day|per\s+day|daily)))?\b/gi,
  // e.g., "every 4-6 hours", "every 8 hrs"
  /\bevery\s+\d+(?:\s*[-–to]+\s*\d+)?\s*(?:hours?|hrs?|h)\b/gi,
  // e.g., "3 times per day", "2-3 times a day", "up to 4 times daily", "max 4 doses per day"
  /\b(?:up\s+to\s+|max(?:imum)?\s+)?\d+(?:\s*[-–to]+\s*\d+)?\s*(?:times?\s*(?:a\s+day|per\s+day|daily)|x\s*\/\s*day)\b/gi,
];

function isEmptyOrNoneText(value: string | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.length === 0 ||
    trimmed === 'none' ||
    trimmed === 'nil' ||
    trimmed === 'n/a' ||
    trimmed === 'na' ||
    trimmed === 'no' ||
    trimmed === 'nothing'
  );
}

export function shouldHideOtc(patient: PatientDetailsData): boolean {
  const numericAge =
    typeof patient.age === 'number' && !Number.isNaN(patient.age) ? patient.age : null;

  if (patient.isInfantUnder3Months) return true;
  if (numericAge !== null && (numericAge < 12 || numericAge >= 65)) return true;
  if (patient.pregnantOrBreastfeeding) return true;

  const activeConditions = (patient.existingConditions || []).filter(
    (c) => !isEmptyOrNoneText(c)
  );
  if (activeConditions.length > 0) return true;

  if (!isEmptyOrNoneText(patient.otherConditions)) return true;
  if (!isEmptyOrNoneText(patient.currentMedicines)) return true;

  return false;
}

export function isPrescriptionOnlyOtc(option: OtcOption): boolean {
  const combined = `${option.name} ${option.purpose} ${option.caution}`;
  return PRESCRIPTION_BLOCKLIST_PATTERNS.some((pattern) => pattern.test(combined));
}

export function stripNumericDose(text: string): { text: string; stripped: boolean } {
  let updated = text;
  let stripped = false;

  for (const pattern of NUMERIC_DOSE_PATTERNS) {
    if (pattern.test(updated)) {
      stripped = true;
      updated = updated.replace(pattern, '__DOSE_PLACEHOLDER__');
    }
    pattern.lastIndex = 0;
  }

  if (!stripped) {
    return { text, stripped: false };
  }

  // Collapse adjacent placeholders and clean up leftover prepositions/punctuation
  updated = updated
    .replace(/(?:__DOSE_PLACEHOLDER__(?:[\s,/;()-]*(?:or|and|to|up to|max|maximum|take|of|per|daily|twice|once)*[\s,/;()-]*)*)+/gi, '__DOSE_PLACEHOLDER__')
    .replace(/\b(?:take|taking|dose\s+of|doses?\s+of|up\s+to|maximum\s+of|max)\s+__DOSE_PLACEHOLDER__/gi, '__DOSE_PLACEHOLDER__')
    .replace(/__DOSE_PLACEHOLDER__/g, DOSE_REPLACEMENT_TEXT)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();

  return { text: updated, stripped: true };
}

export function sanitizeOtcOption(option: OtcOption): OtcOption {
  const cleanName = stripNumericDose(option.name);
  const cleanPurpose = stripNumericDose(option.purpose);
  const cleanCaution = stripNumericDose(option.caution);

  let finalName = cleanName.text;
  // Keep OTC title tidy if dose was stripped from name (e.g., "Paracetamol 500mg" -> "Paracetamol")
  if (cleanName.stripped) {
    finalName = option.name;
    for (const pattern of NUMERIC_DOSE_PATTERNS) {
      finalName = finalName.replace(pattern, '');
      pattern.lastIndex = 0;
    }
    finalName = finalName
      .replace(/\(\s*\)/g, '')
      .replace(/[-–,/]+\s*$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!finalName) {
      finalName = option.name.replace(/\d+/g, '').trim() || 'OTC option';
    }
  }

  const finalCaution =
    cleanName.stripped && !cleanCaution.text.includes(DOSE_REPLACEMENT_TEXT)
      ? `${cleanCaution.text.replace(/\.?\s*$/, '')}. ${DOSE_REPLACEMENT_TEXT}.`
      : cleanCaution.text;

  return {
    name: finalName,
    purpose: cleanPurpose.text,
    caution: finalCaution,
  };
}

export function applySafetyFilter(
  rawResult: RawAnalysisResult,
  patient: PatientDetailsData,
  language: Language = 'en'
): FilteredAnalysisResult {
  // 1. Emergency escalation
  if (rawResult.emergency === true || rawResult.urgency === 'emergency') {
    return {
      shouldRedirectToEmergency: true,
      emergencyReason:
        rawResult.emergency_reason ||
        rawResult.urgency_summary ||
        'Your symptoms may require urgent emergency medical attention.',
      otcHidden: true,
      removedPrescriptionItems: [],
      result: {
        ...rawResult,
        emergency: true,
        urgency: 'emergency',
        otc_options: [],
      },
    };
  }

  // 2. High-risk patient details -> hide OTC section entirely
  if (shouldHideOtc(patient)) {
    return {
      shouldRedirectToEmergency: false,
      otcHidden: true,
      otcRestrictedMessage: OTC_RESTRICTED_MESSAGES[language] || OTC_RESTRICTED_MESSAGES.en,
      removedPrescriptionItems: [],
      result: {
        ...rawResult,
        otc_options: [],
      },
    };
  }

  // 3. Prescription drug blocklist + numeric dose stripping
  const removedPrescriptionItems: string[] = [];
  const safeOtcOptions: OtcOption[] = [];

  for (const item of rawResult.otc_options || []) {
    if (isPrescriptionOnlyOtc(item)) {
      removedPrescriptionItems.push(item.name);
      continue;
    }
    safeOtcOptions.push(sanitizeOtcOption(item));
  }

  return {
    shouldRedirectToEmergency: false,
    otcHidden: false,
    removedPrescriptionItems,
    result: {
      ...rawResult,
      otc_options: safeOtcOptions,
    },
  };
}
