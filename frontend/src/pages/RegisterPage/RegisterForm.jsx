import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle2, Loader as Loader2 } from 'lucide-react';
import PropTypes from "prop-types";

const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: 'Weak', color: 'bg-danger' };
    if (strength <= 4) return { level: 2, label: 'Medium', color: 'bg-warning' };
    return { level: 3, label: 'Strong', color: 'bg-success' };
};

const validateForm = (formData) => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';

    if (!formData.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email format';
    }

    if (!formData.organization.trim()) errors.organization = 'Organization is required';

    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';

    return errors;
};

const RegisterForm = ({ onSubmit, isLoading, submitError }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        organization: '',
        role: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    const [passwordStrength, setPasswordStrength] = useState({ level: 0, label: '', color: '' });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({ ...prev, [name]: newValue }));

        if (name === 'password') setPasswordStrength(calculatePasswordStrength(value));

        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <>
            {submitError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-danger/10 border border-danger rounded text-danger"
                >
                    {submitError}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@company.com"
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono placeholder:text-text-muted"
                    />
                    {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                </div>

                {/* Organization */}
                <div>
                    <label htmlFor="organization" className="block text-sm font-medium mb-2">Organization / Company</label>
                    <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Acme Corporation"
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                    />
                    {errors.organization && <p className="mt-1 text-sm text-danger">{errors.organization}</p>}
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-2">
                        Role / Department <span className="text-text-muted">(optional)</span>
                    </label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="Fleet Manager"
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                    />
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex gap-1 mb-1">
                                {[1, 2, 3].map((level) => (
                                    <div
                                        key={level}
                                        className={`h-1 flex-1 rounded ${level <= passwordStrength.level ? passwordStrength.color : 'bg-border'}`}
                                    />
                                ))}
                            </div>
                            <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                Strength: {passwordStrength.label}
                            </p>
                        </div>
                    )}
                    {errors.password && <p className="mt-1 text-sm text-danger">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="mt-1 text-sm text-success flex items-center gap-1">
                            <CheckCircle2 size={14} /> Passwords match
                        </p>
                    )}
                    {errors.confirmPassword && <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="w-5 h-5 accent-accent mt-0.5 flex-shrink-0"
                        />
                        <span className="text-sm text-text-secondary">
              I agree to the{' '}
                            <a href="/register" className="text-accent hover:text-accent-dim">Terms of Service</a>{' '}
                            and{' '}
                            <a href="/register" className="text-accent hover:text-accent-dim">Privacy Policy</a>
            </span>
                    </label>
                    {errors.agreeToTerms && <p className="mt-1 text-sm text-danger">{errors.agreeToTerms}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-accent text-bg-base font-semibold hover:bg-accent-dim transition-all glow-cyan disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:text-accent-dim transition-colors font-medium">
                        Sign In →
                    </Link>
                </p>
            </div>
        </>
    );
};

RegisterForm.prototype = {
    onSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    submitError: PropTypes.string
}

export default RegisterForm;