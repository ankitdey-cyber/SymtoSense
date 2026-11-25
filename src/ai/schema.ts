import { z } from 'zod';

export const PossibleConditionSchema = z.object({
  name: z.string().min(1),
  likelihood: z.enum(['high', 'medium', 'low']),
  reason: z.string().min(1),
});

export const OtcOptionSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().min(1),
  caution: z.string().min(1),
});

export const AnalysisResultSchema = z.object({
  emergency: z.boolean(),
  urgency: z.enum(['self_care', 'see_doctor_1_2_days', 'see_doctor_today', 'emergency']),
  urgency_title: z.string().min(1),
  urgency_summary: z.string().min(1),
  emergency_reason: z.string().optional(),
  possible_conditions: z.array(PossibleConditionSchema).min(1).max(5),
  self_care_steps: z.array(z.string().min(1)).max(8),
  otc_options: z.array(OtcOptionSchema).max(5),
  avoid: z.array(z.string().min(1)).max(8),
  see_doctor_if: z.array(z.string().min(1)).min(1).max(8),
  suggested_specialist: z.string().min(1),
  specialist_reason: z.string().min(1),
  follow_up_questions: z.array(z.string().min(1)).max(6),
  disclaimer: z.string().min(1),
});

export type ValidatedAnalysisResult = z.infer<typeof AnalysisResultSchema>;

/**
 * Gemini structured output responseSchema matching @google/genai Type values.
 * Kept framework-agnostic so both server.ts and shared code can import it without
 * bundling @google/genai into the browser.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    emergency: {
      type: 'BOOLEAN',
      description: 'True only if red-flag or life-threatening emergency care is needed right now.',
    },
    urgency: {
      type: 'STRING',
      enum: ['self_care', 'see_doctor_1_2_days', 'see_doctor_today', 'emergency'],
      description: 'Overall clinical triage urgency level.',
    },
    urgency_title: {
      type: 'STRING',
      description:
        'Short urgency headline in the requested language (e.g., "Self-care likely OK", "See a doctor in 1–2 days", "See a doctor today", or "Emergency").',
    },
    urgency_summary: {
      type: 'STRING',
      description: '1-2 calm sentences explaining why this urgency level was chosen.',
    },
    emergency_reason: {
      type: 'STRING',
      description: 'Required if emergency is true; plain-language explanation of the urgent sign.',
    },
    possible_conditions: {
      type: 'ARRAY',
      description: '2 to 4 possible explanations ranked from highest to lowest likelihood.',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          likelihood: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          reason: {
            type: 'STRING',
            description: 'Plain-language explanation starting with why this matches the symptoms.',
          },
        },
        required: ['name', 'likelihood', 'reason'],
      },
    },
    self_care_steps: {
      type: 'ARRAY',
      description: '3 to 5 practical, safe home-care actions.',
      items: { type: 'STRING' },
    },
    otc_options: {
      type: 'ARRAY',
      description:
        '0 to 3 safe, common over-the-counter options only (NEVER prescription drugs, antibiotics, steroids, opioids, benzodiazepines, or injections; NEVER include numeric doses like mg, ml, or tablets per day).',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          purpose: { type: 'STRING' },
          caution: {
            type: 'STRING',
            description:
              'Safety caution without numeric doses; instruct to follow the label dose or ask a pharmacist.',
          },
        },
        required: ['name', 'purpose', 'caution'],
      },
    },
    avoid: {
      type: 'ARRAY',
      description: '2 to 4 things to avoid while recovering.',
      items: { type: 'STRING' },
    },
    see_doctor_if: {
      type: 'ARRAY',
      description: '3 to 5 clear warning signs that mean the user should see a doctor sooner.',
      items: { type: 'STRING' },
    },
    suggested_specialist: {
      type: 'STRING',
      description: 'Recommended type of doctor (e.g., General Physician, Dermatologist, ENT Specialist).',
    },
    specialist_reason: {
      type: 'STRING',
      description: '1 short sentence explaining how this specialist can help.',
    },
    follow_up_questions: {
      type: 'ARRAY',
      description: '2 to 4 helpful follow-up questions a doctor may ask or that help clarify symptoms.',
      items: { type: 'STRING' },
    },
    disclaimer: {
      type: 'STRING',
      description:
        'Clear medical disclaimer stating this is informational guidance, not a diagnosis, and to call 112 in an emergency.',
    },
  },
  required: [
    'emergency',
    'urgency',
    'urgency_title',
    'urgency_summary',
    'possible_conditions',
    'self_care_steps',
    'otc_options',
    'avoid',
    'see_doctor_if',
    'suggested_specialist',
    'specialist_reason',
    'follow_up_questions',
    'disclaimer',
  ],
} as const;
