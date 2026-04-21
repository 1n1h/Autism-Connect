"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Users,
  MapPin,
  Phone,
  Globe,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Resource } from "@/types/resource";
import { humanizeSpecialization } from "@/types/resource";

const TYPE_META: Record<
  string,
  { icon: LucideIcon; label: string; bg: string; fg: string }
> = {
  therapy: { icon: Heart, label: "Therapy", bg: "bg-coral-100", fg: "text-coral-600" },
  school: { icon: GraduationCap, label: "School", bg: "bg-teal-100", fg: "text-teal-600" },
  doctor: { icon: Stethoscope, label: "Diagnostic", bg: "bg-lavender-100", fg: "text-lavender-400" },
  nonprofit: { icon: Users, label: "Nonprofit", bg: "bg-sunny-200", fg: "text-plum-900" },
};

export function ResourceCard({ resource, index = 0 }: { resource: Resource; index?: number }) {
  const meta = TYPE_META[resource.resource_type ?? ""] ?? TYPE_META.nonprofit;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/resources/${resource.id}`}
        className="group relative block overflow-hidden rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft transition"
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.bg}`}>
            <Icon className={`h-6 w-6 ${meta.fg}`} />
          </div>
          {resource.accepts_insurance && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-600">
              <ShieldCheck className="h-3 w-3" />
              Insurance
            </span>
          )}
        </div>

        <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-plum-800/60">
          {meta.label}
        </div>
        <h3 className="mt-1 font-display text-lg font-bold leading-tight text-plum-900 group-hover:text-coral-600">
          {resource.name}
        </h3>

        {resource.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-plum-800/70">
            {resource.description}
          </p>
        )}

        <div className="mt-4 space-y-1.5 text-xs text-plum-800/70">
          {(resource.city || resource.state) && (
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {[resource.city, resource.state].filter(Boolean).join(", ")}
            </div>
          )}
          {resource.phone && (
            <div className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {resource.phone}
            </div>
          )}
          {resource.website && (
            <div className="inline-flex items-center gap-1.5 truncate">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{displayDomain(resource.website)}</span>
            </div>
          )}
        </div>

        {resource.specializations && resource.specializations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {resource.specializations.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full bg-plum-800/5 px-2.5 py-1 text-[10px] font-semibold text-plum-800/70"
              >
                {humanizeSpecialization(s)}
              </span>
            ))}
            {resource.specializations.length > 3 && (
              <span className="rounded-full bg-plum-800/5 px-2.5 py-1 text-[10px] font-semibold text-plum-800/50">
                +{resource.specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function displayDomain(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
