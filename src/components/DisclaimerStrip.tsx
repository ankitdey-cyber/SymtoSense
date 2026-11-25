import { Info } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface DisclaimerStripProps {
  language: Language;
  compact?: boolean;
}

export function DisclaimerStrip({ language, compact = false }: DisclaimerStripProps) {
  const t = TRANSLATIONS[language];

  return (
    <div
      role="alert"
      className={`w-full flex items-center gap-3 rounded-lg bg-primary-container border border-mint-accent text-on-primary-container ${
        compact ? 'px-4 py-2.5' : 'px-4 py-3.5'
      }`}
    >
      <Info className="w-5 h-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="font-body text-body-sm leading-snug">{t.disclaimerBanner}</p>
    </div>
  );
}
