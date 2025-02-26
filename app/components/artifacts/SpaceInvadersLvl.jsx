import React from 'react'

const SpaceInvadersLvl = () => {
    return (
        <div className="p-4">
        <div className="arcade-screen max-w-md mx-auto bg-black border-8 border-gray-800 p-4">
            <div className="space-invaders-screen bg-black h-80 relative overflow-hidden">
            <div className="space-invaders-header flex justify-between text-white font-pixel text-lg mb-4">
                <div>SCORE: 9990</div>
                <div>HI-SCORE: 9990</div>
            </div>
            
            {/* Glitched invaders at level 256 */}
            <div className="invaders-container absolute inset-0 flex flex-wrap justify-center content-start pt-10">
                {Array(16).fill().map((_, i) => (
                <div key={i} className="invader-row flex w-full justify-center mb-3">
                    {Array(6).fill().map((_, j) => (
                    <div key={j} className="invader-sprite w-10 h-6 mx-1 bg-white pixelated opacity-70 animate-glitch"></div>
                    ))}
                </div>
                ))}
            </div>
            
            {/* Player ship at bottom */}
            <div className="player-ship absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-green-500 pixelated"></div>
            
            {/* Kill screen glitch effects */}
            <div className="kill-screen-overlay absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
            <div className="screen-scan-lines absolute inset-0 bg-scan-lines"></div>
            
            {/* Game Over text that appears then disappears */}
            <div className="game-over absolute inset-0 flex items-center justify-center">
                <div className="text-red-500 font-pixel text-2xl animate-blink">GAME OVER</div>
            </div>
            </div>
            <div className="arcade-controls mt-4 flex justify-center">
            <div className="joystick-base w-12 h-12 rounded-full bg-gray-800 relative mr-8">
                <div className="joystick-stick w-6 h-6 rounded-full bg-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="action-button w-10 h-10 rounded-full bg-red-600 border-4 border-gray-800"></div>
            </div>
        </div>
        </div>
    )
}

export default SpaceInvadersLvl