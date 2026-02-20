export default function Card({children, className = ''}) {
  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-5 sm:p-6 lg:p-8 rounded-xl lg:rounded-2xl shadow-xl hover:shadow-2xl transition-shadow ${className}`}>
      {children}
    </div>
  );
}
