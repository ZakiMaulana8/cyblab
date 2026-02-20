export default function RiskMeter({score=0}) {
  const getRiskLevel = (score) => {
    if (score < 30) return { level: 'Low', color: 'from-green-500 to-emerald-600' };
    if (score < 60) return { level: 'Medium', color: 'from-yellow-500 to-orange-600' };
    return { level: 'High', color: 'from-red-500 to-rose-600' };
  };

  const { level } = getRiskLevel(score);

  return (
    <div className="w-full mt-6 sm:mt-8">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm sm:text-base font-semibold text-white">Risk Score</label>
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">{score}%</span>
      </div>
      <div className="w-full h-2 sm:h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          style={{width:`${score}%`}}
          className={`h-full rounded-full bg-gradient-to-r ${getRiskLevel(score).color} transition-all duration-500 shadow-lg`}
        />
      </div>
      <p className="text-xs sm:text-sm text-slate-400 mt-2">Risk Level: <span className="font-semibold text-sky-400">{level}</span></p>
    </div>
  );
}
