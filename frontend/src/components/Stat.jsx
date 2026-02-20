export default function Stat({label, value, icon: Icon = null}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-4 sm:p-5 rounded-lg hover:border-sky-600/50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />}
        <p className="text-slate-400 text-xs sm:text-sm font-medium">{label}</p>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
