import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { UserRole } from "../../types";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  History,
  CheckCircle,
  FileCheck,
  User,
  Shield,
  Key,
  Database,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export const SecurityGovernance: React.FC = () => {
  const {
    currentUser,
    switchRole,
    toggleSalaryMasking,
    auditLogs,
    activeCycle,
    formatCurrency,
  } = usePlanning();

  const [retentionPolicyYears, setRetentionPolicyYears] = useState(7);
  const [isGdprPurgeActive, setIsGdprPurgeActive] = useState(false);

  const permissionsMatrix: {
    role: UserRole;
    label: string;
    canViewAll: boolean;
    canEditFinancials: boolean;
    canSubmit: boolean;
    canApprove: boolean;
    canLockCycle: boolean;
    canViewSalaries: boolean;
    canViewAudit: boolean;
  }[] = [
    {
      role: "ADMINISTRATOR",
      label: "Planning Administrator",
      canViewAll: true,
      canEditFinancials: true,
      canSubmit: true,
      canApprove: true,
      canLockCycle: true,
      canViewSalaries: true,
      canViewAudit: true,
    },
    {
      role: "CONTROLLER",
      label: "Financial Controller",
      canViewAll: true,
      canEditFinancials: true,
      canSubmit: false,
      canApprove: true,
      canLockCycle: true,
      canViewSalaries: true,
      canViewAudit: true,
    },
    {
      role: "DEPARTMENT_MANAGER",
      label: "Department Manager",
      canViewAll: false,
      canEditFinancials: true,
      canSubmit: true,
      canApprove: false,
      canLockCycle: false,
      canViewSalaries: false,
      canViewAudit: false,
    },
    {
      role: "EXECUTIVE",
      label: "Executive (CFO / CEO)",
      canViewAll: true,
      canEditFinancials: false,
      canSubmit: false,
      canApprove: true,
      canLockCycle: true,
      canViewSalaries: true,
      canViewAudit: true,
    },
    {
      role: "AUDITOR",
      label: "Internal / External Auditor",
      canViewAll: true,
      canEditFinancials: false,
      canSubmit: false,
      canApprove: false,
      canLockCycle: false,
      canViewSalaries: false,
      canViewAudit: true,
    },
    {
      role: "COMPLIANCE_OFFICER",
      label: "Compliance Officer",
      canViewAll: true,
      canEditFinancials: false,
      canSubmit: false,
      canApprove: false,
      canLockCycle: false,
      canViewSalaries: false,
      canViewAudit: true,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Security, RBAC & Governance
            </span>
            <span className="text-xs text-slate-500">Enterprise Compliance & Segregation of Duties</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Access Control Matrix & Statutory Retention</h1>
          <p className="text-xs text-slate-500">
            Role-Based Access Control (RBAC), sensitive individual compensation data masking, and 7-year audit retention
          </p>
        </div>

        {/* Current Active Security Profile Pill */}
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <Shield className="w-5 h-5 text-blue-600" />
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Current Security Context</span>
            <span className="font-bold text-slate-900">
              {currentUser.name} ({currentUser.role})
            </span>
          </div>
        </div>
      </div>

      {/* Security Tools Cards: Salary Masking, Segregation of Duties, Plan Lock Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* US12.3 Salary Masking Control */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compensation Privacy
              </span>
              <button
                onClick={toggleSalaryMasking}
                className={`p-2 rounded-lg border transition shadow-sm ${
                  currentUser.maskSensitiveSalaries
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {currentUser.maskSensitiveSalaries ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">Sensitive Salary Data Masking</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Obfuscates individual base salaries, bonuses, and personal compensation in headcount views for privacy compliance.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Mask Status:</span>
            <span
              className={`font-bold ${currentUser.maskSensitiveSalaries ? "text-amber-700" : "text-emerald-700"}`}
            >
              {currentUser.maskSensitiveSalaries ? "ENFORCED ($***,***)" : "VISIBLE ($185,000)"}
            </span>
          </div>
        </div>

        {/* US12.6 Baseline Lock Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Integrity Lock
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">Baseline Immutability Lock</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cryptographically locks financial numbers once approved by the Financial Controller to prevent unauthorized tampering.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">{activeCycle.name}:</span>
            <span className="font-bold text-purple-700">{activeCycle.status}</span>
          </div>
        </div>

        {/* US12.5 Statutory Retention */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Statutory Retention
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">7-Year Financial Retention</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complies with SOX, IFRS, and GAAP statutory retention rules for historical planning baselines.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Retention Horizon:</span>
            <span className="font-bold text-emerald-700">{retentionPolicyYears} Years (SOX Compliant)</span>
          </div>
        </div>
      </div>

      {/* US12.1: Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enterprise Role-Based Access Matrix (RBAC)</h2>
            <p className="text-xs text-slate-500">
              Segregation of duties across Financial Controllers, Department Heads, Executives, and Internal Auditors
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Role Profile</th>
                <th className="py-3 px-3 text-center">View All CC</th>
                <th className="py-3 px-3 text-center">Edit Plan</th>
                <th className="py-3 px-3 text-center">Submit</th>
                <th className="py-3 px-3 text-center">Approve</th>
                <th className="py-3 px-3 text-center">Lock Baseline</th>
                <th className="py-3 px-3 text-center">View Salary</th>
                <th className="py-3 px-3 text-center">Audit Logs</th>
                <th className="py-3 px-4 text-center">Switch Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {permissionsMatrix.map((p) => {
                const isCurrent = currentUser.role === p.role;

                return (
                  <tr key={p.role} className={`hover:bg-slate-50 transition ${isCurrent ? "bg-blue-50/50" : ""}`}>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span>{p.label}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[9px] font-mono font-bold">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">{p.canViewAll ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canEditFinancials ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canSubmit ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canApprove ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canLockCycle ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canViewSalaries ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-3 text-center">{p.canViewAudit ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => switchRole(p.role)}
                        disabled={isCurrent}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 disabled:opacity-40 text-blue-600 border border-slate-300 rounded text-[11px] font-semibold shadow-sm transition"
                      >
                        {isCurrent ? "Active" : "Switch To"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
