import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import api from "../../utils/axios";
import { auth, googleProvider } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";


const GoogleLogin = () => {
    const dispatch=useDispatch()
  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const token = await result.user.getIdToken();

      const { data } = await api.post("/auth/login", { token });
      dispatch(setUserData(data))

    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-85 bg-[#13151c] border border-white/10 rounded-2xl p-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
            Welcome to CortexAI
          </h2>

          <p className="text-[13px] text-slate-500">
            Please login to continue using the app.
          </p>
        </div>

        <button
          type="button"
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.75 rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 border shadow-lg transition-all duration-150 cursor-pointer"
        >
          <FcGoogle size={22} />
          Continue With Google
        </button>
      </div>
    </div>
  );
};

export default GoogleLogin;