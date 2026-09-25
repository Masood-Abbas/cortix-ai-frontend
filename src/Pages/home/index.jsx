import { useSelector } from "react-redux";
import GoogleLogin from "../../components/login";

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  console.log(userData);

  return (
    <div className="h-screen flex bg-[#0df14] text-white overflow-hidden">
      {!userData && <GoogleLogin />}
    </div>
  );
};

export default Home;