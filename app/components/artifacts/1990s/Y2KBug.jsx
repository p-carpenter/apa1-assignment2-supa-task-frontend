import React from 'react'

const Y2KBug = () => {
  return (
    <div className="p-4">
        <div className="usenet-post max-w-lg mx-auto bg-white border border-gray-400 shadow-win95">
            <div className="usenet-header bg-win95-blue text-white p-2 text-sm">
            <div className="flex justify-between">
                <span>comp.risks</span>
                <span>Message 19.97</span>
            </div>
            </div>
            <div className="usenet-metadata bg-win95-gray p-2 text-xs border-b border-gray-500">
            <p><strong>From:</strong> Peter G. Neumann (neumann@csl.sri.com)</p>
            <p><strong>Subject:</strong> Year-2000 Risks</p>
            <p><strong>Date:</strong> 1997-12-15</p>
            </div>
            <div className="usenet-content p-3 overflow-y-auto h-56 font-mono text-sm">
            <p className="mb-2">The Year-2000 problem continues to get worse before it gets better.</p>
            <p className="mb-2">There are serious concerns that many systems will fail as 1/1/2000 approaches.</p>
            <p className="mb-2">Particular risks include:</p>
            <ul className="list-disc ml-5 mb-2">
                <li>Financial systems (payments, interest calculations)</li>
                <li>Date-based processing systems</li>
                <li>Infrastructure (power, telecommunications)</li>
                <li>Embedded systems</li>
            </ul>
            <p className="mb-2">The following actions should be taken immediately:</p>
            <ol className="list-decimal ml-5 mb-2">
                <li>Inventory all systems</li>
                <li>Assess date dependencies</li>
                <li>Prioritize mission-critical systems</li>
                <li>Begin remediation efforts</li>
                <li>Test extensively</li>
            </ol>
            <p className="mb-2">There is increasing evidence that not nearly enough is being done to remedy this situation in a timely fashion. The risks are not being adequately assessed in many government and commercial enterprises.</p>
            <p>-- Peter G. Neumann, Moderator of RISKS Forum</p>
            </div>
        </div>
        </div>
  )
}

export default Y2KBug