"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  GraduationCap,
  Stethoscope,
  Users,
  MapPin,
  Phone,
  Globe,
  Mail,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Resource } from "@/types/resource";
import { humanizeSpecialization } from "@/types/resource";

const TYPE_META: Record<
  string,
  { icon: LucideIcon; label: string; bg: string; fg: string; gradient: string }
> = {
  therapy: {
    icon: Heart,
    label: "Therapy",
    bg: "bg-coral-100",
    fg: "text-coral-600",
    gradient: "from-coral-200 via-coral-100 to-sunny-200",
  },
  school: {
    icon: GraduationCap,
    label: "School",
    bg: "bg-teal-100",
    fg: "text-teal-600",
    gradient: "from-teal-200 via-teal-100 to-lavender-100",
  },
  doctor: {
    icon: Stethoscope,
    label: "Doctor / Diagnostic",
    bg: "bg-lavender-100",
    fg: "text-lavender-400",
    gradient: "from-lavender-200 via-lavender-100 to-sunny-200",
  },
  nonprofit: {
    icon: Users,
    label: "Nonprofit / Support",
    bg: "bg-sunny-200",
    fg: "text-plum-900",
    gradient: "from-sunny-200 via-coral-100 to-teal-100",
  },
};

export function ResourceDetail({ resource }: { resource: Resource }) {
  const meta = TYPE_META[resource.resource_type ?? ""] ?? TYPE_META.nonprofit;
  const Icon = meta.icon;
  const fullAddress = [resource.address, resource.city, resource.state, resource.zip_code]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = fullAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/resources"
        className="inline-flex items-center gap-2 text-sm font-semibold text-plum-800/70 hover:text-plum-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to resources
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6"
      >
        {/* Hero */}
        <div className={`relative overflow-hidden rounded-4xl bg-gradient-to-br ${meta.gradient} p-8 md:p-12`}>
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl"
          />
          <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white ${meta.fg} shadow-soft`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="mt-4 text-xs font-bold uppercase tracking-wider text-plum-900/70">
            {meta.label}
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
            {resource.name}
          </h1>
          {resource.description && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-plum-900/80">
              {resource.description}
            </p>
          )}
        </div>

        {/* Info grid */}
        <div className="mt-6 grid gap-5 md:grid-cols-[1.4fr_1fr]">
          {/* Contact card */}
          <div className="rounded-3xl border border-plum-800/5 bg-white p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold text-plum-900">Contact</h2>
            <div className="mt-4 space-y-4 text-sm">
              {fullAddress && (
                <InfoRow icon={MapPin} label="Address">
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-plum-900 hover:text-coral-600"
                    >
                      {fullAddress}
                    </a>
                  ) : (
                    fullAddress
                  )}
                </InfoRow>
              )}
              {resource.phone && (
                <InfoRow icon={Phone} label="Phone">
                  <a href={`tel:${resource.phone}`} className="text-plum-900 hover:text-coral-600">
                    {resource.phone}
                  </a>
                </InfoRow>
              )}
              {resource.email && (
                <InfoRow icon={Mail} label="Email">
                  <a href={`mailto:${resource.email}`} className="text-plum-900 hover:text-coral-600">
                    {resource.email}
                  </a>
                </InfoRow>
              )}
              {resource.website && (
                <InfoRow icon={Globe} label="Website">
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-plum-900 hover:text-coral-600"
                  >
                    {resource.website}
                  </a>
                </InfoRow>
              )}

              {resource.website && (
                <a
                  href={resource.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700"
                >
                  Visit website →
                </a>
              )}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
              <div className="text-xs font-bold uppercase tracking-wider text-plum-800/60">
                Insurance
              </div>
              <div className="mt-2 flex items-center gap-2">
                {resource.accepts_insurance === true ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-teal-500" />
                    <span className="font-semibold text-plum-900">Accepted</span>
                  </>
                ) : resource.accepts_insurance === false ? (
                  <>
                    <ShieldX className="h-5 w-5 text-plum-800/40" />
                    <span className="font-semibold text-plum-800/70">Not accepted / private pay</span>
                  </>
                ) : (
                  <span className="text-sm text-plum-800/60">Contact provider to confirm</span>
                )}
              </div>
            </div>

            {resource.specializations && resource.specializations.length > 0 && (
              <div className="rounded-3xl border border-plum-800/5 bg-white p-6 shadow-soft">
                <div className="text-xs font-bold uppercase tracking-wider text-plum-800/60">
                  Specializations
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resource.specializations.map((s) => (
                    <span
                      key={s}
                      className={`rounded-full ${meta.bg} px-3 py-1 text-xs font-semibold ${meta.fg}`}
                    >
                      {humanizeSpecialization(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-xs text-plum-800/50">
          Information shown is collected from each provider&apos;s public site. Please
          confirm hours, insurance, and waitlists directly with the provider
          before visiting.
        </p>
      </motion.div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-plum-800/5 text-plum-800/70">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-plum-800/50">
          {label}
        </div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
