import React from 'react'

const WindowsNTBSOD = () => {
         return (
          <div className="p-4">
            <div className="bsod max-w-lg mx-auto bg-blue-700 text-white p-4 font-mono">
              <div className="bsod-content">
                <p className="mb-6 text-center font-bold">
                  Windows NT
                </p>
                <p className="mb-4">
                  A fatal exception 0E has occurred at 0028:C000251F in VXD VMM(01) +
                  00001A5F. The current application will be terminated.
                </p>
                <p className="mb-4">
                  * Press any key to terminate the current application.<br />
                  * Press CTRL+ALT+DEL to restart your computer. You will lose any
                  unsaved information in all applications.
                </p>
                <div className="error-details mb-4">
                  <p>Technical information:</p>
                  <p className="ml-4">
                    *** STOP: 0x0000000A (0x00000000,0x00000002,0x00000000,0x8013EB68)<br />
                    IRQL_NOT_LESS_OR_EQUAL
                  </p>
                </div>
                <p className="blink mb-4">
                  Press any key to continue _
                </p>
                <div className="kmode-explanation mt-8 p-2 border border-white">
                  <p className="text-xs">
                    <strong>EXPLANATION:</strong> The IRQL_NOT_LESS_OR_EQUAL bug check indicates that a 
                    kernel-mode process or driver attempted to access pageable memory 
                    when its IRQL was too high. This is a common cause of crashes in 
                    Windows NT 4.0 due to faulty drivers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
}

export default WindowsNTBSOD