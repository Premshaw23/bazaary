"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Zap, ArrowRight, Wallet, TrendingUp, BarChart3, Users } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white selection:bg-brand-100 selection:text-brand-700">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[1000px] pointer-events-none z-0 mesh-gradient opacity-60" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-100 w-fit">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-sm font-semibold text-brand-700 uppercase tracking-wider">Next-Gen Marketplace</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-extrabold leading-[1.1] text-slate-900">
              The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent">Digital Commerce</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-slate-600 leading-relaxed max-w-xl">
              Bazaary empowers sellers with real-time analytics, instant payouts, and a seamless shopping experience for buyers worldwide.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
              <Link href="/register" className="btn-premium group">
                Get Started Now <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center space-x-6 pt-4 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">Joined by <span className="text-slate-900 font-bold">2,500+</span> top-tier sellers this month</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-500/10 blur-3xl rounded-full" />
            <div className="relative glass rounded-2xl overflow-hidden shadow-2xl animate-float">
              <Image
                src="/images/hero.png"
                alt="Bazaary Dashboard"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-4 md:px-8 max-w-7xl mx-auto z-10 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">Why Industry Leaders Choose Bazaary</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">Powerful features designed to scale your business without the complexity of traditional platforms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Wallet className="w-6 h-6 text-brand-600" />}
            title="Real-Time Wallet"
            desc="Track every cent with our live ledger system. Request payouts and see them reflect instantly."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-brand-600" />}
            title="Secure Escrow"
            desc="Buy and sell with confidence. Our advanced dispute resolution protects every transaction."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-brand-600" />}
            title="Instant Search"
            desc="Powered by Meilisearch for ultra-fast, relevant results. Find what you need as you type."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-brand-600" />}
            title="Seller Growth"
            desc="Dedicated tools for stock management, listing optimization, and performance analytics."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 mesh-gradient" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="Total Volume" value="$24M+" />
            <StatItem label="Safe Orders" value="1.2M+" />
            <StatItem label="Active Sellers" value="15k+" />
            <StatItem label="Global Reach" value="45+" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 max-w-5xl mx-auto text-center">
        <div className="glass p-12 rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-3xl -mr-32 -mt-32" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900">Ready to redefine your shop?</h2>
          <p className="text-xl text-slate-600">Join the next generation of digital merchants and start selling in minutes.</p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="btn-premium px-10">Start Selling</Link>
            <Link href="/login" className="btn-secondary px-10">Sign In</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card group"
    >
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl md:text-5xl font-display font-black text-white">{value}</div>
      <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-bold text-brand-600">Bazaary.</h2>
          <p className="text-slate-500 max-w-sm">The world's most advanced e-commerce engine for modern creators and established businesses alike.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-slate-500">
            <li><Link href="/about" className="hover:text-brand-600">About Us</Link></li>
            <li><Link href="/features" className="hover:text-brand-600">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-600">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-slate-500">
            <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
            <li><Link href="/docs" className="hover:text-brand-600">API Docs</Link></li>
            <li><a href="mailto:support@bazaary.com" className="hover:text-brand-600">support@bazaary.com</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Bazaary Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}