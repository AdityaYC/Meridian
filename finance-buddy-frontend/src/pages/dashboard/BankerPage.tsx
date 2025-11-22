import React, { useEffect, useState, useRef } from 'react';
import { Video, Phone, Loader2, AlertCircle } from 'lucide-react';
import { tavusService } from '../../services/tavus/TavusService';
import { api } from '../../lib/api';
import DailyIframe from '@daily-co/daily-js';
import toast from 'react-hot-toast';

const BankerPage: React.FC = () => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [callFrame, setCallFrame] = useState<any>(null);
    const [personaImage, setPersonaImage] = useState<string | null>(null);

    const iframeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch persona details
        const fetchPersona = async () => {
            console.log('Fetching persona from backend...');
            const persona = await tavusService.getPersona();
            console.log('Persona received in frontend:', persona);
            
            // Try to find a valid image URL from the persona object
            // API structure might vary, checking common fields
            if (persona) {
                // Check all possible fields
                const imageUrl = persona.thumbnail_url || 
                               persona.avatar_url || 
                               persona.profile_image_url || 
                               (persona.layers?.background?.url); // sometimes deep nested
                
                console.log('Resolved image URL:', imageUrl);
                
                if (imageUrl) {
                    setPersonaImage(imageUrl);
                }
            }
        };
        fetchPersona();
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (callFrame) {
                callFrame.destroy();
            }
            if (conversationId) {
                tavusService.endConversation(conversationId);
            }
        };
    }, [callFrame, conversationId]);

    const startCall = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Step 1: Get financial context from backend
            const { data: contextData } = await api.get('/banker/context');
            const personaContext = contextData.personaContext;

            // Step 2: Create Tavus conversation (returns conversation_id and conversation_url)
            const conversation = await tavusService.createConversation(personaContext);
            setConversationId(conversation.conversation_id);
            const conversationUrl = conversation.conversation_url;

            // Step 3: Initialize Daily.co iframe for video call
            if (iframeRef.current) {
                const frame = DailyIframe.createFrame(iframeRef.current, {
                    showLeaveButton: false,
                    showFullscreenButton: false,
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                        borderRadius: '16px',
                    },
                });

                frame.join({ url: conversationUrl });

                frame.on('left-meeting', handleCallEnd);
                frame.on('error', (error: any) => {
                    console.error('Daily.co error:', error);
                    setError('Call connection failed');
                });

                setCallFrame(frame);
                setIsCallActive(true);
                toast.success('Connected to Raj, your personal banker');
            }
        } catch (error: any) {
            console.error('Start call error:', error);
            setError(error.message || 'Failed to start consultation');
            toast.error('Failed to connect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const endCall = async () => {
        try {
            if (callFrame) {
                callFrame.leave();
                callFrame.destroy();
                setCallFrame(null);
            }

            if (conversationId) {
                await tavusService.endConversation(conversationId);
                setConversationId(null);
            }

            setIsCallActive(false);
            toast.success('Call ended');
        } catch (error) {
            console.error('End call error:', error);
        }
    };

    const handleCallEnd = () => {
        setIsCallActive(false);
        setCallFrame(null);
        setConversationId(null);
        setConversationUrl(null);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="heading-2">Personal Banker</h1>
                <p className="text-gray-600 mt-1">Speak with Raj, your dedicated financial advisor</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Video Call Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Video Container */}
                    <div
                        className="card overflow-hidden bg-black relative"
                        style={{ aspectRatio: '16/9', minHeight: '500px' }}
                    >
                        {!isCallActive ? (
                            /* Before Call - Raj Profile */
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="text-center px-8">
                                    {personaImage ? (
                                        <img 
                                            src={personaImage} 
                                            alt="Raj" 
                                            className="w-32 h-32 mx-auto mb-6 rounded-full object-cover border-4 border-primary-500 shadow-xl"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                                            R
                                        </div>
                                    )}
                                    <h2 className="text-3xl font-bold text-white mb-2">Meet Raj</h2>
                                    <p className="text-gray-300 text-lg mb-4">Your Personal Financial Advisor</p>
                                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                                        Certified Financial Planner® with 15+ years of experience in wealth management. Raj is here to help
                                        you make smart financial decisions.
                                    </p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400 max-w-md mx-auto">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={startCall}
                                            disabled={isLoading}
                                            className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Video className="w-6 h-6" />
                                                    Start Consultation
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Active Call - Tavus Video */
                            <div ref={iframeRef} className="absolute inset-0" />
                        )}
                    </div>

                    {/* Call Controls */}
                    {isCallActive && (
                        <div className="card p-6">
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={endCall}
                                    className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                                >
                                    <Phone className="w-6 h-6 rotate-[135deg]" />
                                </button>
                            </div>
                            <p className="text-center text-sm text-gray-600 mt-4">End consultation</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Banker Info Card */}
                    <div className="card p-6">
                        <div className="text-center mb-4">
                            {personaImage ? (
                                <img 
                                    src={personaImage} 
                                    alt="Raj" 
                                    className="w-20 h-20 mx-auto mb-3 rounded-full object-cover border-2 border-primary-500"
                                />
                            ) : (
                                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                                    R
                                </div>
                            )}
                            <h3 className="font-semibold text-gray-900">Raj</h3>
                            <p className="text-sm text-gray-600">Certified Financial Planner®</p>
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
                                <span className="text-gray-600">Languages</span>
                                <span className="font-medium text-gray-900">English, Hindi, Spanish</span>
                            </div>
                        </div>
                    </div>

                    {/* What can I help with */}
                    {!isCallActive && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">What Raj can help with:</h3>

                            <div className="space-y-2">
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">💰</span>
                                    <span>Budget review and optimization</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">📊</span>
                                    <span>Spending pattern analysis</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">💳</span>
                                    <span>Debt management strategies</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">🎯</span>
                                    <span>Financial goal planning</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">📈</span>
                                    <span>Investment recommendations</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-gray-600">
                                    <span className="text-lg">💡</span>
                                    <span>Personalized financial insights</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="card p-6 bg-blue-50 border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">💡 Tips for your consultation</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Speak clearly and naturally</li>
                            <li>• Be specific about your goals</li>
                            <li>• Ask follow-up questions</li>
                            <li>• Take notes on recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankerPage;
