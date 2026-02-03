import React from 'react';
import { AnalysisData } from '../App';
import { File02Icon, ArrowDownRight01Icon, ArrowUpRight01Icon, Calendar03Icon, Alert02Icon, Brain02Icon } from 'hugeicons-react';

interface MentalHealthReportProps {
  analysisHistory: AnalysisData[];
}

export function MentalHealthReport({ analysisHistory }: MentalHealthReportProps) {
  if (analysisHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 p-12 text-center">
        <File02Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2 tracking-tight">No Data Available</h3>
        <p className="text-gray-600 tracking-tight">
          Complete at least one analysis to view your mental health report.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalEntries = analysisHistory.length;
  const depressedCount = analysisHistory.filter(a => a.classification === 'Depressed').length;
  const averageConfidence = analysisHistory.reduce((sum, a) => sum + a.confidence, 0) / totalEntries;
  
  // Aggregate emotion scores
  const emotionAggregates: { [key: string]: number[] } = {};
  analysisHistory.forEach(analysis => {
    analysis.emotions.forEach(emotion => {
      if (!emotionAggregates[emotion.label]) {
        emotionAggregates[emotion.label] = [];
      }
      emotionAggregates[emotion.label].push(emotion.score);
    });
  });

  const averageEmotions = Object.entries(emotionAggregates).map(([label, scores]) => ({
    label,
    average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
  })).sort((a, b) => b.average - a.average);

  const depressionRate = (depressedCount / totalEntries) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-xl flex items-center justify-center border-[0.75px] border-[#9F67FF]">
            <Brain02Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Mental Health Report</h2>
            <p className="text-sm text-gray-600 tracking-tight">Comprehensive analysis summary</p>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 tracking-tight">Total Entries</span>
            <Calendar03Icon className="w-5 h-5 text-[#5B8DEE]" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{totalEntries}</p>
        </div>

        <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 tracking-tight">Depression Indicators</span>
            <Alert02Icon className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{depressedCount}</p>
          <p className="text-xs text-gray-500 mt-1 tracking-tight">{depressionRate.toFixed(0)}% of entries</p>
        </div>

        <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 tracking-tight">Avg. Confidence</span>
            <ArrowUpRight01Icon className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{(averageConfidence * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 tracking-tight">Dominant Emotion</span>
            <Brain02Icon className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{averageEmotions[0]?.label || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1 tracking-tight">
            {((averageEmotions[0]?.average || 0) * 100).toFixed(0)}% intensity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Emotion Scores */}
        <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 tracking-tight">Average Emotion Scores</h3>
          <div className="space-y-4">
            {averageEmotions.slice(0, 5).map((emotion, index) => {
              const percentage = emotion.average * 100;
              return (
                <div key={emotion.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 tracking-tight">{emotion.label}</span>
                    <span className="text-sm font-medium text-gray-900 tracking-tight">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-[0.75px] border-gray-300">
                    <div
                      className={`h-full transition-all duration-500 ${
                        index === 0
                          ? 'bg-[#7C3AED]'
                          : index === 1
                          ? 'bg-[#5B8DEE]'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={`rounded-xl border-[0.75px] p-6 ${
        depressionRate > 50
          ? 'bg-red-50 border-red-200'
          : depressionRate > 30
          ? 'bg-amber-50 border-amber-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-4">
          {depressionRate > 50 ? (
            <Alert02Icon className="w-8 h-8 text-red-600 flex-shrink-0" />
          ) : depressionRate > 30 ? (
            <Alert02Icon className="w-8 h-8 text-amber-600 flex-shrink-0" />
          ) : (
            <ArrowDownRight01Icon className="w-8 h-8 text-green-600 flex-shrink-0" />
          )}
          <div>
            <h3 className={`font-semibold mb-2 tracking-tight ${
              depressionRate > 50
                ? 'text-red-900'
                : depressionRate > 30
                ? 'text-amber-900'
                : 'text-green-900'
            }`}>
              {depressionRate > 50
                ? 'High Risk Indicators'
                : depressionRate > 30
                ? 'Moderate Risk Indicators'
                : 'Low Risk Indicators'}
            </h3>
            <p className={`text-sm mb-3 tracking-tight ${
              depressionRate > 50
                ? 'text-red-800'
                : depressionRate > 30
                ? 'text-amber-800'
                : 'text-green-800'
            }`}>
              {depressionRate > 50
                ? 'The analysis shows consistent patterns associated with depression across your entries. It\'s strongly recommended to consult with a mental health professional.'
                : depressionRate > 30
                ? 'Some entries indicate potential signs of mental distress. Consider discussing these feelings with a counselor or therapist.'
                : 'Your entries show generally positive mental health indicators. Continue maintaining healthy habits and emotional awareness.'}
            </p>
            <div className={`text-xs tracking-tight ${
              depressionRate > 50
                ? 'text-red-700'
                : depressionRate > 30
                ? 'text-amber-700'
                : 'text-green-700'
            }`}>
              <strong>Important:</strong> This tool provides insights based on text analysis and is not a clinical diagnosis. 
              Always consult healthcare professionals for proper evaluation and treatment.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries Timeline */}
      <div className="bg-white rounded-xl border-[0.75px] border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 tracking-tight">Recent Analysis Timeline</h3>
        <div className="space-y-3">
          {analysisHistory.slice(0, 5).map((entry, index) => (
            <div
              key={entry.timestamp}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-[0.75px] border-gray-200"
            >
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                entry.classification === 'Depressed' ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium tracking-tight ${
                    entry.classification === 'Depressed' ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {entry.classification}
                  </span>
                  <span className="text-xs text-gray-500 tracking-tight">
                    {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 tracking-tight">
                  <span>Top emotion: {entry.emotions[0].label}</span>
                  <span>•</span>
                  <span>Confidence: {(entry.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-blue-50 border-[0.75px] border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 tracking-tight">Mental Health Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
          <div>
            <strong className="tracking-tight">Crisis Support:</strong>
            <p className="text-xs mt-1 tracking-tight">National Suicide Prevention Lifeline: 988</p>
          </div>
          <div>
            <strong className="tracking-tight">Professional Help:</strong>
            <p className="text-xs mt-1 tracking-tight">Consult licensed therapists via telehealth platforms</p>
          </div>
        </div>
      </div>
    </div>
  );
}