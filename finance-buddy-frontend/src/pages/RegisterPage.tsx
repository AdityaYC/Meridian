import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/meridian-logo.jpg';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await authAPI.register(formData);
            setAuth(data.user, data.token);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </button>
            </header>

            {/* Register Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <img src={logo} alt="Meridian Logo" className="inline-block w-16 h-16 rounded-xl mb-4 object-cover" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
                        <p className="text-gray-600">Start managing your finances better today</p>
                    </div>

                    {/* Form */}
                    <div className="card p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="label-text block mb-2">
                                        First name
                                    </label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="input"
                                        placeholder="John"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="label-text block mb-2">
                                        Last name
                                    </label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="input"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="label-text block mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input pl-10"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="label-text block mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input pl-10 pr-10"
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                            </div>

                            {/* Terms */}
                            <div>
                                <label className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        required
                                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                                    />
                                    <span className="text-sm text-gray-600">
                                        I agree to the{' '}
                                        <a href="#" className="text-primary-600 hover:text-primary-700">
                                            Terms of Service
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-primary-600 hover:text-primary-700">
                                            Privacy Policy
                                        </a>
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>

                        {/* Sign in link */}
                        <div className="mt-6 text-center">
                            <span className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Sign in
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
