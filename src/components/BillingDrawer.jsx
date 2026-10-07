import { Crown, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { createBillingOrder } from "../../features/createBillingOrder.js";

const BillingDrawer = ({ open, onClose }) => {
  const { userData } = useSelector((state) => state.user);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const handleUpgrade = async (plan) => {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    setError("");
    try {
      const order = await createBillingOrder(plan);
      window.location.assign(order.checkoutUrl);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not start checkout. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-0 z-50 h-screen w-95 bg-[#0f1117] border border-white/10 shadow-2xl flex flex-col "
          >
            {/* header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <div className="text-white text-lg font-medium text-left">
                  Billing
                </div>
                <div className="text-slate-400 text-sm">Plans & Credits</div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center "
              >
                <X size={18} className="text-slate-300" />
              </button>
            </div>
            {/* creditional progress */}
            <div className="p-5">
              <div className="rounded-xl bg-white/0.04 border border-white/10 p-4">
                <div className="flex justify-between items-center">
                  <div className>
                    <p className="text-slate-400 text-sm ">Current Plan</p>
                    <h3 className="text-left text-white text-xl font-bold">
                      {userData?.plan || "Free"}
                    </h3>
                  </div>
                  <Crown size={18} className="text-yellow-400" />
                </div>

                {/* progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Credits</span>
                    <span>
                      {userData?.credits || 0} / {userData?.totalCredits || 100}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden ">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* cards */}

            <div className="px-5 flex-1 overflow-auto space-y-4">
              {error && (
                <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}
                <div className ="rounded-xl border border-white/10 p-4 text-left">
                <h3 className="text-white font-semibold ">Starter Pan</h3>
                <p className="text-indigo-400 text-2xl font-bold mt-2">$199</p>
                <p className="text-slate-400 text-sm mt-1">500 Credits</p>
                <button
                  onClick={() => handleUpgrade("starter")}
                  disabled={Boolean(loadingPlan)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === "starter" ? "Opening checkout..." : "Upgrade"}
                </button>
                </div>

            </div>

             <div className="px-5 flex-1 overflow-auto space-y-4">
                <div className ="rounded-xl border border-white/10 p-4 text-left">
                <h3 className="text-white font-semibold ">Pro Pan</h3>
                <p className="text-indigo-400 text-2xl font-bold mt-2">$500</p>
                <p className="text-slate-400 text-sm mt-1">1000 Credits</p>
                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={Boolean(loadingPlan)}
                  className="mt-3 w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingPlan === "pro" ? "Opening checkout..." : "Upgrade"}
                </button>
                </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BillingDrawer;
