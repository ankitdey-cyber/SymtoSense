import { jsPDF } from 'jspdf';
import type {
  FilteredAnalysisResult,
  Language,
  PatientDetailsData,
  SymptomInputData,
} from '../types';
import { getSymptomLabel, TRANSLATIONS } from '../i18n/translations';

interface PdfExportPayload {
  symptoms: SymptomInputData;
  patient: PatientDetailsData;
  filteredResult: FilteredAnalysisResult;
  language: Language;
  timestamp?: string;
}

function hasNonLatinScript(text: string): boolean {
  return /[^\u0000-\u024F\u2000-\u206F]/.test(text);
}

function generateUnicodeCanvasPdf(lines: Array<{ text: string; style: 'banner' | 'title' | 'heading' | 'body' | 'bullet' | 'meta' }>, filename: string) {
  const pageWidthPx = 1240;
  const pageHeightPx = 1754;
  const marginX = 80;
  const maxWidth = pageWidthPx - marginX * 2;

  const pages: HTMLCanvasElement[] = [];

  const createPage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageWidthPx, pageHeightPx);
    pages.push(canvas);
    return { canvas, ctx, y: 80 };
  };

  let current = createPage();

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, width: number): string[] => {
    const words = text.split(/\s+/);
    const wrapped: string[] = [];
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > width && line) {
        wrapped.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) wrapped.push(line);
    return wrapped;
  };

  for (const item of lines) {
    const { ctx } = current;

    if (item.style === 'banner') {
      ctx.font = '600 24px "Inter", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
      const wrapped = wrapText(ctx, item.text, maxWidth - 48);
      const boxHeight = wrapped.length * 34 + 36;
      if (current.y + boxHeight > pageHeightPx - 80) {
        current = createPage();
      }
      current.ctx.fillStyle = '#E6F7F5';
      current.ctx.fillRect(marginX, current.y, maxWidth, boxHeight);
      current.ctx.strokeStyle = '#0F766E';
      current.ctx.lineWidth = 3;
      current.ctx.strokeRect(marginX, current.y, maxWidth, boxHeight);
      current.ctx.fillStyle = '#0B4F4A';
      current.ctx.font = '600 24px "Inter", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
      wrapped.forEach((l, idx) => {
        current.ctx.fillText(l, marginX + 24, current.y + 42 + idx * 34);
      });
      current.y += boxHeight + 28;
      continue;
    }

    let font = '400 24px "Inter", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
    let color = '#0F172A';
    let lineHeight = 34;
    let extraTop = 0;
    let indent = 0;

    if (item.style === 'title') {
      font = '700 38px "Poppins", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
      color = '#0F766E';
      lineHeight = 48;
      extraTop = 8;
    } else if (item.style === 'heading') {
      font = '600 28px "Poppins", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
      color = '#0F172A';
      lineHeight = 38;
      extraTop = 20;
    } else if (item.style === 'meta') {
      font = '500 22px "Inter", "Noto Sans Bengali", "Noto Sans Devanagari", sans-serif';
      color = '#475569';
      lineHeight = 32;
    } else if (item.style === 'bullet') {
      indent = 24;
    }

    current.ctx.font = font;
    const wrapped = wrapText(current.ctx, item.text, maxWidth - indent);
    const blockHeight = extraTop + wrapped.length * lineHeight + 8;

    if (current.y + blockHeight > pageHeightPx - 80) {
      current = createPage();
    }

    current.y += extraTop;
    current.ctx.font = font;
    current.ctx.fillStyle = color;

    for (const l of wrapped) {
      current.ctx.fillText(l, marginX + indent, current.y);
      current.y += lineHeight;
    }
    current.y += 6;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  pages.forEach((canvas, idx) => {
    if (idx > 0) doc.addPage();
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  });

  doc.save(filename);
}

