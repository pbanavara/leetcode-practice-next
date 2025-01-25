'use client';

import { useState, useEffect } from 'react';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { PseudocodeEditor } from '@/components/PseudocodeEditor';
import { AnalysisFeedback } from '@/components/AnalysisFeedback';
import { WalkthroughInput } from '@/components/WalkthroughInput';
import { SessionProgress } from '@/components/SessionProgress';
import { api } from '@/lib/api';
import { PracticeSession } from '@/types';

export default function Home() {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [pseudocode, setPseudocode] = useState('');
  const [walkthrough, setWalkthrough] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [verification, setVerification] = useState('');
  const [iterations, setIterations] = useState(0);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    startNewSession();
  }, []);

  const startNewSession = async () => {
    try {
      const sessionData = await api.startSession(3);
      setSession(sessionData);
      resetState();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const resetState = () => {
    setPseudocode('');
    setWalkthrough('');
    setAnalysis('');
    setVerification('');
    setIterations(0);
    setShowWalkthrough(false);
  };

  const handleSubmitPseudocode = async () => {
    if (!session) return;
    try {
      const result = await api.submitPseudocode(session.session_id, pseudocode);
      setAnalysis(result.analysis);
      setIterations(result.iterations);

      if (result.analysis.includes('solid') || result.analysis.includes('correct')) {
        setShowWalkthrough(true);
      }
    } catch (error) {
      console.error('Error submitting pseudocode:', error);
    }
  };

  const handleSubmitWalkthrough = async () => {
    if (!session) return;
    try {
      const result = await api.submitWalkthrough(session.session_id, walkthrough);
      setVerification(result.verification);

      if (result.next_problem) {
        setTimeout(() => {
          setSession(prev => ({
            ...prev!,
            current_problem: result.next_problem
          }));
          resetState();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting walkthrough:', error);
    }
  };

  if (!session) return <div>Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <SessionProgress
        completedProblems={(session.current_problem?.id ?? 1) - 1}
        totalProblems={session.total_problems}
      />

      <ProblemDisplay problem={session.current_problem} />

      <PseudocodeEditor
        value={pseudocode}
        onChange={setPseudocode}
      />

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        onClick={handleSubmitPseudocode}
        disabled={showWalkthrough}
      >
        Submit Pseudocode
      </button>

      {analysis && (
        <AnalysisFeedback
          analysis={analysis}
          iterations={iterations}
        />
      )}

      {showWalkthrough && (
        <WalkthroughInput
          value={walkthrough}
          onChange={setWalkthrough}
          onSubmit={handleSubmitWalkthrough}
          verification={verification}
        />
      )}
    </main>
  );
}
