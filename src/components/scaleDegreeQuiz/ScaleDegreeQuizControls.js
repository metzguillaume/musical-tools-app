// src/components/scaleDegreeQuiz/ScaleDegreeQuizControls.js

import React from 'react';
import { SHAPE_ORDER, SCALE_TYPE_INFO } from './scaleDegreeConstants';

const CONTEXT_MODE_INFO = {
    rootGiven:    { label: 'Root Given',    desc: 'Root shown on low E, A or D string' },
    qualityGiven: { label: 'Quality Given', desc: 'Only Major/Minor shown — find the root yourself' },
};

export const ScaleDegreeQuizControls = ({ settings, onSettingToggle, onSavePreset }) => {
    const { enabledScaleTypes, enabledShapes, contextModes } = settings;

    return (
        <div className="space-y-6">

            {/* ── Context Modes ─────────────────────────────────── */}
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-1">Context Mode</h3>
                <p className="text-xs text-gray-400 mb-2">Select one or more — questions will mix randomly.</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CONTEXT_MODE_INFO).map(([key, info]) => {
                        const isActive = !!contextModes?.[key];
                        return (
                            <button
                                key={key}
                                onClick={() => onSettingToggle('contextModes', key)}
                                className={`rounded-lg text-sm font-bold py-3 px-2 text-center transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                                        : 'bg-slate-600 text-gray-400 hover:bg-slate-500'
                                }`}
                            >
                                <div>{info.label}</div>
                                <div className={`text-xs font-normal mt-0.5 ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {info.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scale Types ───────────────────────────────────── */}
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-1">Scale Types</h3>
                <p className="text-xs text-gray-400 mb-2">Select one or more scale types to include.</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SCALE_TYPE_INFO).map(([key, info]) => {
                        const isActive = !!enabledScaleTypes?.[key];
                        return (
                            <button
                                key={key}
                                onClick={() => onSettingToggle('enabledScaleTypes', key)}
                                className={`rounded-lg text-sm font-bold py-3 px-2 text-center transition-all ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                                        : 'bg-slate-600 text-gray-400 hover:bg-slate-500'
                                }`}
                            >
                                {info.shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── CAGED Shapes ──────────────────────────────────── */}
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-1">CAGED Shapes</h3>
                <p className="text-xs text-gray-400 mb-2">Which positions to include.</p>
                <div className="grid grid-cols-5 gap-2">
                    {SHAPE_ORDER.map(shape => {
                        const isActive = !!enabledShapes?.[shape];
                        return (
                            <button
                                key={shape}
                                onClick={() => onSettingToggle('enabledShapes', shape)}
                                className={`flex items-center justify-center p-3 rounded-lg font-bold text-xl transition-all ${
                                    isActive
                                        ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-400'
                                        : 'bg-slate-600 text-gray-500 hover:bg-slate-500'
                                }`}
                            >
                                {shape}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Save Preset ───────────────────────────────────── */}
            <div className="border-t border-slate-600 pt-4">
                <button
                    onClick={onSavePreset}
                    className="w-full py-3 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform active:scale-95"
                >
                    Save Preset
                </button>
            </div>

        </div>
    );
};