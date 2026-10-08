import { FileText, Mic, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage } from "../../features/chatActions.js";
import { agentsList } from "../../utils/staticData/agents.jsx";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");

  const [selectedFile,setSelectedFile]=useState(null)

  const fileRef=useRef(null)

  const conversationId = useSelector(
    (state) => state.conversation.selectedConversation?._id,
  );
  const { sendRequestId, error } = useSelector((state) => state.message);
  const chat = useSelector(
    (state) => state.message.byConversation[conversationId],
  );
  const user = useSelector((state) => state.user.userData);

  const dispatch = useDispatch();
  const disabled =
    !user || Boolean(sendRequestId) || Boolean(chat?.loading || chat?.error);
  const isSelectedImage = selectedFile?.type?.startsWith("image/");
  const previewUrl = useMemo(
    () => (selectedFile && isSelectedImage ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile, isSelectedImage],
  );

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSendMessage = async () => {
    const prompt = value.trim();
    const attachedFile = selectedFile || fileRef.current?.files?.[0] || null;
    if ((!prompt && !attachedFile) || disabled) return;
    const result = await dispatch(sendChatMessage({ prompt, conversationId,agent:selectedAgent.toLowerCase(), file:attachedFile }));
    if (sendChatMessage.fulfilled.match(result)) {
      setValue("");
      clearSelectedFile();
    }
  };

  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      {!conversationId && error && (
        <p role="alert" className="text-red-400 mb-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 bg-white/3 border border-white/7 px-4 pt-3.5 pb-3 rounded-2xl">
        {/* agent list */}
        <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
          {agentsList.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;

            return (
              <div
              onClick={()=>setSelectedAgent(agent.label)}
                className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isActive
                    ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)] "
                    : " bg-white/3 text-slate-400 border-white/6 hover:border-white/7"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </div>
            );
          })}
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
            {isSelectedImage && previewUrl ? (
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="h-12 w-12 rounded-lg object-cover border border-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-300">
                <FileText size={22} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {isSelectedImage ? "Image selected" : "File selected"}
              </p>
            </div>
            <button
              type="button"
              title="Remove attachment"
              onClick={clearSelectedFile}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* text-area */}
        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          disabled={disabled}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
          <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e)=>{ const file = e.target.files[0]
            if(file){
              setSelectedFile(file)
            }
          }}/>
            <button
              title="Attachments are  available t"
              className="p-2  cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent" 
              onClick={()=>fileRef.current.click()}>
              <Paperclip size={16} />
            </button>
            <button
              title="Voice input is not available yet"
              className="p-2  cursor-pointer flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent"
            >
              <Mic size={16} />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={disabled || (!value.trim() && !selectedFile)}
            aria-label="Send message"
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150 bg-linear-to-br from-indigo-500 to-violet-700 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
