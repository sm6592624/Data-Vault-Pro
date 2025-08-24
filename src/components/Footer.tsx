import { Zap, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import type { Dataset } from '../types';

interface FooterProps {
  dataset: Dataset | null;
}

export function Footer({ dataset }: FooterProps) {
  return (
    <footer className="footer-browse">
      <div className="footer-content-browse">
        {/* Main Footer Content */}
        <div className="footer-grid-browse">
          {/* Company Info */}
          <div className="footer-section-browse">
            <div className="footer-brand-browse">
              <Zap className="footer-brand-icon-browse" />
              <span className="footer-brand-text-browse">DataExplorer</span>
            </div>
            <p className="footer-description-browse">
              AI-powered data visualization and analytics platform built with modern web technologies.
            </p>
            <div className="footer-social-browse">
              <a href="#" className="footer-social-link-browse" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="footer-social-link-browse" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="footer-social-link-browse" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="footer-social-link-browse" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section-browse">
            <h4 className="footer-section-title-browse">Product</h4>
            <ul className="footer-links-browse">
              <li><a href="#" className="footer-link-browse">Dashboard</a></li>
              <li><a href="#" className="footer-link-browse">Analytics</a></li>
              <li><a href="#" className="footer-link-browse">Reports</a></li>
              <li><a href="#" className="footer-link-browse">API</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section-browse">
            <h4 className="footer-section-title-browse">Resources</h4>
            <ul className="footer-links-browse">
              <li><a href="#" className="footer-link-browse">Documentation</a></li>
              <li><a href="#" className="footer-link-browse">Support</a></li>
              <li><a href="#" className="footer-link-browse">Tutorials</a></li>
              <li><a href="#" className="footer-link-browse">Community</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section-browse">
            <h4 className="footer-section-title-browse">Company</h4>
            <ul className="footer-links-browse">
              <li><a href="#" className="footer-link-browse">About</a></li>
              <li><a href="#" className="footer-link-browse">Careers</a></li>
              <li><a href="#" className="footer-link-browse">Privacy</a></li>
              <li><a href="#" className="footer-link-browse">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Dataset Info */}
        {dataset && (
          <div className="footer-dataset-browse">
            <div className="footer-dataset-info-browse">
              <span className="footer-dataset-label-browse">Current Dataset:</span>
              <span className="footer-dataset-name-browse">{dataset.name}</span>
              <span className="footer-dataset-separator-browse">•</span>
              <span className="footer-dataset-description-browse">{dataset.description}</span>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="footer-bottom-browse">
          <div className="footer-tech-stack-browse">
            <span className="footer-tech-item-browse">
              <Zap className="w-3 h-3" />
              ML-Enhanced Analytics
            </span>
            <span className="footer-tech-separator-browse">•</span>
            <span className="footer-tech-item-browse">React 19 + TypeScript</span>
            <span className="footer-tech-separator-browse">•</span>
            <span className="footer-tech-item-browse">Tailwind CSS + Vite</span>
          </div>
          <div className="footer-copyright-browse">
            <span>© 2025 DataExplorer. Crafted with passion by a Software Developer</span>
            <Heart className="w-3 h-3 footer-heart-browse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
