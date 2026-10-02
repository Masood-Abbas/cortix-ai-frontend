import { Check, Code2, Copy, Download, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGFM from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MessageBubble = ({
  role,
  content,
  images = [],
  artifacts = [],
  onSelectArtifact,
}) => {
  const isUser = role === "user";
  const visibleArtifacts = Array.isArray(artifacts)
    ? artifacts.filter((artifact) => artifact?.files?.length)
    : [];
  const visibleImages = Array.isArray(images)
    ? images.filter(Boolean).slice(0, 4)
    : [];
  const [lightBox, setLightbox] = useState(null);

  const [copyCode, setCopyCode] = useState("");

  const copyCodeData = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopyCode(code);
    setTimeout(() => {
      setCopyCode(null);
    }, 2000);
  };

  const downloadImage = async (src) => {
    const fileName = `generated-image-${Date.now()}.webp`;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      const link = document.createElement("a");
      link.href = src;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.click();
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      <div
        className={`w-fit max-w-[92vw]  md:max-w-[72%] px-4 py-2.5 text-left rounded-2xl wrap-break-word text-[13.5px] overflow-hidden leading-relaxed ${
          isUser
            ? "bg-linear-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
            : "text-slate-200 rounded-200 rounded-tl-sm "
        }`}
      >
        <Markdown
          remarkPlugins={[remarkGFM]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 whitespace-pre-wrap wrap-break-word">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/10">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-white/10  px-3 py-2 ">{children}</td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline inline-flex items-center gap-1 wrap-break-word"
              >
                {children} <ExternalLink size={14} />
              </a>
            ),
            code: ({ className, children }) => {
              const value = String(children).trim();
              if (!className) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-400">
                    {value}
                  </code>
                );
              }
              const language = className?.replace("language-", "");
              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                  <div
                    className="flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2
                  "
                  >
                    <span className="uppercase text-xs text-slate-400">
                      {language}
                    </span>
                    <button
                      className="flex items-center gap-1 text-xs cursor-pointer"
                      onClick={() => copyCodeData(value)}
                    >
                      {copyCode == value ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> copy
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#0d1117",
                      fontSize: "13px",
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>
                </div>
              );
            },
            img:({src})=>{
              if(!src) return null;
              return(
                <img
                src={src}
                onClick={()=>setLightbox(src)}
                loading="lazy"
                onError={(e)=>e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in "
                />
              )
            }
          }}
        >
          {content}
        </Markdown>
        {visibleImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {visibleImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-white/10"
              >
                <img
                  src={src}
                  alt="no-image"
                  onError={(e) => {
                    console.log("Failed:", src);
                    e.currentTarget.parentElement?.remove();
                  }}
                  onClick={() => setLightbox(src)}
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    downloadImage(src);
                  }}
                  title="Download image"
                  aria-label="Download image"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                >
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {visibleArtifacts.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectArtifact?.(visibleArtifacts.at(-1)?.id)}
            className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/15 transition-colors"
          >
            <Code2 size={14} />
            Show code preview
          </button>
        )}
      </div>

      {lightBox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
          >
            <X />
          </button>
          <button
            onClick={() => downloadImage(lightBox)}
            className="absolute top-5 right-17 text-white/80 hover:text-white bg-white/10 rounded-full p-2"
            title="Download image"
            aria-label="Download image"
          >
            <Download />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
