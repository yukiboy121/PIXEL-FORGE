"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { createLocalProject } from "@/lib/local-projects";
import { getSession } from "@/lib/local-auth";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 50 * 1024 * 1024;

export default function UploadZone() {
  const { setOriginalImage } = useEditorStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported format. Please use JPEG, PNG, or WebP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("File too large. Maximum size is 50MB.");
        return;
      }

      const user = getSession();
      if (!user) {
        setError("Please log in before creating a project.");
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = async () => {
        try {
          await createLocalProject(file, img.naturalWidth, img.naturalHeight, user.email);
        } catch {
          setError("Could not save this project locally. Check available browser storage.");
          URL.revokeObjectURL(url);
          return;
        }
        setOriginalImage(url, file, img.naturalWidth, img.naturalHeight);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("Failed to read image. The file may be corrupted.");
      };
      img.src = url;
    },
    [setOriginalImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    },
    [processFile]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            isDragOver
              ? "border-accent bg-accent/5"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
          />
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition ${
              isDragOver ? "bg-accent/10" : "bg-white/5 group-hover:bg-white/10"
            }`}
          >
            {isDragOver ? (
              <ImageIcon className="h-7 w-7 text-accent" />
            ) : (
              <Upload className="h-7 w-7 text-white/30 group-hover:text-white/50" />
            )}
          </div>
          <p className="mt-5 text-base font-medium text-white/70">
            {isDragOver ? "Release to upload" : "Drop your image here"}
          </p>
          <p className="mt-1.5 text-sm text-white/30">or browse from your computer</p>
          <p className="mt-4 text-xs text-white/20">
            JPEG, PNG, WebP — up to 50MB
          </p>
          <p className="mt-1 text-xs text-white/15">
            You can also paste an image from clipboard
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-error/10 px-4 py-3 text-sm text-error"
            >
              <X className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
