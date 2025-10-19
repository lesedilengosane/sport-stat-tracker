export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center animate-bounce">
        <div className="mx-auto mb-6 w-12 h-12 rounded-full bg-orange-500"></div>
        <h1 className="text-2xl font-bold text-orange-500 mb-2">
          Loading match details...
        </h1>
        <p className="text-gray-300">
          Please wait while we fetch all match information.
        </p>
      </div>
    </div>
  );
}
