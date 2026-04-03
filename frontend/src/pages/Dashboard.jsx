import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Radio } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-bg-base dot-grid">
        <div className="scanline" />

        <nav className="glass-effect py-4 relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="text-accent w-8 h-8" />
              <span className="font-display text-2xl font-bold">
                Track<span className="text-accent">POC</span>
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2 border border-accent text-accent hover:bg-accent hover:text-bg-base transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="glass-effect p-16 border-l-accent inline-block">
              <Radio className="text-accent w-24 h-24 mx-auto mb-6" />
              <h1 className="font-display text-5xl font-bold mb-4">
                Dashboard <span className="text-accent">Coming Soon</span>
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
                The command center interface is currently under development. This will be your
                central hub for monitoring all field operations in real-time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="glass-effect p-6 border-l-accent">
                  <div className="text-3xl font-mono font-bold text-accent mb-2">Live Map</div>
                  <div className="text-text-secondary">Real-time tracking</div>
                </div>
                <div className="glass-effect p-6 border-l-accent">
                  <div className="text-3xl font-mono font-bold text-accent mb-2">Fleet Mgmt</div>
                  <div className="text-text-secondary">Device control</div>
                </div>
                <div className="glass-effect p-6 border-l-accent">
                  <div className="text-3xl font-mono font-bold text-accent mb-2">Analytics</div>
                  <div className="text-text-secondary">Insights & reports</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
