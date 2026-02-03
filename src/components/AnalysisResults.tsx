import React from 'react';
import { AlertCircleIcon, CheckmarkCircle01Icon, Activity01Icon, ArrowUpRight01Icon, Loading03Icon } from 'hugeicons-react';
import { AnalysisData } from '../App';

interface AnalysisResultsProps {
  data: AnalysisData | null;
  isAnalyzing: boolean;
  error?: string | null;
}

export function AnalysisResults({ data, isAnalyzing, error }: AnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 p-6 h-full flex flex-col items-center justify-center">
        <Loading03Icon className="w-12 h-12 text-[#7C3AED] animate-spin mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">Processing Your Entry</h3>
        <div className="space-y-2 text-sm text-gray-600 text-center">
          <p className="animate-pulse tracking-tight">• Tokenizing text...</p>
          <p className="animate-pulse delay-100 tracking-tight">• Removing stopwords...</p>
          <p className="animate-pulse delay-200 tracking-tight">• Applying lemmatization...</p>
          <p className="animate-pulse delay-300 tracking-tight">• Running MentalBERT analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-[0.75px] border-red-200">
          <AlertCircleIcon className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">Analysis Error</h3>
        <p className="text-sm text-gray-600 max-w-sm tracking-tight mb-2">{error}</p>
        <p className="text-xs text-gray-500 max-w-sm tracking-tight">
          Start the backend with: <code className="bg-gray-100 px-1 rounded">cd backend && pip install -r requirements.txt && python -m uvicorn app:app --reload</code>
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-[0.75px] border-gray-200">
          <Activity01Icon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">Ready to Analyze</h3>
        <p className="text-sm text-gray-600 max-w-sm tracking-tight">
          Write your journal entry and click "Analyze Entry" to receive real-time mental health insights powered by MentalBERT.
        </p>
      </div>
    );
  }

  const isDepressed = data.classification === 'Depressed';

  return (
    <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b-[0.75px] border-gray-200 bg-[#7C3AED]">
        <div className="flex items-center gap-2">
          <ArrowUpRight01Icon className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white tracking-tight">Analysis Results</h2>
        </div>
        <p className="text-sm text-purple-100 mt-1 tracking-tight">
          Real-time NLP-powered assessment
        </p>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Classification Result */}
        <div className={`p-6 rounded-xl border-[0.75px] ${
          isDepressed 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            {isDepressed ? (
              <AlertCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            ) : (
              <CheckmarkCircle01Icon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 tracking-tight ${
                isDepressed ? 'text-red-900' : 'text-green-900'
              }`}>
                {data.classification}
              </h3>
              <p className={`text-sm mb-3 tracking-tight ${
                isDepressed ? 'text-red-700' : 'text-green-700'
              }`}>
                Model confidence: {(data.confidence * 100).toFixed(1)}%
              </p>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden border-[0.75px] border-gray-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    isDepressed ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${data.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emotion Detection */}
        <div className="border-[0.75px] border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4 tracking-tight">Emotion Detection</h3>
          <div className="space-y-3">
            {data.emotions.map((emotion, index) => (
              <div key={emotion.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 tracking-tight">{emotion.label}</span>
                  <span className="text-sm font-medium text-gray-900 tracking-tight">
                    {(emotion.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden border-[0.75px] border-gray-300">
                  <div
                    className={`h-full transition-all duration-500 ${
                      index === 0 
                        ? 'bg-[#7C3AED]'
                        : index === 1
                        ? 'bg-[#5B8DEE]'
                        : 'bg-gray-400'
                    }`}
                    style={{
                      width: `${emotion.score * 100}%`,
                      transitionDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preprocessing Steps */}
        <div className="border-[0.75px] border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3 tracking-tight">Processing Pipeline</h3>
          <div className="space-y-2">
            {data.preprocessingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckmarkCircle01Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 tracking-tight">{step}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 tracking-tight">
            Analysis completed at {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>

        {/* Clinical Note */}
        {isDepressed && (
          <div className="bg-amber-50 border-[0.75px] border-amber-200 rounded-xl p-5">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2 tracking-tight">
              <AlertCircleIcon className="w-5 h-5" />
              Important Notice
            </h4>
            <p className="text-sm text-amber-800 tracking-tight">
              This analysis suggests potential signs of depression. Please consider reaching out to a mental health professional for a comprehensive evaluation. If you're experiencing crisis, contact a crisis helpline immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}