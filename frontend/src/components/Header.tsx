import { Search, Bell, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-[var(--nav-height)] bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Caută în OpenSales..."
                        className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-5">
                <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3 pl-5 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">Admin User</p>
                        <p className="text-[11px] font-medium text-slate-500">Premium Account</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-all">
                        AU
                    </div>
                </div>
            </div>
        </header>
    );
}
