import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveArtifact,
  selectArtifactEntries,
  setSelectedArtifact,
} from "../redux/messageSlice.js";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import Editor from "@monaco-editor/react";
import {
  Code2,
  PanelLeftClose,
  PanelRightClose,
  Copy,
  Eye,
  Check,
  X,
} from "lucide-react";

const Artifact = ({ mobileOpen = false, onMobileClose }) => {
  const dispatch = useDispatch();
  const artifactEntries = useSelector(selectArtifactEntries);
  const selectedArtifactId = useSelector((state) => state.message.selectedArtifactId);
  const artifact = useSelector(selectActiveArtifact);
  const files = useMemo(() => artifact?.files || [], [artifact]);

  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("code");
  const [activeFile, setActiveFile] = useState(0);

  const [copied, setCopied] = useState(false);

  

  if (artifactEntries?.length == 0) return null;

  const file = files[activeFile] || files[0];
  const htmlFile = files.find(
    (f) => f.name === "index.html",
  )?.content;
  const cssFile = files.find(
    (f) => f.name === "style.css",
  )?.content;
  const jsFile = files.find(
    (f) => f.name === "script.js",
  )?.content;

  const canPreview = Boolean(htmlFile);

  const previewDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    ${cssFile || ""}
    </style>
</head>
<body>
    ${htmlFile || ""}
    <script>
        ${jsFile || ""}
    </script>
</body>
</html>`;

  // detect Language based on file extension
  const detectLanguage = (fileName = "") => {
    const name = fileName.toLowerCase();
    if (name.endsWith(".html")) return "html";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".js")) return "javascript";
    if (name.endsWith(".jsx")) return "javascript";
    if (name.endsWith(".tsx")) return "typescript";
    if (name.endsWith(".py")) return "python";
    if (name.endsWith(".java")) return "java";
    if (name.endsWith(".cpp")) return "cpp";
    if (name.endsWith(".c")) return "c";

    return "plaintext";
  };


  const handleCopy =async () => {
    await navigator.clipboard.writeText(file?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: mobileOpen ? "100vw" : collapsed ? 48 : 360 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      className={`${mobileOpen ? "fixed inset-0 z-50 flex w-full" : "hidden"} xl:static xl:z-auto xl:flex h-full border border-white/6 flex-col overflow-hidden shrink-0 bg-[#0d0f14]`}
    >
      {!collapsed ? (
        <div className="flex flex-col h-full bg-[#0d0f14]">
          {/* title */}
          <div className="h-14 px-3 sm:px-4 border-b border-white/6 flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              className="hidden xl:flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0
        "
              onClick={() => setCollapsed(true)}
            >
              <PanelRightClose size={16} />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Code2 size={12} className="text-indigo-400" />
              </div>
              {/* <div className="text-[13px] font-medium to-slate-200 truncate">
                {artifact?.title || "Untitled Artifact"}
              </div> */}
            </div>
            <button
              className="xl:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0"
              onClick={onMobileClose}
              aria-label="Close artifacts"
            >
              <X size={17} />
            </button>

            {/* content or code editor */}

            <div className="flex items-center gap-1 shrink-0">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium to-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={handleCopy}
              
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            {canPreview && (
              <div className="flex items-center gap-1 bg-white/4 border border-white/6 p-1rounded-lg">
                <button
                  onClick={() => setTab("code")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150 ${tab === "code" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                >
                  <Code2 size={11} /> Code
                </button>
                <button
                  onClick={() => setTab("preview")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150 ${tab === "preview" ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-slate-200"}`}
                >
                  <Eye size={11} /> Preview
                </button>
              </div>
            )}
          </div>
          <div className="border-b border-white/6 p-2 space-y-1 shrink-0 max-h-32 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            {artifactEntries.map((entry) => {
              const isActive =
                entry.id === String(selectedArtifactId) ||
                (!selectedArtifactId && entry.id === artifactEntries.at(-1)?.id);
              return (
                <button
                  key={`${entry.id}-${entry.messageIndex}-${entry.artifactIndex}`}
                  onClick={() => {
                    dispatch(setSelectedArtifact(entry.id));
                    setActiveFile(0);
                  }}
                  className={`w-full text-left rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-200"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className="block truncate">
                    {entry.artifact?.title || `Artifact ${entry.messageIndex + 1}`}
                  </span>
                  <span className="block text-[11px] opacity-70">
                    {entry.artifact?.files?.length || 0} files
                  </span>
                </button>
              );
            })}
          </div>

          {/* tabs */}
          {tab === "code" && (
              <div className="h-auto flex border-b border-white/6 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden shrink-0">
                {files.map((f, i) => (
                  <button
                    onClick={() => setActiveFile(i)}
                    key={i}
                    className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/5 relative cursor-pointer bg-transparent 
            ${activeFile === i ? "text-indigo-400" : "text-slate-500 hover:text-slate-300 "}`}
                  >
                    {f.name}
                    {activeFile === i && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
          )}

          {/* code editor */}

          <div className="flex-1 overflow-hidden">
            {tab === "preview" && canPreview ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full "
              >
                <iframe
                  title="preview"
                  srcDoc={previewDoc}
                  className="w-full h-full "
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full "
              >
                <Editor
                  theme="vs-dark"
                  language={detectLanguage(file?.name)}
                  value={file?.content || ""}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 8 },
                  lineNumbers: "on",
                  renderLineHighlight: "none",
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden xl:flex h-full border border-white/6 bg-[#0d0f14] flex-col items-center py-4 gap-3 shrink-0">
          <button
            className="flex  items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0
        "
            onClick={() => setCollapsed(false)}
          >
            <PanelLeftClose size={16} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap truncate"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              {artifact?.title || "Untitled Artifact"}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Artifact;
