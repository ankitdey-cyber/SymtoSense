import { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Ban,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  FileDown,
  HeartHandshake,
  HelpCircle,
  MapPin,
  Pill,
  RotateCcw,
  Shield,
  Stethoscope,
} from 'lucide-react';
import type {
  FilteredAnalysisResult,
  Language,
  LikelihoodLevel,
  PatientDetailsData,
  SymptomInputData,
  UrgencyLevel,
} from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';
import { downloadSummaryPdf } from '../utils/pdf';

interface ResultsScreenProps {
  language: Language;
  symptoms: SymptomInputData;
  patient: PatientDetailsData;
  filteredResult: FilteredAnalysisResult;
  isSavedToHistory: boolean;
  onSaveToHistory: () => void;
  onStartOver: () => void;
  timestamp?: string;
}

const URGENCY_STYLES: Record<UrgencyLevel, { container: string }> = {
  self_care: {
    container:
      'rounded-lg bg-success-container border border-success/25 p-5 flex items-start gap-3.5 text-on-success-container',
  },
  see_doctor_1_2_days: {
    container:
      'rounded-lg bg-warning-container border border-warning/25 p-5 flex items-start gap-3.5 text-on-warning-container',
  },
  see_doctor_today: {
    container:
      'rounded-lg bg-urgent-container border border-urgent/25 p-5 flex items-start gap-3.5 text-on-urgent-container',
  },
  emergency: {
    container:
      'rounded-lg bg-emergency p-5 flex items-start gap-3.5 text-on-emergency shadow-sm',
  },
};

function UrgencyIcon({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === 'self_care') {
    return <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />;
  }
  if (urgency === 'see_doctor_1_2_days') {
    return <Clock className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />;
  }
  if (urgency === 'see_doctor_today') {
    return <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />;
  }
  return <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />;
}

const LIKELIHOOD_STYLES: Record<LikelihoodLevel, { badge: string; bar: string }> = {
  high: {
    badge: 'bg-primary-container text-on-primary-container',
    bar: 'w-4/5 bg-primary',
  },
  medium: {
    badge: 'bg-warning-container text-on-warning-container',
    bar: 'w-1/2 bg-warning',
  },
  low: {
    badge: 'bg-surface-container text-on-surface-variant',
    bar: 'w-1/4 bg-outline',
  },
};

