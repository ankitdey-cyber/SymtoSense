import { useEffect, useState } from 'react';
import type {
  FilteredAnalysisResult,
  HistoryEntry,
  Language,
  PatientDetailsData,
  ScreenId,
  SymptomInputData,
} from './types';
import { checkRedFlags } from './safety/redFlags';
import { applySafetyFilter } from './safety/filter';
import { analyzeSymptoms } from './ai/client';
import {
  clearAllHistoryData,
  getHistoryOptIn,
  loadHistory,
  saveHistoryEntry,
  setHistoryOptIn,
} from './utils/storage';
import { AppShell } from './components/AppShell';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LandingScreen } from './screens/LandingScreen';
import { SymptomInputScreen } from './screens/SymptomInputScreen';
import { PatientDetailsScreen } from './screens/PatientDetailsScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { AboutSafetyScreen } from './screens/AboutSafetyScreen';

const INITIAL_SYMPTOMS: SymptomInputData = {
  notes: '',
  selectedSymptoms: [],
  duration: '1_3_days',
  severity: 'moderate',
};

const INITIAL_PATIENT: PatientDetailsData = {
  age: '',
  isInfantUnder3Months: false,
  sex: 'female',
  pregnantOrBreastfeeding: false,
  allergies: ['None known'],
  otherAllergies: '',
  existingConditions: [],
  otherConditions: '',
  currentMedicines: '',
  consentAccepted: false,
};

interface EmergencyState {
  reason: string;
  isSelfHarm: boolean;
  matchedFlags: string[];
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('landing');
  const [language, setLanguage] = useState<Language>('en');
  const [symptoms, setSymptoms] = useState<SymptomInputData>(INITIAL_SYMPTOMS);
  const [patient, setPatient] = useState<PatientDetailsData>(INITIAL_PATIENT);

  const [isAnalysing, setIsAnalysing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<FilteredAnalysisResult | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<string | undefined>(undefined);
  const [currentResultId, setCurrentResultId] = useState<string | null>(null);
  const [emergencyState, setEmergencyState] = useState<EmergencyState>({
    reason: '',
    isSelfHarm: false,
    matchedFlags: [],
  });

  const [historyOptIn, setHistoryOptInState] = useState<boolean>(() => getHistoryOptIn());
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [screen, isAnalysing]);

  const handleToggleHistoryOptIn = (next: boolean) => {
    setHistoryOptInState(next);
    setHistoryOptIn(next);
  };

  const resetCheckFlow = () => {
    setSymptoms(INITIAL_SYMPTOMS);
    setPatient(INITIAL_PATIENT);
    setCurrentResult(null);
    setCurrentTimestamp(undefined);
    setCurrentResultId(null);
    setApiError(null);
    setScreen('symptom-input');
  };

  const handleNavigate = (target: ScreenId) => {
    setApiError(null);
    setScreen(target);
  };

