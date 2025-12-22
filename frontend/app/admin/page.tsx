import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card-premium w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold mb-6">Admin Panel</h1>
        <div className="space-y-4">
          <Nav href="/admin/payouts" label="Payout Approvals" />
          <Nav href="/admin/wallet" label="Platform Wallet" />
          <Nav href="/admin/orders" label="Orders" />
        </div>
      </div>
    </div>
  );
}

function Nav({ href, label }: any) {
  return (
    <Link
      href={href}
      className="btn-premium bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 w-full block text-center py-3"
      style={{ boxShadow: 'none' }}
    >
      {label}
    </Link>
  );
}
