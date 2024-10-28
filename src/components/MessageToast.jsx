"use client"
import React, { useEffect } from 'react';

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer); // Clean up the timer on unmount
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center justify-between px-4 py-2 rounded-md shadow-lg text-white 
                ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold">
                ×
            </button>
        </div>
    );
}

export default Toast;
