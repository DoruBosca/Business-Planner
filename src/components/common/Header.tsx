import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { UserRole, DepartmentId } from "../../types";
import {
  Building2,
  Calendar,
  Layers,
  Shield,
  Eye,
  EyeOff,
  Bell,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  History,
  Lock,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onOpenAuditLogs: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuditLogs, onOpenNotifications }) => {
  const {
    cycles,
    activeCycleId,
    setActiveCycleId,
    activeCycle,
    departments,
    selectedDepartmentId,
    setSelectedDepartmentId,
    currentUser,
    switchRole,
    toggleSalaryMasking,
    notifications,
    recalculateDrivers,
    formatCurrency,
    consolidatedPnL,
  } = usePlanning();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: "CONTROLLER", label: "Financial Controller", desc: "Full financial review, approval & locking authority" },
    { role: "DEPARTMENT_MANAGER", label: "Department Manager", desc: "Edit headcount, submit budget proposals" },
    { role: "EXECUTIVE", label: "Executive (CFO / CEO)", desc: "Consolidated boards, high-level MBR & strategy" },
    { role: "ADMINISTRATOR", label: "Planning Administrator", desc: "Configure cycles, milestones, and system rules" },
    { role: "AUDITOR", label: "Internal / External Auditor", desc: "Audit logs inspection & governance compliance" },
    { role: "COMPLIANCE_OFFICER", label: "Compliance Officer", desc: "Security retention, policy enforcement & masking" },
  ];

  return (
    <header className="bg-[#0F172A] border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & App Title with Geometric Diamond */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="w-7 h-7 bg-blue-500 rounded-xs transform rotate-45 shadow-sm shadow-blue-500/50"></div>
              <Building2 className="w-4 h-4 text-white absolute z-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  PLANSPHERE
                </span>
              </div>
            </div>
          </div>

          {/* Center Context Bar: Planning Cycle & Department Selector */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700 shadow-inner">
            {/* Active Cycle Pill with Emerald Status Dot */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cycle:</span>
              <select
                value={activeCycleId}
                onChange={(e) => setActiveCycleId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id} className="bg-slate-900 text-white">
                    {cycle.name} {cycle.status === "LOCKED" ? "🔒" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-slate-700"></div>

            {/* Department Filter */}
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value as DepartmentId | "ALL")}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  Consolidated Entity (All CC)
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                    {dept.name} ({dept.costCenter})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Tools: Recalculate, Role Switcher, Sensitive Salary Mask, Notifications, User Badge */}
          <div className="flex items-center space-x-2.5">
            {/* Recalculate Drivers Button */}
            <button
              onClick={recalculateDrivers}
              title="Recalculate P&L from Headcount & Cost Drivers"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply Drivers</span>
            </button>

            {/* Salary Masking Toggle */}
            <button
              onClick={toggleSalaryMasking}
              title={currentUser.maskSensitiveSalaries ? "Sensitive Salaries Masked (Click to reveal)" : "Sensitive Salaries Visible (Click to mask)"}
              className={`p-2 rounded-lg border text-xs flex items-center transition-all ${
                currentUser.maskSensitiveSalaries
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              {currentUser.maskSensitiveSalaries ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Audit Log Button */}
            <button
              onClick={onOpenAuditLogs}
              title="View Immutable Audit Trail & Change Log"
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Profile & Role Switcher with Avatar */}
            <div className="relative border-l border-slate-700 pl-3">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2.5 p-1 hover:bg-slate-800/80 rounded-lg transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold leading-none text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.role.replace(/_/g, " ")}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600/80 rounded-full flex items-center justify-center border border-blue-400 text-xs font-bold text-white shadow-sm">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role Simulation</p>
                    <p className="text-xs text-slate-300">Switch user profile to test role-based permissions</p>
                  </div>
                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex items-start space-x-2.5 ${
                          currentUser.role === r.role ? "bg-blue-950/60 text-blue-300 border-l-2 border-blue-500" : "text-slate-300"
                        }`}
                      >
                        <Shield className={`w-4 h-4 mt-0.5 ${currentUser.role === r.role ? "text-blue-400" : "text-slate-500"}`} />
                        <div>
                          <p className="font-semibold">{r.label}</p>
                          <p className="text-[10px] text-slate-400">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
