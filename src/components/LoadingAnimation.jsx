const LoadingAnimation = () => {
  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      <div className="flex w-9 h-9 items-center justify-center shrink-0">
        <span
          className="block w-2.5 h-2.5 rounded-full bg-linear-to-br from-cyan-300 to-violet-400"
          style={{ boxShadow: "0 0 14px rgba(125, 211, 252, 0.8)" }}
        />
      </div>
      <div className="text-[13px] font-medium tracking-wide text-slate-400 text-left">
        Thinking
      </div>
    </div>
  );
};

export default LoadingAnimation;