  const handleAnalyse = async () => {
    setApiError(null);

    // Step 3: BEFORE calling Gemini, run local rule-based red-flag check.
    // If any red flag matches, go straight to Emergency screen and do NOT call AI for medicines.
    const redFlag = checkRedFlags(symptoms, patient);
    if (redFlag.triggered) {
      setEmergencyState({
        reason: redFlag.reason,
        isSelfHarm: redFlag.isSelfHarm,
        matchedFlags: redFlag.matchedFlags,
      });
      setScreen('emergency');
      return;
    }

    setIsAnalysing(true);
    try {
      // Step 4 & 5: Call Gemini structured JSON endpoint (with Zod validation + 1 retry)
      const rawResult = await analyzeSymptoms({
        symptoms,
        patient,
        language,
      });

      // Step 6: Post-process with deterministic safety filter
      const filtered = applySafetyFilter(rawResult, patient, language);

      if (filtered.shouldRedirectToEmergency) {
        setEmergencyState({
          reason:
            filtered.emergencyReason ||
            rawResult.urgency_summary ||
            'Your symptoms may require urgent emergency care.',
          isSelfHarm: false,
          matchedFlags: [],
        });
        setScreen('emergency');
        return;
      }

      const entryId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `check-${Date.now()}`;
      const timestamp = new Date().toISOString();

      setCurrentResult(filtered);
      setCurrentTimestamp(timestamp);
      setCurrentResultId(entryId);

      // History saved ONLY in localStorage, ONLY if user opted in
      if (historyOptIn) {
        const entry: HistoryEntry = {
          id: entryId,
          timestamp,
          language,
          symptoms,
          patient,
          filteredResult: filtered,
        };
        setHistoryEntries(saveHistoryEntry(entry));
      }

      setScreen('results');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to analyse your symptoms right now. Please try again.';
      setApiError(message);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleSaveCurrentToHistory = () => {
    if (!currentResult || !currentResultId) return;
    handleToggleHistoryOptIn(true);
    const entry: HistoryEntry = {
      id: currentResultId,
      timestamp: currentTimestamp || new Date().toISOString(),
      language,
      symptoms,
      patient,
      filteredResult: currentResult,
    };
    setHistoryEntries(saveHistoryEntry(entry));
  };

  const handleOpenHistoryEntry = (entry: HistoryEntry) => {
    setSymptoms(entry.symptoms);
    setPatient(entry.patient);
    setCurrentResult(entry.filteredResult);
    setCurrentTimestamp(entry.timestamp);
    setCurrentResultId(entry.id);
    setScreen('results');
  };

  const handleDeleteAllHistory = () => {
    clearAllHistoryData();
    setHistoryEntries([]);
    setHistoryOptInState(false);
  };

  if (screen === 'emergency') {
    return (
      <EmergencyScreen
        language={language}
        onLanguageChange={setLanguage}
        reason={emergencyState.reason}
        isSelfHarm={emergencyState.isSelfHarm}
        matchedFlags={emergencyState.matchedFlags}
        onNavigate={handleNavigate}
        onStartNewCheck={resetCheckFlow}
      />
    );
  }

  const isCurrentResultSaved = Boolean(
    currentResultId && historyEntries.some((entry) => entry.id === currentResultId)
  );

  return (
    <AppShell
      activeScreen={screen}
      language={language}
      onLanguageChange={setLanguage}
      onNavigate={handleNavigate}
      footerExtraDisclaimer={
        screen === 'results' && currentResult?.result.disclaimer
          ? currentResult.result.disclaimer
          : undefined
      }
    >
      {isAnalysing ? (
        <LoadingOverlay language={language} />
      ) : screen === 'landing' ? (
        <LandingScreen language={language} onStartCheck={() => handleNavigate('symptom-input')} />
      ) : screen === 'symptom-input' ? (
        <SymptomInputScreen
          language={language}
          value={symptoms}
          onChange={setSymptoms}
          onNext={() => handleNavigate('patient-details')}
        />
      ) : screen === 'patient-details' ? (
        <PatientDetailsScreen
          language={language}
          value={patient}
          saveHistoryOptIn={historyOptIn}
          onToggleSaveHistoryOptIn={handleToggleHistoryOptIn}
          onChange={setPatient}
          onBack={() => handleNavigate('symptom-input')}
          onAnalyse={handleAnalyse}
          apiError={apiError}
        />
      ) : screen === 'results' && currentResult ? (
        <ResultsScreen
          language={language}
          symptoms={symptoms}
          patient={patient}
          filteredResult={currentResult}
          isSavedToHistory={isCurrentResultSaved}
          onSaveToHistory={handleSaveCurrentToHistory}
          onStartOver={resetCheckFlow}
          timestamp={currentTimestamp}
        />
      ) : screen === 'history' ? (
        <HistoryScreen
          language={language}
          entries={historyEntries}
          optIn={historyOptIn}
          onToggleOptIn={handleToggleHistoryOptIn}
          onOpenEntry={handleOpenHistoryEntry}
          onDeleteAll={handleDeleteAllHistory}
          onStartNewCheck={resetCheckFlow}
        />
      ) : (
        <AboutSafetyScreen language={language} onStartCheck={resetCheckFlow} />
      )}
    </AppShell>
  );
}
