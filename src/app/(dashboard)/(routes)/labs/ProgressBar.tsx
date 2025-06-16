import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
    progress?: number; // Progress percentage (0-100)
}

export function ProgressBar({ progress = 0 }: ProgressBarProps) {
    return (
        <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                        width: `${Math.min(Math.max(progress, 0), 100)}%` 
                    }}
                ></div>
            </div>
            {progress > 0 && (
                <div className="text-center">
                    <span className="text-sm text-gray-600">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
            )}
            {progress === 0 && (
                <div className="text-center">
                    <span className="text-sm text-gray-600">
                        Initializing...
                    </span>
                </div>
            )}
        </div>
    );
}