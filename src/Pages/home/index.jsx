import { useSelector } from "react-redux";
import GoogleLogin from "../../components/Login";
import SideBar from "../../components/SideBar";
import ChatArea from "../../components/ChatArea";
import Artifact from "../../components/Artifact";

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="h-screen flex bg-[#0df14] text-white overflow-hidden">
      <SideBar/>
      <ChatArea/>
      <Artifact/>

      {!userData && <GoogleLogin />}
    </div>
  );
};

export default Home;
