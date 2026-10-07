import { useEffect } from "react";
import Home from "./Pages/home";
import { getCurrentUser } from "../features/getCurrentUser";
import { confirmBillingSession } from "../features/confirmBillingSession.js";
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (window.location.pathname !== "/payment/success" || !sessionId) return;

    let active = true;
    const confirmPayment = async () => {
      try {
        await confirmBillingSession(sessionId);
        const data = await getCurrentUser();
        if (active) dispatch(setUserData(data));
        window.history.replaceState({}, "", "/");
      } catch (error) {
        console.error("Payment confirmation failed:", error);
      }
    };

    confirmPayment();
    return () => { active = false; };
  }, [dispatch]);

  return (
    <>
      <Home />
    </>
  );
};

export default App;
