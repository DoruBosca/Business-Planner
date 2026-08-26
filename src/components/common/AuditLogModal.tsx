import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { X, Search, Filter, History, Shield, Download } from "lucide-react";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = usePlanning();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRoleFilter === "ALL" || log.userRole === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const exportAuditCSV = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Target Entity", "Previous Value", "New Value", "Reason"];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.targetEntity}"`,
      `"${l.previousValue || ""}"`,
      `"${l.newValue || ""}"`,
      `"${l.reason || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PlanSphere_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Immutable Governance Audit Trail</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Verified Ledger
                </span>
              </h2>
              <p className="text-xs text-slate-500">Complete traceability of plan changes, approvals, driver updates, and lock events</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportAuditCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, entities, users, or justifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:bg-white"
            >
              <option value="ALL">All Roles</option>
              <option value="CONTROLLER">Controller</option>
              <option value="DEPARTMENT_MANAGER">Department Manager</option>
              <option value="EXECUTIVE">Executive</option>
              <option value="ADMINISTRATOR">Administrator</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No audit log entries matching current search filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-semibold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">{log.targetEntity}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{log.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 text-[11px] mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  {log.previousValue && (
                    <div>
                      <span className="text-slate-500 font-medium block">Previous State:</span>
                      <span className="text-rose-600 font-mono">{log.previousValue}</span>
                    </div>
                  )}
                  {log.newValue && (
                    <div>
                      <span className="text-slate-500 font-medium block">Updated State:</span>
                      <span className="text-emerald-600 font-mono">{log.newValue}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span>
                      User: <strong className="text-slate-800">{log.userName}</strong> ({log.userRole})
                    </span>
                  </div>
                  {log.reason && <span className="italic text-slate-500">"{log.reason}"</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
