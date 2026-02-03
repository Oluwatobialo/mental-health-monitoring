import React, { useState } from 'react';
import { File02Icon, MagicWand02Icon } from 'hugeicons-react';

interface TextAnalysisInterfaceProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

export function TextAnalysisInterface({ onAnalyze, isAnalyzing }: TextAnalysisInterfaceProps) {
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setCharCount(newText.length);
  };

  const handleSubmit = () => {
    if (text.trim().length > 0 && !isAnalyzing) {
      onAnalyze(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: allow default (new line)
        return;
      }
      // Enter: analyze entry
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white rounded-2xl border-[0.75px] border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b-[0.75px] border-gray-200 bg-[#5B8DEE]">
        <div className="flex items-center gap-2">
          <File02Icon className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white tracking-tight">Journal Entry</h2>
        </div>
        <p className="text-sm text-purple-100 mt-1 tracking-tight">
          Express your thoughts and feelings freely
        </p>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-6 flex flex-col">
        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Start writing... Share how you're feeling today, your thoughts, or anything on your mind. This is a safe space for self-reflection."
          className="flex-1 w-full resize-none border-[0.75px] border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent text-gray-800 placeholder:text-gray-400 min-h-[300px] lg:min-h-[400px] tracking-tight"
          disabled={isAnalyzing}
        />

        {/* Character Count */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500 tracking-tight">
            {charCount} characters
          </span>
          <span className="text-xs text-gray-400 tracking-tight">
            Enter to analyze · Shift+Enter for new line
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || isAnalyzing}
          className="w-full py-3 px-6 bg-[#7C3AED] text-white rounded-xl hover:bg-[#6D2FD6] transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-400 flex items-center justify-center gap-2 font-medium tracking-tight border-[0.75px] border-[#9F67FF]"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <MagicWand02Icon className="w-5 h-5" />
              Analyze Entry
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="px-6 pb-6">
        <div className="bg-[#D4D4E8] border-[0.75px] border-[#B8B8D0] rounded-lg p-4">
          <p className="text-xs text-[#2D2A3D] tracking-tight">
            <strong>Privacy Note:</strong> Your text is analyzed using NLP models to assess mental health indicators. This tool is for research and self-awareness purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}