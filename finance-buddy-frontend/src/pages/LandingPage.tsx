import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, TrendingUp, Users, CheckCircle } from 'lucide-react';
import logo from '../assets/meridian-logo.jpg';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Meridian Logo" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-xl font-semibold text-gray-900">Meridian</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Features
                            </a>
                            <a href="#security" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Security
                            </a>
                            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                Pricing
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-ghost text-sm"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-primary text-sm"
                            >
                                Get started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            Now with real-time banking
                        </div>

                        <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Your finances,
                            <br />
                            simplified
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                            Track spending, set budgets, and get AI-powered insights—all in one beautifully simple app. Connect your bank in seconds.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="btn-primary px-6 py-3 text-base inline-flex items-center gap-2 justify-center"
                            >
                                Start for free
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="btn-secondary px-6 py-3 text-base">
                                Watch demo
                            </button>
                        </div>

                        <div className="flex items-center gap-8 mt-12">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-600">Free forever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-600">Bank-level security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-gray-600">No credit card required</span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent h-32 bottom-0 z-10" />
                            <img
                                src="/dashboard-preview.png"
                                alt="Dashboard"
                                className="w-full rounded-2xl border border-gray-200 shadow-xl"
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="1200" height="800" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="1200" height="800" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23A3A3A3" font-family="sans-serif" font-size="24"%3EDashboard Preview%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-2xl mb-16">
                        <h2 className="heading-2 mb-4">Everything you need to manage your money</h2>
                        <p className="body-text">
                            Powerful features designed to give you complete control over your finances.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        <StatCard number="$2.4B+" label="Tracked by users" />
                        <StatCard number="150K+" label="Active users" />
                        <StatCard number="4.9/5" label="App store rating" />
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-24 bg-gray-50 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="heading-2 mb-6">Bank-level security you can trust</h2>
                            <p className="body-text mb-8">
                                Your financial data is encrypted and protected with the same security standards used by major banks.
                            </p>

                            <div className="space-y-4">
                                <SecurityFeature
                                    title="256-bit encryption"
                                    description="All data is encrypted in transit and at rest"
                                />
                                <SecurityFeature
                                    title="Read-only access"
                                    description="We can only view your data, never move money"
                                />
                                <SecurityFeature
                                    title="SOC 2 compliant"
                                    description="Independently audited security practices"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-soft">
                            <Shield className="w-16 h-16 text-primary-600 mb-6" />
                            <h3 className="text-2xl font-semibold mb-4">Trusted by thousands</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We partner with Plaid and Teller for secure bank connections. Your credentials are never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="heading-2 mb-6">Ready to take control of your finances?</h2>
                    <p className="text-xl text-gray-600 mb-10">
                        Join thousands of users who've simplified their financial lives.
                    </p>

                    <button
                        onClick={() => navigate('/register')}
                        className="btn-primary px-8 py-4 text-lg inline-flex items-center gap-2"
                    >
                        Get started free
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-sm text-gray-500 mt-6">
                        No credit card required · Free forever
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <img src={logo} alt="Meridian Logo" className="w-8 h-8 rounded-lg object-cover" />
                                <span className="font-semibold text-gray-900">Meridian</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Your personal AI financial assistant.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                                <li><a href="#" className="hover:text-gray-900">Security</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">About</a></li>
                                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                                <li><a href="#" className="hover:text-gray-900">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-600">
                        © 2025 Meridian. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Feature Card Component
const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => {
    return (
        <div className="group">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{ number: string; label: string }> = ({ number, label }) => {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{number}</div>
            <div className="text-gray-600">{label}</div>
        </div>
    );
};

// Security Feature Component
const SecurityFeature: React.FC<{ title: string; description: string }> = ({
    title,
    description,
}) => {
    return (
        <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
                <div className="font-semibold text-gray-900 mb-1">{title}</div>
                <div className="text-sm text-gray-600">{description}</div>
            </div>
        </div>
    );
};

const features = [
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Real-time insights',
        description: 'Get instant updates on your spending patterns and financial health with AI-powered analysis.',
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'Instant sync',
        description: 'Connect all your bank accounts and credit cards for automatic transaction tracking.',
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: 'Smart budgets',
        description: 'Set budgets that adapt to your spending and get alerts before you overspend.',
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: 'Secure by default',
        description: 'Bank-level encryption and security. Your data is always protected and private.',
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: 'Investment tracking',
        description: 'Monitor your portfolio performance and get personalized investment recommendations.',
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'AI assistant',
        description: 'Chat with your financial advisor anytime. Get answers to all your money questions.',
    },
];

export default LandingPage;
