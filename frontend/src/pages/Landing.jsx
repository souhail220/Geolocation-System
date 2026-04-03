import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Battery, History, Users, Lock, ArrowRight, Play, Zap, Clock, Database, CircleCheck as CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Live Map Tracking',
      description:
        'Real-time positions updated every 30 seconds on interactive OpenStreetMap/satellite layers',
    },
    {
      icon: Shield,
      title: 'Geofencing & Alerts',
      description:
        'Define geographic zones and receive instant entry/exit alerts by email',
    },
    {
      icon: Battery,
      title: 'Device Health Monitoring',
      description:
        'Battery level, signal quality, and connectivity status for every radio',
    },
    {
      icon: History,
      title: 'Route History & Playback',
      description:
        'Animated replay of 90-day movement history with CSV/KML/XLS export',
    },
    {
      icon: Users,
      title: 'Team & Fleet Management',
      description:
        'Organize radios by group, team, or zone with full CRUD management',
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control',
      description:
        'Admin, Supervisor, Operator, and View-Only roles with audit logs',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Connect Your Radios',
      description: 'Integrate existing POC devices via our API',
    },
    {
      number: '02',
      title: 'Go Live Instantly',
      description: 'See all positions on your command map in real time',
    },
    {
      number: '03',
      title: 'Monitor & React',
      description: 'Get alerts, generate reports, manage your fleet',
    },
  ];

  const stats = [
    { value: '5,000+', label: 'Active Radios' },
    { value: '<30s', label: 'Position Refresh' },
    { value: '4', label: 'Access Roles' },
    { value: '24', label: 'Months History' },
  ];

  const heroStats = [
    { value: '5,000+', label: 'Radios' },
    { value: '30s', label: 'Update Rate' },
    { value: '99.9%', label: 'Uptime' },
    { value: '90-Day', label: 'History' },
  ];

  const securityFeatures = [
    'JWT authentication with secure sessions',
    'Role-based data access restrictions',
    'Full audit trail of user actions',
    'Geographic access limitations per user',
    'Data encrypted in transit and at rest',
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden dot-grid">
        <div className="scanline" />

        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Real-Time Command of <br />
              <span className="text-accent text-glow">Your Field Teams</span>
            </h1>

            <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto mb-12">
              Track 5,000+ POC radios live on an interactive map. Geofencing alerts,
              route history, fleet analytics — all in one ops platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="px-8 py-4 bg-accent text-bg-base font-semibold hover:bg-accent-dim transition-all glow-cyan inline-flex items-center justify-center gap-2 group"
              >
                Request a Demo
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-8 py-4 border border-accent text-accent hover:bg-accent hover:text-bg-base transition-all inline-flex items-center justify-center gap-2">
                <Play size={20} />
                View Live Demo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass-effect p-6 border-l-accent"
                >
                  <div className="font-mono text-3xl font-bold text-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-text-secondary text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="glass-effect p-8 rounded-lg border-l-accent">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-2 bg-bg-base h-64 rounded flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-accent rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                  <MapPin className="text-accent w-20 h-20 z-10" />
                </div>
                <div className="col-span-3 md:col-span-1 space-y-4">
                  <div className="bg-bg-base p-4 rounded">
                    <div className="text-text-muted text-xs mb-1">Signal</div>
                    <div className="text-success text-xl font-bold">Strong</div>
                  </div>
                  <div className="bg-bg-base p-4 rounded">
                    <div className="text-text-muted text-xs mb-1">Battery</div>
                    <div className="text-warning text-xl font-bold">87%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-24 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-accent">Command the Field</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Built for mission-critical operations with enterprise-grade reliability
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect p-6 border-l-accent hover:scale-105 transition-transform cursor-pointer"
                >
                  <Icon className="text-accent w-12 h-12 mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary text-lg">
              Three simple steps to operational excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -z-10" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-bg-base font-display text-2xl font-bold glow-cyan">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-24 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-effect p-12 border-l-accent"
          >
            <div className="flex items-center gap-4 mb-8">
              <Shield className="text-accent w-16 h-16" />
              <h2 className="font-display text-4xl font-bold">
                Enterprise-Grade <span className="text-accent">Security</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="text-success w-6 h-6 flex-shrink-0 mt-1" />
                  <p className="text-text-secondary">{feature}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-mono text-5xl font-bold text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to Take <span className="text-accent">Command</span>?
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Join leading operations teams using TrackPOC to maintain situational awareness
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-base font-semibold hover:bg-accent-dim transition-all glow-cyan group"
            >
              Get Started Now
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
