import { AlertTriangle, ClipboardList, Phone, Pill, ShieldCheck, ShieldPlus } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { DisclaimerStrip } from '../components/DisclaimerStrip';

interface AboutSafetyScreenProps {
  language: Language;
  onStartCheck: () => void;
}

export function AboutSafetyScreen({ language, onStartCheck }: AboutSafetyScreenProps) {
  const t = TRANSLATIONS[language];

  const cards = [
    {
      Icon: ClipboardList,
      iconBg: 'bg-primary-container text-primary',
      title: t.aboutHowTitle,
      desc: t.aboutHowDesc,
    },
    {
      Icon: AlertTriangle,
      iconBg: 'bg-emergency-container text-emergency',
      title: t.aboutRedFlagTitle,
      desc: t.aboutRedFlagDesc,
    },
    {
      Icon: Pill,
      iconBg: 'bg-warning-container text-warning',
      title: t.aboutOtcTitle,
      desc: t.aboutOtcDesc,
    },
    {
      Icon: ShieldCheck,
      iconBg: 'bg-success-container text-success',
      title: t.aboutPrivacyTitle,
      desc: t.aboutPrivacyDesc,
    },
    {
      Icon: Phone,
      iconBg: 'bg-primary-container text-primary',
      title: t.aboutHelplinesTitle,
      desc: t.aboutHelplinesDesc,
    },
  ];

  return (
    <main className="flex-1 min-w-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
      <DisclaimerStrip language={language} />

      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-headline-lg text-on-surface">{t.aboutHeading}</h1>
        <p className="font-body text-body-md text-on-surface-variant text-pretty">
          {t.aboutSubtitle}
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(({ Icon, iconBg, title, desc }) => (
          <article
            key={title}
            className="rounded-lg bg-surface-container-lowest border border-outline-variant p-5 shadow-sm flex items-start gap-4"
          >
            <div
              className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="font-title text-title-md text-on-surface">{title}</h2>
              <p className="font-body text-body-md text-on-surface-variant text-pretty">{desc}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="pb-4">
        <button
          type="button"
          onClick={onStartCheck}
          className="w-full sm:w-auto sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-md bg-primary text-on-primary font-label text-label-lg shadow-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change cursor-pointer"
        >
          <ShieldPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{t.landingCta}</span>
        </button>
      </div>
    </main>
  );
}
