import { useState } from 'react';
import { Link } from 'react-router-dom';
import {motion} from 'framer-motion';
import { Eye, EyeOff, Loader as Loader2 } from 'lucide-react';
import PropTypes from "prop-types";


const LoginForm = ({ onSubmit, isLoading, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <h1 className="font-display text-4xl font-bold mb-2">Welcome Back</h1>
                <p className="text-text-secondary">Sign in to your command center</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-danger/10 border border-danger rounded text-danger"
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="operator@yourorg.com"
                        required
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono placeholder:text-text-muted"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="w-4 h-4 accent-accent"
                        />
                        <span className="text-sm text-text-secondary">Remember me</span>
                    </label>
                    <a href="/login" className="text-sm text-accent hover:text-accent-dim transition-colors">
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-accent text-bg-base font-semibold hover:bg-accent-dim transition-all glow-cyan disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-bg-surface text-text-muted">or</span>
                    </div>
                </div>

                <p className="text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-accent hover:text-accent-dim transition-colors font-medium">
                        Request Access →
                    </Link>
                </p>
            </div>
        </div>
    );
};

LoginForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string, // or object depending on your usage
};

export default LoginForm;