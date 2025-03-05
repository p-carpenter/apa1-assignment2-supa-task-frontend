import React from 'react'

const MarsClimateCrash = () => {
    return (
    <div className="p-4">
    <div className="nasa-screen max-w-lg mx-auto bg-black border border-gray-600 text-green-500 font-mono">
        <div className="nasa-header bg-gray-900 p-2 flex justify-between items-center">
        <div className="nasa-logo flex items-center">
            <span className="text-white font-bold mr-2">NASA</span>
            <span className="text-xs">Mission Control</span>
        </div>
        <div className="nasa-time text-xs">
            1999-09-23 09:06:12 UTC
        </div>
        </div>
        <div className="nasa-content p-3 overflow-y-auto h-64">
        <p className="animate-typing mb-3">&gt; MISSION STATUS: CRITICAL</p>
        <p className="animate-typing delay-500 mb-3">&gt; Mars Climate Orbiter - Signal Lost</p>
        <p className="mb-3">TELEMETRY DATA:</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>Last Known Alt: 57 km</div>
            <div>Expected Alt: 150 km</div>
            <div>Signal Strength: 0%</div>
            <div>Last Contact: 09:04:52 UTC</div>
        </div>
        <div className="error-message text-red-500 p-2 border border-red-500 mb-3">
            ERROR: Trajectory calculations show spacecraft entered Martian atmosphere
        </div>
        <p className="mb-3">INVESTIGATION NOTES:</p>
        <div className="investigation-notes text-yellow-400 p-2 border border-yellow-400 text-xs">
            <p className="mb-2">- Trajectory analysis indicates incorrect orbital insertion</p>
            <p className="mb-2">- Investigating navigation data discrepancies</p>
            <p className="mb-2">- Possible unit conversion error between metric/imperial</p>
            <p>- Software team reviewing thrust calculations</p>
        </div>
        </div>
        <div className="nasa-footer bg-gray-900 p-1 text-xs">
        <span>NASA/JPL CONFIDENTIAL</span>
        </div>
    </div>
    </div>
    );
}

export default MarsClimateCrash