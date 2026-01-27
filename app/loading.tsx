export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-calm-200 rounded w-48 mb-2" />
        <div className="h-4 bg-calm-100 rounded w-32" />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
          <div className="animate-pulse">
            <div className="h-5 bg-calm-200 rounded w-32 mb-4" />
            <div className="space-y-2">
              <div className="h-16 bg-calm-100 rounded" />
              <div className="h-16 bg-calm-100 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
