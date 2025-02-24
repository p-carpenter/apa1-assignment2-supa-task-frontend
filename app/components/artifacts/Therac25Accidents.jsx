import React from 'react'

const Therac25Accidents = () => {
    return (
    <div className="p-4">
    <div className="therac-interface max-w-lg mx-auto bg-black text-green-500 border border-gray-700 font-mono">
        <div className="therac-header bg-gray-900 p-2 flex justify-between items-center">
        <div className="flex items-center">
            <span className="font-bold mr-2">THERAC-25</span>
            <span className="text-xs">Radiotherapy System</span>
        </div>
        <div className="text-xs">
            Terminal #3 - 06/85
        </div>
        </div>
        
        <div className="therac-content p-4">
        <div className="treatment-settings mb-4 grid grid-cols-2 gap-2 text-sm">
            <div>Patient ID: <span className="text-white">845-9621</span></div>
            <div>Mode: <span className="text-white">X-ray</span></div>
            <div>Energy: <span className="text-white">25 MeV</span></div>
            <div>Field Size: <span className="text-white">10x10 cm</span></div>
            <div>Dose: <span className="text-white">200 rads</span></div>
            <div>Time: <span className="text-white">0.1 sec</span></div>
        </div>
        
        <div className="machine-status mb-4 flex items-center border-b border-green-700 pb-2">
            <div className="status-label mr-4">BEAM STATUS:</div>
            <div className="status-value text-white flex items-center">
            <div className="status-indicator w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            READY
            </div>
        </div>
        
        <div className="error-screen text-red-500 p-3 border border-red-500 bg-black mb-4 animate-flicker">
            <p className="mb-2 text-center font-bold">MALFUNCTION 54</p>
            <p className="text-xs mb-2 text-center">DOSE INPUT 2 ERROR</p>
            <p className="text-xs text-center">PRESS RETURN TO PROCEED</p>
        </div>
        
        <div className="incident-timeline mt-6 border-t border-green-700 pt-2 text-xs">
            <p className="text-yellow-400 mb-1">/* Fatal Incident Timeline */</p>
            <p className="mb-1">* Operator enters X-ray mode</p>
            <p className="mb-1">* System shows "READY" status</p>
            <p className="mb-1">* Operator changes parameters rapidly</p>
            <p className="mb-1">* "MALFUNCTION 54" appears briefly</p>
            <p className="mb-1">* Operator bypasses error by pressing RETURN</p>
            <p className="mb-1">* System delivered electron beam at X-ray current (100X overdose)</p>
            <p className="mb-1">* Patient receives lethal radiation dose</p>
        </div>
        
        <div className="safety-analysis p-3 mt-4 border border-yellow-500 bg-yellow-900 bg-opacity-20 text-yellow-500 text-xs">
            <p><strong>ROOT CAUSE ANALYSIS:</strong> Race condition in software when operator changes parameters quickly. System shows error but allows treatment to proceed with incorrect settings when error bypassed.</p>
        </div>
        </div>
    </div>
    </div>
    );
}

export default Therac25Accidents