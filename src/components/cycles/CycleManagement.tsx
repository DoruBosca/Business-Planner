import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { PlanningCycle, PlanningCycleType, DepartmentId } from "../../types";
import {
  CalendarRange,
  Plus,
  CheckCircle2,
  Clock,
  Lock,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Send,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const CycleManagement: React.FC = () => {
  const {
    cycles,
    activeCycleId,
    setActiveCycleId,
    activeCycle,
    createCycle,
    updateCycleStatus,
    updateMilestone,
    submissions,
    submitDepartmentPlan,
    reviewSubmission,
    currentUser,
    departments,
    pnlItems,
    formatCurrency,
    formatPercent,
    consolidatedPnL,
  } = usePlanning();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCycleForm, setNewCycleForm] = useState({
    name: "April Business Review & Reforecast (FY2028)",
    type: "APRIL_REFORECAST" as PlanningCycleType,
    fiscalYear: 2028,
    startDate: "2028-04-01",
    submissionDeadline: "2028-04-25",
    reviewDeadline: "2028-05-10",
    description: "6+6 mid-year operational reforecast & strategic alignment.",
  });

  const [comparisonMetric, setComparisonMetric] = useState<"REVENUE" | "PERSONNEL" | "EBIT">("EBIT");

  // Comparison between October Plan (FY27 baseline) vs April Reforecast (FY27 mid-year)
  const octPlanCycle = cycles.find((c) => c.type === "OCTOBER_PLAN") || cycles[0];
  const aprReviewCycle = cycles.find((c) => c.type === "APRIL_REFORECAST") || cycles[1] || cycles[0];

  const comparisonData = departments.map((dept) => {
    let octRev = 0;
    let octCosts = 0;
    let aprRev = 0;
    let aprCosts = 0;

    pnlItems.forEach((item) => {
      const octVal = item.departmentBreakdown[dept.id] || 0;
      // April reforecast simulation with +3.2% macro shift
      const aprVal =
        item.category === "Income"
          ? Math.round(octVal * 1.018)
          : Math.round(octVal * 1.025);

      if (item.category === "Income") {
        octRev += octVal;
        aprRev += aprVal;
      } else {
        octCosts += octVal;
        aprCosts += aprVal;
      }
    });

    const octEbit = octRev - octCosts;
    const aprEbit = aprRev - aprCosts;

    return {
      department: dept.name,
      deptId: dept.id,
      octoberPlan: Math.round((comparisonMetric === "REVENUE" ? octRev : comparisonMetric === "PERSONNEL" ? octCosts : octEbit) / 1000),
      aprilReview: Math.round((comparisonMetric === "REVENUE" ? aprRev : comparisonMetric === "PERSONNEL" ? aprCosts : aprEbit) / 1000),
      delta: Math.round(((comparisonMetric === "REVENUE" ? aprRev - octRev : comparisonMetric === "PERSONNEL" ? aprCosts - octCosts : aprEbit - octEbit)) / 1000),
      pctChange: octEbit !== 0 ? (((aprEbit - octEbit) / Math.abs(octEbit)) * 100).toFixed(1) : "0",
    };
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCycle(newCycleForm);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Planning Cycle Management
            </span>
            <span className="text-xs text-slate-500">Governance & Multi-Cycle Comparison</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Official Corporate Planning Cycles</h1>
          <p className="text-xs text-slate-500">
            Manage October Annual Planning (Next FY) & April Business Review / Reforecast (6+6) with milestone tracking
          </p>
        </div>

        {currentUser.role === "ADMINISTRATOR" || currentUser.role === "CONTROLLER" ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate New Planning Cycle</span>
          </button>
        ) : null}
      </div>

      {/* Active Cycles Status Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cycles.map((cycle) => {
          const isSelected = cycle.id === activeCycleId;
          const isLocked = cycle.status === "LOCKED";

          return (
            <div
              key={cycle.id}
              className={`rounded-xl border p-5 transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        cycle.type === "OCTOBER_PLAN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {cycle.type === "OCTOBER_PLAN" ? "Official Annual Plan" : "Mid-Year Reforecast"}
                    </span>
                    {cycle.isBaseline && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Board Baseline
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{cycle.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cycle.description}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
                    isLocked
                      ? "bg-slate-100 text-slate-500 border border-slate-200"
                      : cycle.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isLocked && <Lock className="w-3.5 h-3.5" />}
                  <span>{cycle.status.replace(/_/g, " ")}</span>
                </span>
              </div>

              {/* Progress & Milestones */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Cycle Completion Progress</span>
                  <span className="font-bold text-slate-900">{cycle.completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${cycle.completionRate}%` }}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Milestones & Timeline Deadlines
                  </span>
                  {cycle.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={currentUser.role !== "ADMINISTRATOR" && currentUser.role !== "CONTROLLER"}
                          onClick={() => updateMilestone(cycle.id, m.id, !m.completed)}
                          className={`p-0.5 rounded transition ${
                            m.completed ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <span className={`font-medium ${m.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {m.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{m.targetDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveCycleId(cycle.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isSelected ? "Active Cycle Selected" : "Set as Active Workspace"}
                </button>

                {(currentUser.role === "CONTROLLER" || currentUser.role === "ADMINISTRATOR") && (
                  <div className="flex items-center space-x-2">
                    {cycle.status !== "LOCKED" ? (
                      <button
                        onClick={() => updateCycleStatus(cycle.id, "LOCKED", "Formal executive lock")}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lock Cycle</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateCycleStatus(cycle.id, "OPEN_FOR_SUBMISSIONS", "Controller unlocked cycle")}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition"
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* US1.5: Executive October Plan vs April Review Deviation Comparison */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">October Plan vs April Review Comparison</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Identify strategic deviations between original annual budget (October) and 6+6 reforecast (April) to trigger corrective actions
            </p>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(["EBIT", "REVENUE", "PERSONNEL"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setComparisonMetric(m)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  comparisonMetric === m ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m === "EBIT" ? "Operating EBIT" : m === "REVENUE" ? "Revenue" : "Personnel Costs"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="department" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}k`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="octoberPlan" name="October Plan Baseline ($k)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aprilReview" name="April Review Reforecast ($k)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Department / Entity</th>
                <th className="py-3 px-4 text-right">October Plan ($k)</th>
                <th className="py-3 px-4 text-right">April Review ($k)</th>
                <th className="py-3 px-4 text-right">Net Deviation ($k)</th>
                <th className="py-3 px-4 text-right">% Variance</th>
                <th className="py-3 px-4 text-center">Corrective Action Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {comparisonData.map((row) => (
                <tr key={row.deptId} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">{row.department}</td>
                  <td className="py-2.5 px-4 text-right text-slate-600">${row.octoberPlan.toLocaleString()}k</td>
                  <td className="py-2.5 px-4 text-right text-slate-900 font-medium">${row.aprilReview.toLocaleString()}k</td>
                  <td className={`py-2.5 px-4 text-right font-bold ${row.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {row.delta >= 0 ? "+" : ""}
                    ${row.delta.toLocaleString()}k
                  </td>
                  <td className={`py-2.5 px-4 text-right font-bold ${row.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {Number(row.pctChange) >= 0 ? "+" : ""}
                    {row.pctChange}%
                  </td>
                  <td className="py-2.5 px-4 text-center font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Reforecast Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Cycle Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Initiate New Planning Cycle</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cycle Title</label>
                <input
                  type="text"
                  required
                  value={newCycleForm.name}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cycle Type</label>
                  <select
                    value={newCycleForm.type}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, type: e.target.value as PlanningCycleType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="OCTOBER_PLAN">October Annual Plan</option>
                    <option value="APRIL_REFORECAST">April Reforecast</option>
                    <option value="CUSTOM_CYCLE">Custom Operating Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fiscal Year</label>
                  <input
                    type="number"
                    value={newCycleForm.fiscalYear}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, fiscalYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={newCycleForm.submissionDeadline}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, submissionDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Controller Review Deadline</label>
                  <input
                    type="date"
                    value={newCycleForm.reviewDeadline}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, reviewDeadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Strategic Description & Purpose</label>
                <textarea
                  rows={3}
                  value={newCycleForm.description}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Launch Planning Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
