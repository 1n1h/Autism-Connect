"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper, { type Area } from "react-easy-crop";
import { ZoomIn, ZoomOut, X, Check, Loader2 } from "lucide-react";
import { getCroppedBlob } from "@/lib/image/crop";

export function CropModal({
  src,
  open,
  onCancel,
  onConfirm,
}: {
  src: string | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset state whenever a fresh image is loaded
  useEffect(() => {
    if (open && src) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setArea(null);
    }
  }, [open, src]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  async function handleSave() {
    if (!src || !area) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(src, area);
      await onConfirm(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum-900/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-label="Crop your photo"
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-4xl bg-white shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-plum-800/5 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-plum-900">
                  Center your face
                </h2>
                <p className="text-xs text-plum-800/60">
                  Drag to reposition. Use the slider to zoom.
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Cancel"
                className="rounded-full p-1.5 text-plum-800/50 transition hover:bg-plum-800/5 hover:text-plum-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper area */}
            <div className="relative h-[360px] w-full bg-plum-900">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                classes={{ containerClassName: "bg-plum-900" }}
              />
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-3 border-t border-plum-800/5 px-6 py-4">
              <ZoomOut className="h-4 w-4 text-plum-800/50" />
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                aria-label="Zoom"
                className="flex-1 accent-coral-500"
              />
              <ZoomIn className="h-4 w-4 text-plum-800/50" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-plum-800/5 bg-cream px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full px-5 py-2 text-sm font-semibold text-plum-800/70 transition hover:text-plum-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!area || saving}
                className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:bg-plum-700 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Use photo
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
