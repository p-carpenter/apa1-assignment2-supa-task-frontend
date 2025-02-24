import React from 'react'

const Win95RecycleBin = () => {
    return (
    <div className="p-4">
    <div className="win95-error-window max-w-md mx-auto">
        <div className="explorer-window-bar mb-2">
        <div className="folder-name">
            <img src="/win95-folder-icon.png" className="w-4 h-4 mr-2" alt="Folder Icon" />
            <p>Recycle Bin</p>
        </div>
        <div className="window-buttons flex">
            <div id="min-button" className="w-4 h-4 mr-1 bg-win95-gray border border-gray-600"></div>
            <div id="max-button" className="w-4 h-4 mr-1 bg-win95-gray border border-gray-600"></div>
            <div id="close-button" className="w-4 h-4 bg-win95-gray border border-gray-600"></div>
        </div>
        </div>
        
        <div className="recyclebin-window border border-gray-400 bg-white mb-4">
        <div className="recyclebin-header bg-win95-blue text-white p-1 text-sm flex">
            <span className="mr-4">File</span>
            <span className="mr-4">Edit</span>
            <span className="mr-4">View</span>
            <span>Help</span>
        </div>
        <div className="recyclebin-content h-40 p-2 overflow-auto">
            <div className="file-item flex items-center mb-1 hover:bg-blue-200 p-1">
            <div className="file-icon w-4 h-4 bg-gray-300 mr-2"></div>
            <span className="file-name text-sm">VeryLongFileName_With_Many_Characters_That_Exceeds_The_Maximum_Path_Length_In_Windows_95_And_Causes_The_System_To_Crash_When_Trying_To_Delete_It.txt</span>
            </div>
            <div className="file-item flex items-center mb-1 hover:bg-blue-200 p-1">
            <div className="file-icon w-4 h-4 bg-gray-300 mr-2"></div>
            <span className="file-name text-sm">Document.doc</span>
            </div>
            <div className="file-item flex items-center hover:bg-blue-200 p-1">
            <div className="file-icon w-4 h-4 bg-gray-300 mr-2"></div>
            <span className="file-name text-sm">Spreadsheet.xls</span>
            </div>
        </div>
        </div>
        
        {/* Error Dialog */}
        <div className="win95-dialog border-2 border-gray-400 bg-win95-gray shadow-lg">
        <div className="dialog-titlebar bg-win95-blue text-white p-1 flex justify-between items-center">
            <span className="text-sm">Windows</span>
            <div id="dialog-close" className="w-4 h-4 bg-win95-gray border border-gray-600"></div>
        </div>
        <div className="dialog-content p-3 flex">
            <div className="dialog-icon mr-3">
            <span className="text-2xl">⚠️</span>
            </div>
            <div className="dialog-message text-sm">
            <p className="mb-2">Cannot delete file: The path is too long.</p>
            <p>Try renaming the file or moving it to a location with a shorter path.</p>
            </div>
        </div>
        <div className="dialog-buttons flex justify-center p-2">
            <button className="px-4 py-1 bg-win95-gray border-t border-l border-white border-r border-b border-gray-800 text-sm">
            OK
            </button>
        </div>
        </div>
    </div>
    </div>
);
}

export default Win95RecycleBin