import React from 'react'

const ATTNetworkCollapse = () => {
  return (
          <div className="p-4">
            <div className="att-noc max-w-lg mx-auto bg-black text-green-500 border border-gray-700 font-mono">
              <div className="noc-header bg-blue-900 text-white p-2 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-bold mr-2">AT&T</span>
                  <span className="text-xs">Network Operations Center</span>
                </div>
                <div className="text-xs">
                  January 15, 1990 - 14:25:06 EST
                </div>
              </div>
              
              <div className="noc-content p-3">
                <div className="status-indicator mb-3 flex justify-between items-center">
                  <span>NETWORK STATUS:</span>
                  <span className="bg-red-700 text-white px-2 animate-pulse">CRITICAL</span>
                </div>
                
                <div className="network-map border border-gray-700 p-2 mb-3 h-48 relative overflow-hidden">
                  <div className="map-title text-xs mb-2">US LONG DISTANCE NETWORK</div>
                  
                  {/* Simple network map visualization */}
                  <div className="us-map flex flex-wrap justify-center h-full">
                    {/* Network nodes with connections */}
                    <div className="network-node absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="network-node absolute top-1/5 left-2/3 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="network-node absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="network-node absolute top-2/3 left-3/4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="network-node absolute top-3/4 left-1/5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    
                    {/* Red alert overlay */}
                    <div className="alert-overlay absolute inset-0 bg-red-900 bg-opacity-30 animate-flash"></div>
                  </div>
                </div>
                
                <div className="alert-log border border-gray-700 p-2 h-36 overflow-auto text-xs">
                  <p className="mb-1">[14:25:06] CRITICAL: Signaling System 7 (SS7) network failure detected</p>
                  <p className="mb-1">[14:25:12] ALERT: Multiple switching centers reporting cascading failures</p>
                  <p className="mb-1">[14:25:20] ERROR: Regional transfer point NYC-03 not responding</p>
                  <p className="mb-1">[14:25:34] CRITICAL: 50% of switching capacity offline</p>
                  <p className="mb-1">[14:25:49] ALERT: Software bug detected in routing update mechanism</p>
                  <p className="mb-1">[14:26:03] CRITICAL: Cascading failure affecting 114 switching centers</p>
                  <p className="mb-1">[14:26:18] ERROR: Backup systems unable to compensate for traffic volume</p>
                  <p className="mb-1">[14:26:42] ALERT: Estimated 70 million calls affected</p>
                  <p className="mb-1">[14:27:05] ACTION: Manual override of SS7 routing protocol initiated</p>
                  <p className="mb-1">[14:27:30] STATUS: Beginning emergency recovery procedures</p>
                </div>
                
                <div className="recovery-status mt-3 border border-yellow-500 bg-yellow-900 bg-opacity-30 p-2 text-yellow-500 text-xs">
                  <p><strong>ROOT CAUSE ANALYSIS:</strong> Software bug in SS7 routing update mechanism causing cascading recovery messages that overwhelm switching systems</p>
                </div>
              </div>
            </div>
          </div>
        );
}

export default ATTNetworkCollapse