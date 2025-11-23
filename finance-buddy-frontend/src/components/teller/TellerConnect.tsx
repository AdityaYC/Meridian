import React from 'react';
import { useTellerConnect } from 'teller-connect-react';
import { tellerAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

interface TellerConnectButtonProps {
    onSuccess?: () => void;
}

const TellerConnectButton: React.FC<TellerConnectButtonProps> = ({ onSuccess }) => {
    const appId = import.meta.env.VITE_TELLER_APP_ID;

    if (!appId) {
        console.error('❌ VITE_TELLER_APP_ID is not set in environment variables');
    }

    const { open, ready } = useTellerConnect({
        applicationId: appId || 'app_plbijm30hhgpim9f3q000', // Fallback to new App ID
        environment: 'sandbox', // ✅ Explicitly set to sandbox
        onSuccess: async (authorization) => {
            console.log('✅ Teller enrollment success:', authorization);
            console.log('Access Token:', authorization.accessToken);
            console.log('Enrollment ID:', authorization.enrollment.id);
            console.log('Institution:', authorization.enrollment.institution);

            try {
                // Show loading toast
                const toastId = toast.loading('Saving your bank connection...');

                // Save enrollment to backend
                const response = await tellerAPI.saveEnrollment({
                    accessToken: authorization.accessToken,
                    enrollmentId: authorization.enrollment.id,
                    institution: authorization.enrollment.institution,
                });

                console.log('✅ Enrollment saved:', response.data);

                toast.success(
                    `Connected to ${authorization.enrollment.institution?.name || 'your bank'}! Found ${response.data.accountCount} account(s).`,
                    { id: toastId, duration: 5000 }
                );

                // Callback to refresh accounts list
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 500);
                }

            } catch (error: any) {
                console.error('❌ Failed to save enrollment:', error);
                toast.error('Failed to save bank connection: ' + (error.response?.data?.error || error.message), { duration: 6000 });
            }
        },
        onExit: () => {
            console.log('Teller Connect closed');
        },
    });

    return (
        <button
            onClick={() => {
                console.log('Opening Teller Connect with App ID:', appId);
                if (open) open();
            }}
            disabled={!ready || !appId}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Plus className="w-5 h-5" />
            {ready ? 'Connect Bank Account' : 'Loading...'}
        </button>
    );
};

export default TellerConnectButton;
