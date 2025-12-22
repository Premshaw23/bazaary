import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex flex-col">
      <header className="w-full px-4 py-8 flex flex-col items-center justify-center bg-linear-to-r from-blue-700 to-blue-500 text-white shadow-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-2 tracking-tight drop-shadow-lg">Bazaary</h1>
        <p className="text-2xl md:text-3xl mb-4 font-semibold drop-shadow">Empowering Sellers. Delighting Buyers.</p>
        <div className="flex gap-4 mt-2">
          <Link href="/login" className="btn-premium bg-white text-blue-700 px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-50 transition">Login</Link>
          <Link href="/register" className="btn-premium bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition">Register</Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <section className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-4">Why Bazaary?</h2>
          <p className="text-lg text-gray-700 mb-6">Bazaary is a next-generation, seller-first e-commerce platform designed to make online selling and buying seamless, transparent, and rewarding for everyone.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon="🛒" title="Seller-First" desc="Low fees, instant payouts, and powerful tools for sellers of all sizes." />
            <FeatureCard icon="⚡" title="Fast & Secure" desc="Lightning-fast checkout, secure payments, and robust fraud protection." />
            <FeatureCard icon="🤝" title="Community Driven" desc="Built for trust, transparency, and long-term relationships between buyers and sellers." />
          </div>
        </section>
        <section className="w-full max-w-4xl bg-linear-to-r from-blue-100 to-blue-50 rounded-2xl shadow p-8 text-center mb-10">
          <h3 className="text-2xl font-bold text-blue-700 mb-2">Platform Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-lg text-blue-900">
            <li>✔️ Real-time Wallet & Ledger</li>
            <li>✔️ Instant Payout Requests</li>
            <li>✔️ Advanced Order Management</li>
            <li>✔️ Product Listings & Inventory</li>
            <li>✔️ Admin Unlock & Dispute Flows</li>
            <li>✔️ Analytics & Insights</li>
            <li>✔️ Modern, Responsive UI</li>
            <li>✔️ 24/7 Support</li>
          </ul>
        </section>
        <section className="w-full max-w-4xl text-center">
          <h3 className="text-2xl font-bold text-blue-700 mb-2">Get Started Today</h3>
          <p className="text-lg text-gray-700 mb-6">Join thousands of sellers and buyers who trust Bazaary for their e-commerce needs.</p>
          <Link href="/register" className="btn-premium bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-blue-700 transition text-xl">Create Your Free Account</Link>
        </section>
      </main>
      <footer className="w-full text-center text-xs text-gray-400 py-4 border-t border-gray-100 bg-white">
        Bazaary &copy; {new Date().getFullYear()} &mdash; Built for Sellers, Loved by Buyers
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-blue-50 rounded-xl p-6 shadow flex flex-col items-center">
      <div className="text-4xl mb-2">{icon}</div>
      <h4 className="text-xl font-bold text-blue-800 mb-1">{title}</h4>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}