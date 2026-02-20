export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-slate-900/50 border border-slate-700 px-4 py-3 sm:py-3 rounded-lg lg:rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-white placeholder-slate-400 text-sm sm:text-base"
    />
  );
}
