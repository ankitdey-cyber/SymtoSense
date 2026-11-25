import type { DurationOption, Language, LikelihoodLevel, SeverityLevel, SexOption, UrgencyLevel } from '../types';

export const SYMPTOM_CHIPS: Array<{ id: string; labels: Record<Language, string> }> = [
  { id: 'Fever', labels: { en: 'Fever', bn: 'জ্বর', hi: 'बुखार' } },
  { id: 'Headache', labels: { en: 'Headache', bn: 'মাথাব্যথা', hi: 'सिरदर्द' } },
  { id: 'Cough', labels: { en: 'Cough', bn: 'কাশি', hi: 'खांसी' } },
  { id: 'Sore throat', labels: { en: 'Sore throat', bn: 'গলা ব্যথা', hi: 'गले में खराश' } },
  { id: 'Stomach pain', labels: { en: 'Stomach pain', bn: 'পেট ব্যথা', hi: 'पेट दर्द' } },
  { id: 'Vomiting', labels: { en: 'Vomiting', bn: 'বমি', hi: 'उल्टी' } },
  { id: 'Diarrhoea', labels: { en: 'Diarrhoea', bn: 'ডায়রিয়া', hi: 'दस्त' } },
  { id: 'Rash', labels: { en: 'Rash', bn: 'ত্বকে র‍্যাশ', hi: 'चकत्ते (रैश)' } },
  { id: 'Fatigue', labels: { en: 'Fatigue', bn: 'ক্লান্তি', hi: 'थकान' } },
  { id: 'Body ache', labels: { en: 'Body ache', bn: 'গা ব্যথা', hi: 'बदन दर्द' } },
  { id: 'Dizziness', labels: { en: 'Dizziness', bn: 'মাথা ঘোরা', hi: 'चक्कर आना' } },
  { id: 'Runny nose', labels: { en: 'Runny nose', bn: 'সর্দি / নাক দিয়ে জল পড়া', hi: 'बहती नाक' } },
];

export const ALLERGY_CHIPS: Array<{ id: string; labels: Record<Language, string> }> = [
  { id: 'Penicillin', labels: { en: 'Penicillin', bn: 'পেনিসিলিন', hi: 'पेनिसिलिन' } },
  { id: 'Aspirin / NSAIDs', labels: { en: 'Aspirin / NSAIDs', bn: 'অ্যাসপিরিন / NSAIDs', hi: 'एस्पिरिन / NSAIDs' } },
  { id: 'Sulfa drugs', labels: { en: 'Sulfa drugs', bn: 'সালফা ওষুধ', hi: 'सल्फा दवाएं' } },
  { id: 'None known', labels: { en: 'None known', bn: 'কোনোটি জানা নেই', hi: 'कोई ज्ञात नहीं' } },
];

export const CONDITION_CHIPS: Array<{ id: string; labels: Record<Language, string> }> = [
  { id: 'Diabetes', labels: { en: 'Diabetes', bn: 'ডায়াবেটিস', hi: 'मधुमेह (डायबिटीज)' } },
  { id: 'BP', labels: { en: 'BP', bn: 'উচ্চ রক্তচাপ (BP)', hi: 'रक्तचाप (BP)' } },
  { id: 'Asthma', labels: { en: 'Asthma', bn: 'হাঁপানি (অ্যাজমা)', hi: 'अस्थमा (दमा)' } },
  { id: 'Heart disease', labels: { en: 'Heart disease', bn: 'হৃদরোগ', hi: 'हृदय रोग' } },
  { id: 'Kidney/Liver disease', labels: { en: 'Kidney/Liver disease', bn: 'কিডনি/লিভারের রোগ', hi: 'किडनी/लिवर की बीमारी' } },
  { id: 'Other', labels: { en: 'Other', bn: 'অন্যান্য', hi: 'अन्य' } },
];

