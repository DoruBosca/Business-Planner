import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { CostDriverRule, DepartmentId } from "../../types";
import {
  Cpu,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Percent,
  CheckCircle,
  HelpCircle,
  BarChart3,
  Layers,
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

export const CostDriverPlanning: React.FC = () => {
  const {
    costDrivers,
    updateCostDriver,
    recalculateDrivers,
    departments,
    formatCurrency,
    formatPercent,
    consolidatedPnL,
    totalHeadcountStats,
  } = usePlanning();

  const [selectedDriverId, setSelectedDriverId] = useState<string>(costDrivers[0]?.id || "");
  const [recalcNotice, setRecalcNotice] = useState(false);

  const selectedDriver = costDrivers.find((d) => d.id === selectedDriverId) || costDrivers[0];

  const handleRateChange = (driverId: string, newRate: number) => {
    updateCostDriver(driverId, { baseRate: newRate });
  };

  const handleDeptOverrideChange = (driverId: string, deptId: DepartmentId, newRate: number) => {
    const driver = costDrivers.find((d) => d.id === driverId);
    if (!driver) return;
    const updatedOverrides = { ...driver.departmentOverrides, [deptId]: newRate };
    updateCostDriver(driverId, { departmentOverrides: updatedOverrides });
  };

  const handleTriggerRecalc = () => {
    recalculateDrivers();
    setRecalcNotice(true);
    setTimeout(() => setRecalcNotice(false), 3000);
  };

  // US4.4 Driver Sensitivity Tornado Chart Data
  // Calculating EBIT sensitivity if each driver moves by +10%
  const sensitivityData = costDrivers.map((driver) => {
    let estimatedAnnualImpact = 0;
    const baseRate = driver.baseRate;

    if (driver.category === "HEADCOUNT") {
      // 10% change on loaded benefits
      estimatedAnnualImpact = totalHeadcountStats.totalAnnualFullyLoadedCost * 0.1 * 0.22;
    } else if (driver.category === "TRAVEL") {
      // 10% change on travel rate ($4,800 * 10% * FTE)
      estimatedAnnualImpact = totalHeadcountStats.totalCurrentFTE * baseRate * 0.1;
    } else if (driver.category === "IT_INFRASTRUCTURE") {
      // 10% change on software seat licenses
      estimatedAnnualImpact = totalHeadcountStats.totalCurrentFTE * baseRate * 0.1;
    } else if (driver.category === "FACILITIES") {
      // 10% change on facilities cost per sqft (120 sqft * $48 * 0.1 * FTE)
      estimatedAnnualImpact = totalHeadcountStats.totalCurrentFTE * 120 * baseRate * 0.1;
    } else if (driver.category === "TRAINING") {
      estimatedAnnualImpact = totalHeadcountStats.totalCurrentFTE * baseRate * 0.1;
    } else {
      estimatedAnnualImpact = 45000;
    }

    return {
      driverName: driver.name,
      impact: Math.round(estimatedAnnualImpact / 1000), // in $k
      category: driver.category,
      unit: driver.unit,
    };
  }).sort((a, b) => b.impact - a.impact);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Driver-Based Cost Planning Engine
            </span>
            <span className="text-xs text-slate-500">Activity & Headcount Linkages</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Operational Cost Drivers & Formula Rules</h1>
          <p className="text-xs text-slate-500">
            Define dynamic cost formulas (Travel per FTE, IT seat costs, Rent/sqft, Benefits) with departmental overrides
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerRecalc}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recalculate Entire Model</span>
          </button>
        </div>
      </div>

      {recalcNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>All dependent P&L cost elements dynamically recalculated based on updated driver rules.</span>
        </div>
      )}

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {costDrivers.map((driver) => {
          const isSelected = driver.id === selectedDriverId;

          return (
            <div
              key={driver.id}
              onClick={() => setSelectedDriverId(driver.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{driver.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{driver.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{driver.description}</p>
                </div>
                <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-mono font-bold">
                  {driver.unit.includes("$") ? formatCurrency(driver.baseRate) : `${driver.baseRate} ${driver.unit}`}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{driver.formulaDescription}</span>
                <span className="text-blue-600 font-semibold hover:underline">Edit Rules &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Rule Configuration & Department Overrides (US4.1 & US4.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Configure Rule: {selectedDriver.name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Formula: {selectedDriver.formulaDescription}</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Global Base Rate Input */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-semibold mb-1">
                Global Organizational Base Rate ({selectedDriver.unit})
              </label>
              <div className="flex items-center space-x-3 mt-2">
                <input
                  type="number"
                  value={selectedDriver.baseRate}
                  onChange={(e) => handleRateChange(selectedDriver.id, Number(e.target.value))}
                  className="w-40 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-500">Applies to all departments unless overridden below</span>
              </div>
            </div>

            {/* US4.3 Department Overrides */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Departmental Specific Overrides
                </span>
                <span className="text-[11px] text-slate-500">e.g. Engineering software seats vs Sales travel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map((dept) => {
                  const overrideVal = selectedDriver.departmentOverrides[dept.id] ?? selectedDriver.baseRate;

                  return (
                    <div
                      key={dept.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <div>
                          <span className="font-semibold text-slate-900 block">{dept.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">CC: {dept.costCenter}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          value={overrideVal}
                          onChange={(e) => handleDeptOverrideChange(selectedDriver.id, dept.id, Number(e.target.value))}
                          className="w-24 text-right px-2 py-1 bg-white border border-slate-200 rounded text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">{selectedDriver.unit.split("/")[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* US4.4: Driver Sensitivity Tornado Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">EBIT Sensitivity Ranking</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Estimated annual EBIT impact ($k) for every <strong>+10% shift</strong> in cost driver rates
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensitivityData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}k`} />
                  <YAxis type="category" dataKey="driverName" stroke="#64748B" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(val: any) => [`-$${val}k EBIT Impact`, "Sensitivity"]}
                  />
                  <Bar dataKey="impact" name="EBIT Sensitivity ($k)" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 mt-4">
            <span className="font-bold">Key Insight:</span> Loaded Benefits and Travel per FTE represent over 65% of all variable cost variance sensitivity.
          </div>
        </div>
      </div>
    </div>
  );
};
