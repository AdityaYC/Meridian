import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

interface TellerConnectButtonProps {
    onSuccess: (accessToken: string, enrollment: any) => void;
    onExit?: () => void;
}

declare global {
    interface Window {
        TellerConnect: any;
    }
}

const TellerConnectButton: React.FC<TellerConnectButtonProps> = ({ onSuccess, onExit }) => {
    const applicationId = import.meta.env.VITE_TELLER_APP_ID || 'app_no402286a4r0e93057005';
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Check if Teller script is loaded
        const checkScript = () => {
            if (window.TellerConnect) {
                setReady(true);
            } else {
                setTimeout(checkScript, 500);
            }
        };
        checkScript();
    }, []);

    const handleOpen = () => {
        if (!window.TellerConnect) {
            toast.error('Teller is not ready yet. Please reload.');
            return;
        }

        try {
            const teller = window.TellerConnect.setup({
                applicationId,
                onInit: function () {
                    console.log('Teller initialized');
                },
                onSuccess: function (enrollment: any) {
                    console.log('Teller enrollment successful:', enrollment);
                    toast.success(`Connected to ${enrollment.institution.name}!`);
                    onSuccess(enrollment.accessToken, enrollment);
                },
                onExit: function () {
                    console.log('Teller Connect closed');
                    if (onExit) onExit();
                },
            });

            teller.open();
        } catch (error) {
            console.error('Failed to open Teller:', error);
            toast.error('Failed to open bank connection');
        }
    };

    return (
        <button
            onClick={handleOpen}
            disabled={!ready}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus className="w-5 h-5" />
            {ready ? 'Connect Bank Account' : 'Loading...'}
        </button>
    );
};

export default TellerConnectButton;
