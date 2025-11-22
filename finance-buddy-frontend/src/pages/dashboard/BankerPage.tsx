import React, { useEffect, useState } from 'react';
import { Video, Phone, Loader, AlertCircle } from 'lucide-react';
import { anamService } from '../../services/anam/AnamService';
import toast from 'react-hot-toast';

const BankerPage: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  useEffect(() => {
    anamService.onConnectionStatus((status) => {
      console.log('Connection status:', status);
      setConnectionStatus(status);
      
      if (status === 'connected') {
        setIsConnecting(false);
        toast.success('Connected to Michael!');
      } else if (status === 'error') {
        toast.error('Connection failed');
        setIsConnecting(false);
      }
    });

    return () => {
      if (isSessionActive) {
        anamService.disconnect();
      }
    };
  }, [isSessionActive]);

  const startSession = async () => {
    setIsConnecting(true);
    setIsSessionActive(true);

    try {
      await anamService.initialize('michael-video');
      toast.success('Session started! Speak naturally with Michael.');
    } catch (error: any) {
      console.error('Session start error:', error);
      toast.error('Failed to start session: ' + error.message);
      setIsSessionActive(false);
      setIsConnecting(false);
    }
  };

  const endSession = async () => {
    try {
      await anamService.disconnect();
      setIsSessionActive(false);
      setConnectionStatus('disconnected');
      toast.success('Session ended');
    } catch (error) {
      console.error('End session error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="heading-2">Personal Banker</h1>
        <p className="text-gray-600 mt-1">Talk with Michael in real-time</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden bg-black relative" style={{ aspectRatio: '16/9' }}>
            {!isSessionActive ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-5xl font-bold shadow-xl animate-pulse">
                    M
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Meet Michael</h2>
                  <p className="text-gray-300 text-lg mb-4">Your AI Financial Advisor, CFP®</p>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Talk naturally with Michael in real-time. He can help with budgets, investments, spending analysis, and financial planning.
                  </p>
                  <button
                    onClick={startSession}
                    disabled={isConnecting}
                    className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <Loader className="w-6 h-6 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="w-6 h-6" />
                        Start Conversation
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0">
                <video
                  id="michael-video"
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />

                {connectionStatus !== 'connected' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center text-white">
                      {connectionStatus === 'connecting' ? (
                        <>
                          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                          <p className="text-lg">Connecting to Michael...</p>
                        </>
                      ) : connectionStatus === 'error' ? (
                        <>
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                          <p className="text-lg text-red-400">Connection failed</p>
                          <button onClick={endSession} className="mt-4 btn-secondary">
                            Try Again
                          </button>
                        </>
                      ) : (
                        <>
                          <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                          <p className="text-lg">Initializing...</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {connectionStatus === 'connected' && (
                  <div className="absolute top-6 left-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-sm rounded-full text-white">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-medium">LIVE</span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 right-6">
                  <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white">
                    <p className="text-sm font-medium">Michael, CFP®</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isSessionActive && (
            <div className="card p-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={endSession}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                  title="End conversation"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>
              </div>

              <div className="mt-4 text-center">
                {connectionStatus === 'connected' ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-600">✓ Connected</p>
                    <p className="text-xs text-gray-600">Speak naturally to ask questions</p>
                  </div>
                ) : connectionStatus === 'connecting' ? (
                  <p className="text-sm text-blue-600">Connecting...</p>
                ) : connectionStatus === 'error' ? (
                  <p className="text-sm text-red-600">Connection failed</p>
                ) : (
                  <p className="text-sm text-gray-600">Disconnected</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                M
              </div>
              <h3 className="font-semibold text-gray-900">Michael</h3>
              <p className="text-sm text-gray-600">AI Financial Advisor, CFP®</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Specialization</span>
                <span className="font-medium text-gray-900">Wealth Management</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium text-gray-900">15+ Years</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium text-green-600">Real-time</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Powered by</span>
                <span className="font-medium text-gray-900">Anam AI</span>
              </div>
            </div>
          </div>

          {!isSessionActive && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ask Michael about:</h3>

              <div className="space-y-2 text-sm">
                <div className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  💰 Account balances and transactions
                </div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  📊 Spending patterns and analysis
                </div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  💳 Investment recommendations
                </div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  🎯 Budget planning and optimization
                </div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  📈 Financial goals and strategies
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankerPage;
