import { Code2, Menu, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { selectArtifactEntries, selectMessages } from "../redux/messageSlice.js";

const NavChat = ({ onOpenSidebar, onOpenArtifact }) => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const messages = useSelector(selectMessages);
  const artifactEntries = useSelector(selectArtifactEntries);
  return (
    <div className="h-14 flex items-center px-3 sm:px-5 border-b gap-2.5 border-white/6 bg-[#0d0f14]">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5"
        aria-label="Open sidebar"
      >
        <Menu size={17} />
      </button>
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <MessageSquare  size={13} className="text-indigo-400"/>
      </div>

      <div className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-slate-100 tracking-tight">{selectedConversation?.title || "New Chat"}</div>
      <div className="hidden sm:block text-[10px] font-medium text-slate-600 bg-white/4 border border-white/6 py-0.5 rounded-full px-2 whitespace-nowrap">{messages?.length} Messages</div>
      {artifactEntries.length > 0 && (
        <button
          type="button"
          onClick={onOpenArtifact}
          className="xl:hidden flex items-center justify-center gap-1.5 h-8 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2 text-xs text-indigo-200 hover:bg-indigo-500/15"
          aria-label="Open artifacts"
        >
          <Code2 size={15} />
          <span className="hidden sm:inline">Artifacts</span>
        </button>
      )}
    </div>
  );
};

export default NavChat;
