import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { Scenario } from "../../types";
import {
  GitFork,
  Sliders,
  TrendingUp,
  Plus,
  Copy,
  CheckCircle,
  BarChart3,
  DollarSign,
  Users,
  Percent,
  Check,
  Award,
  Trash2,
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

export const ScenarioWhatIf: React.FC = () => {
  const {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    activeScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    formatCurrency,
    formatPercent,
    totalHeadcountStats,
  } = usePlanning();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDesc, setNewScenarioDesc] = useState("");
  const [newRevGrowth, setNewRevGrowth] = useState<number>(12);
  const [newHireRate, setNewHireRate] = useState<number>(10);

  const sideBySideData = scenarios.map((s) => ({
    name: s.name,
    isBaseCase: s.isBaseCase,
    revenue: Math.round(s.calculatedRevenue / 1000),
    costs: Math.round(s.calculatedTotalCost / 1000),
    ebit: Math.round(s.calculatedEbit / 1000),
    ebitMargin: s.calculatedEbitMargin.toFixed(1),
    headcount: Math.round(totalHeadcountStats.totalCurrentFTE * (1 + s.hiringRateAdjustmentPercent / 100)),
  }));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    createScenario({
      name: newScenarioName,
      description: newScenarioDesc,
      isBaseCase: false,
      revenueGrowthAdjustmentPercent: newRevGrowth,
      hiringRateAdjustmentPercent: newHireRate,
      salaryInflationAdjustmentPercent: 3.5,
      travelBudgetAdjustmentPercent: 0,
      itBudgetAdjustmentPercent: 0,
      fxAdjustmentPercent: 0,
      tags: ["Custom", "What-If"],
    });
    setNewScenarioName("");
    setNewScenarioDesc("");
    setIsNewModalOpen(false);
  };

  const handleClone = (scenario: Scenario) => {
    createScenario({
      name: `${scenario.name} (Clone)`,
      description: `Cloned from ${scenario.name}. Adjust assumptions for iterative stress-testing.`,
      isBaseCase: false,
      revenueGrowthAdjustmentPercent: scenario.revenueGrowthAdjustmentPercent,
      hiringRateAdjustmentPercent: scenario.hiringRateAdjustmentPercent,
      salaryInflationAdjustmentPercent: scenario.salaryInflationAdjustmentPercent,
      travelBudgetAdjustmentPercent: scenario.travelBudgetAdjustmentPercent,
      itBudgetAdjustmentPercent: scenario.itBudgetAdjustmentPercent,
      fxAdjustmentPercent: scenario.fxAdjustmentPercent,
      tags: [...scenario.tags, "Cloned"],
    });
  };

  const handlePromoteToBaseline = (scenarioId: string) => {
    scenarios.forEach((s) => {
      updateScenario(s.id, { isBaseCase: s.id === scenarioId });
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Scenario Planning & What-If Levers
            </span>
            <span className="text-xs text-slate-500">Stress-Testing & Sensitivity Models</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Multi-Scenario Modeling & Sensitivity Levers</h1>
          <p className="text-xs text-slate-500">
            Compare Base Case, Optimistic Expansion, and Downside trajectories with instant recalculation of EBIT and headcount
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Scenario</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === activeScenarioId;

          return (
            <div
              key={scenario.id}
              onClick={() => setActiveScenarioId(scenario.id)}
              className={`rounded-xl border p-5 cursor-pointer transition-all ${
                isSelected
                  ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    {scenario.isBaseCase ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                        <Award className="w-3 h-3" />
                        <span>Baseline</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        What-If Simulation
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{scenario.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{scenario.description}</p>
                </div>
              </div>

              {/* Mini Metrics */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">TNS</span>
                  <span className="font-bold text-slate-900">{formatCurrency(scenario.calculatedRevenue, true)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">EBIT</span>
                  <span className={`font-bold ${scenario.calculatedEbit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(scenario.calculatedEbit, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans">Margin</span>
                  <span className="font-bold text-purple-700">{scenario.calculatedEbitMargin.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClone(scenario);
                  }}
                  className="flex items-center space-x-1 text-slate-500 hover:text-slate-900"
                  title="Clone scenario"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone</span>
                </button>

                {!scenario.isBaseCase && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromoteToBaseline(scenario.id);
                      }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Promote to Base</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScenario(scenario.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Scenario Levers & Live P&L Waterfall (US6.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levers Slider Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Levers: {activeScenario.name}</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Live Recalc</span>
          </div>

          {/* Revenue Growth Slider */}
          <div className="text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700">Revenue Growth Rate</span>
              <span className="text-emerald-600 font-mono font-bold">
                {activeScenario.revenueGrowthAdjustmentPercent >= 0 ? "+" : ""}
                {activeScenario.revenueGrowthAdjustmentPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="35"
              step="0.5"
              value={activeScenario.revenueGrowthAdjustmentPercent}
              onChange={(e) =>
                updateScenario(activeScenario.id, { revenueGrowthAdjustmentPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Salary Inflation Slider */}
          <div className="text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700">Salary Inflation Rate</span>
              <span className="text-purple-700 font-mono font-bold">
                +{activeScenario.salaryInflationAdjustmentPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={activeScenario.salaryInflationAdjustmentPercent}
              onChange={(e) =>
                updateScenario(activeScenario.id, { salaryInflationAdjustmentPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Headcount Growth Slider */}
          <div className="text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700">Headcount Ramp Adjustment</span>
              <span className="text-blue-700 font-mono font-bold">
                {activeScenario.hiringRateAdjustmentPercent >= 0 ? "+" : ""}
                {activeScenario.hiringRateAdjustmentPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="40"
              step="1"
              value={activeScenario.hiringRateAdjustmentPercent}
              onChange={(e) =>
                updateScenario(activeScenario.id, { hiringRateAdjustmentPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Travel Budget Policy Slider */}
          <div className="text-xs">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-slate-700">Travel & Entertainment Budget</span>
              <span className="text-amber-700 font-mono font-bold">
                {activeScenario.travelBudgetAdjustmentPercent >= 0 ? "+" : ""}
                {activeScenario.travelBudgetAdjustmentPercent.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={activeScenario.travelBudgetAdjustmentPercent}
              onChange={(e) =>
                updateScenario(activeScenario.id, { travelBudgetAdjustmentPercent: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

        {/* US6.3: Side-by-Side Scenario Comparison Chart & Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>Side-by-Side Financial Comparison ($ in Thousands)</span>
              </h2>
              <p className="text-xs text-slate-500">Total Net Sales, Total Operating Costs & EBIT by scenario</p>
            </div>
          </div>

          <div className="h-60 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sideBySideData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}k`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "6px" }} />
                <Bar dataKey="revenue" name="Total Revenue ($k)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" name="Total Costs ($k)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ebit" name="Operating EBIT ($k)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Side-by-Side Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-sans">Scenario Name</th>
                  <th className="py-2.5 px-3 text-right">Revenue ($k)</th>
                  <th className="py-2.5 px-3 text-right">Costs ($k)</th>
                  <th className="py-2.5 px-3 text-right">EBIT ($k)</th>
                  <th className="py-2.5 px-3 text-right">EBIT %</th>
                  <th className="py-2.5 px-3 text-right">FTE Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sideBySideData.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 flex items-center space-x-1.5">
                      <span>{row.name}</span>
                      {row.isBaseCase && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px]">
                          Baseline
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">${row.revenue.toLocaleString()}k</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">${row.costs.toLocaleString()}k</td>
                    <td className="py-2.5 px-3 text-right text-purple-700 font-bold">${row.ebit.toLocaleString()}k</td>
                    <td className="py-2.5 px-3 text-right text-slate-900">{row.ebitMargin}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{row.headcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Scenario Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <GitFork className="w-5 h-5 text-blue-600" />
                <span>Create Planning Scenario</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scenario Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY27 Aggressive EMEA Expansion"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Revenue Growth % (+/-)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newRevGrowth}
                  onChange={(e) => setNewRevGrowth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Headcount Ramp % (+/-)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newHireRate}
                  onChange={(e) => setNewHireRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Hypothesis & Strategic Context</label>
                <textarea
                  rows={3}
                  placeholder="Describe market assumptions, hiring pace, or target customer acquisition shifts..."
                  value={newScenarioDesc}
                  onChange={(e) => setNewScenarioDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Create Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
