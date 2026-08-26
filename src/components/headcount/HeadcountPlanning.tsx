import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { HeadcountPosition, DepartmentId } from "../../types";
import {
  Users,
  UserPlus,
  UserMinus,
  Briefcase,
  MapPin,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
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

export const HeadcountPlanning: React.FC = () => {
  const {
    headcountList,
    addHeadcountPosition,
    updateHeadcountPosition,
    deleteHeadcountPosition,
    monthlyHeadcount,
    totalHeadcountStats,
    selectedDepartmentId,
    setSelectedDepartmentId,
    departments,
    currentUser,
    formatCurrency,
    formatPercent,
    recalculateDrivers,
  } = usePlanning();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<HeadcountPosition | null>(null);

  // Hiring simulation slider state
  const [simulationHiringMultiplier, setSimulationHiringMultiplier] = useState<number>(0); // -50% to +50%

  const [formData, setFormData] = useState<Omit<HeadcountPosition, "id">>({
    departmentId: "ENG",
    role: "Senior Cloud Solutions Architect",
    level: "Senior",
    location: "US HQ (San Francisco)",
    type: "FTE",
    currentCount: 2,
    plannedHires: 1,
    plannedExits: 0,
    plannedTransfers: 0,
    targetHireMonth: 3,
    baseAnnualSalary: 175000,
    benefitsRate: 0.22,
    bonusRate: 0.15,
    onboardingCost: 3500,
    status: "RECRUITING",
    recruiterLeadTimeWeeks: 6,
  });

  const locations = [
    "US HQ (San Francisco)",
    "London (UK)",
    "Berlin (DE)",
    "Singapore",
    "Tokyo (JP)",
    "Remote",
  ] as const;

  const filteredHeadcount = headcountList.filter((item) => {
    const matchesDept = selectedDepartmentId === "ALL" || item.departmentId === selectedDepartmentId;
    const matchesSearch =
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === "ALL" || item.type === selectedTypeFilter;
    const matchesLoc = selectedLocationFilter === "ALL" || item.location === selectedLocationFilter;
    return matchesDept && matchesSearch && matchesType && matchesLoc;
  });

  // Simulated total calculations
  const simHiresFactor = 1 + simulationHiringMultiplier / 100;
  const simulatedPlannedHires = Math.round(totalHeadcountStats.totalPlannedHires * simHiresFactor);
  const simulatedTotalFTE = totalHeadcountStats.totalCurrentFTE + simulatedPlannedHires - totalHeadcountStats.totalPlannedExits;
  const simulatedCost = Math.round(totalHeadcountStats.totalAnnualFullyLoadedCost * (1 + (simHiresFactor - 1) * 0.4));

  // Multi-Year Workforce Growth Trends Data (FY25 - FY29)
  const multiYearTrendData = [
    { year: "FY25 (Actual)", fteCount: 68, salaryCost: 8900, contractors: 3 },
    { year: "FY26 (Actual)", fteCount: 86, salaryCost: 11800, contractors: 5 },
    { year: "FY27 (Plan)", fteCount: simulatedTotalFTE, salaryCost: Math.round(simulatedCost / 1000), contractors: 7 },
    { year: "FY28 (Proj)", fteCount: Math.round(simulatedTotalFTE * 1.18), salaryCost: Math.round((simulatedCost * 1.2) / 1000), contractors: 8 },
    { year: "FY29 (Proj)", fteCount: Math.round(simulatedTotalFTE * 1.35), salaryCost: Math.round((simulatedCost * 1.42) / 1000), contractors: 10 },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPos) {
      updateHeadcountPosition(editingPos.id, formData);
      setEditingPos(null);
    } else {
      addHeadcountPosition(formData);
    }
    setIsAddModalOpen(false);
  };

  const openEditModal = (pos: HeadcountPosition) => {
    setEditingPos(pos);
    setFormData({ ...pos });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Headcount & Workforce Planning
            </span>
            <span className="text-xs text-slate-500">Position Roster & Automatic Compensation Engine</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Workforce Evolution & Compensation Model</h1>
          <p className="text-xs text-slate-500">
            Model departmental positions, hiring timelines, loaded benefit surcharges, recruitment lead times & multi-year trends
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingPos(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Active Workforce</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalHeadcountStats.totalCurrentFTE} FTE</span>
            <span className="text-xs text-slate-500 font-medium">7 Contractors</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Across 6 Global Office Locations & Remote
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planned Net Growth</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">+{totalHeadcountStats.netGrowthFTE} Net</span>
            <span className="text-xs text-slate-500 font-mono">+{totalHeadcountStats.totalPlannedHires} / -{totalHeadcountStats.totalPlannedExits}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 pt-2 border-t border-slate-100">
            Target Year-End: {totalHeadcountStats.totalCurrentFTE + totalHeadcountStats.netGrowthFTE} FTEs
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Vacancies & Lead Time</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{totalHeadcountStats.openVacancies} Req</span>
            <span className="text-xs text-slate-500">Avg Lead: 5.8 wks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Proactive recruitment triggered for Q2/Q3 requisitions
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loaded Annual Personnel Cost</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {currentUser.maskSensitiveSalaries ? "$***,***" : formatCurrency(totalHeadcountStats.totalAnnualFullyLoadedCost, true)}
            </span>
            <span className="text-xs text-purple-700 font-semibold font-mono">22% Surcharge</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Includes Base + 22% Benefits + Bonus + $3.5k Onboarding
          </p>
        </div>
      </div>

      {/* US2.3: Interactive Hiring Scenario Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hiring Ramp Scenario Simulator</h2>
              <p className="text-xs text-slate-500">
                Stress-test workforce adjustments in real-time to preview instant FTE & Personnel Cost impacts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Simulated FTE Target</span>
              <span className="text-sm font-bold text-emerald-600">{simulatedTotalFTE} FTE</span>
            </div>
            <div className="h-6 w-px bg-slate-300" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Simulated Cost Impact</span>
              <span className="text-sm font-bold text-purple-700">
                {currentUser.maskSensitiveSalaries ? "$***,***" : formatCurrency(simulatedCost, true)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="font-semibold">Hiring Velocity Adjustment:</span>
            <span className="font-bold text-blue-700 font-mono">
              {simulationHiringMultiplier >= 0 ? `+${simulationHiringMultiplier}% (Accelerated)` : `${simulationHiringMultiplier}% (Restrained)`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={simulationHiringMultiplier}
            onChange={(e) => setSimulationHiringMultiplier(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>-50% (Hiring Freeze)</span>
            <span>0% (Baseline Plan)</span>
            <span>+50% (Hypergrowth)</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Monthly Actual vs Plan & Multi-Year Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* US2.5: Monthly Headcount Actual vs Plan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Headcount Tracking (M1 - M12)</h2>
              <p className="text-xs text-slate-500">Planned vs Actual headcount evolution</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                <span className="text-slate-600 font-medium">Planned FTE</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-600 font-medium">Actual FTE</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyHeadcount} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="plannedFTE" name="Planned FTE" stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actualFTE" name="Actual FTE" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* US2.7: Multi-Year Workforce Growth Trends */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Year Workforce Growth Trends (FY25 - FY29)</h2>
              <p className="text-xs text-slate-500">Headcount expansion and salary expenditure projection</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Total FTEs</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiYearTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", color: "#FFFFFF", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="fteCount" name="FTE Count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Headcount Position Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search position by role, level, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Types</option>
                <option value="FTE">FTE</option>
                <option value="Contractor">Contractor</option>
              </select>

              <select
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="ALL">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredHeadcount.length}</strong> positions
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Role Title & Level</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Current</th>
                <th className="py-3 px-4 text-center">Hires</th>
                <th className="py-3 px-4 text-center">Hire Month</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Fully Loaded</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredHeadcount.map((pos) => {
                const dept = departments.find((d) => d.id === pos.departmentId);
                const loadedSalary =
                  pos.baseAnnualSalary * (1 + pos.benefitsRate + pos.bonusRate) * (pos.currentCount + pos.plannedHires);

                return (
                  <tr key={pos.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-semibold text-slate-900">{pos.role}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Level: {pos.level} • Req Lead: {pos.recruiterLeadTimeWeeks}w</span>
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-50 border border-slate-200 text-slate-700">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept?.color }} />
                        <span>{dept?.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{pos.location}</span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          pos.type === "FTE" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {pos.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">{pos.currentCount}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-600">+{pos.plannedHires}</td>
                    <td className="py-2.5 px-4 text-center text-slate-600">M{pos.targetHireMonth}</td>
                    <td className="py-2.5 px-4 text-right text-slate-600">
                      {currentUser.maskSensitiveSalaries ? "$***,***" : formatCurrency(pos.baseAnnualSalary)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      {currentUser.maskSensitiveSalaries ? "$***,***" : formatCurrency(loadedSalary)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          pos.status === "FILLED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : pos.status === "RECRUITING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {pos.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-sans">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(pos)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition"
                          title="Edit Position"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteHeadcountPosition(pos.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                          title="Delete Position"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Modal (Add / Edit) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>{editingPos ? "Edit Headcount Position" : "Add Headcount Position"}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Seniority Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Director">Director</option>
                    <option value="VP">VP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value as DepartmentId })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Location</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {locations.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="FTE">FTE (Permanent)</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Count</label>
                  <input
                    type="number"
                    value={formData.currentCount}
                    onChange={(e) => setFormData({ ...formData, currentCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Planned Hires</label>
                  <input
                    type="number"
                    value={formData.plannedHires}
                    onChange={(e) => setFormData({ ...formData, plannedHires: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Hire Month (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.targetHireMonth}
                    onChange={(e) => setFormData({ ...formData, targetHireMonth: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Base Annual Salary ($)</label>
                  <input
                    type="number"
                    value={formData.baseAnnualSalary}
                    onChange={(e) => setFormData({ ...formData, baseAnnualSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Benefits Surcharge (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.benefitsRate}
                    onChange={(e) => setFormData({ ...formData, benefitsRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Variable Bonus (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.bonusRate}
                    onChange={(e) => setFormData({ ...formData, bonusRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  {editingPos ? "Save Changes" : "Create Position"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
