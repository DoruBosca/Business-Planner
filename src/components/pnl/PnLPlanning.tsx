import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { DepartmentId, PnLLineItem } from "../../types";
import {
  TrendingUp,
  Lock,
  Unlock,
  Save,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Building,
  DollarSign,
  Percent,
  RefreshCw,
  Plus,
} from "lucide-react";

export const PnLPlanning: React.FC = () => {
  const {
    pnlItems,
    updatePnLMonthlyPlan,
    activeCycle,
    updateCycleStatus,
    departments,
    selectedDepartmentId,
    setSelectedDepartmentId,
    currentUser,
    formatCurrency,
    formatPercent,
    consolidatedPnL,
    recalculateDrivers,
  } = usePlanning();

  const [selectedQuarter, setSelectedQuarter] = useState<"FY" | "Q1" | "Q2" | "Q3" | "Q4">("FY");
  const [editingValues, setEditingValues] = useState<{ [itemId: string]: number[] }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const monthsByQuarter: { [key: string]: number[] } = {
    Q1: [0, 1, 2],
    Q2: [3, 4, 5],
    Q3: [6, 7, 8],
    Q4: [9, 10, 11],
    FY: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const activeMonths = monthsByQuarter[selectedQuarter];

  const handleCellChange = (itemId: string, monthIdx: number, val: number) => {
    if (activeCycle.status === "LOCKED") return;

    const currentPlan = editingValues[itemId] || [...(pnlItems.find((i) => i.id === itemId)?.monthlyPlan || [])];
    currentPlan[monthIdx] = val;

    setEditingValues((prev) => ({
      ...prev,
      [itemId]: currentPlan,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = () => {
    Object.entries(editingValues).forEach(([itemId, plan]) => {
      updatePnLMonthlyPlan(itemId, plan);
    });
    setEditingValues({});
    setHasUnsavedChanges(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleLockCycle = () => {
    if (activeCycle.status === "LOCKED") {
      updateCycleStatus(activeCycle.id, "OPEN_FOR_SUBMISSIONS", "Controller unlocked financial plan");
    } else {
      updateCycleStatus(activeCycle.id, "LOCKED", "Formal executive lock for financial baseline");
    }
  };

  // Group items by category
  const categories = Array.from(new Set(pnlItems.map((i) => i.category)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              P&L Financial Planning Grid
            </span>
            <span className="text-xs text-slate-500">
              {activeCycle.name} • {activeCycle.status}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Multi-Entity P&L Budget Formulation</h1>
          <p className="text-xs text-slate-500">
            Full spreadsheet-style financial planning matrix with instant organizational cost consolidation & baseline locking
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition animate-pulse"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}

          {(currentUser.role === "CONTROLLER" || currentUser.role === "ADMINISTRATOR") && (
            <button
              onClick={handleLockCycle}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                activeCycle.status === "LOCKED"
                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
              }`}
            >
              {activeCycle.status === "LOCKED" ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{activeCycle.status === "LOCKED" ? "Unlock Plan" : "Lock Plan Baseline"}</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>All P&L cost elements successfully saved and consolidated into the organizational ledger.</span>
        </div>
      )}

      {/* Target Setup Cards (US3.1 & US3.6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Net Sales (TNS)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(consolidatedPnL.totalRevenue, true)}</span>
            <span className="text-xs text-slate-500 font-mono">Target FY27</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block pt-2 border-t border-slate-100">
            Organic Growth: +14.2% YoY
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Margin Target</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{consolidatedPnL.grossMarginPercent.toFixed(1)}%</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Favorable</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block pt-2 border-t border-slate-100">
            Material & COGS: {formatCurrency(consolidatedPnL.materialCosts, true)}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Profit (EBIT)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(consolidatedPnL.ebit, true)}</span>
            <span className="text-xs text-blue-700 font-mono font-medium">{consolidatedPnL.ebitMarginTNS.toFixed(1)}% TNS</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block pt-2 border-t border-slate-100">
            Total Costs: {formatCurrency(consolidatedPnL.totalCosts, true)}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Consolidation Status</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-700">6 Cost Centers</span>
            <span className="text-xs text-slate-500 font-mono">100% Synced</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block pt-2 border-t border-slate-100">
            Status: {activeCycle.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Planning Matrix Spreadsheet View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Interactive Budget Matrix ($ in Thousands)</h2>
          </div>

          {/* Quarter / Time Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(["FY", "Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  selectedQuarter === q ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {q === "FY" ? "Full Year (12M)" : q}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-sans min-w-[240px] sticky left-0 bg-slate-50 z-10">P&L Cost Element</th>
                <th className="py-3 px-3 text-right">FY Total ($k)</th>
                {activeMonths.map((mIdx) => (
                  <th key={mIdx} className="py-3 px-3 text-right">
                    {monthNames[mIdx]} ($k)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => {
                const catItems = pnlItems.filter((i) => i.category === category);

                return (
                  <React.Fragment key={category}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-50/80 font-sans font-bold text-slate-800 border-t border-slate-200">
                      <td className="py-2.5 px-4 sticky left-0 bg-slate-50/90 z-10 text-blue-700" colSpan={activeMonths.length + 2}>
                        {category}
                      </td>
                    </tr>

                    {/* Cost Element Rows */}
                    {catItems.map((item) => {
                      const currentMonthly = editingValues[item.id] || item.monthlyPlan;
                      const fullYearTotal = currentMonthly.reduce((a, b) => a + b, 0);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4 font-sans text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">GL: {item.code}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 border-r border-slate-200">
                            ${Math.round(fullYearTotal / 1000).toLocaleString()}k
                          </td>
                          {activeMonths.map((mIdx) => {
                            const val = currentMonthly[mIdx] || 0;
                            const isEditable = activeCycle.status !== "LOCKED";

                            return (
                              <td key={mIdx} className="py-2 px-2 text-right">
                                {isEditable ? (
                                  <input
                                    type="number"
                                    value={Math.round(val / 1000)}
                                    onChange={(e) => handleCellChange(item.id, mIdx, Number(e.target.value) * 1000)}
                                    className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                                  />
                                ) : (
                                  <span className="text-slate-700">${Math.round(val / 1000).toLocaleString()}k</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
