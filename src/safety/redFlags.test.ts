import { describe, expect, it } from 'vitest';
import { checkRedFlags } from './redFlags';
import type { PatientDetailsData, SymptomInputData } from '../types';

const baseSymptoms: SymptomInputData = {
  notes: '',
  selectedSymptoms: [],
  duration: '1_3_days',
  severity: 'moderate',
};

const basePatient: PatientDetailsData = {
  age: 30,
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

describe('checkRedFlags', () => {
  it('does not trigger on routine mild viral symptoms', () => {
    const res = checkRedFlags(
      {
        ...baseSymptoms,
        notes: 'Mild fever and scratchy throat since yesterday evening with a dull headache',
        selectedSymptoms: ['Fever', 'Sore throat'],
      },
      basePatient
    );
    expect(res.triggered).toBe(false);
    expect(res.isSelfHarm).toBe(false);
    expect(res.matchedFlags).toHaveLength(0);
  });

  it.each([
    ['Chest pain in English', 'I have severe chest pain and pressure since an hour'],
    ['Chest pain in Hindi transliteration', 'mujhe seene mein dard ho raha hai'],
    ['Chest pain in Bengali transliteration', 'amar buke byatha korche'],
    ['Shortness of breath', 'Experiencing sudden shortness of breath'],
    ['Difficulty breathing in Bengali', 'আমার প্রচণ্ড শ্বাসকষ্ট হচ্ছে'],
    ['Fainting', 'My father fainted in the bathroom'],
    ['Unconscious in Hindi', 'patient behosh ho gaya'],
    ['Stroke signs', 'Sudden face drooping and slurred speech'],
    ['One-sided weakness', 'One-sided weakness in my left arm'],
    ['Seizure / fits', 'He just had a seizure and fits'],
    ['Severe bleeding', 'Uncontrolled heavy bleeding from leg wound'],
    ['Vomiting blood', 'Started vomiting blood twice this morning'],
    ['Coughing blood in Bengali', 'kashir sathe rokto berocche'],
    ['Black tarry stool', 'Passing black tarry stool since last night'],
    ['Worst headache', 'This is the worst headache of my life suddenly'],
    ['Confusion', 'Grandfather is suddenly very confused and disoriented'],
    ['Swollen lips/throat', 'Swelling of lips and throat after eating nuts'],
    ['Severe abdominal pain', 'Having excruciating abdominal pain on right side'],
    ['Severe dehydration / no urine', 'Severe dehydration and no urine since yesterday'],
  ])('triggers emergency for %s', (_label, notes) => {
    const res = checkRedFlags({ ...baseSymptoms, notes }, basePatient);
    expect(res.triggered).toBe(true);
    expect(res.isSelfHarm).toBe(false);
    expect(res.matchedFlags.length).toBeGreaterThan(0);
  });

  it('triggers on high fever combined with stiff neck', () => {
    const res = checkRedFlags(
      {
        ...baseSymptoms,
        selectedSymptoms: ['Fever'],
        notes: 'High temperature and a very stiff neck',
      },
      basePatient
    );
    expect(res.triggered).toBe(true);
    expect(res.matchedFlags).toContain('High fever with stiff neck');
  });

  it('triggers on severe stomach pain chip + severe severity', () => {
    const res = checkRedFlags(
      {
        ...baseSymptoms,
        selectedSymptoms: ['Stomach pain'],
        severity: 'severe',
      },
      basePatient
    );
    expect(res.triggered).toBe(true);
    expect(res.matchedFlags).toContain('Severe abdominal pain');
  });

  it('triggers on fever in a baby under 3 months via patient toggle or infant age', () => {
    const resByFlag = checkRedFlags(
      { ...baseSymptoms, selectedSymptoms: ['Fever'] },
      { ...basePatient, age: 0, isInfantUnder3Months: true }
    );
    expect(resByFlag.triggered).toBe(true);
    expect(resByFlag.matchedFlags).toContain('Fever in a baby under 3 months');

    const resByText = checkRedFlags(
      { ...baseSymptoms, notes: 'My 2 month old baby has a fever' },
      basePatient
    );
    expect(resByText.triggered).toBe(true);
    expect(resByText.matchedFlags).toContain('Fever in a baby under 3 months');
  });

  it('sets isSelfHarm=true for self-harm and suicide keywords across languages', () => {
    const enRes = checkRedFlags(
      { ...baseSymptoms, notes: 'I am having thoughts of suicide and want to hurt myself' },
      basePatient
    );
    expect(enRes.triggered).toBe(true);
    expect(enRes.isSelfHarm).toBe(true);

    const hiRes = checkRedFlags(
      { ...baseSymptoms, notes: 'mujhe aatmahatya ke vichar aa rahe hain' },
      basePatient
    );
    expect(hiRes.triggered).toBe(true);
    expect(hiRes.isSelfHarm).toBe(true);

    const bnRes = checkRedFlags(
      { ...baseSymptoms, notes: 'আমার আত্মহত্যা করার কথা মনে হচ্ছে' },
      basePatient
    );
    expect(bnRes.triggered).toBe(true);
    expect(bnRes.isSelfHarm).toBe(true);
  });
});
