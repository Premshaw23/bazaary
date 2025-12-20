import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="space-y-4">
        <Nav href="/admin/payouts" label="Payout Approvals" />
        <Nav href="/admin/wallet" label="Platform Wallet" />
        <Nav href="/admin/orders" label="Orders" />
      </div>
    </div>
  );
}

function Nav({ href, label }: any) {
  return (
    <Link href={href} className="block border p-4 rounded hover:bg-gray-50">
      {label}
    </Link>
  );
}
