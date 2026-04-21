"use client";

import { Search, X } from "lucide-react";
import { RESOURCE_TYPES, type ResourceFilters } from "@/types/resource";

export function ResourceFilter({
  filters,
  onChange,
  cities,
  specializations,
  totalCount,
  shownCount,
}: {
  filters: ResourceFilters;
  onChange: (next: ResourceFilters) => void;
  cities: string[];
  specializations: string[];
  totalCount: number;
  shownCount: number;
}) {
  const update = <K extends keyof ResourceFilters>(key: K, value: ResourceFilters[K]) =>
    onChange({ ...filters, [key]: value });

  const hasFilter =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.city !== "all" ||
    filters.specialization !== "all" ||
    filters.insuranceOnly;

  return (
    <div className="sticky top-20 z-10 rounded-3xl border border-plum-800/5 bg-white/80 p-5 shadow-soft backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-800/40" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search by name, city, description..."
            className="w-full rounded-full border-2 border-plum-800/10 bg-cream py-3 pl-11 pr-4 text-sm outline-none transition focus:border-coral-400 focus:shadow-glow"
          />
        </div>

        {/* City + Insurance + Reset on the right */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            aria-label="Filter by city"
            className="rounded-full border-2 border-plum-800/10 bg-cream px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-coral-400"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.specialization}
            onChange={(e) => update("specialization", e.target.value)}
            aria-label="Filter by specialization"
            className="rounded-full border-2 border-plum-800/10 bg-cream px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-coral-400"
          >
            <option value="all">All specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-plum-800/10 bg-cream px-4 py-2.5 text-sm font-semibold transition has-[:checked]:border-teal-400 has-[:checked]:bg-teal-50 has-[:checked]:text-teal-600">
            <input
              type="checkbox"
              checked={filters.insuranceOnly}
              onChange={(e) => update("insuranceOnly", e.target.checked)}
              className="h-3.5 w-3.5 accent-teal-500"
            />
            Insurance
          </label>

          {hasFilter && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  search: "",
                  type: "all",
                  city: "all",
                  specialization: "all",
                  insuranceOnly: false,
                })
              }
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-plum-800/60 transition hover:text-coral-600"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Type pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <TypePill
          active={filters.type === "all"}
          onClick={() => update("type", "all")}
        >
          All
        </TypePill>
        {RESOURCE_TYPES.map((t) => (
          <TypePill
            key={t.value}
            active={filters.type === t.value}
            onClick={() => update("type", t.value)}
          >
            {t.label}
          </TypePill>
        ))}

        <div className="ml-auto self-center text-xs text-plum-800/60">
          Showing <strong className="text-plum-900">{shownCount}</strong> of {totalCount}
        </div>
      </div>
    </div>
  );
}

function TypePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-plum-800 px-4 py-1.5 text-xs font-bold text-cream shadow-soft"
          : "rounded-full border border-plum-800/10 bg-white px-4 py-1.5 text-xs font-bold text-plum-800/70 transition hover:border-plum-800/30"
      }
    >
      {children}
    </button>
  );
}
