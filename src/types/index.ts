export type Language = 'en' | 'bn' | 'hi';

export type ScreenId =
  | 'landing'
  | 'symptom-input'
  | 'patient-details'
  | 'results'
  | 'emergency'
  | 'history'
  | 'about';

export type DurationOption = 'today' | '1_3_days' | '4_7_days' | 'over_a_week';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export type SexOption = 'female' | 'male' | 'other';

export type UrgencyLevel =
  | 'self_care'
  | 'see_doctor_1_2_days'
  | 'see_doctor_today'
  | 'emergency';

export type LikelihoodLevel = 'high' | 'medium' | 'low';

export interface SymptomInputData {
  notes: string;
  selectedSymptoms: string[];
  duration: DurationOption;
  severity: SeverityLevel;
}

export interface PatientDetailsData {
  age: number | '';
  isInfantUnder3Months: boolean;
  sex: SexOption;
  pregnantOrBreastfeeding: boolean;
  allergies: string[];
  otherAllergies: string;
  existingConditions: string[];
  otherConditions: string;
  currentMedicines: string;
  consentAccepted: boolean;
}

export interface PossibleCondition {
  name: string;
  likelihood: LikelihoodLevel;
  reason: string;
}

export interface OtcOption {
  name: string;
  purpose: string;
  caution: string;
}

export interface RawAnalysisResult {
  emergency: boolean;
  urgency: UrgencyLevel;
  urgency_title: string;
  urgency_summary: string;
  emergency_reason?: string;
  possible_conditions: PossibleCondition[];
  self_care_steps: string[];
  otc_options: OtcOption[];
  avoid: string[];
  see_doctor_if: string[];
  suggested_specialist: string;
  specialist_reason: string;
  follow_up_questions: string[];
  disclaimer: string;
}

export interface FilteredAnalysisResult {
  shouldRedirectToEmergency: boolean;
  emergencyReason?: string;
  otcHidden: boolean;
  otcRestrictedMessage?: string;
  removedPrescriptionItems: string[];
  result: RawAnalysisResult;
}

export interface RedFlagCheckResult {
  triggered: boolean;
  isSelfHarm: boolean;
  matchedFlags: string[];
  reason: string;
}

export interface AnalyzeRequestPayload {
  symptoms: SymptomInputData;
  patient: PatientDetailsData;
  language: Language;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  language: Language;
  symptoms: SymptomInputData;
  patient: PatientDetailsData;
  filteredResult: FilteredAnalysisResult;
}
