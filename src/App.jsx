import { useEffect } from "react";
import Home from "./Pages/home";
import { getCurrentUser } from "../features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";

const App = () => {
  const dispatch = useDispatch()
  const getUser = async () => {
  const data  = await getCurrentUser();
  dispatch(setUserData(data))
  };
  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <Home />
    </>
  );
};

export default App;