export function ResultsScreen({
  language,
  symptoms,
  patient,
  filteredResult,
  isSavedToHistory,
  onSaveToHistory,
  onStartOver,
  timestamp,
}: ResultsScreenProps) {
  const t = TRANSLATIONS[language];
  const { result, otcHidden, otcRestrictedMessage } = filteredResult;
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({ 0: true });
  const [pdfToastVisible, setPdfToastVisible] = useState(false);

  const urgencyStyle = URGENCY_STYLES[result.urgency] || URGENCY_STYLES.see_doctor_1_2_days;

  const mapsQuery = encodeURIComponent(`${result.suggested_specialist} near me`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDownloadPdf = () => {
    downloadSummaryPdf({
      symptoms,
      patient,
      filteredResult,
      language,
      timestamp,
    });
    setPdfToastVisible(true);
    window.setTimeout(() => setPdfToastVisible(false), 4500);
  };

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      <DisclaimerStrip language={language} compact />

      {/* Top Urgency Banner */}
      <section className="w-full" aria-label="Urgency assessment">
        <div role="alert" className={urgencyStyle.container}>
          <UrgencyIcon urgency={result.urgency} />
          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="font-headline text-headline-md">
              {result.urgency_title || t.urgencyLabels[result.urgency]}
            </h1>
            <p className="font-body text-body-md text-pretty">{result.urgency_summary}</p>
          </div>
        </div>
      </section>

      {/* Possible Conditions */}
      <section className="w-full flex flex-col gap-3" aria-labelledby="conditions-heading">
        <h2 id="conditions-heading" className="font-headline text-headline-md text-on-surface">
          {t.possibleConditionsHeading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.possible_conditions.map((condition, idx) => {
            const style = LIKELIHOOD_STYLES[condition.likelihood] || LIKELIHOOD_STYLES.low;
            return (
              <article
                key={`${condition.name}-${idx}`}
                className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-title text-title-md text-on-surface">{condition.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label text-label-sm shrink-0 ${style.badge}`}
                  >
                    {t.likelihoodLabels[condition.likelihood]}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className={`h-full rounded-full ${style.bar}`} />
                </div>
                <p className="font-body text-body-sm text-on-surface-variant text-pretty">
                  {condition.reason}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Self-care & OTC side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Self-care steps checklist */}
        {result.self_care_steps.length > 0 && (
          <section className="rounded-lg bg-surface-container-low border border-outline-variant p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <h2 className="font-title text-title-md text-on-surface">{t.selfCareHeading}</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {result.self_care_steps.map((step, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(checkedSteps[idx])}
                    onChange={() => toggleStep(idx)}
                    className="mt-1 h-5 w-5 shrink-0 rounded-sm border-outline text-primary focus:ring-primary"
                  />
                  <span className="font-body text-body-md text-on-surface text-pretty">{step}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Common over-the-counter options OR Restricted Notice */}
        <section className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
            <h2 className="font-title text-title-md text-on-surface">{t.otcHeading}</h2>
          </div>

          {otcHidden ? (
            <div
              role="note"
              className="p-4 rounded-md bg-warning-container/70 border border-warning/25 text-on-warning-container flex items-start gap-3"
            >
              <Shield className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="font-body text-body-md text-pretty">{otcRestrictedMessage}</p>
            </div>
          ) : result.otc_options.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {result.otc_options.map((otc, idx) => (
                  <div
                    key={`${otc.name}-${idx}`}
                    className="p-3.5 rounded-md bg-surface-container-low border border-outline-variant flex flex-col gap-1"
                  >
                    <h3 className="font-label text-label-lg text-on-surface">{otc.name}</h3>
                    <p className="font-body text-body-sm text-on-surface-variant text-pretty">
                      {otc.purpose}
                    </p>
                    <p className="font-body text-body-sm text-warning text-pretty">
                      {otc.caution}
                    </p>
                  </div>
                ))}
              </div>

              <p className="font-label text-label-md text-primary bg-primary-container px-3.5 py-2 rounded-md">
                {t.otcFollowLabelNote}
              </p>
            </>
          ) : (
            <p className="font-body text-body-md text-on-surface-variant bg-surface-container-low px-3.5 py-2.5 rounded-md border border-outline-variant">
              {t.otcFollowLabelNote}
            </p>
          )}
        </section>
      </div>

      {/* Avoid & See a doctor if */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.avoid.length > 0 && (
          <section className="rounded-lg bg-surface-container-low border border-outline-variant p-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />
              <h2 className="font-title text-title-md text-on-surface">{t.avoidHeading}</h2>
            </div>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 font-body text-body-md text-on-surface-variant">
              {result.avoid.map((item, idx) => (
                <li key={idx} className="text-pretty">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.see_doctor_if.length > 0 && (
          <section className="rounded-lg bg-urgent-container/60 border border-urgent/20 p-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-urgent shrink-0" aria-hidden="true" />
              <h2 className="font-title text-title-md text-on-urgent-container">
                {t.seeDoctorIfHeading}
              </h2>
            </div>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 font-body text-body-md text-on-urgent-container">
              {result.see_doctor_if.map((item, idx) => (
                <li key={idx} className="text-pretty">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Follow-up Questions & Suggested Specialist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.follow_up_questions.length > 0 && (
          <section className="rounded-lg bg-surface-container-low border border-outline-variant p-5 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <h2 className="font-title text-title-md text-on-surface">{t.followUpHeading}</h2>
            </div>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 font-body text-body-md text-on-surface-variant">
              {result.follow_up_questions.map((question, idx) => (
                <li key={idx} className="text-pretty">
                  {question}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Suggested Specialist */}
        <article className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <header className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary-container text-primary flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-body text-body-sm text-on-surface-variant">
                  {t.suggestedSpecialistLabel}
                </p>
                <h2 className="font-title text-title-md text-on-surface">
                  {result.suggested_specialist}
                </h2>
              </div>
            </header>
            <p className="font-body text-body-md text-on-surface-variant text-pretty">
              {result.specialist_reason}
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary-container text-on-primary-container font-label text-label-lg hover:bg-mint-accent transition-colors duration-state-change"
          >
            <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.findNearbyDoctors}</span>
          </a>
        </article>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-primary text-on-primary font-label text-label-lg shadow-sm hover:bg-secondary transition-colors duration-state-change cursor-pointer"
          >
            <FileDown className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.downloadPdf}</span>
          </button>

          {!isSavedToHistory && (
            <button
              type="button"
              onClick={onSaveToHistory}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-primary-container/70 border border-mint-accent text-on-primary-container font-label text-label-md hover:bg-primary-container transition-colors duration-state-change cursor-pointer"
            >
              <BookmarkPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.saveToHistoryBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStartOver}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-surface-container-low border border-outline-variant text-on-surface font-label text-label-lg hover:bg-surface-container transition-colors duration-state-change cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.startOver}</span>
          </button>
        </div>

        {isSavedToHistory && (
          <div className="inline-flex items-center self-start gap-1.5 px-3 py-1.5 rounded-md bg-primary-container/60 text-on-primary-container font-label text-label-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t.savedToHistoryBadge}</span>
          </div>
        )}

        {pdfToastVisible && (
          <p className="font-body text-body-sm text-primary bg-primary-container rounded-md px-4 py-2.5 self-start">
            {t.pdfReadyToast}
          </p>
        )}
      </div>
    </main>
  );
}