export interface UIStrings {
  brand: string;
  navCheckSymptoms: string;
  navHistory: string;
  navAbout: string;
  disclaimerBanner: string;
  footerDisclaimer: string;
  landingBadge: string;
  landingHeadline: string;
  landingSubtitle: string;
  landingCta: string;
  landingFeaturesHeading: string;
  featureConditionsTitle: string;
  featureConditionsDesc: string;
  featureSelfCareTitle: string;
  featureSelfCareDesc: string;
  featureEmergencyTitle: string;
  featureEmergencyDesc: string;
  step1Label: string;
  step1Subtitle: string;
  describeLabel: string;
  describePlaceholder: string;
  selectSymptomsHeading: string;
  selectedCountSuffix: string;
  noSymptomsSelected: string;
  searchSymptomsPlaceholder: string;
  durationHeading: string;
  durations: Record<DurationOption, string>;
  severityHeading: string;
  severities: Record<SeverityLevel, string>;
  nextPatientDetails: string;
  symptomRequiredError: string;
  step2Label: string;
  backToSymptoms: string;
  patientDetailsHeading: string;
  ageLabel: string;
  agePlaceholder: string;
  infantUnder3MonthsLabel: string;
  sexLabel: string;
  sexOptions: Record<SexOption, string>;
  pregnantTitle: string;
  pregnantSubtitle: string;
  knownAllergiesHeading: string;
  otherAllergiesPlaceholder: string;
  existingConditionsHeading: string;
  otherConditionsPlaceholder: string;
  currentMedicinesLabel: string;
  currentMedicinesPlaceholder: string;
  saveHistoryOptInTitle: string;
  saveHistoryOptInDesc: string;
  consentLabel: string;
  consentRequiredError: string;
  analyseButton: string;
  loadingTitle: string;
  loadingSubtitle: string;
  loadingStep1: string;
  loadingStep2: string;
  loadingStep3: string;
  errorTitle: string;
  tryAgain: string;
  urgencyLabels: Record<UrgencyLevel, string>;
  likelihoodLabels: Record<LikelihoodLevel, string>;
  possibleConditionsHeading: string;
  selfCareHeading: string;
  otcHeading: string;
  otcFollowLabelNote: string;
  avoidHeading: string;
  seeDoctorIfHeading: string;
  followUpHeading: string;
  suggestedSpecialistLabel: string;
  findNearbyDoctors: string;
  downloadPdf: string;
  pdfReadyToast: string;
  saveToHistoryBtn: string;
  savedToHistoryBadge: string;
  startOver: string;
  emergencyHeadline: string;
  emergencyDefaultDesc: string;
  selfHarmSupportHeadline: string;
  selfHarmSupportMessage: string;
  callTeleManas: string;
  teleManasSubtext: string;
  call112: string;
  call108: string;
  findNearestHospital: string;
  emergencyNoMedicineNote: string;
  startNewCheck: string;
  historyHeading: string;
  historySubtitle: string;
  historyOptInBannerTitle: string;
  historyOptInBannerDesc: string;
  historyOptInOn: string;
  historyOptInOff: string;
  historyEmptyTitle: string;
  historyEmptyDesc: string;
  startNewCheckCta: string;
  viewFullResults: string;
  deleteAllData: string;
  deleteConfirmPrompt: string;
  cancel: string;
  yesDeleteAll: string;
  aboutHeading: string;
  aboutSubtitle: string;
  aboutHowTitle: string;
  aboutHowDesc: string;
  aboutRedFlagTitle: string;
  aboutRedFlagDesc: string;
  aboutOtcTitle: string;
  aboutOtcDesc: string;
  aboutPrivacyTitle: string;
  aboutPrivacyDesc: string;
  aboutHelplinesTitle: string;
  aboutHelplinesDesc: string;
}

