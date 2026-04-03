import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, CircleCheck as CheckCircle2, Loader as Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    level: 0,
    label: '',
    color: '',
  });

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    let level = 0;
    let label = '';
    let color = '';

    if (strength <= 2) {
      level = 1;
      label = 'Weak';
      color = 'bg-danger';
    } else if (strength <= 4) {
      level = 2;
      label = 'Medium';
      color = 'bg-warning';
    } else {
      level = 3;
      label = 'Strong';
      color = 'bg-success';
    }

    return { level, label, color };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.fullName.split(' ')[0],
          lastName: formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0],
          email: formData.email,
          password: formData.password,
          phoneNumber: '00000000',
          teamId: 1,
          role: 'OBSERVER',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setErrors({ submit: data.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ submit: 'Connection error. Please check if the server is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-bg-base dot-grid flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center glass-effect p-12 border-l-accent"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="text-bg-base w-12 h-12" />
            </motion.div>

            <h2 className="font-display text-3xl font-bold mb-4">Account Created!</h2>
            <p className="text-text-secondary mb-8">
              Check your email to verify your account and complete the setup process.
            </p>

            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-accent text-bg-base font-semibold hover:bg-accent-dim transition-all glow-cyan"
            >
              Back to Sign In
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg-base dot-grid flex items-center justify-center p-6">
        <div className="scanline" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Radio className="text-accent w-10 h-10" />
              <span className="font-display text-3xl font-bold">
                Track<span className="text-accent">POC</span>
              </span>
            </Link>

            <h1 className="font-display text-4xl font-bold mb-2">Request Access</h1>
            <p className="text-text-secondary">
              Create your TrackPOC account to start managing your fleet
            </p>
          </div>

          <div className="glass-effect p-8 border-l-accent">
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-danger/10 border border-danger rounded text-danger"
              >
                {errors.submit}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-danger">{errors.fullName}</p>
                )}
              </div>

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
                  placeholder="john.doe@company.com"
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono placeholder:text-text-muted"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-danger">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">
                  Organization / Company
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-text-muted"
                />
                {errors.organization && (
                  <p className="mt-1 text-sm text-danger">{errors.organization}</p>
                )}
              </div>

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

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
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
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      Strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-sm text-danger">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>
                )}
              </div>

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
                    <a href="#" className="text-accent hover:text-accent-dim">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-accent hover:text-accent-dim">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-danger">{errors.agreeToTerms}</p>
                )}
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
                <Link
                  to="/login"
                  className="text-accent hover:text-accent-dim transition-colors font-medium"
                >
                  Sign In →
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;
