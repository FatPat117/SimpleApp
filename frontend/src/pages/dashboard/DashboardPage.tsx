export function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">1d</button>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">3d</button>
          <button className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">30d</button>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600">Custom</button>
          <div className="ml-auto rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-500">
            Jun 09, 2025 - Jul 08, 2025
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-800">Lead generation</h1>
            <p className="mt-1 text-xs text-slate-500">New contacts added to the pool.</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-400">People</p>
              <p className="text-lg font-semibold text-slate-800">0</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Companies</p>
              <p className="text-lg font-semibold text-slate-800">0</p>
            </div>
          </div>
        </div>
        <div className="mt-5 h-52 rounded-lg border border-dashed border-slate-200 bg-slate-50/50" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Most visited contacts</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Quicomm</li>
            <li>Airbnb</li>
            <li>Mateo Jensen</li>
            <li>Lucia Bianchi</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Least visited contacts</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Quicomm</li>
            <li>Airbnb</li>
            <li>Mateo Jensen</li>
            <li>Lucia Bianchi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
