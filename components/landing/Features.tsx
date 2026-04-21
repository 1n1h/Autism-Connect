"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Bot, MessageCircle, MapPin, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  blurb: string;
  accent: string;
  iconBg: string;
  iconColor: string;
};

const features: Feature[] = [
  {
    icon: BookOpen,
    title: "Resource library",
    blurb:
      "40+ verified Georgia resources — therapists, schools, doctors, nonprofits. Filter by type, city, specialization, insurance.",
    accent: "from-coral-200 to-coral-100",
    iconBg: "bg-coral-100",
    iconColor: "text-coral-600",
  },
  {
    icon: Users,
    title: "Parent community",
    blurb:
      "A blog feed by and for parents. Share what worked. Ask hard questions. Find people who really get it.",
    accent: "from-teal-200 to-teal-100",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    icon: Bot,
    title: "AI guidance",
    blurb:
      "Ask anything about diagnoses, IEPs, therapies, benefits. Our AI links straight to the resources on the site.",
    accent: "from-lavender-200 to-lavender-100",
    iconBg: "bg-lavender-100",
    iconColor: "text-lavender-400",
  },
  {
    icon: MessageCircle,
    title: "Direct messaging",
    blurb:
      "Message another parent one-on-one. Trade school district tips, therapist referrals, or just vent.",
    accent: "from-sunny-200 to-coral-100",
    iconBg: "bg-sunny-200",
    iconColor: "text-plum-800",
  },
  {
    icon: MapPin,
    title: "Hyperlocal first",
    blurb:
      "We start in Georgia so the info is actually real — addresses, insurance, waitlists. New states rolling in.",
    accent: "from-teal-200 to-sunny-200",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    blurb:
      "Your child's details stay yours. Row-level security on everything, no data sold, ever.",
    accent: "from-plum-800/10 to-lavender-100",
    iconBg: "bg-plum-800",
    iconColor: "text-cream",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="inline-flex rounded-full bg-teal-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600">
            Everything parents need
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-plum-900 md:text-5xl">
            Less searching. <span className="rainbow-text">More time with your kid.</span>
          </h2>
          <p className="mt-4 text-lg text-plum-800/70">
            We&apos;ve pulled the hundred tabs you have open into one warm,
            searchable home — plus the humans and AI to help you use it.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-plum-800/5 bg-white p-7 shadow-soft"
            >
              <div
                className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${feature.accent} opacity-60 blur-2xl transition duration-500 group-hover:opacity-90`}
              />
              <div className="relative">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-plum-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-plum-800/70">
                  {feature.blurb}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
