import { Mic, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import sendMessage from "../../features/sendMessage";
import { useSelector } from "react-redux";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const {selectedConverstion}= useSelector(state=>state.conversation)
  const handleSendMessage=async () => {
    try {
      const payload={
         prompt:value.trim(),
         conversationId:selectedConverstion?._id
      }
      const data= await sendMessage(payload)
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="w-full overflow-hidden px-3  md:px-5 py-4 border-t border-white/6 bg-[#0d0f14]">
      <div className="flext frex-col gap-2 bg-white/3 boder border-white/7 px-4 pt-3.5 pb-3 rounded-2xl">
        <textarea
          placeholder="Ask Anything..."
          onChange={(e) => setValue(e.target.value)}
          value={value.trim()}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed scrollbar-none [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer">
              <Paperclip size={16} />
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/6 transition-all duration-150 bg-transparent cursor-pointer">
              <Mic size={16} />
            </button>
          </div>
          {/* send button */}
          <button
          onClick={handleSendMessage}
          disabled={!value}
           className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all duration-150  ${value.trim()?"bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white/80":"bg-white/5 text-slate-600 cursor-not-allowed"} `}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