export function downloadSummaryPdf({
  symptoms,
  patient,
  filteredResult,
  language,
  timestamp,
}: PdfExportPayload): void {
  const t = TRANSLATIONS[language];
  const { result, otcHidden, otcRestrictedMessage } = filteredResult;
  const dateStr = timestamp
    ? new Date(timestamp).toLocaleString()
    : new Date().toLocaleString();

  const symptomList = symptoms.selectedSymptoms
    .map((s) => getSymptomLabel(s, language))
    .join(', ');

  const lines: Array<{
    text: string;
    style: 'banner' | 'title' | 'heading' | 'body' | 'bullet' | 'meta';
  }> = [
    { text: `DISCLAIMER: ${t.disclaimerBanner}`, style: 'banner' },
    { text: 'SymptoSense — Symptom Summary', style: 'title' },
    { text: `Date: ${dateStr}`, style: 'meta' },
    {
      text: `${t.urgencyLabels[result.urgency]}: ${result.urgency_title}`,
      style: 'heading',
    },
    { text: result.urgency_summary, style: 'body' },
    { text: t.step1Subtitle, style: 'heading' },
    {
      text: `${t.selectSymptomsHeading}: ${symptomList || '-'} | ${t.durationHeading}: ${t.durations[symptoms.duration]} | ${t.severityHeading}: ${t.severities[symptoms.severity]}`,
      style: 'meta',
    },
  ];

  if (symptoms.notes.trim()) {
    lines.push({ text: symptoms.notes.trim(), style: 'body' });
  }

  const ageText = patient.isInfantUnder3Months
    ? t.infantUnder3MonthsLabel
    : patient.age !== ''
      ? `${patient.age}`
      : '-';
  lines.push({
    text: `${t.ageLabel}: ${ageText} | ${t.sexLabel}: ${t.sexOptions[patient.sex]}`,
    style: 'meta',
  });

  lines.push({ text: t.possibleConditionsHeading, style: 'heading' });
  for (const cond of result.possible_conditions) {
    lines.push({
      text: `• ${cond.name} (${t.likelihoodLabels[cond.likelihood]}) — ${cond.reason}`,
      style: 'bullet',
    });
  }

  if (result.self_care_steps.length > 0) {
    lines.push({ text: t.selfCareHeading, style: 'heading' });
    for (const step of result.self_care_steps) {
      lines.push({ text: `• ${step}`, style: 'bullet' });
    }
  }

  lines.push({ text: t.otcHeading, style: 'heading' });
  if (otcHidden && otcRestrictedMessage) {
    lines.push({ text: otcRestrictedMessage, style: 'body' });
  } else if (result.otc_options.length > 0) {
    for (const otc of result.otc_options) {
      lines.push({
        text: `• ${otc.name}: ${otc.purpose} (${otc.caution})`,
        style: 'bullet',
      });
    }
    lines.push({ text: t.otcFollowLabelNote, style: 'meta' });
  }

  if (result.avoid.length > 0) {
    lines.push({ text: t.avoidHeading, style: 'heading' });
    for (const item of result.avoid) {
      lines.push({ text: `• ${item}`, style: 'bullet' });
    }
  }

  if (result.see_doctor_if.length > 0) {
    lines.push({ text: t.seeDoctorIfHeading, style: 'heading' });
    for (const item of result.see_doctor_if) {
      lines.push({ text: `• ${item}`, style: 'bullet' });
    }
  }

  if (result.follow_up_questions.length > 0) {
    lines.push({ text: t.followUpHeading, style: 'heading' });
    for (const q of result.follow_up_questions) {
      lines.push({ text: `• ${q}`, style: 'bullet' });
    }
  }

  lines.push({
    text: `${t.suggestedSpecialistLabel}: ${result.suggested_specialist}`,
    style: 'heading',
  });
  lines.push({ text: result.specialist_reason, style: 'body' });
  lines.push({ text: result.disclaimer || t.footerDisclaimer, style: 'meta' });

  const filename = `SymptoSense-Summary-${new Date().toISOString().slice(0, 10)}.pdf`;
  const allText = lines.map((l) => l.text).join(' ');

  if (hasNonLatinScript(allText) && typeof document !== 'undefined') {
    generateUnicodeCanvasPdf(lines, filename);
    return;
  }

  // Native crisp vector PDF for English/Latin text
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 44;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 44) {
      doc.addPage();
      y = 44;
    }
  };

  for (const item of lines) {
    if (item.style === 'banner') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(item.text, maxWidth - 20);
      const boxH = wrapped.length * 14 + 18;
      ensureSpace(boxH + 12);
      doc.setFillColor(230, 247, 245);
      doc.setDrawColor(15, 118, 110);
      doc.roundedRect(margin, y, maxWidth, boxH, 6, 6, 'FD');
      doc.setTextColor(11, 79, 74);
      doc.text(wrapped, margin + 10, y + 18);
      y += boxH + 18;
      continue;
    }

    if (item.style === 'title') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 118, 110);
      ensureSpace(26);
      doc.text(item.text, margin, y);
      y += 24;
      continue;
    }

    if (item.style === 'heading') {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const wrapped = doc.splitTextToSize(item.text, maxWidth);
      ensureSpace(wrapped.length * 16 + 8);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 16 + 4;
      continue;
    }

    if (item.style === 'meta') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const wrapped = doc.splitTextToSize(item.text, maxWidth);
      ensureSpace(wrapped.length * 13 + 6);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 13 + 6;
      continue;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const indent = item.style === 'bullet' ? 10 : 0;
    const wrapped = doc.splitTextToSize(item.text, maxWidth - indent);
    ensureSpace(wrapped.length * 14 + 6);
    doc.text(wrapped, margin + indent, y);
    y += wrapped.length * 14 + 5;
  }

  doc.save(filename);
}
