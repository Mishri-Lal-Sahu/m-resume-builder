import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics | M-Docs Admin" };

export default async function AdminAnalyticsPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs = await db.activityLog.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { action: true, country: true, createdAt: true },
  });

  // Calculate usage distribution (by action)
  const actionCounts: Record<string, number> = {};
  logs.forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });
  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate top countries
  const countryCounts: Record<string, number> = {};
  logs.forEach((log) => {
    const c = log.country || "Unknown";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCountryCount = topCountries[0]?.[1] || 1;

  // Calculate traffic trends (last 30 days)
  const trafficTrend: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    trafficTrend[dateStr] = 0;
  }
  logs.forEach((log) => {
    const dateStr = log.createdAt.toISOString().split("T")[0];
    if (trafficTrend[dateStr] !== undefined) {
      trafficTrend[dateStr]++;
    }
  });

  const trendEntries = Object.entries(trafficTrend);
  const maxTraffic = Math.max(1, ...trendEntries.map((e) => e[1]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Platform Analytics
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Data collected over the last 30 days via Activity Logs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Trends */}
        <div className="col-span-full rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <h2 className="mb-6 font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Traffic Trends & Activity</h2>
          <div className="flex h-48 items-end gap-1 sm:gap-2">
            {trendEntries?.map(([date, count]) => {
              const heightPct = Math.max(4, (count / maxTraffic) * 100);
              const label = new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <div key={date} className="group relative flex flex-1 flex-col justify-end">
                  <div className="absolute bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block z-10">
                    {label}: {count}
                  </div>
                  <div
                    className="w-full rounded-t-sm bg-rose-500/80 transition-all hover:bg-rose-400 dark:bg-rose-600/60 dark:hover:bg-rose-500"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Countries */}
        <div className="rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <h2 className="mb-6 font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Top Countries</h2>
          <div className="space-y-4">
            {topCountries.length === 0 ? (
              <p className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>No geographic data logged recently.</p>
            ) : (
              topCountries?.map(([country, count]) => (
                <div key={country}>
                  <div className="mb-1 flex justify-between text-sm transition-colors" style={{ color: "var(--text-primary)" }}>
                    <span className="font-medium">{country}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500"
                      style={{ width: `${(count / maxCountryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage Distribution */}
        <div className="rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <h2 className="mb-6 font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Event Distribution</h2>
          <div className="space-y-4">
            {topActions.length === 0 ? (
              <p className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>No events logged recently.</p>
            ) : (
              topActions?.map(([action, count]) => (
                <div key={action} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 transition-colors" style={{ borderColor: "var(--sidebar-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-bold transition-colors" style={{ color: "var(--text-muted)" }}>
                      {count}
                    </div>
                    <span className="text-sm font-medium transition-colors" style={{ color: "var(--text-primary)" }}>
                      {action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
                    {Math.round((count / logs.length) * 100)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
