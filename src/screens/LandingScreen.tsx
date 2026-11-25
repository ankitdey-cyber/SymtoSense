import { BellRing, ClipboardList, Pill, ShieldCheck, ShieldPlus } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';

interface LandingScreenProps {
  language: Language;
  onStartCheck: () => void;
}

export function LandingScreen({ language, onStartCheck }: LandingScreenProps) {
  const t = TRANSLATIONS[language];

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-8 md:gap-10">
      {/* Full-width Horizontal Disclaimer Strip */}
      <DisclaimerStrip language={language} />

      {/* Hero Section */}
      <section className="w-full max-w-3xl flex flex-col gap-4 md:gap-5">
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
          <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="font-label text-label-sm">{t.landingBadge}</span>
        </div>

        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-surface text-balance">
          {t.landingHeadline}
        </h1>

        <p className="font-body text-body-lg text-on-surface-variant text-pretty max-w-2xl">
          {t.landingSubtitle}
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onStartCheck}
            className="w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-on-primary font-label text-label-lg shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change cursor-pointer"
          >
            <ShieldPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.landingCta}</span>
          </button>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section id="about-section" className="w-full flex flex-col gap-4" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-headline text-headline-md text-on-surface">
          {t.landingFeaturesHeading}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary-container text-primary flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="font-title text-title-md text-on-surface">
                {t.featureConditionsTitle}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant text-pretty">
                {t.featureConditionsDesc}
              </p>
            </div>
          </article>

          <article className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-primary-container text-primary flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="font-title text-title-md text-on-surface">
                {t.featureSelfCareTitle}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant text-pretty">
                {t.featureSelfCareDesc}
              </p>
            </div>
          </article>

          <article className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-md bg-warning-container text-warning flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="font-title text-title-md text-on-surface">
                {t.featureEmergencyTitle}
              </h3>
              <p className="font-body text-body-md text-on-surface-variant text-pretty">
                {t.featureEmergencyDesc}
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
