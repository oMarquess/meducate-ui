import { useEffect, useState } from 'react';

export function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prevProgress) => {
                const newProgress = prevProgress + 1;
                if (newProgress >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return newProgress;
            });
        }, 100); // Adjust the interval duration as needed

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
}