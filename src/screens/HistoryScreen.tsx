import { useState } from 'react';
import { ChevronDown, ChevronUp, History, Trash2 } from 'lucide-react';
import type { HistoryEntry, Language, UrgencyLevel } from '../types';
import { getSymptomLabel, TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';

interface HistoryScreenProps {
  language: Language;
  entries: HistoryEntry[];
  optIn: boolean;
  onToggleOptIn: (next: boolean) => void;
  onOpenEntry: (entry: HistoryEntry) => void;
  onDeleteAll: () => void;
  onStartNewCheck: () => void;
}

const URGENCY_BADGE_CLASS: Record<UrgencyLevel, string> = {
  self_care: 'bg-success-container text-on-success-container',
  see_doctor_1_2_days: 'bg-warning-container text-on-warning-container',
  see_doctor_today: 'bg-urgent-container text-on-urgent-container',
  emergency: 'bg-emergency-container text-on-emergency-container',
};

function formatDate(iso: string, lang: Language): string {
  const locale = lang === 'bn' ? 'bn-IN' : lang === 'hi' ? 'hi-IN' : 'en-GB';
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export function HistoryScreen({
  language,
  entries,
  optIn,
  onToggleOptIn,
  onOpenEntry,
  onDeleteAll,
  onStartNewCheck,
}: HistoryScreenProps) {
  const t = TRANSLATIONS[language];
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() =>
    entries[0] ? { [entries[0].id]: true } : {}
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      <DisclaimerStrip language={language} compact />

      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline text-headline-lg text-on-surface">{t.historyHeading}</h1>
          <p className="font-body text-body-md text-on-surface-variant">{t.historySubtitle}</p>
        </div>

        {/* Opt-in Privacy Control */}
        <section className="rounded-lg bg-surface-container-low border border-outline-variant p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-title text-title-md text-on-surface">
              {t.historyOptInBannerTitle}
            </span>
            <span className="font-body text-body-sm text-on-surface-variant">
              {t.historyOptInBannerDesc}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={optIn}
            aria-label={t.historyOptInBannerTitle}
            onClick={() => onToggleOptIn(!optIn)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              optIn ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-surface shadow-sm transition-transform duration-state-change ${
                optIn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </section>

        {/* History List or Empty State */}
        {entries.length === 0 ? (
          <section className="rounded-lg bg-surface-container-low border border-outline-variant p-8 text-center flex flex-col items-center gap-3">
            <History className="w-8 h-8 text-outline" aria-hidden="true" />
            <h2 className="font-title text-title-md text-on-surface">{t.historyEmptyTitle}</h2>
            <p className="font-body text-body-md text-on-surface-variant text-pretty max-w-md">
              {t.historyEmptyDesc}
            </p>
            <button
              type="button"
              onClick={onStartNewCheck}
              className="mt-1 px-6 py-3 rounded-md bg-primary text-on-primary font-label text-label-lg hover:bg-secondary transition-colors duration-state-change cursor-pointer"
            >
              {t.startNewCheckCta}
            </button>
          </section>
        ) : (
          <section className="flex flex-col gap-3" aria-label={t.historyHeading}>
            {entries.map((entry) => {
              const expanded = Boolean(expandedIds[entry.id]);
              const result = entry.filteredResult.result;
              const badgeClass =
                URGENCY_BADGE_CLASS[result.urgency] || URGENCY_BADGE_CLASS.see_doctor_1_2_days;
              const symptomHeading =
                entry.symptoms.selectedSymptoms.length > 0
                  ? entry.symptoms.selectedSymptoms
                      .map((s) => getSymptomLabel(s, language))
                      .join(', ')
                  : entry.symptoms.notes.slice(0, 60) || t.step1Subtitle;
              const topMatch = result.possible_conditions[0];

              return (
                <article
                  key={entry.id}
                  className="rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => toggleExpanded(entry.id)}
                    className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-surface-container-low transition-colors duration-state-change cursor-pointer"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="font-body text-body-sm text-on-surface-variant tabular-nums">
                        {formatDate(entry.timestamp, language)}
                      </span>
                      <h2 className="font-title text-title-md text-on-surface">{symptomHeading}</h2>
                      <span
                        className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full font-label text-label-sm ${badgeClass}`}
                      >
                        {result.urgency_title || t.urgencyLabels[result.urgency]}
                      </span>
                    </div>
                    {expanded ? (
                      <ChevronUp className="w-5 h-5 text-on-surface-variant shrink-0 mt-1" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-on-surface-variant shrink-0 mt-1" aria-hidden="true" />
                    )}
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-outline-variant flex flex-col gap-2">
                      <p className="font-body text-body-sm text-on-surface-variant">
                        {t.durationHeading}: {t.durations[entry.symptoms.duration]} ·{' '}
                        {t.severityHeading}: {t.severities[entry.symptoms.severity]}
                      </p>
                      {topMatch && (
                        <p className="font-body text-body-md text-on-surface text-pretty">
                          {topMatch.name} ({t.likelihoodLabels[topMatch.likelihood]}).{' '}
                          {result.urgency_summary}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenEntry(entry)}
                        className="font-label text-label-md text-primary hover:underline self-start cursor-pointer"
                      >
                        {t.viewFullResults}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* Delete all my data */}
        {(entries.length > 0 || optIn) && (
          <div className="pt-2 pb-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="w-full sm:w-auto sm:self-start inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-surface-container-low border border-outline-variant text-error font-label text-label-lg hover:bg-emergency-container/40 transition-colors duration-state-change cursor-pointer"
            >
              <Trash2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.deleteAllData}</span>
            </button>

            {confirmDeleteOpen && (
              <div className="rounded-lg bg-surface-container-low border border-outline-variant p-4 flex flex-col gap-3">
                <p className="font-body text-body-md text-on-surface">{t.deleteConfirmPrompt}</p>
                <div className="grid grid-cols-2 gap-2.5 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteOpen(false)}
                    className="px-4 py-2.5 rounded-md border border-outline-variant bg-surface font-label text-label-md text-on-surface cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteAll();
                      setConfirmDeleteOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-md bg-error text-on-error font-label text-label-md cursor-pointer"
                  >
                    {t.yesDeleteAll}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
