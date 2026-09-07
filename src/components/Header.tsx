import React from "react";
import { Pill, Activity, HelpCircle, History, Sparkles } from "lucide-react";

interface HeaderProps {
  activeTab: "finder" | "history" | "about";
  onSelectTab: (tab: "finder" | "history" | "about") => void;
  hasAiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  hasAiKey = false
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex justify-between items-center shadow-xs shrink-0 z-10">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
          <Pill className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              MedMatch <span className="text-blue-600">AI</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              College Project
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden md:block">
            Generic Medicine Alternative Finder & Price Comparison
          </p>
        </div>
      </div>

      {/* Navigation tabs matching High Density theme */}
      <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
        <button
          onClick={() => onSelectTab("finder")}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
            activeTab === "finder"
              ? "text-blue-600 underline underline-offset-4 font-semibold"
              : "text-slate-600 hover:text-blue-600"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Finder</span>
        </button>

        <button
          onClick={() => onSelectTab("history")}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
            activeTab === "history"
              ? "text-blue-600 underline underline-offset-4 font-semibold"
              : "text-slate-600 hover:text-blue-600"
          }`}
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>

        <button
          onClick={() => onSelectTab("about")}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
            activeTab === "about"
              ? "text-blue-600 underline underline-offset-4 font-semibold"
              : "text-slate-600 hover:text-blue-600"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>About & Viva Notes</span>
        </button>
      </nav>
    </header>
  );
};
