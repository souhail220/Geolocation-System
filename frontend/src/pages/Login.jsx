import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Eye, EyeOff, Loader as Loader2, MapPin } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const token = response.headers.get('Authorization');
        if (token) {
          login(token);
          navigate('/dashboard');
        } else {
          setError('Authentication token not received');
        }
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-[55%] bg-bg-base dot-grid relative overflow-hidden">
          <div className="scanline" />

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <Link to="/" className="flex items-center gap-2">
              <Radio className="text-accent w-10 h-10" />
              <span className="font-display text-3xl font-bold">
                Track<span className="text-accent">POC</span>
              </span>
            </Link>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="glass-effect p-8 rounded-lg border-l-accent">
                  <div className="relative h-64 bg-bg-base rounded overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{
                          x: Math.random() * 100 + '%',
                          y: Math.random() * 100 + '%',
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      >
                        <MapPin className="text-accent w-6 h-6" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-text-secondary text-lg italic">
                    "Precision tracking for teams that can't afford to lose sight of the field."
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="text-text-muted text-sm">
              © 2025 TrackPOC. All rights reserved.
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[45%] bg-bg-surface flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2">
                <Radio className="text-accent w-8 h-8" />
                <span className="font-display text-2xl font-bold">
                  Track<span className="text-accent">POC</span>
                </span>
              </Link>
            </div>

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
                <a href="#" className="text-sm text-accent hover:text-accent-dim transition-colors">
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
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
