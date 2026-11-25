import { useState } from 'react';
import { Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Language, PatientDetailsData, SexOption } from '../types';
import { ALLERGY_CHIPS, CONDITION_CHIPS, TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';

interface PatientDetailsScreenProps {
  language: Language;
  value: PatientDetailsData;
  saveHistoryOptIn: boolean;
  onToggleSaveHistoryOptIn: (next: boolean) => void;
  onChange: (next: PatientDetailsData) => void;
  onBack: () => void;
  onAnalyse: () => void;
  apiError: string | null;
}

const SEX_OPTIONS: SexOption[] = ['female', 'male', 'other'];

export function PatientDetailsScreen({
  language,
  value,
  saveHistoryOptIn,
  onToggleSaveHistoryOptIn,
  onChange,
  onBack,
  onAnalyse,
  apiError,
}: PatientDetailsScreenProps) {
  const t = TRANSLATIONS[language];
  const [consentError, setConsentError] = useState(false);

  const toggleAllergy = (id: string) => {
    if (id === 'None known') {
      const hasNone = value.allergies.includes('None known');
      onChange({
        ...value,
        allergies: hasNone ? [] : ['None known'],
        otherAllergies: hasNone ? value.otherAllergies : '',
      });
      return;
    }

    const withoutNone = value.allergies.filter((a) => a !== 'None known');
    const exists = withoutNone.includes(id);
    const next = exists ? withoutNone.filter((a) => a !== id) : [...withoutNone, id];
    onChange({ ...value, allergies: next });
  };

  const toggleCondition = (id: string) => {
    const exists = value.existingConditions.includes(id);
    const next = exists
      ? value.existingConditions.filter((c) => c !== id)
      : [...value.existingConditions, id];
    onChange({ ...value, existingConditions: next });
  };

  const handleSubmit = () => {
    if (!value.consentAccepted) {
      setConsentError(true);
      return;
    }
    setConsentError(false);
    onAnalyse();
  };

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      <DisclaimerStrip language={language} compact />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Progress Indicator */}
        <section aria-label="Step progress" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-md text-primary">{t.step2Label}</span>
            <button
              type="button"
              onClick={onBack}
              className="font-label text-label-sm text-primary hover:underline cursor-pointer"
            >
              {t.backToSymptoms}
            </button>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-full h-full rounded-full bg-primary transition-all duration-surface-enter" />
          </div>
        </section>

        <h1 className="font-headline text-headline-lg text-on-surface">
          {t.patientDetailsHeading}
        </h1>

        {/* Age & Sex */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label-md text-on-surface">{t.ageLabel}</span>
              <input
                type="number"
                min={0}
                max={120}
                value={value.age}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onChange({ ...value, age: '' });
                  } else {
                    const num = Math.max(0, Math.min(120, Number(raw)));
                    onChange({
                      ...value,
                      age: Number.isNaN(num) ? '' : num,
                      isInfantUnder3Months: num > 0 ? false : value.isInfantUnder3Months,
                    });
                  }
                }}
                placeholder={t.agePlaceholder}
                className="w-full rounded-md border border-outline-variant bg-surface px-4 py-3 font-body text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer self-start">
              <input
                type="checkbox"
                checked={value.isInfantUnder3Months}
                onChange={(e) =>
                  onChange({
                    ...value,
                    isInfantUnder3Months: e.target.checked,
                    age: e.target.checked ? 0 : value.age,
                  })
                }
                className="h-4 w-4 rounded-sm border-outline text-primary focus:ring-primary"
              />
              <span className="font-body text-body-sm text-on-surface-variant">
                {t.infantUnder3MonthsLabel}
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-label text-label-md text-on-surface">{t.sexLabel}</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.sexLabel}>
              {SEX_OPTIONS.map((opt) => {
                const active = value.sex === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ ...value, sex: opt })}
                    className={`px-3 py-3 rounded-md border font-label text-label-md transition-colors duration-state-change cursor-pointer ${
                      active
                        ? 'border-primary bg-primary-container text-on-primary-container'
                        : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary'
                    }`}
                  >
                    {t.sexOptions[opt]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pregnant or breastfeeding toggle */}
        <section className="rounded-lg bg-surface-container-low border border-outline-variant p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-title text-title-md text-on-surface">{t.pregnantTitle}</span>
            <span className="font-body text-body-sm text-on-surface-variant">
              {t.pregnantSubtitle}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={value.pregnantOrBreastfeeding}
            aria-label={t.pregnantTitle}
            onClick={() =>
              onChange({ ...value, pregnantOrBreastfeeding: !value.pregnantOrBreastfeeding })
            }
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              value.pregnantOrBreastfeeding ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface shadow-sm transition-transform duration-state-change ${
                value.pregnantOrBreastfeeding ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </section>

        {/* Known allergies */}
        <section className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 md:p-5 flex flex-col gap-3">
          <h2 className="font-title text-title-md text-on-surface">{t.knownAllergiesHeading}</h2>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_CHIPS.map((chip) => {
              const active = value.allergies.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleAllergy(chip.id)}
                  className={`px-4 py-2 rounded-full border font-label text-label-md transition-colors duration-state-change cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline-variant text-on-surface hover:border-primary'
                  }`}
                >
                  {chip.labels[language]}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={value.otherAllergies}
            onChange={(e) => {
              const nextVal = e.target.value;
              onChange({
                ...value,
                otherAllergies: nextVal,
                allergies: nextVal.trim()
                  ? value.allergies.filter((a) => a !== 'None known')
                  : value.allergies,
              });
            }}
            placeholder={t.otherAllergiesPlaceholder}
            className="w-full rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </section>

        {/* Existing conditions */}
        <section className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 md:p-5 flex flex-col gap-3">
          <h2 className="font-title text-title-md text-on-surface">
            {t.existingConditionsHeading}
          </h2>
          <div className="flex flex-wrap gap-2">
            {CONDITION_CHIPS.map((chip) => {
              const active = value.existingConditions.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCondition(chip.id)}
                  className={`px-4 py-2 rounded-full border font-label text-label-md transition-colors duration-state-change cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-low border-outline-variant text-on-surface hover:border-primary'
                  }`}
                >
                  {chip.labels[language]}
                </button>
              );
            })}
          </div>
          {value.existingConditions.includes('Other') && (
            <input
              type="text"
              value={value.otherConditions}
              onChange={(e) => onChange({ ...value, otherConditions: e.target.value })}
              placeholder={t.otherConditionsPlaceholder}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          )}
        </section>

        {/* Current medicines */}
        <section className="flex flex-col gap-1.5">
          <label htmlFor="current-meds" className="font-label text-label-md text-on-surface">
            {t.currentMedicinesLabel}
          </label>
          <input
            id="current-meds"
            type="text"
            value={value.currentMedicines}
            onChange={(e) => onChange({ ...value, currentMedicines: e.target.value })}
            placeholder={t.currentMedicinesPlaceholder}
            className="w-full rounded-md border border-outline-variant bg-surface px-4 py-3 font-body text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </section>

        {/* Opt-in Local History Storage */}
        <section className="rounded-lg bg-surface-container-low border border-outline-variant p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-label text-label-lg text-on-surface">
              {t.saveHistoryOptInTitle}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant text-pretty">
              {t.saveHistoryOptInDesc}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={saveHistoryOptIn}
            aria-label={t.saveHistoryOptInTitle}
            onClick={() => onToggleSaveHistoryOptIn(!saveHistoryOptIn)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              saveHistoryOptIn ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface shadow-sm transition-transform duration-state-change ${
                saveHistoryOptIn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </section>

        {/* Consent Checkbox (Mandatory) */}
        <label className="flex items-center gap-3 p-4 rounded-lg bg-primary-container/60 border border-mint-accent cursor-pointer">
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={value.consentAccepted}
            onChange={(e) => {
              onChange({ ...value, consentAccepted: e.target.checked });
              if (e.target.checked) setConsentError(false);
            }}
            className="h-5 w-5 shrink-0 rounded-sm border-outline text-primary focus:ring-primary"
          />
          <span className="font-body text-body-md text-on-primary-container">{t.consentLabel}</span>
        </label>

        {consentError && (
          <div
            role="alert"
            className="rounded-lg bg-emergency-container border border-error/25 p-3.5 text-on-emergency-container font-body text-body-sm flex items-center gap-2.5"
          >
            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.consentRequiredError}</span>
          </div>
        )}

        {apiError && (
          <div
            role="alert"
            className="rounded-lg bg-emergency-container border border-error/25 p-4 text-on-emergency-container flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 font-label text-label-lg">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.errorTitle}</span>
            </div>
            <p className="font-body text-body-sm text-pretty">{apiError}</p>
          </div>
        )}

        {/* Analyse Button */}
        <div className="pb-4">
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md font-label text-label-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change cursor-pointer ${
              value.consentAccepted
                ? 'bg-primary text-on-primary hover:bg-secondary'
                : 'bg-outline-variant text-on-surface-variant'
            }`}
          >
            <Activity className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.analyseButton}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
