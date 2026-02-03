import React, { useState } from 'react';
import { TextAnalysisInterface } from './components/TextAnalysisInterface';
import { AnalysisResults } from './components/AnalysisResults';
import { MentalHealthReport } from './components/MentalHealthReport';
import { Brain02Icon } from 'hugeicons-react';

export interface AnalysisData {
  classification: 'Depressed' | 'Not Depressed';
  confidence: number;
  emotions: {
    label: string;
    score: number;
  }[];
  preprocessingSteps: string[];
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisData[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 2000) }), // Limit payload size
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const detail = err.detail != null
          ? (Array.isArray(err.detail) ? err.detail.map((d: { msg?: string }) => d?.msg ?? d).join(' ') : String(err.detail))
          : `Request failed: ${res.status}`;
        throw new Error(detail);
      }
      const data: AnalysisData = await res.json();
      setAnalysisData(data);
      setAnalysisHistory(prev => [data, ...prev]);
    } catch (e) {
      const message = e instanceof Error
        ? (e.name === 'AbortError' ? 'Analysis timed out (45s). Try a shorter entry.' : e.message)
        : 'Analysis failed. Is the backend running?';
      setAnalysisError(message);
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#2D2A3D] border-b-[0.75px] border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center border-[0.75px] border-[#9F67FF]">
                <Brain02Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white tracking-tight">DeepEcho</h1>
                <p className="text-xs text-gray-300 tracking-tight">Mental Health Monitoring System</p>
              </div>
            </div>
            <button
              onClick={() => setShowReport(!showReport)}
              disabled={analysisHistory.length === 0}
              className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D2FD6] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:border-gray-700 text-sm tracking-tight border-[0.75px] border-[#9F67FF]"
            >
              {showReport ? 'Back to Analysis' : 'View Report'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showReport ? (
          <MentalHealthReport analysisHistory={analysisHistory} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Text Input */}
            <div className="lg:col-span-1">
              <TextAnalysisInterface
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-1">
              <AnalysisResults
                data={analysisData}
                isAnalyzing={isAnalyzing}
                error={analysisError}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t-[0.75px] border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 tracking-tight">
            This is a research tool for mental health monitoring. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;