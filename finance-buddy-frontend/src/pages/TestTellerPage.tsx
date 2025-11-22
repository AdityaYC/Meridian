import React, { useEffect, useState } from 'react';

declare global {
    interface Window {
        TellerConnect: any;
    }
}

const TestTellerPage: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const appId = import.meta.env.VITE_TELLER_APP_ID;

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    useEffect(() => {
        if (window.TellerConnect) {
            addLog('Teller Script Detected ✅');
        } else {
            addLog('Teller Script MISSING ❌');
        }
    }, []);

    const handleTest = () => {
        addLog(`Starting Test... App ID: ${appId}`);

        if (!window.TellerConnect) {
            addLog('Error: window.TellerConnect is undefined');
            return;
        }

        try {
            addLog('Setting up Teller...');
            const teller = window.TellerConnect.setup({
                applicationId: appId,
                onInit: function () {
                    addLog('Callback: onInit - Teller initialized');
                },
                onSuccess: function (enrollment: any) {
                    addLog('Callback: onSuccess - Enrollment ID: ' + enrollment.id);
                },
                onExit: function () {
                    addLog('Callback: onExit - Teller Closed');
                },
            });

            addLog('Calling teller.open()...');
            teller.open();
            addLog('teller.open() called.');
        } catch (e: any) {
            addLog('EXCEPTION: ' + e.message);
            console.error(e);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Teller Debug Console</h1>

            <div className="mb-6">
                <button
                    onClick={handleTest}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 w-full"
                >
                    OPEN TELLER MODAL
                </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm min-h-[300px] overflow-y-auto">
                {logs.length === 0 && <span className="text-gray-500">Ready...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-800 pb-1">{log}</div>
                ))}
            </div>
        </div>
    );
};

export default TestTellerPage;
