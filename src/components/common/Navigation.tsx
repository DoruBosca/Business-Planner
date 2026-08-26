import React from "react";
import { usePlanning } from "../../context/PlanningContext";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  TrendingUp,
  Cpu,
  Sparkles,
  GitFork,
  GitCompare,
  CheckSquare,
  FileBarChart,
  Database,
  ShieldCheck,
} from "lucide-react";

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = usePlanning();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "cycles", label: "Planning Cycles", icon: CalendarRange },
    { id: "headcount", label: "Headcount", icon: Users },
    { id: "pnl", label: "P&L Financials", icon: TrendingUp },
    { id: "drivers", label: "Cost Drivers", icon: Cpu },
    { id: "forecasting", label: "AI Forecast", icon: Sparkles, isAi: true },
    { id: "scenarios", label: "Scenarios & Levers", icon: GitFork },
    { id: "variance", label: "Variance Analysis", icon: GitCompare },
    { id: "workflow", label: "Approvals", icon: CheckSquare },
    { id: "reporting", label: "MBR Reports", icon: FileBarChart },
    { id: "integration", label: "Data Integration", icon: Database },
    { id: "governance", label: "Governance", icon: ShieldCheck },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex space-x-1.5 overflow-x-auto py-2.5 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? item.isAi
                    ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-xs"
                    : "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? item.isAi
                      ? "text-purple-600"
                      : "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.label}</span>
              {item.isAi && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                    isActive ? "bg-purple-200/80 text-purple-800" : "bg-purple-100 text-purple-700"
                  }`}
                >
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
