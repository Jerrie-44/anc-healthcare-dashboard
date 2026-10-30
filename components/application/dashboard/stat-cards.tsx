// components/application/dashboard/stat-cards.tsx
"use client";

interface StatItem {
  id: string;
  title: string;
  value: string;
  delta: string;
  deltaType: "positive" | "negative" | "neutral";
  comparisonText: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  gradient: string;
}

const CLINICAL_STATS: StatItem[] = [
  {
    id: "intake-velocity",
    title: "Intake Velocity",
    value: "148",
    delta: "+14.2%",
    deltaType: "positive",
    comparisonText: "vs. preceding 30-day intake cycle",
    gradient: "from-blue-500/10 to-indigo-500/10 text-[#007aff]",
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: "match-latency",
    title: "Mean Match Latency",
    value: "22m",
    delta: "-8m",
    deltaType: "positive",
    comparisonText: "time from intake ingest to clinician acceptance",
    gradient: "from-emerald-500/10 to-teal-500/10 text-emerald-600",
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "urgent-sla",
    title: "Urgent SLA Adherence",
    value: "98.6%",
    delta: "+2.1%",
    deltaType: "positive",
    comparisonText: "dispatched & evaluated within 24h goal",
    gradient: "from-rose-500/10 to-orange-500/10 text-rose-600",
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: "network-saturation",
    title: "Clinician Capacity Ratio",
    value: "78%",
    delta: "Optimal",
    deltaType: "neutral",
    comparisonText: "caseload utilization across all active zones",
    gradient: "from-purple-500/10 to-pink-500/10 text-purple-600",
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

interface StatCardsProps {
  variant?: "simple" | "footer";
}

export function StatCards({ variant = "footer" }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CLINICAL_STATS.map((stat) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={stat.id}
            className="flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#eaecf0] bg-white shadow-xs transition hover:border-[#b2d5ff]"
          >
            {/* Top Stat Body */}
            <div className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-caption-1-medium text-text-tertiary">
                  {stat.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-[8px] bg-linear-to-br ${stat.gradient}`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-display-3-bold text-text-primary">
                  {stat.value}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-caption-2-bold font-semibold ${
                    stat.deltaType === "positive"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {stat.delta}
                </span>
              </div>
            </div>

            {/* Footer Band */}
            {variant === "footer" && (
              <div className="border-t border-[#eaecf0] bg-[#fcfcfd] px-5 py-2.5">
                <span className="text-caption-2-regular text-text-tertiary">
                  {stat.comparisonText}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}