import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-bg-surface border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="text-accent w-8 h-8" />
              <span className="font-display text-2xl font-bold">
                Track<span className="text-accent">POC</span>
              </span>
            </div>
            <p className="text-text-secondary">
              Precision tracking for teams that can't afford to lose sight of the field.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-text-secondary hover:text-accent transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#security" className="text-text-secondary hover:text-accent transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#documentation" className="text-text-secondary hover:text-accent transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#contact" className="text-text-secondary hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/login" className="text-text-secondary hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-text-secondary hover:text-accent transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-text-muted">
          <p>&copy; 2025 TrackPOC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
