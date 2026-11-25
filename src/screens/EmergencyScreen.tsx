import {
  AlertTriangle,
  Ambulance,
  HeartPulse,
  Hospital,
  LifeBuoy,
  Phone,
  PhoneCall,
} from 'lucide-react';
import type { Language, ScreenId } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface EmergencyScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  reason: string;
  isSelfHarm: boolean;
  matchedFlags: string[];
  onNavigate: (screen: ScreenId) => void;
  onStartNewCheck: () => void;
}

const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'hi', label: 'हिन्दी' },
];

export function EmergencyScreen({
  language,
  onLanguageChange,
  reason,
  isSelfHarm,
  matchedFlags,
  onNavigate,
  onStartNewCheck,
}: EmergencyScreenProps) {
  const t = TRANSLATIONS[language];
  const hospitalMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=emergency+hospital+near+me';

  return (
    <div className="min-h-screen w-full flex flex-col bg-emergency text-on-emergency font-body antialiased">
      {/* Top Nav (consistent brand + language switch) */}
      <header className="w-full border-b border-on-emergency/25">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-on-emergency focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-emergency rounded-sm cursor-pointer"
          >
            <span className="w-8 h-8 rounded-md bg-surface text-emergency flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="font-headline text-title-md text-on-emergency">{t.brand}</span>
          </button>

          <div
            className="flex items-center rounded-full bg-on-emergency-container p-1 shrink-0"
            role="group"
            aria-label="Language switch"
          >
            {LANGUAGES.map((item) => {
              const active = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => onLanguageChange(item.code)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-full font-label text-label-sm transition-colors duration-state-change cursor-pointer whitespace-nowrap ${
                    active ? 'bg-surface text-emergency' : 'text-on-emergency'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Full Red Emergency Content (No medicine suggestions) */}
      <main className="flex-1 min-w-0 w-full max-w-2xl mx-auto px-4 md:px-8 py-10 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-on-emergency-container flex items-center justify-center shrink-0">
          {isSelfHarm ? (
            <LifeBuoy className="w-12 h-12 text-on-emergency" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-12 h-12 text-on-emergency" aria-hidden="true" />
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <h1 className="font-display text-display-lg-mobile md:text-display-lg text-on-emergency text-balance">
            {isSelfHarm ? t.selfHarmSupportHeadline : t.emergencyHeadline}
          </h1>
          <p className="font-body text-body-lg text-on-emergency text-pretty">
            {isSelfHarm ? t.selfHarmSupportMessage : reason || t.emergencyDefaultDesc}
          </p>
          {matchedFlags.length > 0 && !isSelfHarm && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {matchedFlags.map((flag) => (
                <span
                  key={flag}
                  className="px-3 py-1 rounded-full bg-on-emergency-container/80 text-on-emergency font-label text-label-sm"
                >
                  {flag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Huge Tap-to-Call Buttons */}
        <div className="w-full max-w-lg flex flex-col gap-3">
          {isSelfHarm && (
            <a
              href="tel:14416"
              className="w-full flex flex-col items-center justify-center gap-1 px-6 py-5 rounded-lg bg-surface text-emergency shadow-md hover:bg-emergency-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-emergency transition-colors duration-state-change"
            >
              <span className="inline-flex items-center gap-3 font-headline text-headline-md">
                <PhoneCall className="w-6 h-6 shrink-0" aria-hidden="true" />
                <span>{t.callTeleManas}</span>
              </span>
              <span className="font-body text-body-sm text-on-emergency-container">
                {t.teleManasSubtext}
              </span>
            </a>
          )}

          <a
            href="tel:112"
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-lg bg-surface text-emergency font-headline text-headline-md shadow-md hover:bg-emergency-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-emergency transition-colors duration-state-change"
          >
            <Phone className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>{t.call112}</span>
          </a>

          <a
            href="tel:108"
            className="w-full inline-flex items-center justify-center gap-3 px-6 py-5 rounded-lg bg-surface text-emergency font-headline text-headline-md shadow-md hover:bg-emergency-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-emergency transition-colors duration-state-change"
          >
            <Ambulance className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span>{t.call108}</span>
          </a>

          <a
            href={hospitalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-on-emergency-container border border-on-emergency/40 text-on-emergency font-label text-label-lg hover:bg-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-emergency transition-colors duration-state-change"
          >
            <Hospital className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t.findNearestHospital}</span>
          </a>
        </div>

        <p className="font-body text-body-sm text-on-emergency/90 text-pretty max-w-md">
          {t.emergencyNoMedicineNote}
        </p>
      </main>

      <footer className="w-full border-t border-on-emergency/25">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onStartNewCheck}
              className="font-label text-label-md text-on-emergency underline cursor-pointer"
            >
              {t.startNewCheck}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="font-label text-label-md text-on-emergency underline cursor-pointer"
            >
              {t.navHistory}
            </button>
          </div>
          <p className="font-body text-body-sm text-on-emergency/85 text-center text-pretty">
            {t.disclaimerBanner}
          </p>
        </div>
      </footer>
    </div>
  );
}
