export default function CustomLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-white">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-25"></div>
        {/* Main spinning circle */}
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600"></div>
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse h-12 w-12 bg-blue-500 rounded-full opacity-20"></div>
        </div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
        </div>
      </div>
      {/* Loading text with animation */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 animate-pulse">Loading</h2>
        <p className="text-sm text-gray-600">Please wait while we prepare your content...</p>
      </div>
      {/* Animated dots */}
      <div className="flex gap-2 mt-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
