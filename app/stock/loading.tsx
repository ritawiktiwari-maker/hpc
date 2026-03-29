export default function Loading() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 skeleton-loading mb-2" />
          <div className="h-4 w-64 skeleton-loading" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 skeleton-loading" />
          <div className="h-10 w-32 skeleton-loading" />
        </div>
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-20 skeleton-loading" />
            <div className="flex-1 h-4 skeleton-loading" />
            <div className="h-6 w-16 skeleton-loading" />
            <div className="h-6 w-20 skeleton-loading" />
          </div>
        ))}
      </div>
    </div>
  )
}
