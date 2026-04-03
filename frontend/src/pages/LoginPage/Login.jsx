import { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import PageTransition from '../../components/PageTransition.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import LoginPanel from './LoginPanel.jsx';
import LoginForm from './LoginForm.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
          <LoginPanel />

          <div className="w-full lg:w-[45%] bg-bg-surface flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
              {/* Mobile-only logo */}
              <div className="lg:hidden mb-8 text-center">
                <Link to="/" className="inline-flex items-center gap-2">
                  <Radio className="text-accent w-8 h-8" />
                  <span className="font-display text-2xl font-bold">
                  Track<span className="text-accent">POC</span>
                </span>
                </Link>
              </div>

              <LoginForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  error={error}
              />
            </motion.div>
          </div>
        </div>
      </PageTransition>
  );
};

export default Login;