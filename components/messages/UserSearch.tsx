"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import type { MessageAuthor } from "@/types/messaging";

export function UserSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MessageAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!ctrl.signal.aborted) setResults(data.users ?? []);
      } catch { /* aborted */ }
      finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function startConversation(id: string) {
    router.push(`/messages/${id}`);
  }

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-800/40" />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Find a parent by name or city..."
          className="w-full rounded-full border-2 border-plum-800/10 bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:border-coral-400 focus:shadow-glow"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              setQ("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-plum-800/40 hover:text-plum-900"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-plum-800/10 bg-white shadow-soft">
          {loading ? (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-plum-800/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-plum-800/60">
              No parents match &ldquo;{q}&rdquo;.
            </div>
          ) : (
            <ul className="divide-y divide-plum-800/5">
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => startConversation(u.id)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-cream/60"
                  >
                    {u.profile_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.profile_photo_url}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-coral-300 to-teal-300 text-xs font-bold text-plum-900">
                        {(u.first_name ?? "P").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-plum-900">
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") || "Parent"}
                      </div>
                      {(u.location || u.state) && (
                        <div className="text-xs text-plum-800/60">
                          {[u.location, u.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
