import { useEffect } from "react";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import NavChat from "./NavChat";
import { useDispatch, useSelector } from "react-redux";
import { getMessages } from "../../features/getMessages";
import { setMessages } from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  useEffect(() => {
    const getMesg = async () => {
      if (selectedConversation) {
        const data = await getMessages(selectedConversation?._id);
        dispatch(setMessages(data));
        console.log("mesages start")
      }
    };
    getMesg()
  }, [selectedConversation, dispatch]);
  return (
    <div className="flex-1 flex flex-col">
      <NavChat />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatArea;
