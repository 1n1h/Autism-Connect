"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { ResourceFilter } from "./ResourceFilter";
import type { Resource, ResourceFilters } from "@/types/resource";

const INITIAL_FILTERS: ResourceFilters = {
  search: "",
  type: "all",
  city: "all",
  specialization: "all",
  insuranceOnly: false,
};

export function ResourcesView({ resources }: { resources: Resource[] }) {
  const [filters, setFilters] = useState<ResourceFilters>(INITIAL_FILTERS);

  const { cities, specializations } = useMemo(() => {
    const citySet = new Set<string>();
    const specSet = new Set<string>();
    for (const r of resources) {
      if (r.city) citySet.add(r.city);
      if (r.specializations) for (const s of r.specializations) specSet.add(s);
    }
    return {
      cities: Array.from(citySet).sort(),
      specializations: Array.from(specSet).sort(),
    };
  }, [resources]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return resources.filter((r) => {
      if (filters.type !== "all" && r.resource_type !== filters.type) return false;
      if (filters.city !== "all" && r.city !== filters.city) return false;
      if (
        filters.specialization !== "all" &&
        !(r.specializations ?? []).includes(filters.specialization)
      ) {
        return false;
      }
      if (filters.insuranceOnly && !r.accepts_insurance) return false;
      if (q) {
        const haystack = [
          r.name,
          r.description,
          r.city,
          r.state,
          ...(r.specializations ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [resources, filters]);

  return (
    <div>
      <ResourceFilter
        filters={filters}
        onChange={setFilters}
        cities={cities}
        specializations={specializations}
        totalCount={resources.length}
        shownCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 rounded-3xl border-2 border-dashed border-plum-800/10 bg-white/50 p-12 text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-800/5">
            <SearchX className="h-7 w-7 text-plum-800/50" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-plum-900">
            No matches — yet.
          </h3>
          <p className="mt-2 text-sm text-plum-800/70">
            Try clearing a filter or searching a different term. More
            providers land every week.
          </p>
        </motion.div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => (
            <ResourceCard key={r.id} resource={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
