import { useEffect } from "react";
import Home from "./Pages/home";
import { getCurrentUser } from "../features/getCurrentUser";
import { useDispatch, useStore } from "react-redux";
import { setUserData } from "./redux/userSlice";

const App = () => {
  const dispatch = useDispatch()
  const store = useStore();
  useEffect(() => {
    let active = true;
    const revision = store.getState().user.revision;
    const getUser = async () => {
      const data = await getCurrentUser();
      if (active && store.getState().user.revision === revision) dispatch(setUserData(data));
    };
    getUser();
    return () => { active = false; };
  }, [dispatch, store]);

  return (
    <>
      <Home />
    </>
  );
};

export default App;
