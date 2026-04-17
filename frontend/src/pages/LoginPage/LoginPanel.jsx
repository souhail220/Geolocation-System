import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, MapPin } from 'lucide-react';

const LoginPanel = () => {
    return (
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
    );
};

export default LoginPanel;