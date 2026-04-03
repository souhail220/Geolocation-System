import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import PageTransition from '../../components/PageTransition.jsx';
import RegisterForm from './RegisterForm.jsx';
import RegisterSuccess from './RegisterSuccess.jsx';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setSubmitError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setSubmitError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setSubmitError('Connection error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) return <RegisterSuccess />;

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
              <RegisterForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  submitError={submitError}
              />
            </div>
          </motion.div>
        </div>
      </PageTransition>
  );
};

export default Register;