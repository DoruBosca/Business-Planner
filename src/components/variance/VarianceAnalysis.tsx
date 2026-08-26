import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { VarianceRecord, PnLLineItem } from "../../types";
import {
  GitCompare,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
  Filter,
  BarChart3,
  FileText,
  User,
  Check,
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
  Cell,
} from "recharts";

export const VarianceAnalysis: React.FC = () => {
  const {
    pnlItems,
    variances,
    addVarianceExplanation,
    approveVariance,
    formatCurrency,
    formatPercent,
    departments,
    currentUser,
  } = usePlanning();

  const [selectedMonth, setSelectedMonth] = useState<number>(4); // April
  const [selectedItemForExplanation, setSelectedItemForExplanation] = useState<VarianceRecord | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newExplanation, setNewExplanation] = useState("");
  const [newCorrectiveAction, setNewCorrectiveAction] = useState("");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRootCauseResult, setAiRootCauseResult] = useState<{
    rootCauseAnalysis: string;
    keyDeviations: string[];
    actionPlan: string[];
  } | null>({
    rootCauseAnalysis:
      "Q1 Actuals exhibit a favorable +$420k EBIT bridge driven by accelerated Enterprise SaaS contract recognitions (+$380k) combined with deferred contractor hiring in Engineering (+$140k favorable variance), offsetting cloud infra consumption overruns (-$60k).",
    keyDeviations: [
      "Revenue Outperformance: Enterprise expansion in North America closed 3 weeks ahead of pipeline schedule",
      "Personnel Favorable Lag: 4 senior engineering vacancies open for 7 weeks longer than planned lead time",
      "Cloud Compute Overrun: LLM vector database indexing compute spike in March",
    ],
    actionPlan: [
      "Fast-track recruiter agency placement for London technical leads",
      "Shift cloud cluster reserve instances to 1-year commitments for 28% discount",
      "Rebalance marketing ad spend into high-converting Q3 campaigns",
    ],
  });

  // Calculate monthly variances for all items
  const varianceList = pnlItems.map((item) => {
    const monthIdx = selectedMonth - 1;
    const plan = item.monthlyPlan[monthIdx] || 0;
    const actual = item.monthlyActual[monthIdx] || 0;
    const forecast = item.monthlyForecast[monthIdx] || 0;

    const delta = item.category === "Income" ? actual - plan : plan - actual;
    const variancePercent = plan !== 0 ? ((actual - plan) / plan) * 100 : 0;
    const absDeviation = Math.abs(actual - plan);

    return {
      item,
      plan,
      actual,
      forecast,
      delta,
      variancePercent,
      absDeviation,
      isOverrun: item.category === "Income" ? delta < 0 : delta < 0,
      requiresExplanation: absDeviation > 10000 || Math.abs(variancePercent) > 5.0,
    };
  });

  // US8.5: Ranked Variance Drivers (Top Overruns & Top Savings)
  const rankedDrivers = [...varianceList].sort((a, b) => b.absDeviation - a.absDeviation);

  // US8.3: Waterfall Bridge from Plan EBIT to Actual EBIT
  const planRevenue = pnlItems
    .filter((i) => i.category === "Income")
    .reduce((sum, i) => sum + (i.monthlyPlan[selectedMonth - 1] || 0), 0);
  const actualRevenue = pnlItems
    .filter((i) => i.category === "Income")
    .reduce((sum, i) => sum + (i.monthlyActual[selectedMonth - 1] || 0), 0);

  const planCosts = pnlItems
    .filter((i) => i.category !== "Income")
    .reduce((sum, i) => sum + (i.monthlyPlan[selectedMonth - 1] || 0), 0);
  const actualCosts = pnlItems
    .filter((i) => i.category !== "Income")
    .reduce((sum, i) => sum + (i.monthlyActual[selectedMonth - 1] || 0), 0);

  const planEbit = planRevenue - planCosts;
  const actualEbit = actualRevenue - actualCosts;
  const revenueVariance = actualRevenue - planRevenue;
  const costVariance = planCosts - actualCosts;

  const waterfallData = [
    { name: "Plan EBIT", amount: Math.round(planEbit / 1000), type: "BASE" },
    {
      name: "Rev Impact",
      amount: Math.round(revenueVariance / 1000),
      type: revenueVariance >= 0 ? "POS" : "NEG",
    },
    {
      name: "Cost Savings/Over",
      amount: Math.round(costVariance / 1000),
      type: costVariance >= 0 ? "POS" : "NEG",
    },
    { name: "Actual EBIT", amount: Math.round(actualEbit / 1000), type: "TOTAL" },
  ];

  const handleTriggerAiRootCause = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/root-cause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: `Month ${selectedMonth}`,
          planEbit,
          actualEbit,
          topVariances: rankedDrivers.slice(0, 5).map((v) => ({
            name: v.item.name,
            category: v.item.category,
            plan: v.plan,
            actual: v.actual,
            variancePercent: v.variancePercent,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRootCauseResult({
          rootCauseAnalysis: data.rootCauseAnalysis,
          keyDeviations: data.keyDeviations || ["Volume growth in North America", "Hiring lag in R&D"],
          actionPlan: data.actionPlan || ["Reallocate unspent travel into Q3 product marketing"],
        });
      }
    } catch (err) {
      console.error("Root cause AI error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveExplanation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForExplanation) return;

    addVarianceExplanation(selectedItemForExplanation.id, newExplanation, newCorrectiveAction);
    setNewExplanation("");
    setNewCorrectiveAction("");
    setIsLogModalOpen(false);
    setSelectedItemForExplanation(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Variance Analysis & Diagnostics
            </span>
            <span className="text-xs text-slate-500">Plan vs Actuals & Waterfall Bridge</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Variance Diagnostics & Root Cause Analysis</h1>
          <p className="text-xs text-slate-500">
            Interactive EBIT waterfall bridge, automated deviation threshold alerts & formal management explanation logbook
          </p>
        </div>

        {/* Month Selector & AI Button */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold">Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m} className="bg-white text-slate-900">
                  Period M{String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTriggerAiRootCause}
            disabled={isAiLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
            <span>{isAiLoading ? "Diagnosing Deviations..." : "AI Root-Cause Diagnostic"}</span>
          </button>
        </div>
      </div>

      {/* US8.3: EBIT Waterfall Bridge Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Monthly EBIT Waterfall Bridge ($ in Thousands)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Walks from Planned Operating Profit to Actual Results for Month {selectedMonth}
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-500">Net Delta:</span>
            <span className={`font-bold ${actualEbit >= planEbit ? "text-emerald-600" : "text-rose-600"}`}>
              {actualEbit >= planEbit ? "+" : ""}
              {formatCurrency(actualEbit - planEbit)}
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}k`, ""]}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => {
                  const color =
                    entry.type === "BASE"
                      ? "#2563EB"
                      : entry.type === "TOTAL"
                      ? "#7C3AED"
                      : entry.type === "POS"
                      ? "#059669"
                      : "#E11D48";
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Root-Cause Diagnostic Output Card */}
      {aiRootCauseResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">AI FP&A Root-Cause Diagnostic Report</h3>
            </div>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono">Gemini 2.5 Analysis</span>
          </div>

          <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">{aiRootCauseResult.rootCauseAnalysis}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-emerald-700 block mb-1 text-[11px]">Identified Drivers:</span>
              <ul className="space-y-1 text-slate-700">
                {aiRootCauseResult.keyDeviations.map((d, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-600">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-blue-900 block mb-1 text-[11px]">
                Recommended Mitigation Actions:
              </span>
              <ul className="space-y-1 text-slate-700">
                {aiRootCauseResult.actionPlan.map((a, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-blue-600">&rarr;</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Documented Variance Logbook (US8.4 & US8.5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Documented Management Explanation Logbook</h2>
          </div>
          <span className="text-xs text-slate-500">{variances.length} Logged Explanations</span>
        </div>

        <div className="space-y-3">
          {variances.map((record) => (
            <div key={record.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{record.lineItemName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({record.period})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      record.status === "APPROVED_BY_CONTROLLER"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : record.status === "DOCUMENTED"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {record.status.replace(/_/g, " ")}
                  </span>
                  {record.status !== "APPROVED_BY_CONTROLLER" && (
                    <button
                      onClick={() => approveVariance(record.id)}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-semibold transition"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>

              {record.documentedReason ? (
                <div className="text-slate-700">
                  <span className="text-slate-500 font-semibold">Root Cause:</span> {record.documentedReason}
                </div>
              ) : (
                <div className="text-amber-700 font-medium">Pending management justification input</div>
              )}

              {record.correctiveAction && (
                <div className="text-blue-900">
                  <span className="font-semibold text-slate-500">Action Plan:</span> {record.correctiveAction}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                <span>Submitter: {record.submitter || "Pending"}</span>
                <span className="font-mono">{formatCurrency(record.varianceDollar)} variance</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Variance Explanation Modal */}
      {isLogModalOpen && selectedItemForExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Log Variance Explanation: {selectedItemForExplanation.lineItemName}</span>
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveExplanation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Root Cause Explanation (Detailed Justification)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the business drivers (pricing shifts, supplier delivery delays, scope changes)..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Remediation & Corrective Action Plan
                </label>
                <textarea
                  rows={3}
                  placeholder="What specific managerial actions will be taken in the next 30-60 days to bring costs back to plan?"
                  value={newCorrectiveAction}
                  onChange={(e) => setNewCorrectiveAction(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Submit Explanation to Controller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
