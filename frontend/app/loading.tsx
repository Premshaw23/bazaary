// This file displays a loading indicator for the Next.js app's route-level loading state.

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <span className="text-lg text-gray-600">Loading...</span>
    </div>
  );
}
