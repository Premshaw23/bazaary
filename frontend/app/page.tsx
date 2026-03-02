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
      <div className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none z-0 mesh-gradient opacity-40 blur-3xl" />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col space-y-10"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-3 bg-slate-900/3 px-5 py-2.5 rounded-full border border-slate-900/10 w-fit mx-auto lg:mx-0 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(0,102,255,0.8)]" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">The Bazaary Engine v2.0</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-display font-black leading-[0.9] text-slate-950 tracking-tighter"
            >
              Sell <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-indigo-600">Faster</span>.<br />
              Buy <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-brand-500">Cleaner</span>.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
            >
              The world's most advanced peer-to-peer commerce layer.
              Real-time settlement, fraud-proof escrow, and total
              transparency for everyone.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-6 pt-2">
              <Link href="/register" className="btn-premium group text-lg px-12 py-5">
                Explore Market <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-12 py-5">
                Our Vision
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-8 border-t border-slate-100/50">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-brand-50 to-brand-100 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-900 font-bold">Trusted by 15,000+ Merchants</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="text-yellow-400 w-3 h-3 fill-current">★</div>
                  ))}
                  <span className="text-xs text-slate-400 ml-2">4.9/5 Industry Rating</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative perspective-1000 hidden lg:block"
          >
            <div className="absolute -inset-10 bg-brand-500/10 blur-[130px] rounded-full animate-pulse" />
            <div className="relative glass rounded-[2.5rem] p-4 shadow-2xl border-white/40 group overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
              <div className="rounded-4xl overflow-hidden shadow-inner bg-slate-50 animate-float">
                <Image
                  src="/images/hero.png"
                  alt="Bazaary Premium Dashboard"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-5 rounded-2xl shadow-2xl border-white/50 z-20 flex items-center gap-4 animate-float"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Sales Today</p>
                <p className="text-xl font-black text-slate-900">+$12,450</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-10 -left-10 glass p-5 rounded-2xl shadow-2xl border-white/50 z-20 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Settled Payout</p>
                <p className="text-xl font-black text-slate-900">Instant</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-y border-slate-100 bg-slate-50/30 backdrop-blur-sm py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-between items-center gap-8 grayscale opacity-40">
          <span className="text-2xl font-display font-black tracking-tighter">APPLE</span>
          <span className="text-2xl font-display font-black tracking-tighter">STRIPE</span>
          <span className="text-2xl font-display font-black tracking-tighter">VERCEL</span>
          <span className="text-2xl font-display font-black tracking-tighter">NESTJS</span>
          <span className="text-2xl font-display font-black tracking-tighter">MEILI</span>
        </div>
      </div>

      {/* Features Grid */}
      <section className="relative py-32 px-4 md:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center mb-24 space-y-4">
          <span className="text-brand-600 font-black text-xs uppercase tracking-[0.3em]">Built for Scale</span>
          <h2 className="text-4xl md:text-6xl font-display font-black text-slate-950 tracking-tighter">Engineered for perfection.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium leading-relaxed italic">"Bazaary doesn't just process transactions; it builds trust at the speed of light."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <FeatureCard
            icon={<Wallet className="w-8 h-8" />}
            title="Sovereign Wallet"
            desc="Total control over your funds. Every transaction is immutable into our proprietary settlement ledger."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Ironclad Security"
            desc="Enterprise-grade protection with multi-factor auth and real-time fraud detection algorithms."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Atomic Search"
            desc="Find any product across millions of listings in under 12ms with our decentralized search nodes."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Global Network"
            desc="Expand your reach to 190+ countries with localized currency support and instant tax calc."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto glass p-16 md:p-24 rounded-[3.5rem] text-center space-y-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/10 blur-[150px] -mr-64 -mt-64 group-hover:bg-brand-600/20 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] -ml-64 -mb-64" />

          <h2 className="text-5xl md:text-7xl font-display font-black text-slate-950 tracking-tight leading-none">
            Join the elite circle <br /> of digital merchants.
          </h2>
          <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            The era of slow, expensive marketplaces is over.
            Welcome to the future of Bazaary.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/register" className="btn-premium px-16 py-6 text-xl shadow-2xl shadow-brand-500/20">
              Go Live Now
            </Link>
            <Link href="/login" className="btn-secondary px-16 py-6 text-xl">
              Member Sign In
            </Link>
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