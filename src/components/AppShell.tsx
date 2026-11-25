import React from 'react';
import { HeartPulse } from 'lucide-react';
import type { Language, ScreenId } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface AppShellProps {
  activeScreen: ScreenId;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate: (screen: ScreenId) => void;
  children: React.ReactNode;
  footerExtraDisclaimer?: string;
}

const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'hi', label: 'हिन्दी' },
];

export function AppShell({
  activeScreen,
  language,
  onLanguageChange,
  onNavigate,
  children,
  footerExtraDisclaimer,
}: AppShellProps) {
  const t = TRANSLATIONS[language];

  const isCheckFlow =
    activeScreen === 'symptom-input' ||
    activeScreen === 'patient-details' ||
    activeScreen === 'results';

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface text-on-surface">
      {/* Top Navigation Shell */}
      <header className="sticky top-0 z-20 w-full bg-surface border-b border-outline-variant">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          <div className="pt-3 pb-2 md:py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer shrink-0"
              >
                <span className="w-8 h-8 rounded-md bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="font-headline text-title-md text-on-surface">{t.brand}</span>
              </button>

              {/* Desktop inline primary navigation */}
              <nav
                aria-label="Primary navigation"
                className="hidden md:flex items-center gap-1"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('symptom-input')}
                  aria-current={isCheckFlow ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                    isCheckFlow
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t.navCheckSymptoms}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  aria-current={activeScreen === 'history' ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                    activeScreen === 'history'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t.navHistory}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  aria-current={activeScreen === 'about' ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                    activeScreen === 'about'
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {t.navAbout}
                </button>
              </nav>
            </div>

            <div
              className="flex items-center rounded-full bg-surface-container p-1 border border-outline-variant shrink-0"
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
                      active
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile primary navigation row */}
          <nav
            aria-label="Mobile navigation"
            className="flex md:hidden pb-2.5 items-center gap-1.5 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => onNavigate('symptom-input')}
              aria-current={isCheckFlow ? 'page' : undefined}
              className={`px-3 py-1 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                isCheckFlow
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t.navCheckSymptoms}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              aria-current={activeScreen === 'history' ? 'page' : undefined}
              className={`px-3 py-1 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                activeScreen === 'history'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t.navHistory}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              aria-current={activeScreen === 'about' ? 'page' : undefined}
              className={`px-3 py-1 rounded-full font-label text-label-md whitespace-nowrap transition-colors duration-state-change cursor-pointer ${
                activeScreen === 'about'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t.navAbout}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area — Full Width Container */}
      <div className="flex-1 min-w-0 w-full flex flex-col">
        {children}
      </div>

      {/* Persistent Footer Disclaimer */}
      <footer className="w-full border-t border-outline-variant bg-surface-container-low">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-4">
          <p className="font-body text-body-sm text-on-surface-variant text-center text-pretty">
            {footerExtraDisclaimer || t.footerDisclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
