import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-plum-800/10 bg-cream/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-plum-800 text-cream">
              <span className="rainbow-text font-display text-xl font-bold">∞</span>
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Autism<span className="rainbow-text">Connect</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-plum-800/70">
            A parent-led home for autism resources, community, and AI
            guidance. Built with care in Georgia.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-plum-800/50">
            Product
          </div>
          <ul className="mt-4 space-y-2 text-sm text-plum-800/80">
            <li><a href="#features" className="hover:text-plum-900">Features</a></li>
            <li><a href="#coverage" className="hover:text-plum-900">Coverage</a></li>
            <li><a href="#waitlist" className="hover:text-plum-900">Waitlist</a></li>
            <li><Link href="/login" className="hover:text-plum-900">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-plum-800/50">
            Company
          </div>
          <ul className="mt-4 space-y-2 text-sm text-plum-800/80">
            <li><a href="mailto:hello@autismconnect.app" className="hover:text-plum-900">Contact</a></li>
            <li><Link href="/privacy" className="hover:text-plum-900">Privacy</Link></li>
            <li><Link href="/terms" className="hover:text-plum-900">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-plum-800/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-plum-800/60 sm:flex-row">
          <div>© {new Date().getFullYear()} AutismConnect. All rights reserved.</div>
          <div className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-coral-500" aria-hidden /> for autism families.
          </div>
        </div>
      </div>
    </footer>
  );
}
