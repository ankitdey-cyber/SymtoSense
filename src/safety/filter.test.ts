import { describe, expect, it } from 'vitest';
import {
  applySafetyFilter,
  DOSE_REPLACEMENT_TEXT,
  OTC_RESTRICTED_MESSAGES,
  stripNumericDose,
} from './filter';
import type { PatientDetailsData, RawAnalysisResult } from '../types';

const healthyAdult: PatientDetailsData = {
  age: 32,
  isInfantUnder3Months: false,
  sex: 'female',
  pregnantOrBreastfeeding: false,
  allergies: ['None known'],
  otherAllergies: '',
  existingConditions: [],
  otherConditions: '',
  currentMedicines: '',
  consentAccepted: true,
};

const sampleRawResult: RawAnalysisResult = {
  emergency: false,
  urgency: 'see_doctor_1_2_days',
  urgency_title: 'See a doctor in 1–2 days',
  urgency_summary: 'Monitor your fever and sore throat.',
  possible_conditions: [
    {
      name: 'Viral Pharyngitis',
      likelihood: 'high',
      reason: 'Fever and sore throat for 1–3 days are common viral symptoms.',
    },
  ],
  self_care_steps: ['Drink warm fluids', 'Gargle with warm salt water'],
  otc_options: [
    {
      name: 'Paracetamol 500mg',
      purpose: 'Take 1-2 tablets per day (500 mg every 6 hours) for fever relief.',
      caution: 'Do not exceed 4000mg per day.',
    },
    {
      name: 'Amoxicillin',
      purpose: 'Antibiotic for throat infection.',
      caution: 'Complete the course.',
    },
    {
      name: 'Prednisolone',
      purpose: 'Steroid to reduce throat inflammation.',
      caution: 'Take with food.',
    },
    {
      name: 'Tramadol',
      purpose: 'Opioid for severe pain.',
      caution: 'May cause drowsiness.',
    },
    {
      name: 'Alprazolam',
      purpose: 'Benzodiazepine for restlessness.',
      caution: 'Do not drive.',
    },
    {
      name: 'Diclofenac Injection',
      purpose: 'Intramuscular injection for body ache.',
      caution: 'Clinic use only.',
    },
    {
      name: 'Menthol Lozenges',
      purpose: 'Soothes scratchy throat.',
      caution: 'Avoid giving to young children due to choking risk.',
    },
  ],
  avoid: ['Leftover antibiotics'],
  see_doctor_if: ['Fever lasts over 3 days'],
  suggested_specialist: 'General Physician',
  specialist_reason: 'Can examine your throat and advise safe treatment.',
  follow_up_questions: ['Have you noticed swollen glands in your neck?'],
  disclaimer: 'Informational only, not a diagnosis.',
};

describe('applySafetyFilter', () => {
  it('redirects to Emergency when emergency=true or urgency="emergency"', () => {
    const byFlag = applySafetyFilter(
      { ...sampleRawResult, emergency: true, urgency: 'see_doctor_today' },
      healthyAdult
    );
    expect(byFlag.shouldRedirectToEmergency).toBe(true);
    expect(byFlag.result.otc_options).toHaveLength(0);

    const byUrgency = applySafetyFilter(
      { ...sampleRawResult, emergency: false, urgency: 'emergency' },
      healthyAdult
    );
    expect(byUrgency.shouldRedirectToEmergency).toBe(true);
    expect(byUrgency.result.otc_options).toHaveLength(0);
  });

  it('removes prescription-only drugs (antibiotics, steroids, opioids, benzodiazepines, injections)', () => {
    const filtered = applySafetyFilter(sampleRawResult, healthyAdult, 'en');
    expect(filtered.shouldRedirectToEmergency).toBe(false);
    expect(filtered.otcHidden).toBe(false);
    expect(filtered.removedPrescriptionItems).toEqual([
      'Amoxicillin',
      'Prednisolone',
      'Tramadol',
      'Alprazolam',
      'Diclofenac Injection',
    ]);
    expect(filtered.result.otc_options.map((o) => o.name)).toEqual([
      'Paracetamol',
      'Menthol Lozenges',
    ]);
  });

  it('strips numeric doses (mg, ml, tablets per day) and replaces with label-dose instruction', () => {
    const filtered = applySafetyFilter(sampleRawResult, healthyAdult, 'en');
    const paracetamol = filtered.result.otc_options[0];
    expect(paracetamol.name).toBe('Paracetamol');
    expect(paracetamol.purpose).not.toMatch(/500\s*mg|1-2\s*tablets|every\s*6\s*hours/i);
    expect(paracetamol.purpose).toContain(DOSE_REPLACEMENT_TEXT);
    expect(paracetamol.caution).not.toMatch(/4000\s*mg/i);
    expect(paracetamol.caution).toContain(DOSE_REPLACEMENT_TEXT);

    const syrupTest = stripNumericDose('Take 10 ml syrup 3 times a day');
    expect(syrupTest.stripped).toBe(true);
    expect(syrupTest.text).not.toMatch(/10\s*ml|3\s*times/i);
    expect(syrupTest.text).toContain(DOSE_REPLACEMENT_TEXT);
  });

  it.each([
    ['age < 12', { ...healthyAdult, age: 8 }],
    ['age >= 65', { ...healthyAdult, age: 65 }],
    ['pregnant or breastfeeding', { ...healthyAdult, pregnantOrBreastfeeding: true }],
    ['existing condition selected', { ...healthyAdult, existingConditions: ['Diabetes'] }],
    ['other condition entered', { ...healthyAdult, otherConditions: 'Thyroid disorder' }],
    ['current medicine entered', { ...healthyAdult, currentMedicines: 'Metformin' }],
  ])('hides OTC section with exact message when %s', (_label, patient) => {
    const filtered = applySafetyFilter(sampleRawResult, patient, 'en');
    expect(filtered.otcHidden).toBe(true);
    expect(filtered.result.otc_options).toHaveLength(0);
    expect(filtered.otcRestrictedMessage).toBe(OTC_RESTRICTED_MESSAGES.en);
  });
});
