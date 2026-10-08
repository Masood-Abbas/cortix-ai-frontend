import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import NavChat from "./NavChat";
import { useDispatch, useSelector } from "react-redux";
import { loadMessages } from "../../features/chatActions.js";

const ChatArea = ({ onOpenSidebar, onOpenArtifact }) => {
  const id = useSelector((state) => state.conversation.selectedConversation?._id);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!id) return;
    const request = dispatch(loadMessages(id));
    return () => request.abort();
  }, [id, dispatch]);
  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col">
      <NavChat
        onOpenSidebar={onOpenSidebar}
        onOpenArtifact={onOpenArtifact}
      />
      <MessageList />
      <ChatInput key={id || "new-chat"} />
    </div>
  );
};

export default ChatArea;
