import { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Search, X } from 'lucide-react';
import type { DurationOption, Language, SeverityLevel, SymptomInputData } from '../types';
import { getSymptomLabel, SYMPTOM_CHIPS, TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';

interface SymptomInputScreenProps {
  language: Language;
  value: SymptomInputData;
  onChange: (next: SymptomInputData) => void;
  onNext: () => void;
}

const DURATION_OPTIONS: DurationOption[] = ['today', '1_3_days', '4_7_days', 'over_a_week'];

const SEVERITY_MAP: Record<number, SeverityLevel> = {
  1: 'mild',
  2: 'moderate',
  3: 'severe',
};

const SEVERITY_TO_NUM: Record<SeverityLevel, number> = {
  mild: 1,
  moderate: 2,
  severe: 3,
};

export function SymptomInputScreen({
  language,
  value,
  onChange,
  onNext,
}: SymptomInputScreenProps) {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [showError, setShowError] = useState(false);

  const filteredChips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SYMPTOM_CHIPS;
    return SYMPTOM_CHIPS.filter(
      (chip) =>
        chip.id.toLowerCase().includes(q) ||
        chip.labels.en.toLowerCase().includes(q) ||
        chip.labels.bn.toLowerCase().includes(q) ||
        chip.labels.hi.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleSymptom = (id: string) => {
    const exists = value.selectedSymptoms.includes(id);
    const nextSymptoms = exists
      ? value.selectedSymptoms.filter((s) => s !== id)
      : [...value.selectedSymptoms, id];
    onChange({ ...value, selectedSymptoms: nextSymptoms });
    if (showError && (nextSymptoms.length > 0 || value.notes.trim().length > 0)) {
      setShowError(false);
    }
  };

  const handleContinue = () => {
    if (!value.notes.trim() && value.selectedSymptoms.length === 0) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onNext();
  };

  const severityBadgeClass =
    value.severity === 'mild'
      ? 'bg-success-container text-on-success-container'
      : value.severity === 'moderate'
        ? 'bg-warning-container text-on-warning-container'
        : 'bg-urgent-container text-on-urgent-container';

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      <DisclaimerStrip language={language} compact />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Progress Indicator */}
        <section aria-label="Step progress" className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-md text-primary">{t.step1Label}</span>
            <span className="font-body text-body-sm text-on-surface-variant">{t.step1Subtitle}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className="w-1/2 h-full rounded-full bg-primary transition-all duration-surface-enter" />
          </div>
        </section>

        {/* Large Text Box */}
        <section className="flex flex-col gap-2">
          <label htmlFor="symptom-notes" className="font-headline text-headline-md text-on-surface">
            {t.describeLabel}
          </label>
          <textarea
            id="symptom-notes"
            rows={4}
            value={value.notes}
            onChange={(e) => {
              onChange({ ...value, notes: e.target.value });
              if (showError && e.target.value.trim().length > 0) setShowError(false);
            }}
            placeholder={t.describePlaceholder}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 font-body text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </section>

        {/* Searchable Symptom Chip Picker */}
        <section className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 md:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-title text-title-md text-on-surface">{t.selectSymptomsHeading}</h2>
            <span className="font-label text-label-sm text-primary">
              {value.selectedSymptoms.length} {t.selectedCountSuffix}
            </span>
          </div>

          {/* Selected Chips Shown On Top */}
          <div className="flex flex-wrap gap-2 p-3 rounded-md bg-primary-container/60 border border-mint-accent min-h-12 items-center">
            {value.selectedSymptoms.length === 0 ? (
              <span className="font-body text-body-sm text-on-primary-container">
                {t.noSymptomsSelected}
              </span>
            ) : (
              value.selectedSymptoms.map((sym) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-primary text-on-primary font-label text-label-md"
                >
                  <span>{getSymptomLabel(sym, language)}</span>
                  <button
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    aria-label={`Remove ${sym}`}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-secondary text-on-primary cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Search Input */}
          <label className="flex flex-col gap-1 w-full">
            <span className="sr-only">{t.searchSymptomsPlaceholder}</span>
            <div className="relative flex items-center">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-outline absolute left-3.5 pointer-events-none"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchSymptomsPlaceholder}
                className="w-full rounded-md border border-outline-variant bg-surface-container-low pl-10 pr-4 py-3 font-body text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </label>

          {/* Symptom Chips Grid */}
          <div className="flex flex-wrap gap-2">
            {filteredChips.map((chip) => {
              const isSel = value.selectedSymptoms.includes(chip.id);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => toggleSymptom(chip.id)}
                  aria-pressed={isSel}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-label-md transition-colors duration-state-change cursor-pointer ${
                    isSel
                      ? 'bg-primary text-on-primary border border-primary'
                      : 'bg-surface-container-low border border-outline-variant text-on-surface hover:border-primary'
                  }`}
                >
                  {isSel && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                  <span>{chip.labels[language]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Duration & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration Selector */}
          <section className="flex flex-col gap-3">
            <h2 className="font-title text-title-md text-on-surface">{t.durationHeading}</h2>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t.durationHeading}>
              {DURATION_OPTIONS.map((opt) => {
                const active = value.duration === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange({ ...value, duration: opt })}
                    className={`px-3 py-3 rounded-md border font-label text-label-md text-center transition-colors duration-state-change cursor-pointer ${
                      active
                        ? 'border-primary bg-primary-container text-on-primary-container'
                        : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary'
                    }`}
                  >
                    {t.durations[opt]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Severity Slider */}
          <section className="rounded-lg bg-surface-container-low border border-outline-variant p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="severity-slider" className="font-title text-title-md text-on-surface">
                {t.severityHeading}
              </label>
              <span className={`px-3 py-1 rounded-full font-label text-label-sm ${severityBadgeClass}`}>
                {t.severities[value.severity]}
              </span>
            </div>
            <input
              id="severity-slider"
              type="range"
              min={1}
              max={3}
              step={1}
              value={SEVERITY_TO_NUM[value.severity]}
              onChange={(e) => {
                const nextLevel = SEVERITY_MAP[Number(e.target.value)] || 'moderate';
                onChange({ ...value, severity: nextLevel });
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex items-center justify-between font-label text-label-sm text-on-surface-variant">
              <span>{t.severities.mild}</span>
              <span>{t.severities.moderate}</span>
              <span>{t.severities.severe}</span>
            </div>
          </section>
        </div>

        {showError && (
          <div
            role="alert"
            className="rounded-lg bg-emergency-container border border-error/25 p-3.5 text-on-emergency-container font-body text-body-sm flex items-center gap-2.5"
          >
            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.symptomRequiredError}</span>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-2 pb-4">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-on-primary font-label text-label-lg shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change cursor-pointer"
          >
            <span>{t.nextPatientDetails}</span>
            <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}
