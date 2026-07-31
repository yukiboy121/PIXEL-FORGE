"use client";

import dynamic from "next/dynamic";
import { useEditorStore } from "@/lib/store";

const EditorToolbar = dynamic(() => import("@/components/editor/EditorToolbar"), { ssr: false });
const ToolSidebar = dynamic(() => import("@/components/editor/ToolSidebar"), { ssr: false });
const EditorCanvas = dynamic(() => import("@/components/editor/EditorCanvas"), { ssr: false });
const RightPanel = dynamic(() => import("@/components/editor/RightPanel"), { ssr: false });
const UploadZone = dynamic(() => import("@/components/editor/UploadZone"), { ssr: false });
const ExportDialog = dynamic(() => import("@/components/editor/ExportDialog"), { ssr: false });
const MobileEditor = dynamic(() => import("@/components/editor/MobileEditor"), { ssr: false });

function EditorContent() {
  const originalImageUrl = useEditorStore((s) => s.originalImageUrl);
  const hasImage = !!originalImageUrl;

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen flex-col bg-editor-bg">
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden">
          <ToolSidebar />
          <div className="flex-1 relative">
            {hasImage ? <EditorCanvas /> : <UploadZone />}
          </div>
          <RightPanel />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-screen flex flex-col bg-editor-bg">
        <MobileEditor />
      </div>

      <ExportDialog />
    </>
  );
}

export default function EditorPage() {
  return <EditorContent />;
}
