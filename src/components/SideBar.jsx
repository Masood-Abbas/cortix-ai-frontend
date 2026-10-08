import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRightIcon,
  PenSquare,
  Plus,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getConversation } from "../../features/getConversations";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { logout } from "../../features/logout";
import { setUserData } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

const SideBar = ({ mobileOpen = false, onMobileClose }) => {
  const dispatch = useDispatch();

  const { conversations = [], selectedConversation } = useSelector(
    (state) => state.conversation,
  );

  const { userData } = useSelector((state) => state.user);

  const [collapsed, setCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [listError, setListError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [showBilling,setShowBilling]=useState(false)

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      dispatch(setUserData(null));
    } catch {
      setListError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const userId = userData?._id || userData?.user?._id;

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const getConv = async () => {
      try {
        const data = await getConversation(controller.signal);
        if (!controller.signal.aborted) {
          dispatch(setConversations(data));
          setListError(null);
        }
      } catch {
        if (!controller.signal.aborted) setListError("Could not load recent chats.");
      }
    };

    getConv();
    return () => controller.abort();
  }, [userId, dispatch]);

  // const handlecreateCon = async () => {
  //   const data = await createConversation();
  //   dispatch(addConversation(data));
  // };

  const avatar = userData?.avatar || userData?.user?.avatar;

  return (
    <>
    {mobileOpen && (
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onMobileClose}
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
      />
    )}
    <div
      className={`fixed lg:static inset-y-0 left-0 z-50 h-[100svh] shrink-0 bg-[#0d0f14] border-r border-white/6 transition-all duration-300 ${
        collapsed ? "w-16" : "w-67.5"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className="flex flex-col h-full">
        {/* header */}
        <div
          className={`flex items-center gap-2.5 p-4 border-b border-white/6 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div
            className=" flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
           {collapsed?<PanelRightIcon size={16} /> :<PanelLeftIcon size={16} />}
          </div>

          {!collapsed && (
            <>
              <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1 text-left!">
                CortexAi
              </span>

              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide">
                Free
              </span>

              <button
                className="flex justify-center items-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors duration-150 bg-transparent border-none cursor-pointer"
                 onClick={()=>dispatch(setSelectedConversation(null))}
              >
                <PenSquare size={14} />
              </button>
            </>
          )}
        </div>

        {/* new chat button */}
        <div
          className={`px-4 pt-4 pb-1 ${
            collapsed ? "px-2" : ""
          }`}
        >
          <button
            className={`w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-br from-indigo-500 to-violet-700 rounded-xl py-2.5 border-none cursor-pointer hover:opacity-90 transition-opacity duration-150 ${
              collapsed ? "px-0" : ""
            }`}
            onClick={()=>dispatch(setSelectedConversation(null))}
            title={collapsed ? "New Chat" : ""}
          >
            <Plus size={18} />

            {!collapsed && "New Chat"}
          </button>
        </div>

        {/* recent heading */}
        {!collapsed && (
          <>
            {conversations?.length == 0 ? (
              <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
                No Recent Conversations
              </div>
            ) : (
              <div className="px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-slate-600">
                Recents
              </div>
            )}
          </>
        )}

        {/* conversations */}
        <div
          className={`flex-1 overflow-y-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden ${
            collapsed ? "px-2.5 pt-3" : "px-2.5"
          }`}
        >
          {listError && <p role="alert" className="px-3 text-xs text-red-400">{listError}</p>}
          {conversations.map((conv, i) => {
            const isActive = selectedConversation?._id == conv?._id;

            return (
              <div
                key={conv?._id || i}
                onClick={() => {
                  dispatch(setSelectedConversation(conv));
                  onMobileClose?.();
                }}
                title={collapsed ? conv?.title || "New Chat" : ""}
                className={`flex items-center gap-2.5 cursor-pointer mb-0.5 px-3 py-2.5 rounded-[10px] border transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/18"
                    : "bg-transparent border-transparent"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <div
                  className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  <MessageSquare size={13} />
                </div>

                {!collapsed && (
                  <span
                    className={`text-[13px] font-medium truncate ${
                      isActive ? "text-slate-100" : "text-slate-300"
                    }`}
                  >
                    {conv?.title || "New Chat"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* footer */}
        <div className="mx-2.5 h-px bg-white/6" />

        <div className={`${collapsed ? "p-2" : "p-3.5"}`}>
          {userData ? (
            <div
              className={`flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors duration-150 ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              {/* image */}
              <div className="relative shrink-0">
                {avatar && !imageError ? (
                  <div>
                    <img
                      className="w-9 h-9 rounded-[10px] object-cover border-2 border-indigo-500/25"
                      src={avatar}
                      alt={userData?.name || "user"}
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-[10px] bg-white/6 flex items-center justify-center">
                    <User size={15} className="text-slate-400" />
                  </div>
                )}
              </div>

              {/* name */}
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-100 truncate text-left">
                      {userData?.name ||
                        userData?.user?.name ||
                        "user"}
                    </p>

                    <p className="text-[11px] text-slate-600 mt-px text-left">
                      Free Plan
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                    onClick={()=>setShowBilling(true)}
                      className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                    >
                      <Coins size={16} />
                    </button>

                    <button
                      className="flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/8 hover:text-slate-400 transition-all duration-150"
                      disabled={loggingOut}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              )}

              {/* logout when collapsed */}
              {collapsed && (
                <button
                  title="Log out"
                  aria-label="Log out"
                  disabled={loggingOut}
                  onClick={handleLogout}
                ><LogOut size={14} /></button>
              )}
            </div>
          ) : (
            !collapsed && (
              <button className="w-full flex item-center justify-center gap-2 text-sm font-medium text-slate-200 bg-white/5 border border-white/8 rounded-xl py-2.75 cursor-pointer hover:bg-white/8 transition-colors duration-150">
                Login
              </button>
            )
          )}
        </div>
      </div>
      <BillingDrawer
      open={showBilling}
      onClose={()=>setShowBilling(false)}
      />
    </div>
    </>
  );
};

export default SideBar;
