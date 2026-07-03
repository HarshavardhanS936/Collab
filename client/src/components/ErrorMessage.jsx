export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md shadow-sm">
      <div className="flex justify-between items-center">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="text-xs font-medium bg-red-100 text-red-800 px-3 py-1.5 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
