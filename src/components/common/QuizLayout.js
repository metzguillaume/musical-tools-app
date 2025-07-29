import React from 'react';
import InfoButton from './InfoButton';

const QuizLayout = ({
  title,
  score,
  totalAsked,
  history,
  isReviewing,
  onStartReview,
  topControls,
  children, // This will render the main content (question, answers, feedback)
  footerContent,
  onLogProgress,
  onToggleControls,
  onShowInfo,
}) => {
  return (
    <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
      {/* 1. Shared Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-indigo-300">{title}</h1>
          <InfoButton onClick={onShowInfo} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log</button>
          <button onClick={onToggleControls} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
        </div>
      </div>

      {/* 2. Shared Sub-Header */}
      <div className="w-full flex justify-between items-center mb-4 text-lg">
        <span className="font-semibold">Score: {score} / {totalAsked}</span>
        <div className="flex items-center gap-4">
          {history.length > 0 && (
            <button onClick={onStartReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-sm py-1 px-3 rounded-lg">
              Review
            </button>
          )}
          {topControls}
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-2xl mx-auto">
        {children}
      </div>

      {/* 4. Footer Area */}
      <div className="mt-4 min-h-[52px] flex justify-center items-center gap-4">
        {footerContent}
      </div>
    </div>
  );
};

export default QuizLayout;