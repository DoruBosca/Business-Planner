import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { DepartmentId, PnLLineItem } from "../../types";
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export const MonthlyDashboard: React.FC = () => {
  const {
    pnlItems,
    selectedDepartmentId,
    setSelectedDepartmentId,
    departments,
    activeCycle,
    formatCurrency,
    formatPercent,
    consolidatedPnL,
    totalHeadcountStats,
  } = usePlanning();

  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">(4); // Default to April (M04)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Income: true,
    "Personnel Costs": true,
    "Personnel-Oriented Costs": true,
    "Material Costs": true,
    "Other Costs": true,
    Depreciation: true,
    Allocations: true,
    "Business Results": true,
  });
  const [drillDownItem, setDrillDownItem] = useState<PnLLineItem | null>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Helper to compute line item values based on selected month or full year
  const getItemValues = (item: PnLLineItem) => {
    if (selectedMonth === "ALL") {
      let plan = item.monthlyPlan.reduce((a, b) => a + b, 0);
      let actual = item.monthlyActual.reduce((a, b) => a + b, 0);
      let forecast = item.monthlyForecast.reduce((a, b) => a + b, 0);

      if (selectedDepartmentId !== "ALL") {
        const factor =
          Object.values(item.departmentBreakdown).reduce((a, b) => a + b, 0) > 0
            ? (item.departmentBreakdown[selectedDepartmentId] || 0) /
              Object.values(item.departmentBreakdown).reduce((a, b) => a + b, 0)
            : 0;
        plan = Math.round(plan * factor);
        actual = Math.round(actual * factor);
        forecast = Math.round(forecast * factor);
      }

      const diff = item.category === "Income" ? actual - plan : plan - actual;
      const variancePercent = plan !== 0 ? ((actual - plan) / plan) * 100 : 0;
      return { plan, actual, forecast, diff, variancePercent };
    }

    const monthIndex = Number(selectedMonth) - 1;
    let plan = item.monthlyPlan[monthIndex] || 0;
    let actual = item.monthlyActual[monthIndex] || 0;
    let forecast = item.monthlyForecast[monthIndex] || 0;

    if (selectedDepartmentId !== "ALL") {
      const totalDept = Object.values(item.departmentBreakdown).reduce((a, b) => a + b, 0);
      const factor = totalDept > 0 ? (item.departmentBreakdown[selectedDepartmentId] || 0) / totalDept : 0;
      plan = Math.round(plan * factor);
      actual = Math.round(actual * factor);
      forecast = Math.round(forecast * factor);
    }

    const diff = item.category === "Income" ? actual - plan : plan - actual;
    const variancePercent = plan !== 0 ? ((actual - plan) / plan) * 100 : 0;
    return { plan, actual, forecast, diff, variancePercent };
  };

  // Group line items into required categories
  const categoriesList = [
    { name: "Income", code: "1.0", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Personnel Costs", code: "2.0", color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "Personnel-Oriented Costs", code: "3.0", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { name: "Material Costs", code: "4.0", color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "Other Costs", code: "5.0", color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "Depreciation", code: "6.0", color: "text-rose-400", bg: "bg-rose-500/10" },
    { name: "Allocations", code: "7.0", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  // Compute category sub-totals
  const getCategoryTotals = (categoryName: string) => {
    const items = pnlItems.filter((i) => i.category === categoryName);
    let plan = 0;
    let actual = 0;
    let forecast = 0;
    items.forEach((item) => {
      const vals = getItemValues(item);
      plan += vals.plan;
      actual += vals.actual;
      forecast += vals.forecast;
    });
    const diff = categoryName === "Income" ? actual - plan : plan - actual;
    const variancePercent = plan !== 0 ? ((actual - plan) / plan) * 100 : 0;
    return { plan, actual, forecast, diff, variancePercent };
  };

  // Overall Business Results calculations
  const incomeTotals = getCategoryTotals("Income");
  const personnelTotals = getCategoryTotals("Personnel Costs");
  const personnelOrientedTotals = getCategoryTotals("Personnel-Oriented Costs");
  const materialTotals = getCategoryTotals("Material Costs");
  const otherTotals = getCategoryTotals("Other Costs");
  const depreciationTotals = getCategoryTotals("Depreciation");
  const allocationsTotals = getCategoryTotals("Allocations");

  const totalCostsPlan =
    personnelTotals.plan +
    personnelOrientedTotals.plan +
    materialTotals.plan +
    otherTotals.plan +
    depreciationTotals.plan +
    allocationsTotals.plan;

  const totalCostsActual =
    personnelTotals.actual +
    personnelOrientedTotals.actual +
    materialTotals.actual +
    otherTotals.actual +
    depreciationTotals.actual +
    allocationsTotals.actual;

  const totalCostsForecast =
    personnelTotals.forecast +
    personnelOrientedTotals.forecast +
    materialTotals.forecast +
    otherTotals.forecast +
    depreciationTotals.forecast +
    allocationsTotals.forecast;

  const ebitPlan = incomeTotals.plan - totalCostsPlan;
  const ebitActual = incomeTotals.actual - totalCostsActual;
  const ebitForecast = incomeTotals.forecast - totalCostsForecast;

  const ebitMarginTnsPlan = incomeTotals.plan > 0 ? (ebitPlan / incomeTotals.plan) * 100 : 0;
  const ebitMarginTnsActual = incomeTotals.actual > 0 ? (ebitActual / incomeTotals.actual) * 100 : 0;

  const ebitMarginCostsPlan = totalCostsPlan > 0 ? (ebitPlan / totalCostsPlan) * 100 : 0;
  const ebitMarginCostsActual = totalCostsActual > 0 ? (ebitActual / totalCostsActual) * 100 : 0;

  // Monthly trend chart data
  const monthlyTrendData = months.map((m, idx) => {
    let rev = 0;
    let costs = 0;
    let actRev = 0;
    let actCosts = 0;

    pnlItems.forEach((item) => {
      let pVal = item.monthlyPlan[idx] || 0;
      let aVal = item.monthlyActual[idx] || 0;

      if (selectedDepartmentId !== "ALL") {
        const totalDept = (Object.values(item.departmentBreakdown) as number[]).reduce((a, b) => a + b, 0);
        const f = totalDept > 0 ? (item.departmentBreakdown[selectedDepartmentId] || 0) / totalDept : 0;
        pVal = Math.round(pVal * f);
        aVal = Math.round(aVal * f);
      }

      if (item.category === "Income") {
        rev += pVal;
        actRev += aVal;
      } else {
        costs += pVal;
        actCosts += aVal;
      }
    });

    const ebitP = rev - costs;
    const ebitA = actRev - actCosts;

    return {
      month: m,
      planRevenue: Math.round(rev / 1000),
      actualRevenue: Math.round(actRev / 1000),
      planCosts: Math.round(costs / 1000),
      actualCosts: Math.round(actCosts / 1000),
      planEbit: Math.round(ebitP / 1000),
      actualEbit: Math.round(ebitA / 1000),
      ebitMargin: rev > 0 ? Number(((ebitA / actRev) * 100).toFixed(1)) : 0,
    };
  });

  // Traffic light status helper
  const getTrafficLight = (variancePercent: number, isIncome: boolean) => {
    const favorable = isIncome ? variancePercent >= 0 : variancePercent <= 0;
    const absVar = Math.abs(variancePercent);

    if (favorable || absVar <= 2.0) {
      return {
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        label: "On Track",
      };
    } else if (absVar <= 5.5) {
      return {
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        label: "Moderate Dev",
      };
    } else {
      return {
        color: "text-rose-700 bg-rose-50 border-rose-200",
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
        label: "Critical Dev",
      };
    }
  };

  const exportTableCSV = () => {
    const rows = [
      ["Line Item Code", "Category", "Line Item Name", "Plan", "Actual", "Forecast", "Variance ($)", "Variance (%)"],
    ];

    pnlItems.forEach((item) => {
      const v = getItemValues(item);
      rows.push([
        item.code,
        item.category,
        item.name,
        v.plan.toString(),
        v.actual.toString(),
        v.forecast.toString(),
        v.diff.toString(),
        v.variancePercent.toFixed(2) + "%",
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encoded;
    a.download = `P_and_L_Dashboard_${activeCycle.fiscalYear}_${selectedMonth === "ALL" ? "FullYear" : "M" + selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Cycle context & Monthly Time Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Monthly Business Dashboard
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activeCycle.name} • {selectedDepartmentId === "ALL" ? "Consolidated Enterprise" : departments.find((d) => d.id === selectedDepartmentId)?.name}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">Monthly P&L & Profitability Control Board</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized financial statement hierarchy with real-time actual vs plan traffic-lights & cost center drill-downs
            </p>
          </div>

          {/* Month Selector Pills */}
          <div className="flex items-center flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedMonth("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMonth === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              FY Total
            </button>
            {months.map((m, idx) => {
              const monthNum = idx + 1;
              const isSelected = selectedMonth === monthNum;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income KPI */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Net Sales (TNS)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(incomeTotals.actual, true)}</span>
            <span className="text-xs text-slate-500 font-mono">Plan: {formatCurrency(incomeTotals.plan, true)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className={`font-semibold ${incomeTotals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {incomeTotals.diff >= 0 ? "+" : ""}
              {formatCurrency(incomeTotals.diff, true)} ({incomeTotals.variancePercent.toFixed(1)}%)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Forecast: {formatCurrency(incomeTotals.forecast, true)}</span>
          </div>
        </div>

        {/* Total Personnel Costs KPI */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Personnel Costs</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(personnelTotals.actual, true)}</span>
            <span className="text-xs text-slate-500 font-mono">Plan: {formatCurrency(personnelTotals.plan, true)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className={`font-semibold ${personnelTotals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {personnelTotals.diff >= 0 ? "Favorable " : "Over budget "}
              {formatCurrency(Math.abs(personnelTotals.diff), true)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{totalHeadcountStats.totalCurrentFTE} Active FTEs</span>
          </div>
        </div>

        {/* Operating EBIT KPI */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Profit (EBIT)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(ebitActual, true)}</span>
            <span className="text-xs text-slate-500 font-mono">Plan: {formatCurrency(ebitPlan, true)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className={`font-semibold ${ebitActual >= ebitPlan ? "text-emerald-600" : "text-rose-600"}`}>
              {ebitActual >= ebitPlan ? "+" : ""}
              {formatCurrency(ebitActual - ebitPlan, true)} vs Budget
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Forecast: {formatCurrency(ebitForecast, true)}</span>
          </div>
        </div>

        {/* EBIT % of TNS KPI */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EBIT % of TNS</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{ebitMarginTnsActual.toFixed(1)}%</span>
            <span className="text-xs text-slate-500 font-mono">Target: {ebitMarginTnsPlan.toFixed(1)}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-purple-700">
              EBIT % of Costs: {ebitMarginCostsActual.toFixed(1)}%
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Gross Margin: {consolidatedPnL.grossMarginPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts: Monthly Revenue vs Costs & EBIT Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Financial Performance Area Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Monthly Actual vs Plan Performance ($ in Thousands)</span>
              </h2>
              <p className="text-xs text-slate-500">Revenue, Operating Costs & Monthly EBIT progression</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Actual Revenue</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                <span className="text-slate-600 font-medium">Total Costs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                <span className="text-slate-600 font-medium">EBIT</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}k`, ""]}
                />
                <Area type="monotone" dataKey="actualRevenue" name="Actual Revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="actualCosts" name="Actual Costs" stroke="#3B82F6" strokeWidth={2} fill="url(#costGrad)" />
                <Line type="monotone" dataKey="actualEbit" name="EBIT Profit" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Structure Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-purple-600" />
                <span>Cost Structure Breakdown</span>
              </h2>
              <span className="text-xs text-slate-500 font-semibold">{selectedMonth === "ALL" ? "Full Year" : `Month ${selectedMonth}`}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Share of total organizational spending</p>

            {/* Cost elements progress bars */}
            <div className="space-y-3">
              {[
                { label: "Personnel Costs", val: personnelTotals.actual, color: "bg-blue-500", pct: totalCostsActual > 0 ? (personnelTotals.actual / totalCostsActual) * 100 : 0 },
                { label: "Material & Purchased", val: materialTotals.actual, color: "bg-amber-500", pct: totalCostsActual > 0 ? (materialTotals.actual / totalCostsActual) * 100 : 0 },
                { label: "IT & Other Costs", val: otherTotals.actual, color: "bg-purple-500", pct: totalCostsActual > 0 ? (otherTotals.actual / totalCostsActual) * 100 : 0 },
                { label: "Personnel-Oriented (Travel, etc.)", val: personnelOrientedTotals.actual, color: "bg-indigo-500", pct: totalCostsActual > 0 ? (personnelOrientedTotals.actual / totalCostsActual) * 100 : 0 },
                { label: "Depreciation & Allocations", val: depreciationTotals.actual + allocationsTotals.actual, color: "bg-cyan-500", pct: totalCostsActual > 0 ? ((depreciationTotals.actual + allocationsTotals.actual) / totalCostsActual) * 100 : 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.val, true)} ({item.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
            <span>Total Expenditure</span>
            <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalCostsActual)}</span>
          </div>
        </div>
      </div>

      {/* Main Hierarchical P&L Statement Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">P&L Financial Statement & Cost Element Hierarchy</h2>
            <p className="text-xs text-slate-500">
              Standard corporate P&L line items • Period: {selectedMonth === "ALL" ? "FY2027 Full Year" : `Period M${String(selectedMonth).padStart(2, "0")}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportTableCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export P&L (CSV)</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-28">GL Code</th>
                <th className="py-3 px-4 min-w-[280px]">P&L Line Item Element</th>
                <th className="py-3 px-4 text-right">Plan (Budget)</th>
                <th className="py-3 px-4 text-right">Actual Result</th>
                <th className="py-3 px-4 text-right">Forecast (6+6)</th>
                <th className="py-3 px-4 text-right">Variance ($)</th>
                <th className="py-3 px-4 text-right">Variance (%)</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-center w-24">Drill Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {categoriesList.map((cat) => {
                const isExpanded = expandedCategories[cat.name] ?? true;
                const items = pnlItems.filter((i) => i.category === cat.name);
                const totals = getCategoryTotals(cat.name);
                const isIncome = cat.name === "Income";
                const traffic = getTrafficLight(totals.variancePercent, isIncome);

                return (
                  <React.Fragment key={cat.name}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-100/80 font-sans font-bold text-slate-900 hover:bg-slate-200/60 transition cursor-pointer border-t border-slate-200" onClick={() => toggleCategory(cat.name)}>
                      <td className="py-2.5 px-4 text-slate-500">{cat.code}</td>
                      <td className="py-2.5 px-4 flex items-center space-x-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <span className="text-slate-900 font-bold">{cat.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">({items.length} items)</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{formatCurrency(totals.plan)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-900 font-bold">{formatCurrency(totals.actual)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">{formatCurrency(totals.forecast)}</td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold ${totals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {totals.diff >= 0 ? "+" : ""}
                        {formatCurrency(totals.diff)}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono font-bold ${totals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {totals.variancePercent >= 0 ? "+" : ""}
                        {totals.variancePercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-4 text-center font-sans">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] border ${traffic.color}`}>
                          {traffic.icon}
                          <span>{traffic.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-sans text-[11px] text-slate-400">Category</td>
                    </tr>

                    {/* Line Items Rows */}
                    {isExpanded &&
                      items.map((item) => {
                        const vals = getItemValues(item);
                        const itemTraffic = getTrafficLight(vals.variancePercent, item.category === "Income");

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-4 text-slate-400 font-mono">{item.code}</td>
                            <td className="py-2.5 px-4 pl-8 font-sans text-slate-800">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{item.name}</span>
                                {item.driverType && (
                                  <span className="px-1.5 py-0.2 text-[9px] font-sans rounded bg-slate-100 border border-slate-200 text-slate-600">
                                    {item.driverType.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-600">{formatCurrency(vals.plan)}</td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-900 font-semibold">{formatCurrency(vals.actual)}</td>
                            <td className="py-2.5 px-4 text-right font-mono text-slate-500">{formatCurrency(vals.forecast)}</td>
                            <td className={`py-2.5 px-4 text-right font-mono font-medium ${vals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {vals.diff >= 0 ? "+" : ""}
                              {formatCurrency(vals.diff)}
                            </td>
                            <td className={`py-2.5 px-4 text-right font-mono font-medium ${vals.diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {vals.variancePercent >= 0 ? "+" : ""}
                              {vals.variancePercent.toFixed(1)}%
                            </td>
                            <td className="py-2.5 px-4 text-center font-sans">
                              <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] border ${itemTraffic.color}`}>
                                {itemTraffic.icon}
                                <span>{itemTraffic.label}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center font-sans">
                              <button
                                onClick={() => setDrillDownItem(item)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                              >
                                Drill CC
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}

              {/* Business Results Summary Block */}
              <tr className="bg-slate-100 text-slate-900 font-sans font-bold border-t-2 border-slate-300 text-sm">
                <td className="py-3 px-4 text-indigo-700 font-mono">8.0</td>
                <td className="py-3 px-4 font-extrabold text-indigo-900">TOTAL COSTS & OVERHEADS</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(totalCostsPlan)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 font-extrabold">{formatCurrency(totalCostsActual)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(totalCostsForecast)}</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${totalCostsPlan - totalCostsActual >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {totalCostsPlan - totalCostsActual >= 0 ? "+" : ""}
                  {formatCurrency(totalCostsPlan - totalCostsActual)}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {totalCostsPlan > 0 ? (((totalCostsActual - totalCostsPlan) / totalCostsPlan) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3 px-4 text-center font-sans text-xs text-slate-500">Total</td>
                <td className="py-3 px-4 text-center font-sans text-xs text-slate-400">-</td>
              </tr>

              {/* Operating EBIT Row */}
              <tr className="bg-blue-50/90 text-blue-950 font-sans font-black border-t border-blue-200 text-sm">
                <td className="py-3.5 px-4 text-blue-700 font-mono">8.1</td>
                <td className="py-3.5 px-4 text-blue-900 flex items-center space-x-2">
                  <span>EBIT (OPERATING PROFIT)</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    Key Metric
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-700">{formatCurrency(ebitPlan)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-blue-800 text-base">{formatCurrency(ebitActual)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-700">{formatCurrency(ebitForecast)}</td>
                <td className={`py-3.5 px-4 text-right font-mono font-bold ${ebitActual >= ebitPlan ? "text-emerald-600" : "text-rose-600"}`}>
                  {ebitActual >= ebitPlan ? "+" : ""}
                  {formatCurrency(ebitActual - ebitPlan)}
                </td>
                <td className={`py-3.5 px-4 text-right font-mono font-bold ${ebitActual >= ebitPlan ? "text-emerald-600" : "text-rose-600"}`}>
                  {ebitPlan !== 0 ? (((ebitActual - ebitPlan) / Math.abs(ebitPlan)) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-3.5 px-4 text-center font-sans">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {ebitActual >= ebitPlan ? "Ahead of Plan" : "Behind Plan"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-sans text-xs text-slate-400">-</td>
              </tr>

              {/* EBIT % of TNS Row */}
              <tr className="bg-slate-50 text-slate-800 font-sans font-bold border-t border-slate-200">
                <td className="py-2.5 px-4 text-purple-700 font-mono">8.2</td>
                <td className="py-2.5 px-4 text-purple-900">EBIT % OF TOTAL NET SALES (TNS)</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">{ebitMarginTnsPlan.toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-mono text-purple-800 font-extrabold">{ebitMarginTnsActual.toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                  {incomeTotals.forecast > 0 ? ((ebitForecast / incomeTotals.forecast) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-purple-700">
                  {(ebitMarginTnsActual - ebitMarginTnsPlan >= 0 ? "+" : "") +
                    (ebitMarginTnsActual - ebitMarginTnsPlan).toFixed(1)}
                  % pts
                </td>
                <td className="py-2.5 px-4 text-right font-mono">-</td>
                <td className="py-2.5 px-4 text-center font-sans text-xs text-purple-800 font-semibold">Margin %</td>
                <td className="py-2.5 px-4 text-center font-sans text-xs text-slate-400">-</td>
              </tr>

              {/* EBIT % of Costs Row */}
              <tr className="bg-slate-50 text-slate-800 font-sans font-bold border-t border-slate-200">
                <td className="py-2.5 px-4 text-cyan-700 font-mono">8.3</td>
                <td className="py-2.5 px-4 text-cyan-900">EBIT % OF TOTAL COSTS</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">{ebitMarginCostsPlan.toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-mono text-cyan-800 font-extrabold">{ebitMarginCostsActual.toFixed(1)}%</td>
                <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                  {totalCostsForecast > 0 ? ((ebitForecast / totalCostsForecast) * 100).toFixed(1) : 0}%
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-cyan-700">
                  {(ebitMarginCostsActual - ebitMarginCostsPlan >= 0 ? "+" : "") +
                    (ebitMarginCostsActual - ebitMarginCostsPlan).toFixed(1)}
                  % pts
                </td>
                <td className="py-2.5 px-4 text-right font-mono">-</td>
                <td className="py-2.5 px-4 text-center font-sans text-xs text-cyan-800 font-semibold">Cost Mark %</td>
                <td className="py-2.5 px-4 text-center font-sans text-xs text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down Cost Center Modal */}
      {drillDownItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Cost Center Drill-Down: {drillDownItem.name}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">GL Code: {drillDownItem.code} • Category: {drillDownItem.category}</p>
              </div>
              <button
                onClick={() => setDrillDownItem(null)}
                className="text-slate-500 hover:text-slate-900 text-xs font-semibold px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Departmental cost center allocation breakdown for this line item:
              </p>

              <div className="space-y-3">
                {departments.map((dept) => {
                  const amount = drillDownItem.departmentBreakdown[dept.id] || 0;
                  const total = (Object.values(drillDownItem.departmentBreakdown) as number[]).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? (amount / total) * 100 : 0;

                  return (
                    <div key={dept.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                          <span className="font-semibold text-slate-900">{dept.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({dept.costCenter})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold font-mono text-slate-900">{formatCurrency(amount)}</span>
                          <span className="text-slate-500 text-[11px] ml-2">({pct.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: dept.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
