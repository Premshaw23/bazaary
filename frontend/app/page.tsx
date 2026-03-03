"use client";

import Link from 'next/link';
import Image from 'next/image'
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Star,
  Globe,
  Clock,
  CreditCard,
  CheckCircle,
  Play,
  Quote,
  Award,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 px-6 py-3 rounded-full shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">Live & Secure</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <span className="text-sm text-gray-600">Trusted by 25,000+ sellers</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight tracking-tight">
              The Future of
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient">
                E-Commerce
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Build, sell, and scale your business with our powerful marketplace platform. 
              <span className="text-gray-900 font-semibold"> Zero setup fees, instant payouts.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link 
                href="/register" 
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 transition-all duration-300 shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-1"
              >
                Start Selling Today
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              
              <Link 
                href="/products" 
                className="group bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-gray-200/60 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Play size={18} />
                Browse Products
              </Link>
            </motion.div>

            {/* Stats Bar */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600 mt-1">Active Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">$2.4M+</div>
                <div className="text-sm text-gray-600 mt-1">Sales Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">98.7%</div>
                <div className="text-sm text-gray-600 mt-1">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Support</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles size={16} />
              Platform Features
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to succeed
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-2xl mx-auto">
              From powerful analytics to secure payments, we've built all the tools you need to grow your business.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Search through millions of products in milliseconds with our advanced AI-powered search engine."
              color="yellow"
            />
            
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Bank-Level Security"
              description="Your transactions are protected with military-grade encryption and fraud detection systems."
              color="green"
            />
            
            <FeatureCard 
              icon={<CreditCard className="w-8 h-8" />}
              title="Instant Payouts"
              description="Get paid immediately after each sale with our real-time payment processing system."
              color="blue"
            />
            
            <FeatureCard 
              icon={<Globe className="w-8 h-8" />}
              title="Global Reach"
              description="Sell to customers worldwide with support for 150+ currencies and local payment methods."
              color="purple"
            />
            
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8" />}
              title="Advanced Analytics"
              description="Track your performance with detailed insights, sales forecasting, and customer behavior analysis."
              color="red"
            />
            
            <FeatureCard 
              icon={<Clock className="w-8 h-8" />}
              title="24/7 Support"
              description="Get help whenever you need it with our round-the-clock customer support team."
              color="indigo"
            />
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award size={16} />
              Success Stories
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by entrepreneurs worldwide
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <TestimonialCard 
              quote="Bazaary helped me scale from $10K to $500K in revenue in just 8 months. The analytics dashboard is incredible!"
              author="Sarah Chen"
              role="Fashion Entrepreneur"
              rating={5}
            />
            
            <TestimonialCard 
              quote="The instant payout feature changed everything for my cash flow. No more waiting weeks for payments."
              author="Marcus Rodriguez"
              role="Electronics Seller"
              rating={5}
            />
            
            <TestimonialCard 
              quote="Customer support is phenomenal. They helped me set up my store in less than 30 minutes."
              author="Emily Johnson"
              role="Handmade Crafts"
              rating={5}
            />
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 md:px-8 bg-linear-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
            className="space-y-8"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold leading-tight">
              Ready to transform your business?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of successful sellers who've already made the switch to Bazaary.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link 
                href="/register" 
                className="bg-white text-blue-600 hover:text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Get Started Free
              </Link>
              <Link 
                href="/contact" 
                className="border-2 border-white/30 hover:border-white text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300"
              >
                Talk to Sales
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string; 
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 text-blue-600 group-hover:from-blue-500 group-hover:to-blue-600',
    green: 'from-green-500/10 to-green-600/10 text-green-600 group-hover:from-green-500 group-hover:to-green-600',
    purple: 'from-purple-500/10 to-purple-600/10 text-purple-600 group-hover:from-purple-500 group-hover:to-purple-600',
    yellow: 'from-yellow-500/10 to-yellow-600/10 text-yellow-600 group-hover:from-yellow-500 group-hover:to-yellow-600',
    red: 'from-red-500/10 to-red-600/10 text-red-600 group-hover:from-red-500 group-hover:to-red-600',
    indigo: 'from-indigo-500/10 to-indigo-600/10 text-indigo-600 group-hover:from-indigo-500 group-hover:to-indigo-600',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:border-gray-300/60"
    >
      <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-6 transition-all duration-300 group-hover:text-white group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role, rating }: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <Quote className="w-8 h-8 text-gray-300 mb-4" />
      <p className="text-gray-700 leading-relaxed mb-6 italic">{quote}</p>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-blue-600">Bazaary.</h2>
          <p className="text-slate-500 max-w-sm">The world's most advanced e-commerce engine for modern creators and established businesses alike.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-slate-500">
            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
            <li><Link href="/features" className="hover:text-blue-600">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-slate-500">
            <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
            <li><Link href="/docs" className="hover:text-blue-600">API Docs</Link></li>
            <li><a href="mailto:support@bazaary.com" className="hover:text-blue-600">support@bazaary.com</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Bazaary Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-600">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}