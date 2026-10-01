import { Mic, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage } from "../../features/chatActions.js";
import { agentsList } from "../../utils/staticData/agents.jsx";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");

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

  const handleSendMessage = async () => {
    const prompt = value.trim();
    if (!prompt || disabled) return;
    const result = await dispatch(sendChatMessage({ prompt, conversationId,agent:selectedAgent.toLowerCase() }));
    if (sendChatMessage.fulfilled.match(result)) setValue("");
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
            <button
              disabled
              title="Attachments are not available yet"
              className="p-2 text-slate-600"
            >
              <Paperclip size={16} />
            </button>
            <button
              disabled
              title="Voice input is not available yet"
              className="p-2 text-slate-600"
            >
              <Mic size={16} />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={disabled || !value.trim()}
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
