import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import PageTransition from '../../components/PageTransition.jsx';

const RegisterSuccess = () => {
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
};

export default RegisterSuccess;