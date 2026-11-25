import type { PatientDetailsData, RedFlagCheckResult, SymptomInputData } from '../types';

interface RedFlagRule {
  id: string;
  label: string;
  reason: string;
  isSelfHarm?: boolean;
  patterns: RegExp[];
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'self_harm',
    label: 'Thoughts of self-harm or suicide',
    reason:
      'You mentioned thoughts of self-harm or suicide. Please reach out for immediate, compassionate support right now.',
    isSelfHarm: true,
    patterns: [
      /\b(suicide|suicidal|self[\s-]?harm|kill\s+myself|end\s+my\s+life|want\s+to\s+die|wanna\s+die|hurt\s+myself|harm\s+myself|cutting\s+myself|overdose\s+on\s+purpose|no\s+reason\s+to\s+live|ending\s+it\s+all)\b/i,
      /\b(aatmahatya|atmahatya|atmahatyaa|khud\s*ko\s*(nuksan|khatam|mar)|marna\s+chaht[ai]|nije\s*ke\s*(shesh|mar|khoti)|morbo|morte\s+chai)\b/i,
      /(आत्महत्या|खुद को नुकसान|मरना चाहता|मरना चाहती|আত্মহত্যা|মরতে চাই|নিজেকে শেষ)/i,
    ],
  },
  {
    id: 'chest_pain',
    label: 'Chest pain or pressure',
    reason:
      'Chest pain, pressure, or tightness can signal a serious heart or lung emergency and needs immediate medical care.',
    patterns: [
      /\b(chest\s+(pain|pressure|tightness|heaviness|squeezing|crushing|discomfort)|pain\s+in\s+(my\s+)?chest|pressure\s+in\s+(my\s+)?chest|heart\s+attack)\b/i,
      /\b(seene\s+mein\s+dard|sine\s+mein\s+dard|chhati\s+mein\s+dard|chati\s+me\s+dard|buk\s*e?\s*(byatha|betha|chap|jontrona))\b/i,
      /(सीने में दर्द|छाती में दर्द|বুক ব্যথা|বুকে ব্যথা|বুকে চাপ)/i,
    ],
  },
  {
    id: 'difficulty_breathing',
    label: 'Difficulty breathing or shortness of breath',
    reason:
      'Difficulty breathing or shortness of breath requires immediate emergency medical evaluation.',
    patterns: [
      /\b(difficulty\s+breathing|trouble\s+breathing|hard\s+to\s+breathe|shortness\s+of\s+breath|short\s+of\s+breath|can'?t\s+breathe|cannot\s+breathe|unable\s+to\s+breathe|breathless|gasping\s+for\s+air|labored\s+breathing|laboured\s+breathing)\b/i,
      /\b(saans\s+lene\s+mein\s+(takleef|dikkat|pareshani)|saans\s+phool|sans\s+ful|shwas\s*koshto|shash\s*koshto|nishash\s+nite\s+koshto)\b/i,
      /(सांस लेने में तकलीफ|सांस फूलना|दम घुटना|শ্বাসকষ্ট|শ্বাস নিতে কষ্ট)/i,
    ],
  },
  {
    id: 'fainting_unconscious',
    label: 'Fainting or unconsciousness',
    reason:
      'Fainting, blacking out, or loss of consciousness requires urgent medical assessment.',
    patterns: [
      /\b(faint(ing|ed)?|unconscious|passed\s+out|passing\s+out|blacked\s+out|blacking\s+out|loss\s+of\s+consciousness|unresponsive|collapsed)\b/i,
      /\b(behosh|behoshi|chakkar\s+aakar\s+gir|oggyan|oggan|agyan|gyaan\s+harano)\b/i,
      /(बेहोश|बेहोशी|अचेत|অজ্ঞান|জ্ঞান হারানো)/i,
    ],
  },
  {
    id: 'stroke_signs',
    label: 'Face drooping, slurred speech, or one-sided weakness/numbness',
    reason:
      'Face drooping, slurred speech, or sudden weakness or numbness on one side of the body are warning signs of a stroke. Seek emergency care immediately.',
    patterns: [
      /\b(face\s+droop(ing)?|facial\s+droop|drooping\s+face|slurred\s+speech|difficulty\s+speaking|can'?t\s+speak\s+clearly|one[\s-]?sided\s+(weakness|numbness|paralysis)|weakness\s+on\s+one\s+side|numbness\s+on\s+one\s+side|paralys(is|ed)\s+on\s+one\s+side|stroke\s+symptoms?)\b/i,
      /\b(muh\s+tedha|bolne\s+mein\s+dikkat|ek\s+taraf\s+(kamzori|sunn)|ek\s+pashe?\s+(obosh|durbol)|mukh\s+beke|kotha\s+joriye)\b/i,
      /(मुंह टेढ़ा|बोलने में दिक्कत|एक तरफ कमजोरी|মুখ বেঁকে|কথা জড়িয়ে|এক পাশ অবশ)/i,
    ],
  },
  {
    id: 'seizure',
    label: 'Seizure or fits',
    reason:
      'Seizures, fits, or convulsions require immediate emergency medical evaluation.',
    patterns: [
      /\b(seizures?|fits|convulsions?|epileptic\s+fit|shaking\s+uncontrollably)\b/i,
      /\b(mirgi|daura|daure|khichuni|khichoni)\b/i,
      /(मिर्गी|दौरा|दौरे|খিঁচুনি)/i,
    ],
  },
  {
    id: 'severe_bleeding',
    label: 'Severe bleeding',
    reason:
      'Severe or uncontrolled bleeding requires immediate emergency care.',
    patterns: [
      /\b(severe\s+bleeding|heavy\s+bleeding|uncontrolled\s+bleeding|bleeding\s+heavily|won'?t\s+stop\s+bleeding|excessive\s+bleeding|profuse\s+bleeding)\b/i,
      /\b(bahut\s+khoon|zyada\s+khoon|khoon\s+nahi\s+ruk|prochur\s+rokto|otirikto\s+roktopat|rokto\s+bondho\s+hocche\s+na)\b/i,
      /(बहुत खून|ज्यादा खून|অতিরিক্ত রক্তপাত|প্রচুর রক্তপাত)/i,
    ],
  },
  {
    id: 'vomiting_coughing_blood',
    label: 'Vomiting or coughing blood',
    reason:
      'Vomiting or coughing up blood is a medical emergency and needs urgent hospital care.',
    patterns: [
      /\b(vomit(ing|ed)?\s+(up\s+)?blood|throwing\s+up\s+blood|blood\s+in\s+vomit|cough(ing|ed)?\s+(up\s+)?blood|blood\s+in\s+(sputum|phlegm|cough)|hemoptysis|hematemesis)\b/i,
      /\b(khoon\s+ki\s+ulti|khansi\s+mein\s+khoon|rokto\s+bomi|bomi\s*te\s+rokto|kashir\s+sathe\s+rokto)\b/i,
      /(खून की उल्टी|खांसी में खून|রক্ত বমি|কাশির সাথে রক্ত)/i,
    ],
  },
  {
    id: 'black_tarry_stool',
    label: 'Black or tarry stool',
    reason:
      'Black or tarry stools can indicate internal gastrointestinal bleeding and require urgent medical attention.',
    patterns: [
      /\b(black\s+(and\s+)?tarry\s+stools?|black\s+stools?|tarry\s+stools?|melena|black\s+poop)\b/i,
      /\b(kala\s+(mal|paikhana|potty)|kalo\s+(paykhana|paikhana|mol))\b/i,
      /(काला मल|কালো পায়খানা|কালো মল)/i,
    ],
  },
  {
    id: 'worst_headache',
    label: 'Severe sudden headache ("worst headache")',
    reason:
      'A sudden, severe "worst headache of your life" requires immediate emergency evaluation to rule out serious brain emergencies.',
    patterns: [
      /\b(worst\s+headache(\s+of\s+(my|their|his|her)\s+life)?|thunderclap\s+headache|sudden\s+severe\s+headache|severe\s+sudden\s+headache|sudden\s+worst\s+headache)\b/i,
      /\b(achanak\s+tez\s+sir\s*dard|hothat\s+tibro\s+matha\s*(byatha|betha))\b/i,
      /(अचानक तेज सिरदर्द|হঠাৎ তীব্র মাথাব্যথা)/i,
    ],
  },
  {
    id: 'confusion',
    label: 'Confusion or disorientation',
    reason:
      'Sudden confusion, delirium, or disorientation is a red-flag symptom that needs urgent medical evaluation.',
    patterns: [
      /\b(confusion|confused|disoriented|delirious|delirium|not\s+making\s+sense|altered\s+mental\s+state)\b/i,
      /\b(bhramit|bhranti|abolsabol|abol\s+tabol|matha\s+kaaj\s+korche\s+na)\b/i,
      /(भ्रमित|अस्पष्ट बोलना|আবোলতাবোল|ভুল বকা)/i,
    ],
  },
  {
    id: 'allergic_swelling',
    label: 'Swelling of face, lips, or throat',
    reason:
      'Swelling of the face, lips, tongue, or throat can indicate a severe allergic reaction (anaphylaxis) and requires immediate emergency care.',
    patterns: [
      /\b(swelling\s+of\s+(the\s+)?(face|lips|throat|tongue)|swollen\s+(face|lips|throat|tongue)|(face|lips|throat|tongue)\s+(is\s+|are\s+)?swelling|anaphylaxis)\b/i,
      /\b(chehre\s+par\s+sujan|honth\s+(par\s+)?sujan|gale\s+mein\s+sujan|mukh\s+fule|thot\s+fule|gola\s+fule)\b/i,
      /(चेहरे पर सूजन|होंठ सूज|गले में सूजन|মুখ ফুলে|ঠোঁট ফুলে|গলা ফুলে)/i,
    ],
  },
  {
    id: 'severe_abdominal_pain',
    label: 'Severe abdominal pain',
    reason:
      'Severe abdominal or stomach pain requires urgent medical evaluation to rule out conditions such as appendicitis or internal injury.',
    patterns: [
      /\b(severe\s+(abdominal|stomach|belly|tummy)\s+pain|excruciating\s+(abdominal|stomach)\s+pain|unbearable\s+(abdominal|stomach)\s+pain|sharp\s+severe\s+(abdominal|stomach)\s+pain)\b/i,
      /\b(pet\s+mein\s+(tez|bahut|asahniya)\s+dard|tibro\s+pet\s*(byatha|betha)|pete\s+tibro\s*(byatha|betha))\b/i,
      /(पेट में तेज दर्द|पेट में बहुत दर्द|তীব্র পেট ব্যথা|পেটে তীব্র ব্যথা)/i,
    ],
  },
  {
    id: 'severe_dehydration',
    label: 'Severe dehydration (no urine)',
    reason:
      'Severe dehydration or passing no urine needs immediate medical treatment and fluids.',
    patterns: [
      /\b(severe\s+dehydration|no\s+urine|not\s+urinating|haven'?t\s+urinated|hasn'?t\s+urinated|unable\s+to\s+urinate|no\s+wet\s+diapers|zero\s+urine)\b/i,
      /\b(peshab\s+(band|nahi|ruka)|prosrab\s+(bondho|hocche\s+na|hoyni))\b/i,
      /(पेशाब नहीं|पेशाब बंद|প্রস্রাব বন্ধ|প্রস্রাব হচ্ছে না)/i,
    ],
  },
];

const FEVER_PATTERN = /\b(fever|high\s+temp(erature)?|bukhar|bukhaar|jor|jwar)\b|(बुखार|জ্বর)/i;
const STIFF_NECK_PATTERN =
  /\b(stiff\s+neck|neck\s+stiffness|rigid\s+neck|cannot\s+bend\s+neck|gardan\s+akad|ghar\s+shokto)\b|(गर्दन अकड़|ঘাড় শক্ত|ঘাড় শক্ত)/i;
const INFANT_FEVER_TEXT_PATTERN =
  /\b(newborn|infant|baby)\b.*\b(under\s+3\s+months?|[012]\s*months?|[1-9]\d?\s*weeks?\s*old|[1-9]\d?\s*days?\s*old)\b|\b(under\s+3\s+months?|[012]\s*months?\s*old)\b.*\b(baby|infant|newborn)\b|\b([12]\s*mash(er)?\s*(baccha|shishu))\b/i;

export function checkRedFlags(
  symptoms: SymptomInputData,
  patient: Partial<PatientDetailsData> = {}
): RedFlagCheckResult {
  const combinedText = [
    symptoms.notes || '',
    ...(symptoms.selectedSymptoms || []),
  ]
    .join(' ')
    .trim();

  const matchedFlags: string[] = [];
  const reasons: string[] = [];
  let isSelfHarm = false;

  // 1. Standard pattern rules
  for (const rule of RED_FLAG_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(combinedText))) {
      matchedFlags.push(rule.label);
      reasons.push(rule.reason);
      if (rule.isSelfHarm) {
        isSelfHarm = true;
      }
    }
  }

  // 2. High fever with stiff neck (text + chips combo)
  const hasFever =
    symptoms.selectedSymptoms.some((s) => s.toLowerCase() === 'fever') ||
    FEVER_PATTERN.test(combinedText);
  const hasStiffNeck = STIFF_NECK_PATTERN.test(combinedText);

  if (hasFever && hasStiffNeck) {
    matchedFlags.push('High fever with stiff neck');
    reasons.push(
      'Fever combined with a stiff neck can be a sign of meningitis and requires immediate emergency hospital evaluation.'
    );
  }

  // 3. Severe stomach pain via chip + severity
  const hasStomachPainChip = symptoms.selectedSymptoms.some(
    (s) => s.toLowerCase() === 'stomach pain' || s.toLowerCase() === 'abdominal pain'
  );
  if (
    hasStomachPainChip &&
    symptoms.severity === 'severe' &&
    !matchedFlags.includes('Severe abdominal pain')
  ) {
    matchedFlags.push('Severe abdominal pain');
    reasons.push(
      'Severe abdominal or stomach pain requires urgent medical evaluation.'
    );
  }

  // 4. Fever in a baby under 3 months
  const numericAge =
    typeof patient.age === 'number' && !Number.isNaN(patient.age) ? patient.age : null;
  const isBabyUnder3Months =
    Boolean(patient.isInfantUnder3Months) ||
    (numericAge !== null && numericAge >= 0 && numericAge < 0.25) ||
    INFANT_FEVER_TEXT_PATTERN.test(combinedText);

  if (hasFever && isBabyUnder3Months) {
    matchedFlags.push('Fever in a baby under 3 months');
    reasons.push(
      'Any fever in a baby under 3 months old requires immediate emergency medical evaluation.'
    );
  }

  if (matchedFlags.length === 0) {
    return {
      triggered: false,
      isSelfHarm: false,
      matchedFlags: [],
      reason: '',
    };
  }

  return {
    triggered: true,
    isSelfHarm,
    matchedFlags,
    reason: reasons[0],
  };
}
