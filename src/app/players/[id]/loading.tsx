// app/player/[id]/loading.tsx
export default function LoadingPlayer() {
  return (
    <div className="mx-auto max-w-3xl p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-300" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-gray-300" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Stat</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 7 }).map((_, idx) => (
              <tr key={idx} className="divide-y divide-gray-100">
                <td className="px-4 py-3">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shooting Stats Skeleton */}
      <div className="mt-8 space-y-2">
        <div className="h-5 w-32 rounded bg-gray-300" />
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
      </div>
    </div>
  );
}
