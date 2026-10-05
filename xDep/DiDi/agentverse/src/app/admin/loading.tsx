export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse flex items-center justify-between">
        <div className="h-8 bg-zinc-800 rounded w-48"></div>
        <div className="flex gap-4">
          <div className="h-10 w-24 bg-zinc-800 rounded-md"></div>
          <div className="h-10 w-32 bg-zinc-800 rounded-md"></div>
        </div>
      </div>
      
      <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="border-b border-zinc-800 p-4">
          <div className="flex gap-4">
            <div className="h-10 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-10 bg-zinc-800 rounded w-32"></div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800/50">
              <div className="h-10 w-10 bg-zinc-800 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
              </div>
              <div className="h-8 w-24 bg-zinc-800 rounded-full"></div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-zinc-800 rounded"></div>
                <div className="h-8 w-8 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
