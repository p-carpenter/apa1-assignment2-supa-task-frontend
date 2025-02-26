import React from 'react'

const YTViewCounter = () => {
    return (
    <div className="p-4">
    <div className="youtube-2014 max-w-lg mx-auto bg-white shadow-md">
        <div className="youtube-header bg-white p-2 border-b border-gray-300 flex items-center">
        <div className="youtube-logo mr-4">
            <div className="bg-red-600 rounded text-white px-2 py-1 text-sm font-bold">YouTube</div>
        </div>
        <div className="search-bar flex-1 mx-4">
            <input type="text" value="gangnam style" className="w-full border border-gray-400 p-1 text-sm" readOnly />
        </div>
        <div className="user-icon w-6 h-6 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="video-container bg-black relative" style={{ height: "280px" }}>
        <img 
            src="/gangnam-style-thumbnail.jpg" 
            alt="Gangnam Style Video Thumbnail" 
            className="w-full h-full object-contain"
        />
        <div className="video-controls absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-1 flex items-center text-xs">
            <div className="play-button w-4 h-4 bg-white mr-2"></div>
            <div className="progress-bar flex-1 h-1 bg-gray-600 mx-2">
            <div className="progress h-full bg-red-600" style={{ width: "70%" }}></div>
            </div>
            <div className="volume-icon w-4 h-4 bg-white mx-2"></div>
            <div className="fullscreen-icon w-4 h-4 bg-white ml-2"></div>
        </div>
        </div>
        
        <div className="video-info p-3 border-b border-gray-300">
        <h2 className="text-lg font-bold mb-1">PSY - GANGNAM STYLE(강남스타일) M/V</h2>
        <div className="view-count text-gray-700 text-sm">
            <span className="glitch-text animate-glitch-text">2,147,483,647</span> views
        </div>
        <div className="like-dislike flex items-center mt-2">
            <button className="like-button flex items-center mr-4 text-sm text-gray-700">
            <span className="mr-1">👍</span> 12,345,678
            </button>
            <button className="dislike-button flex items-center text-sm text-gray-700">
            <span className="mr-1">👎</span> 654,321
            </button>
        </div>
        </div>
        
        <div className="uploader-info p-3 flex border-b border-gray-300">
        <div className="channel-icon w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
        <div>
            <div className="channel-name font-bold text-sm">officialpsy</div>
            <div className="subscriber-count text-xs text-gray-700">Subscribers: 12.8M</div>
            <button className="subscribe-button bg-red-600 text-white text-xs px-3 py-1 mt-1 rounded">Subscribe</button>
        </div>
        </div>
        
        <div className="error-message p-3 bg-yellow-100 border border-yellow-400 text-sm">
        <p className="font-bold">YouTube Engineers Note:</p>
        <p>We never thought a video would be watched in numbers greater than a 32-bit integer (2,147,483,647 views), but that was before we met PSY. "Gangnam Style" has been viewed so many times we had to upgrade to a 64-bit integer for the view counter!</p>
        </div>
    </div>
    </div>
);
}

export default YTViewCounter