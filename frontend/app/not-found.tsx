export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-white px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <div className="mb-4">
          <svg width={64} height={64} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e0e7ff"/><path d="M9.17 9.17a3 3 0 1 1 5.66 0M12 15h.01" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">404</h1>
        <p className="text-lg text-gray-700 mb-4">Sorry, the page you are looking for was not found.</p>
        <a href="/" className="btn-premium bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition">Go Home</a>
      </div>
    </div>
  );
}
