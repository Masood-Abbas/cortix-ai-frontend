import { useSelector } from "react-redux";
import { useState } from "react";
import GoogleLogin from "../../components/Login";
import SideBar from "../../components/SideBar";
import ChatArea from "../../components/ChatArea";
import Artifact from "../../components/Artifact";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [artifactOpen, setArtifactOpen] = useState(false);

  return (
    <div className="h-[100svh] w-full flex bg-[#0d0f14] text-white overflow-hidden">
      <SideBar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <ChatArea
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenArtifact={() => setArtifactOpen(true)}
      />
      <Artifact
        mobileOpen={artifactOpen}
        onMobileClose={() => setArtifactOpen(false)}
      />

      {!userData && <GoogleLogin />}
    </div>
  );
};

export default Home;