export const TRANSLATIONS: Record<Language, UIStrings> = {
  en: {
    brand: 'SymptoSense',
    navCheckSymptoms: 'Check Symptoms',
    navHistory: 'History',
    navAbout: 'About',
    disclaimerBanner: 'SymptoSense gives information, not a diagnosis. In an emergency call 112.',
    footerDisclaimer: "SymptoSense is an informational guide and does not replace a doctor's evaluation. In an emergency call 112.",
    landingBadge: 'Calm, private symptom guidance',
    landingHeadline: 'Understand your symptoms. Know when to see a doctor.',
    landingSubtitle: 'Answer a few simple questions about how you feel to explore possible conditions, safe self-care steps, and clear guidance on when to seek medical care.',
    landingCta: 'Check Symptoms',
    landingFeaturesHeading: 'How SymptoSense helps',
    featureConditionsTitle: 'Possible conditions',
    featureConditionsDesc: 'See plain-language explanations of what may match your symptoms and why.',
    featureSelfCareTitle: 'Self-care & OTC guidance',
    featureSelfCareDesc: 'Practical home-care steps, common over-the-counter options, and safety cautions.',
    featureEmergencyTitle: 'Emergency alerts',
    featureEmergencyDesc: 'Immediate red-flag warnings with one-tap access to 112 and ambulance 108.',
    step1Label: 'Step 1 of 2',
    step1Subtitle: 'Your symptoms',
    describeLabel: 'Describe how you feel',
    describePlaceholder: "Example: I've had a mild fever and scratchy throat since yesterday evening, plus a dull headache.",
    selectSymptomsHeading: 'Select symptoms',
    selectedCountSuffix: 'selected',
    noSymptomsSelected: 'No symptoms selected yet. Tap below to add.',
    searchSymptomsPlaceholder: 'Search symptoms (e.g. fever, cough)',
    durationHeading: 'Duration',
    durations: {
      today: 'Today',
      '1_3_days': '1–3 days',
      '4_7_days': '4–7 days',
      over_a_week: 'Over a week',
    },
    severityHeading: 'Severity',
    severities: {
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
    },
    nextPatientDetails: 'Next: Patient Details',
    symptomRequiredError: 'Please describe your symptoms or select at least one symptom chip to continue.',
    step2Label: 'Step 2 of 2',
    backToSymptoms: 'Back to symptoms',
    patientDetailsHeading: 'Patient details',
    ageLabel: 'Age (years)',
    agePlaceholder: 'Enter age',
    infantUnder3MonthsLabel: 'Baby under 3 months old',
    sexLabel: 'Sex',
    sexOptions: {
      female: 'Female',
      male: 'Male',
      other: 'Other',
    },
    pregnantTitle: 'Pregnant or breastfeeding?',
    pregnantSubtitle: 'Helps filter unsafe OTC medicine options',
    knownAllergiesHeading: 'Known allergies',
    otherAllergiesPlaceholder: 'Other allergies (e.g., peanuts, latex)',
    existingConditionsHeading: 'Existing conditions',
    otherConditionsPlaceholder: 'Other existing conditions (optional)',
    currentMedicinesLabel: 'Current medicines',
    currentMedicinesPlaceholder: 'List any medicines or supplements you take',
    saveHistoryOptInTitle: 'Save this check on this device',
    saveHistoryOptInDesc: 'Optional. Stored only in your browser localStorage. Never sent to any database.',
    consentLabel: 'I understand this is not medical advice.',
    consentRequiredError: 'Please tick the box confirming you understand this is not medical advice.',
    analyseButton: 'Analyse Symptoms',
    loadingTitle: 'Reviewing your symptoms…',
    loadingSubtitle: 'Checking safety rules and preparing plain-language guidance.',
    loadingStep1: 'Red-flag safety screening complete',
    loadingStep2: 'Organising possible explanations & self-care steps',
    loadingStep3: 'Applying medicine safety filters',
    errorTitle: 'Could not complete analysis',
    tryAgain: 'Try again',
    urgencyLabels: {
      self_care: 'Self-care likely OK',
      see_doctor_1_2_days: 'See a doctor in 1–2 days',
      see_doctor_today: 'See a doctor today',
      emergency: 'Emergency',
    },
    likelihoodLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    possibleConditionsHeading: 'Possible conditions',
    selfCareHeading: 'Self-care steps',
    otcHeading: 'Common over-the-counter options',
    otcFollowLabelNote: 'Follow the label dose or ask a pharmacist',
    avoidHeading: 'Avoid',
    seeDoctorIfHeading: 'See a doctor if...',
    followUpHeading: 'Helpful follow-up questions to note',
    suggestedSpecialistLabel: 'Suggested specialist',
    findNearbyDoctors: 'Find nearby doctors',
    downloadPdf: 'Download summary (PDF)',
    pdfReadyToast: 'Summary PDF downloaded.',
    saveToHistoryBtn: 'Save to local history',
    savedToHistoryBadge: 'Saved privately on this device',
    startOver: 'Start over',
    emergencyHeadline: 'Your symptoms may need urgent care',
    emergencyDefaultDesc: 'Red-flag warning signs were detected. Please seek immediate emergency medical attention.',
    selfHarmSupportHeadline: 'You do not have to face this alone',
    selfHarmSupportMessage: 'If you are feeling overwhelmed or having thoughts of harming yourself, caring counsellors are available free and confidentially 24/7. Please call Tele-MANAS (14416) or emergency services (112) right now.',
    callTeleManas: 'Call Tele-MANAS 14416',
    teleManasSubtext: '24/7 free, confidential mental health helpline',
    call112: 'Call 112',
    call108: 'Call Ambulance 108',
    findNearestHospital: 'Find nearest hospital',
    emergencyNoMedicineNote: 'For your safety, no medicines or home remedies are suggested for emergency symptoms.',
    startNewCheck: 'Start new check',
    historyHeading: 'Past symptom checks',
    historySubtitle: 'Stored privately on this device. Tap any check to view its summary.',
    historyOptInBannerTitle: 'Save checks on this device',
    historyOptInBannerDesc: 'History is only saved in your browser when you opt in.',
    historyOptInOn: 'Saving ON',
    historyOptInOff: 'Saving OFF',
    historyEmptyTitle: 'No saved symptom checks yet',
    historyEmptyDesc: 'Turn on device saving above or opt in during a check to keep past summaries privately on this device.',
    startNewCheckCta: 'Start a new check',
    viewFullResults: 'View full results',
    deleteAllData: 'Delete all my data',
    deleteConfirmPrompt: 'Delete all saved symptom checks from this device? This cannot be undone.',
    cancel: 'Cancel',
    yesDeleteAll: 'Yes, delete all',
    aboutHeading: 'About & Safety',
    aboutSubtitle: 'How SymptoSense protects your safety and privacy at every step.',
    aboutHowTitle: 'Information, never a diagnosis',
    aboutHowDesc: 'SymptoSense helps you organise your symptoms, learn about possible explanations, and prepare for a doctor visit. It cannot examine you or replace a licensed doctor.',
    aboutRedFlagTitle: 'Instant local red-flag screening',
    aboutRedFlagDesc: 'Before any AI analysis runs, SymptoSense checks your inputs locally for 16 critical warning signs (such as chest pain, breathing trouble, stroke signs, severe bleeding, fever in a baby under 3 months, or self-harm). If any match, you are guided straight to emergency help with no medicine suggestions.',
    aboutOtcTitle: 'Strict OTC medicine safety filters',
    aboutOtcDesc: 'Prescription-only drugs (antibiotics, steroids, opioids, benzodiazepines, and injections) are automatically blocked, numeric doses are stripped, and OTC options are hidden for children under 12, adults 65+, pregnant or breastfeeding users, and anyone with existing conditions or current medicines.',
    aboutPrivacyTitle: 'Private by design',
    aboutPrivacyDesc: 'Your symptom history is never stored in a cloud database. It is saved only in your browser localStorage if you explicitly opt in, and you can erase everything with one tap.',
    aboutHelplinesTitle: 'Emergency helplines (India)',
    aboutHelplinesDesc: 'National Emergency: 112 · Ambulance: 108 · Tele-MANAS Mental Health Support (24/7): 14416.',
  },
  bn: {
    brand: 'SymptoSense',
    navCheckSymptoms: 'লক্ষণ যাচাই',
    navHistory: 'ইতিহাস',
    navAbout: 'সম্পর্কে',
    disclaimerBanner: 'SymptoSense কেবল তথ্য দেয়, কোনো রোগ নির্ণয় করে না। জরুরি অবস্থায় ১১২ নম্বরে কল করুন।',
    footerDisclaimer: 'SymptoSense একটি তথ্যমূলক নির্দেশিকা এবং এটি ডাক্তারের পরামর্শের বিকল্প নয়। জরুরি অবস্থায় ১১২ নম্বরে কল করুন।',
    landingBadge: 'শান্ত, ব্যক্তিগত লক্ষণ নির্দেশিকা',
    landingHeadline: 'আপনার লক্ষণ বুঝুন। কখন ডাক্তার দেখাবেন জানুন।',
    landingSubtitle: 'আপনার কেমন লাগছে সে সম্পর্কে কয়েকটি সহজ প্রশ্নের উত্তর দিন—সম্ভাব্য কারণ, নিরাপদ ঘরোয়া যত্ন এবং কখন চিকিৎসকের কাছে যাবেন তা স্পষ্টভাবে জানুন।',
    landingCta: 'লক্ষণ যাচাই করুন',
    landingFeaturesHeading: 'SymptoSense কীভাবে সাহায্য করে',
    featureConditionsTitle: 'সম্ভাব্য কারণসমূহ',
    featureConditionsDesc: 'সহজ ভাষায় জানুন কোন অবস্থা আপনার লক্ষণের সাথে মিলতে পারে এবং কেন।',
    featureSelfCareTitle: 'ঘরোয়া যত্ন ও সাধারণ ওষুধের তথ্য',
    featureSelfCareDesc: 'নিরাপদ ঘরোয়া পরিচর্যা, সাধারণ ওটিসি বিকল্প এবং প্রয়োজনীয় সতর্কতা।',
    featureEmergencyTitle: 'জরুরি সতর্কবার্তা',
    featureEmergencyDesc: 'বিপজ্জনক লক্ষণে তাৎক্ষণিক সতর্কতা এবং ১১২ ও ১০৮ অ্যাম্বুলেন্সে দ্রুত কল করার সুবিধা।',
    step1Label: 'ধাপ ১ / ২',
    step1Subtitle: 'আপনার লক্ষণসমূহ',
    describeLabel: 'আপনার কেমন লাগছে লিখুন',
    describePlaceholder: 'উদাহরণ: গতকাল সন্ধ্যা থেকে হালকা জ্বর, গলা ব্যথা এবং হালকা মাথাব্যথা হচ্ছে।',
    selectSymptomsHeading: 'লক্ষণ নির্বাচন করুন',
    selectedCountSuffix: 'টি নির্বাচিত',
    noSymptomsSelected: 'এখনো কোনো লক্ষণ নির্বাচন করা হয়নি। নিচে ট্যাপ করে যোগ করুন।',
    searchSymptomsPlaceholder: 'লক্ষণ খুঁজুন (যেমন: জ্বর, কাশি)',
    durationHeading: 'কতদিন ধরে হচ্ছে',
    durations: {
      today: 'আজ থেকে',
      '1_3_days': '১–৩ দিন',
      '4_7_days': '৪–৭ দিন',
      over_a_week: 'এক সপ্তাহের বেশি',
    },
    severityHeading: 'তীব্রতা',
    severities: {
      mild: 'হালকা',
      moderate: 'মাঝারি',
      severe: 'তীব্র',
    },
    nextPatientDetails: 'পরবর্তী: রোগীর তথ্য',
    symptomRequiredError: 'চালিয়ে যেতে আপনার লক্ষণ লিখুন অথবা কমপক্ষে একটি লক্ষণ নির্বাচন করুন।',
    step2Label: 'ধাপ ২ / ২',
    backToSymptoms: 'লক্ষণে ফিরে যান',
    patientDetailsHeading: 'রোগীর তথ্য',
    ageLabel: 'বয়স (বছর)',
    agePlaceholder: 'বয়স লিখুন',
    infantUnder3MonthsLabel: '৩ মাসের কম বয়সী শিশু',
    sexLabel: 'লিঙ্গ',
    sexOptions: {
      female: 'মহিলা',
      male: 'পুরুষ',
      other: 'অন্যান্য',
    },
    pregnantTitle: 'গর্ভবতী বা স্তন্যদানকারী?',
    pregnantSubtitle: 'অনিরাপদ ওটিসি ওষুধ বাদ দিতে সাহায্য করে',
    knownAllergiesHeading: 'জানা অ্যালার্জি',
    otherAllergiesPlaceholder: 'অন্যান্য অ্যালার্জি (যেমন: বাদাম, ল্যাটেক্স)',
    existingConditionsHeading: 'পূর্ববর্তী রোগবালাই',
    otherConditionsPlaceholder: 'অন্য কোনো দীর্ঘমেয়াদী রোগ (ঐচ্ছিক)',
    currentMedicinesLabel: 'বর্তমানে চলা ওষুধ',
    currentMedicinesPlaceholder: 'আপনি বর্তমানে যে ওষুধ বা সাপ্লিমেন্ট খাচ্ছেন তা লিখুন',
    saveHistoryOptInTitle: 'এই ডিভাইসে ইতিহাস সংরক্ষণ করুন',
    saveHistoryOptInDesc: 'ঐচ্ছিক। শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত থাকবে, কোনো সার্ভারে নয়।',
    consentLabel: 'আমি বুঝতে পারছি যে এটি কোনো চিকিৎসা পরামর্শ নয়।',
    consentRequiredError: 'অনুগ্রহ করে সম্মতি বক্সে টিক দিন।',
    analyseButton: 'লক্ষণ বিশ্লেষণ করুন',
    loadingTitle: 'আপনার লক্ষণ পর্যালোচনা করা হচ্ছে…',
    loadingSubtitle: 'নিরাপত্তা যাচাই এবং সহজ ভাষায় নির্দেশিকা তৈরি করা হচ্ছে।',
    loadingStep1: 'জরুরি সতর্কতা যাচাই সম্পন্ন হয়েছে',
    loadingStep2: 'সম্ভাব্য কারণ ও ঘরোয়া যত্ন সাজানো হচ্ছে',
    loadingStep3: 'ওষুধের নিরাপত্তা ফিল্টার প্রয়োগ করা হচ্ছে',
    errorTitle: 'বিশ্লেষণ সম্পন্ন করা যায়নি',
    tryAgain: 'আবার চেষ্টা করুন',
    urgencyLabels: {
      self_care: 'ঘরোয়া যত্নেই সম্ভবত ঠিক হবে',
      see_doctor_1_2_days: '১–২ দিনের মধ্যে ডাক্তার দেখান',
      see_doctor_today: 'আজই ডাক্তার দেখান',
      emergency: 'জরুরি অবস্থা',
    },
    likelihoodLabels: {
      high: 'বেশি',
      medium: 'মাঝারি',
      low: 'কম',
    },
    possibleConditionsHeading: 'সম্ভাব্য কারণসমূহ',
    selfCareHeading: 'ঘরোয়া যত্নের ধাপ',
    otcHeading: 'সাধারণ ওভার-দ্য-কাউন্টার বিকল্প',
    otcFollowLabelNote: 'প্যাকেটের নির্দেশিকা মেনে চলুন অথবা ফার্মাসিস্টের পরামর্শ নিন',
    avoidHeading: 'যা এড়িয়ে চলবেন',
    seeDoctorIfHeading: 'কখন ডাক্তার দেখাবেন...',
    followUpHeading: 'মনে রাখার মতো প্রশ্নসমূহ',
    suggestedSpecialistLabel: 'প্রস্তাবিত বিশেষজ্ঞ',
    findNearbyDoctors: 'কাছাকাছি ডাক্তার খুঁজুন',
    downloadPdf: 'সারাংশ ডাউনলোড (PDF)',
    pdfReadyToast: 'সারাংশ PDF ডাউনলোড হয়েছে।',
    saveToHistoryBtn: 'স্থানীয় ইতিহাসে সংরক্ষণ করুন',
    savedToHistoryBadge: 'এই ডিভাইসে গোপনে সংরক্ষিত',
    startOver: 'নতুন করে শুরু করুন',
    emergencyHeadline: 'আপনার লক্ষণগুলোর জন্য জরুরি চিকিৎসা প্রয়োজন হতে পারে',
    emergencyDefaultDesc: 'বিপজ্জনক লক্ষণ শনাক্ত হয়েছে। অনুগ্রহ করে অবিলম্বে জরুরি চিকিৎসা নিন।',
    selfHarmSupportHeadline: 'আপনি একা নন—সাহায্য হাতের কাছেই আছে',
    selfHarmSupportMessage: 'আপনি যদি অত্যন্ত মানসিক চাপে থাকেন বা নিজের ক্ষতি করার কথা ভাবেন, তবে ২৪/৭ বিনামূল্যে এবং গোপনীয়ভাবে পরামর্শদাতারা আপনার পাশে আছেন। অনুগ্রহ করে এখনই টেলি-মানস (১৪৪১৬) বা ১১২ নম্বরে কল করুন।',
    callTeleManas: 'টেলি-মানস ১৪৪১৬-এ কল করুন',
    teleManasSubtext: '২৪/৭ বিনামূল্যে ও গোপনীয় মানসিক স্বাস্থ্য সহায়তা',
    call112: '১১২ নম্বরে কল করুন',
    call108: 'অ্যাম্বুলেন্স ১০৮-এ কল করুন',
    findNearestHospital: 'নিকটতম হাসপাতাল খুঁজুন',
    emergencyNoMedicineNote: 'আপনার নিরাপত্তার জন্য জরুরি লক্ষণে কোনো ওষুধ বা ঘরোয়া প্রতিকারের পরামর্শ দেওয়া হয় না।',
    startNewCheck: 'নতুন যাচাই শুরু করুন',
    historyHeading: 'পূর্ববর্তী লক্ষণ যাচাই',
    historySubtitle: 'শুধুমাত্র এই ডিভাইসে গোপনে সংরক্ষিত। বিস্তারিত দেখতে ট্যাপ করুন।',
    historyOptInBannerTitle: 'এই ডিভাইসে সংরক্ষণ',
    historyOptInBannerDesc: 'আপনি অনুমতি দিলেই কেবল ব্রাউজারে ইতিহাস সংরক্ষিত হবে।',
    historyOptInOn: 'সংরক্ষণ চালু',
    historyOptInOff: 'সংরক্ষণ বন্ধ',
    historyEmptyTitle: 'কোনো সংরক্ষিত ইতিহাস নেই',
    historyEmptyDesc: 'ইতিহাস রাখতে উপরে সংরক্ষণ চালু করুন অথবা লক্ষণ যাচাইয়ের সময় সংরক্ষণ নির্বাচন করুন।',
    startNewCheckCta: 'নতুন যাচাই শুরু করুন',
    viewFullResults: 'সম্পূর্ণ ফলাফল দেখুন',
    deleteAllData: 'আমার সব তথ্য মুছে ফেলুন',
    deleteConfirmPrompt: 'এই ডিভাইস থেকে সব সংরক্ষিত ইতিহাস মুছে ফেলবেন? এটি আর ফিরিয়ে আনা যাবে না।',
    cancel: 'বাতিল',
    yesDeleteAll: 'হ্যাঁ, সব মুছুন',
    aboutHeading: 'সম্পর্কে ও নিরাপত্তা',
    aboutSubtitle: 'SymptoSense কীভাবে প্রতিটি ধাপে আপনার নিরাপত্তা ও গোপনীয়তা রক্ষা করে।',
    aboutHowTitle: 'তথ্যমূলক নির্দেশিকা, রোগ নির্ণয় নয়',
    aboutHowDesc: 'SymptoSense আপনার লক্ষণ গুছিয়ে নিতে এবং ডাক্তারের সাথে কথা বলার প্রস্তুতিতে সাহায্য করে। এটি কখনোই চিকিৎসকের বিকল্প নয়।',
    aboutRedFlagTitle: 'তাৎক্ষণিক স্থানীয় বিপদ-সংকেত যাচাই',
    aboutRedFlagDesc: 'এআই ব্যবহারের আগেই ১৬টি গুরুতর জরুরি লক্ষণ (যেমন বুক ব্যথা, শ্বাসকষ্ট, স্ট্রোকের লক্ষণ, ৩ মাসের কম শিশুর জ্বর বা আত্মহত্যার চিন্তা) যাচাই করা হয় এবং সরাসরি জরুরি সহায়তায় পাঠানো হয়।',
    aboutOtcTitle: 'কঠোর ওটিসি ওষুধ নিরাপত্তা ফিল্টার',
    aboutOtcDesc: 'প্রেসক্রিপশন ওষুধ (অ্যান্টিবায়োটিক, স্টেরয়েড, ওপিওয়েড, ইনজেকশন) স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়, সংখ্যাগত মাত্রা সরিয়ে ফেলা হয় এবং শিশু, প্রবীণ, গর্ভবতী বা পূর্ববর্তী রোগীদের জন্য ওটিসি তালিকা লুকানো থাকে।',
    aboutPrivacyTitle: 'সম্পূর্ণ ব্যক্তিগত',
    aboutPrivacyDesc: 'কোনো ডেটাবেসে আপনার ইতিহাস জমা হয় না। আপনি অনুমতি দিলেই কেবল আপনার ডিভাইসে সংরক্ষিত থাকে এবং এক ট্যাপেই মুছে ফেলা যায়।',
    aboutHelplinesTitle: 'জরুরি হেল্পলাইন (ভারত)',
    aboutHelplinesDesc: 'জাতীয় জরুরি সেবা: ১১২ · অ্যাম্বুলেন্স: ১০৮ · টেলি-মানস মানসিক স্বাস্থ্য সহায়তা (২৪/৭): ১৪৪১৬।',
  },
  hi: {
    brand: 'SymptoSense',
    navCheckSymptoms: 'लक्षण जांचें',
    navHistory: 'इतिहास',
    navAbout: 'जानकारी',
    disclaimerBanner: 'SymptoSense केवल जानकारी देता है, निदान नहीं। आपात स्थिति में 112 पर कॉल करें।',
    footerDisclaimer: 'SymptoSense एक जानकारीपूर्ण मार्गदर्शिका है और डॉक्टर की जांच का विकल्प नहीं है। आपात स्थिति में 112 पर कॉल करें।',
    landingBadge: 'शांत, निजी लक्षण मार्गदर्शन',
    landingHeadline: 'अपने लक्षणों को समझें। जानें डॉक्टर को कब दिखाना है।',
    landingSubtitle: 'आप कैसा महसूस कर रहे हैं, इसके बारे में कुछ सरल प्रश्नों के उत्तर दें और संभावित स्थितियां, सुरक्षित घरेलू देखभाल व डॉक्टर के पास जाने का सही समय जानें।',
    landingCta: 'लक्षण जांचें',
    landingFeaturesHeading: 'SymptoSense कैसे मदद करता है',
    featureConditionsTitle: 'संभावित स्थितियां',
    featureConditionsDesc: 'सरल भाषा में जानें कि आपके लक्षण किन स्थितियों से मेल खा सकते हैं और क्यों।',
    featureSelfCareTitle: 'घरेलू देखभाल और ओटीसी जानकारी',
    featureSelfCareDesc: 'व्यावहारिक घरेलू उपाय, सामान्य ओटीसी विकल्प और आवश्यक सावधानियां।',
    featureEmergencyTitle: 'आपातकालीन अलर्ट',
    featureEmergencyDesc: 'गंभीर चेतावनी संकेतों पर तुरंत अलर्ट और 112 व एंबुलेंस 108 पर एक-टैप कॉल।',
    step1Label: 'चरण 1 / 2',
    step1Subtitle: 'आपके लक्षण',
    describeLabel: 'बताएं कि आप कैसा महसूस कर रहे हैं',
    describePlaceholder: 'उदाहरण: कल शाम से हल्का बुखार, गले में खराश और हल्का सिरदर्द है।',
    selectSymptomsHeading: 'लक्षण चुनें',
    selectedCountSuffix: 'चुने गए',
    noSymptomsSelected: 'अभी कोई लक्षण नहीं चुना गया है। जोड़ने के लिए नीचे टैप करें।',
    searchSymptomsPlaceholder: 'लक्षण खोजें (जैसे: बुखार, खांसी)',
    durationHeading: 'अवधि',
    durations: {
      today: 'आज से',
      '1_3_days': '1–3 दिन',
      '4_7_days': '4–7 दिन',
      over_a_week: 'एक सप्ताह से अधिक',
    },
    severityHeading: 'गंभीरता',
    severities: {
      mild: 'हल्का',
      moderate: 'मध्यम',
      severe: 'गंभीर',
    },
    nextPatientDetails: 'अगला: रोगी विवरण',
    symptomRequiredError: 'आगे बढ़ने के लिए कृपया अपने लक्षण लिखें या कम से कम एक लक्षण चुनें।',
    step2Label: 'चरण 2 / 2',
    backToSymptoms: 'लक्षणों पर वापस जाएं',
    patientDetailsHeading: 'रोगी का विवरण',
    ageLabel: 'उम्र (वर्ष)',
    agePlaceholder: 'उम्र दर्ज करें',
    infantUnder3MonthsLabel: '3 महीने से कम उम्र का शिशु',
    sexLabel: 'लिंग',
    sexOptions: {
      female: 'महिला',
      male: 'पुरुष',
      other: 'अन्य',
    },
    pregnantTitle: 'गर्भवती या स्तनपान करा रही हैं?',
    pregnantSubtitle: 'असुरक्षित ओटीसी दवाओं को फ़िल्टर करने में मदद करता है',
    knownAllergiesHeading: 'ज्ञात एलर्जी',
    otherAllergiesPlaceholder: 'अन्य एलर्जी (जैसे: मूंगफली, लेटेक्स)',
    existingConditionsHeading: 'मौजूदा बीमारियां',
    otherConditionsPlaceholder: 'कोई अन्य मौजूदा स्थिति (वैकल्पिक)',
    currentMedicinesLabel: 'वर्तमान दवाएं',
    currentMedicinesPlaceholder: 'आप जो भी दवाएं या सप्लीमेंट ले रहे हैं, लिखें',
    saveHistoryOptInTitle: 'इस जांच को इस डिवाइस पर सहेजें',
    saveHistoryOptInDesc: 'वैकल्पिक। केवल आपके ब्राउज़र के localStorage में सहेजा जाएगा।',
    consentLabel: 'मैं समझता/समझती हूं कि यह चिकित्सकीय सलाह नहीं है।',
    consentRequiredError: 'कृपया आगे बढ़ने से पहले सहमति बॉक्स पर टिक करें।',
    analyseButton: 'लक्षणों का विश्लेषण करें',
    loadingTitle: 'आपके लक्षणों की समीक्षा की जा रही है…',
    loadingSubtitle: 'सुरक्षा नियमों की जांच और सरल भाषा में मार्गदर्शन तैयार किया जा रहा है।',
    loadingStep1: 'आपातकालीन संकेत जांच पूरी हुई',
    loadingStep2: 'संभावित कारण और घरेलू देखभाल तैयार की जा रही है',
    loadingStep3: 'दवा सुरक्षा फ़िल्टर लागू किए जा रहे हैं',
    errorTitle: 'विश्लेषण पूरा नहीं हो सका',
    tryAgain: 'पुनः प्रयास करें',
    urgencyLabels: {
      self_care: 'घरेलू देखभाल संभवतः ठीक है',
      see_doctor_1_2_days: '1–2 दिनों में डॉक्टर को दिखाएं',
      see_doctor_today: 'आज ही डॉक्टर को दिखाएं',
      emergency: 'आपातकाल',
    },
    likelihoodLabels: {
      high: 'अधिक',
      medium: 'मध्यम',
      low: 'कम',
    },
    possibleConditionsHeading: 'संभावित स्थितियां',
    selfCareHeading: 'घरेलू देखभाल के कदम',
    otcHeading: 'सामान्य ओवर-द-काउंटर विकल्प',
    otcFollowLabelNote: 'लेबल की खुराक का पालन करें या फार्मासिस्ट से पूछें',
    avoidHeading: 'इनसे बचें',
    seeDoctorIfHeading: 'डॉक्टर को दिखाएं यदि...',
    followUpHeading: 'ध्यान रखने योग्य प्रश्न',
    suggestedSpecialistLabel: 'सुझाए गए विशेषज्ञ',
    findNearbyDoctors: 'नजदीकी डॉक्टर खोजें',
    downloadPdf: 'सारांश डाउनलोड करें (PDF)',
    pdfReadyToast: 'सारांश PDF डाउनलोड हो गया है।',
    saveToHistoryBtn: 'स्थानीय इतिहास में सहेजें',
    savedToHistoryBadge: 'इस डिवाइस पर निजी रूप से सहेजा गया',
    startOver: 'फिर से शुरू करें',
    emergencyHeadline: 'आपके लक्षणों को तत्काल देखभाल की आवश्यकता हो सकती है',
    emergencyDefaultDesc: 'गंभीर चेतावनी संकेत पाए गए हैं। कृपया तुरंत आपातकालीन चिकित्सा सहायता लें।',
    selfHarmSupportHeadline: 'आप अकेले नहीं हैं — मदद उपलब्ध है',
    selfHarmSupportMessage: 'यदि आप बहुत तनाव में हैं या स्वयं को नुकसान पहुंचाने के विचार आ रहे हैं, तो 24/7 निःशुल्क और गोपनीय परामर्श उपलब्ध है। कृपया अभी टेली-मानस (14416) या 112 पर कॉल करें।',
    callTeleManas: 'टेली-मानस 14416 पर कॉल करें',
    teleManasSubtext: '24/7 निःशुल्क, गोपनीय मानसिक स्वास्थ्य हेल्पलाइन',
    call112: '112 पर कॉल करें',
    call108: 'एंबुलेंस 108 पर कॉल करें',
    findNearestHospital: 'निकटतम अस्पताल खोजें',
    emergencyNoMedicineNote: 'आपकी सुरक्षा के लिए आपातकालीन लक्षणों में कोई दवा या घरेलू उपाय नहीं सुझाया जाता है।',
    startNewCheck: 'नई जांच शुरू करें',
    historyHeading: 'पिछली लक्षण जांचें',
    historySubtitle: 'इस डिवाइस पर निजी रूप से सहेजा गया। सारांश देखने के लिए किसी भी जांच पर टैप करें।',
    historyOptInBannerTitle: 'इस डिवाइस पर जांच सहेजें',
    historyOptInBannerDesc: 'इतिहास केवल आपकी सहमति से ही ब्राउज़र में सहेजा जाता है।',
    historyOptInOn: 'सेविंग चालू',
    historyOptInOff: 'सेविंग बंद',
    historyEmptyTitle: 'अभी कोई सहेजी गई जांच नहीं है',
    historyEmptyDesc: 'अपने डिवाइस पर सारांश रखने के लिए ऊपर सेविंग चालू करें या जांच के दौरान सहमति चुनें।',
    startNewCheckCta: 'नई जांच शुरू करें',
    viewFullResults: 'पूरा परिणाम देखें',
    deleteAllData: 'मेरा सारा डेटा हटाएं',
    deleteConfirmPrompt: 'इस डिवाइस से सभी सहेजी गई जांचें हटाएं? इसे वापस नहीं लाया जा सकता।',
    cancel: 'रद्द करें',
    yesDeleteAll: 'हां, सब हटाएं',
    aboutHeading: 'जानकारी और सुरक्षा',
    aboutSubtitle: 'SymptoSense हर कदम पर आपकी सुरक्षा और गोपनीयता कैसे सुनिश्चित करता है।',
    aboutHowTitle: 'केवल जानकारी, निदान नहीं',
    aboutHowDesc: 'SymptoSense आपको लक्षणों को व्यवस्थित करने और डॉक्टर से मिलने की तैयारी करने में मदद करता है। यह किसी डॉक्टर का विकल्प नहीं है।',
    aboutRedFlagTitle: 'तत्काल स्थानीय रेड-फ्लैग जांच',
    aboutRedFlagDesc: 'एआई विश्लेषण से पहले ही 16 गंभीर आपातकालीन संकेतों (जैसे सीने में दर्द, सांस लेने में तकलीफ, स्ट्रोक के संकेत, 3 महीने से छोटे शिशु में बुखार या आत्म-हानि) की जांच की जाती है और बिना दवा सुझाव के तुरंत आपातकालीन सहायता दिखाई जाती है।',
    aboutOtcTitle: 'सख्त ओटीसी दवा सुरक्षा फ़िल्टर',
    aboutOtcDesc: 'प्रिस्क्रिप्शन दवाएं (एंटीबायोटिक्स, स्टेरॉयड, ओपिओइड, इंजेक्शन) स्वतः हटाई जाती हैं, संख्यात्मक खुराक हटाई जाती है, और 12 वर्ष से कम, 65+, गर्भवती/स्तनपान कराने वाली महिलाओं व पहले से बीमार या दवा ले रहे लोगों के लिए ओटीसी अनुभाग छिपा रहता है।',
    aboutPrivacyTitle: 'पूरी तरह निजी',
    aboutPrivacyDesc: 'आपका डेटा किसी क्लाउड डेटाबेस में नहीं जाता। केवल आपकी सहमति पर ब्राउज़र के localStorage में सहेजा जाता है और एक टैप में मिटाया जा सकता है।',
    aboutHelplinesTitle: 'आपातकालीन हेल्पलाइन (भारत)',
    aboutHelplinesDesc: 'राष्ट्रीय आपातकाल: 112 · एंबुलेंस: 108 · टेली-मानस मानसिक स्वास्थ्य सहायता (24/7): 14416।',
  },
};

export function getSymptomLabel(id: string, lang: Language): string {
  const found = SYMPTOM_CHIPS.find((c) => c.id.toLowerCase() === id.toLowerCase());
  return found ? found.labels[lang] : id;
}
