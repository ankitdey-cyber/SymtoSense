import { CheckCircle2, HeartPulse, Loader2, Shield } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from './DisclaimerStrip';

interface LoadingOverlayProps {
  language: Language;
}

export function LoadingOverlay({ language }: LoadingOverlayProps) {
  const t = TRANSLATIONS[language];

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8">
      <DisclaimerStrip language={language} compact />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center py-8">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary-container animate-ping opacity-40 absolute" />
          <div className="w-16 h-16 rounded-full bg-primary-container border border-mint-accent text-primary flex items-center justify-center relative">
            <HeartPulse className="w-8 h-8 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-md w-full">
          <h1 className="font-headline text-headline-md text-on-surface">{t.loadingTitle}</h1>
          <p className="font-body text-body-md text-on-surface-variant text-pretty">
            {t.loadingSubtitle}
          </p>
        </div>

        <div className="w-full max-w-lg rounded-lg bg-surface-container-low border border-outline-variant p-5 flex flex-col gap-3 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
            <span className="font-body text-body-sm text-on-surface">{t.loadingStep1}</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary shrink-0 animate-spin" aria-hidden="true" />
            <span className="font-body text-body-sm text-on-surface">{t.loadingStep2}</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-outline shrink-0" aria-hidden="true" />
            <span className="font-body text-body-sm text-on-surface-variant">{t.loadingStep3}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
