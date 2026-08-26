import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import {
  Department,
  PlanningCycle,
  HeadcountPosition,
  MonthlyHeadcountRecord,
  PnLLineItem,
  CostDriverRule,
  MacroAssumptions,
  Scenario,
  VarianceRecord,
  PlanSubmission,
  AuditLogEntry,
  IntegrationConnector,
  UserRole,
  UserSession,
  DepartmentId,
} from "../types";
import {
  INITIAL_DEPARTMENTS,
  INITIAL_CYCLES,
  INITIAL_HEADCOUNT,
  INITIAL_MONTHLY_HEADCOUNT,
  INITIAL_PNL_ITEMS,
  INITIAL_COST_DRIVERS,
  INITIAL_MACRO,
  INITIAL_SCENARIOS,
  INITIAL_VARIANCES,
  INITIAL_SUBMISSIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INTEGRATIONS,
} from "../data/initialData";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

interface PlanningContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Cycles
  cycles: PlanningCycle[];
  activeCycleId: string;
  setActiveCycleId: (id: string) => void;
  activeCycle: PlanningCycle;
  createCycle: (newCycle: Partial<PlanningCycle>) => void;
  updateCycleStatus: (cycleId: string, status: PlanningCycle["status"], reason?: string) => void;
  updateMilestone: (cycleId: string, milestoneId: string, completed: boolean) => void;

  // Departments
  departments: Department[];
  selectedDepartmentId: DepartmentId | "ALL";
  setSelectedDepartmentId: (dept: DepartmentId | "ALL") => void;

  // Headcount
  headcountList: HeadcountPosition[];
  addHeadcountPosition: (position: Omit<HeadcountPosition, "id">) => void;
  updateHeadcountPosition: (id: string, updates: Partial<HeadcountPosition>) => void;
  deleteHeadcountPosition: (id: string) => void;
  monthlyHeadcount: MonthlyHeadcountRecord[];
  totalHeadcountStats: {
    totalCurrentFTE: number;
    totalPlannedHires: number;
    totalPlannedExits: number;
    netGrowthFTE: number;
    totalAnnualSalary: number;
    totalAnnualFullyLoadedCost: number;
    openVacancies: number;
  };

  // P&L
  pnlItems: PnLLineItem[];
  updatePnLItem: (id: string, updates: Partial<PnLLineItem>) => void;
  consolidatedPnL: {
    totalRevenue: number;
    totalPersonnelCosts: number;
    totalPersonnelOrientedCosts: number;
    totalMaterialCosts: number;
    totalOtherCosts: number;
    totalDepreciation: number;
    totalAllocations: number;
    totalCosts: number;
    ebit: number;
    ebitMarginTNS: number;
    ebitMarginCosts: number;
    grossMarginPercent: number;
  };
  recalculateDrivers: () => void;

  // Cost Drivers
  costDrivers: CostDriverRule[];
  updateCostDriver: (id: string, updates: Partial<CostDriverRule>) => void;

  // Macro
  macro: MacroAssumptions;
  updateMacro: (updates: Partial<MacroAssumptions>) => void;

  // Scenarios
  scenarios: Scenario[];
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  activeScenario: Scenario;
  createScenario: (scenario: Partial<Scenario>) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;

  // Variances
  variances: VarianceRecord[];
  addVarianceExplanation: (id: string, reason: string, action: string) => void;
  approveVariance: (id: string) => void;

  // Submissions & Workflows
  submissions: PlanSubmission[];
  submitDepartmentPlan: (departmentId: DepartmentId, totalRequested: number, headcountCount: number) => void;
  reviewSubmission: (submissionId: string, status: "APPROVED" | "REJECTED", feedback: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, entity: string, prev?: string, next?: string, reason?: string) => void;

  // Integrations
  integrations: IntegrationConnector[];
  triggerIntegrationSync: (id: string) => Promise<void>;

  // User & Governance
  currentUser: UserSession;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserSession>>;
  switchRole: (role: UserRole) => void;
  toggleSalaryMasking: () => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (title: string, message: string, type?: Notification["type"]) => void;

  // Currency Formatter helper
  formatCurrency: (amount: number, compact?: boolean) => string;
  formatPercent: (val: number, decimals?: number) => string;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

export const PlanningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // User Session & Security
  const [currentUser, setCurrentUser] = useState<UserSession>({
    name: "Rachel Adams",
    email: "rachel.adams@enterprise.corp",
    role: "CONTROLLER",
    maskSensitiveSalaries: false,
  });

  // Planning Cycles
  const [cycles, setCycles] = useState<PlanningCycle[]>(INITIAL_CYCLES);
  const [activeCycleId, setActiveCycleId] = useState<string>("CYCLE-APR-2027");

  // Departments
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<DepartmentId | "ALL">("ALL");

  // Headcount
  const [headcountList, setHeadcountList] = useState<HeadcountPosition[]>(INITIAL_HEADCOUNT);
  const [monthlyHeadcount] = useState<MonthlyHeadcountRecord[]>(INITIAL_MONTHLY_HEADCOUNT);

  // P&L
  const [pnlItems, setPnlItems] = useState<PnLLineItem[]>(INITIAL_PNL_ITEMS);

  // Cost Drivers
  const [costDrivers, setCostDrivers] = useState<CostDriverRule[]>(INITIAL_COST_DRIVERS);

  // Macro
  const [macro, setMacro] = useState<MacroAssumptions>(INITIAL_MACRO);

  // Scenarios
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("SCN-BASE");

  // Variances
  const [variances, setVariances] = useState<VarianceRecord[]>(INITIAL_VARIANCES);

  // Submissions
  const [submissions, setSubmissions] = useState<PlanSubmission[]>(INITIAL_SUBMISSIONS);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Integrations
  const [integrations, setIntegrations] = useState<IntegrationConnector[]>(INITIAL_INTEGRATIONS);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "N-1",
      title: "April Reforecast Cycle Open",
      message: "Submissions for the 6+6 Reforecast are due by April 20th. Please review headcount rosters.",
      type: "info",
      timestamp: "2027-04-10 09:00",
      read: false,
    },
    {
      id: "N-2",
      title: "Plan Submission Pending Review",
      message: "Elena Rostova submitted the Commercial & Sales plan ($7.85M budget).",
      type: "warning",
      timestamp: "2027-04-17 11:20",
      read: false,
    },
    {
      id: "N-3",
      title: "ERP Sync Successful",
      message: "SAP S/4HANA General Ledger actuals for Period M04 synchronized without error.",
      type: "success",
      timestamp: "2027-04-20 04:00",
      read: true,
    },
  ]);

  const activeCycle = useMemo(() => {
    return cycles.find((c) => c.id === activeCycleId) || cycles[0];
  }, [cycles, activeCycleId]);

  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  const addNotification = (title: string, message: string, type: Notification["type"] = "info") => {
    const newNotif: Notification = {
      id: "N-" + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addAuditLog = (action: string, entity: string, prev?: string, next?: string, reason?: string) => {
    const newLog: AuditLogEntry = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      targetEntity: entity,
      previousValue: prev,
      newValue: next,
      reason: reason || "User updated record in interface",
    };
    setAuditLogs((p) => [newLog, ...p]);
  };

  const switchRole = (role: UserRole) => {
    let name = "Rachel Adams";
    let email = "rachel.adams@enterprise.corp";
    let dept: DepartmentId | undefined = undefined;

    if (role === "DEPARTMENT_MANAGER") {
      name = "Dr. Marcus Vance";
      email = "marcus.vance@tech.enterprise.corp";
      dept = "ENG";
    } else if (role === "EXECUTIVE") {
      name = "Alexandra Sterling (CEO)";
      email = "alexandra.sterling@enterprise.corp";
    } else if (role === "ADMINISTRATOR") {
      name = "System Admin (Planning SysOps)";
      email = "sysadmin@enterprise.corp";
    } else if (role === "AUDITOR") {
      name = "Jonathan Grey (KPMG Audit Lead)";
      email = "jgrey@audit-partner.corp";
    } else if (role === "COMPLIANCE_OFFICER") {
      name = "Helena Vance (Chief Compliance)";
      email = "compliance@enterprise.corp";
    }

    setCurrentUser({
      name,
      email,
      role,
      departmentId: dept,
      maskSensitiveSalaries: currentUser.maskSensitiveSalaries,
    });
    addAuditLog("ROLE_SWITCHED", `User session switched to ${role}`);
    addNotification("Role Switched", `Active profile changed to ${role} (${name}).`, "info");
  };

  const toggleSalaryMasking = () => {
    setCurrentUser((prev) => ({ ...prev, maskSensitiveSalaries: !prev.maskSensitiveSalaries }));
  };

  // Headcount statistics
  const totalHeadcountStats = useMemo(() => {
    let totalCurrentFTE = 0;
    let totalPlannedHires = 0;
    let totalPlannedExits = 0;
    let totalAnnualSalary = 0;
    let totalAnnualFullyLoadedCost = 0;
    let openVacancies = 0;

    const filtered =
      selectedDepartmentId === "ALL"
        ? headcountList
        : headcountList.filter((h) => h.departmentId === selectedDepartmentId);

    filtered.forEach((pos) => {
      const count = pos.currentCount;
      totalCurrentFTE += count;
      totalPlannedHires += pos.plannedHires;
      totalPlannedExits += pos.plannedExits;
      if (pos.status === "RECRUITING") {
        openVacancies += pos.plannedHires;
      }

      const base = pos.baseAnnualSalary * count;
      const loaded = base * (1 + pos.benefitsRate + pos.bonusRate) + pos.plannedHires * pos.onboardingCost;
      totalAnnualSalary += base;
      totalAnnualFullyLoadedCost += loaded;
    });

    const netGrowthFTE = totalPlannedHires - totalPlannedExits;

    return {
      totalCurrentFTE,
      totalPlannedHires,
      totalPlannedExits,
      netGrowthFTE,
      totalAnnualSalary,
      totalAnnualFullyLoadedCost,
      openVacancies,
    };
  }, [headcountList, selectedDepartmentId]);

  // Add / Update / Delete Headcount
  const addHeadcountPosition = (position: Omit<HeadcountPosition, "id">) => {
    const newId = `HC-${position.departmentId}-${Math.floor(100 + Math.random() * 900)}`;
    const newPos: HeadcountPosition = { ...position, id: newId };
    setHeadcountList((prev) => [...prev, newPos]);
    addAuditLog("HEADCOUNT_POSITION_ADDED", `Position: ${position.role} (${position.departmentId})`, undefined, `Hires: ${position.plannedHires}, Base: $${position.baseAnnualSalary}`);
    addNotification("Headcount Position Added", `${position.role} was added to ${position.departmentId}.`, "success");
  };

  const updateHeadcountPosition = (id: string, updates: Partial<HeadcountPosition>) => {
    setHeadcountList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          addAuditLog("HEADCOUNT_POSITION_UPDATED", `Position: ${item.role} (${item.id})`, JSON.stringify(item), JSON.stringify(updated));
          return updated;
        }
        return item;
      })
    );
  };

  const deleteHeadcountPosition = (id: string) => {
    const item = headcountList.find((h) => h.id === id);
    setHeadcountList((prev) => prev.filter((h) => h.id !== id));
    if (item) {
      addAuditLog("HEADCOUNT_POSITION_DELETED", `Position: ${item.role} (${id})`);
    }
  };

  // Recalculate drivers: update P&L line items based on headcount & driver multipliers
  const recalculateDrivers = () => {
    // Calculate total fully loaded salaries by department
    const deptPersonnelMap: Record<DepartmentId, number> = {
      ENG: 0,
      SALES: 0,
      MKT: 0,
      PROD: 0,
      OPS: 0,
      GNA: 0,
    };
    const deptHeadcountMap: Record<DepartmentId, number> = {
      ENG: 0,
      SALES: 0,
      MKT: 0,
      PROD: 0,
      OPS: 0,
      GNA: 0,
    };

    headcountList.forEach((pos) => {
      const activeCount = pos.currentCount + Math.floor(pos.plannedHires * 0.7);
      deptHeadcountMap[pos.departmentId] += activeCount;
      const loadedAnnual =
        pos.baseAnnualSalary * activeCount * (1 + pos.benefitsRate + pos.bonusRate);
      deptPersonnelMap[pos.departmentId] += loadedAnnual;
    });

    const travelDriver = costDrivers.find((d) => d.id === "DRV-03");
    const itDriver = costDrivers.find((d) => d.id === "DRV-04");

    setPnlItems((prev) =>
      prev.map((item) => {
        if (item.id === "PER-01") {
          // Remuneration
          const newDeptBreakdown = { ...item.departmentBreakdown };
          (Object.keys(newDeptBreakdown) as DepartmentId[]).forEach((d) => {
            newDeptBreakdown[d] = Math.round(deptPersonnelMap[d] * 0.78);
          });
          const annualTotal = (Object.values(newDeptBreakdown) as number[]).reduce((a, b) => a + b, 0);
          const monthly = Array(12).fill(Math.round(annualTotal / 12));
          return { ...item, departmentBreakdown: newDeptBreakdown, monthlyPlan: monthly };
        }
        if (item.id === "POC-01" && travelDriver) {
          // Travel Costs
          const newDeptBreakdown = { ...item.departmentBreakdown };
          (Object.keys(newDeptBreakdown) as DepartmentId[]).forEach((d) => {
            const mult = travelDriver.departmentOverrides?.[d] || travelDriver.defaultMultiplier;
            newDeptBreakdown[d] = Math.round(deptHeadcountMap[d] * mult);
          });
          const annualTotal = (Object.values(newDeptBreakdown) as number[]).reduce((a, b) => a + b, 0);
          const monthly = Array(12).fill(Math.round(annualTotal / 12));
          return { ...item, departmentBreakdown: newDeptBreakdown, monthlyPlan: monthly };
        }
        if (item.id === "OTH-03" && itDriver) {
          // IT Costs
          const newDeptBreakdown = { ...item.departmentBreakdown };
          (Object.keys(newDeptBreakdown) as DepartmentId[]).forEach((d) => {
            const mult = itDriver.departmentOverrides?.[d] || itDriver.defaultMultiplier;
            newDeptBreakdown[d] = Math.round(deptHeadcountMap[d] * mult);
          });
          const annualTotal = (Object.values(newDeptBreakdown) as number[]).reduce((a, b) => a + b, 0);
          const monthly = Array(12).fill(Math.round(annualTotal / 12));
          return { ...item, departmentBreakdown: newDeptBreakdown, monthlyPlan: monthly };
        }
        return item;
      })
    );

    addAuditLog("COST_DRIVERS_RECALCULATED", "P&L line items scaled with updated headcount & driver multipliers");
    addNotification("Drivers Applied", "P&L synchronized with latest Headcount and Business Rules.", "success");
  };

  // Consolidated P&L metrics
  const consolidatedPnL = useMemo(() => {
    let totalRevenue = 0;
    let totalPersonnelCosts = 0;
    let totalPersonnelOrientedCosts = 0;
    let totalMaterialCosts = 0;
    let totalOtherCosts = 0;
    let totalDepreciation = 0;
    let totalAllocations = 0;

    pnlItems.forEach((item) => {
      let annual = 0;
      if (selectedDepartmentId === "ALL") {
        annual = (Object.values(item.departmentBreakdown) as number[]).reduce((a, b) => a + b, 0);
      } else {
        annual = item.departmentBreakdown[selectedDepartmentId] || 0;
      }

      switch (item.category) {
        case "Income":
          totalRevenue += annual;
          break;
        case "Personnel Costs":
          totalPersonnelCosts += annual;
          break;
        case "Personnel-Oriented Costs":
          totalPersonnelOrientedCosts += annual;
          break;
        case "Material Costs":
          totalMaterialCosts += annual;
          break;
        case "Other Costs":
          totalOtherCosts += annual;
          break;
        case "Depreciation":
          totalDepreciation += annual;
          break;
        case "Allocations":
          totalAllocations += annual;
          break;
        default:
          break;
      }
    });

    const totalCosts =
      totalPersonnelCosts +
      totalPersonnelOrientedCosts +
      totalMaterialCosts +
      totalOtherCosts +
      totalDepreciation +
      totalAllocations;

    const ebit = totalRevenue - totalCosts;
    const ebitMarginTNS = totalRevenue > 0 ? (ebit / totalRevenue) * 100 : 0;
    const ebitMarginCosts = totalCosts > 0 ? (ebit / totalCosts) * 100 : 0;
    const grossMarginPercent =
      totalRevenue > 0 ? ((totalRevenue - totalMaterialCosts) / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalPersonnelCosts,
      totalPersonnelOrientedCosts,
      totalMaterialCosts,
      totalOtherCosts,
      totalDepreciation,
      totalAllocations,
      totalCosts,
      ebit,
      ebitMarginTNS,
      ebitMarginCosts,
      grossMarginPercent,
    };
  }, [pnlItems, selectedDepartmentId]);

  const updatePnLItem = (id: string, updates: Partial<PnLLineItem>) => {
    setPnlItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          addAuditLog("PNL_ITEM_UPDATED", `Line Item: ${item.name} (${item.code})`, JSON.stringify(item), JSON.stringify(updated));
          return updated;
        }
        return item;
      })
    );
  };

  const updateCostDriver = (id: string, updates: Partial<CostDriverRule>) => {
    setCostDrivers((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...updates };
          addAuditLog("COST_DRIVER_UPDATED", `Rule: ${d.name}`, JSON.stringify(d), JSON.stringify(updated));
          return updated;
        }
        return d;
      })
    );
  };

  const updateMacro = (updates: Partial<MacroAssumptions>) => {
    setMacro((prev) => {
      const next = { ...prev, ...updates };
      addAuditLog("MACRO_ASSUMPTIONS_UPDATED", "Macroeconomic Model Indices", JSON.stringify(prev), JSON.stringify(next));
      return next;
    });
  };

  // Cycles actions
  const createCycle = (newCycle: Partial<PlanningCycle>) => {
    const cycleId = `CYCLE-${Date.now()}`;
    const fullCycle: PlanningCycle = {
      id: cycleId,
      name: newCycle.name || "New Planning Cycle",
      type: newCycle.type || "CUSTOM_CYCLE",
      fiscalYear: newCycle.fiscalYear || 2027,
      startDate: newCycle.startDate || "2027-01-01",
      submissionDeadline: newCycle.submissionDeadline || "2027-02-15",
      reviewDeadline: newCycle.reviewDeadline || "2027-03-01",
      status: "OPEN_FOR_SUBMISSIONS",
      isBaseline: false,
      description: newCycle.description || "Custom operational planning cycle",
      completionRate: 10,
      milestones: newCycle.milestones || [
        { id: "M-1", title: "Target Release", targetDate: "2027-01-10", completed: true, owner: currentUser.name },
        { id: "M-2", title: "Submissions Due", targetDate: "2027-02-15", completed: false, owner: "Department Heads" },
        { id: "M-3", title: "Review & Signoff", targetDate: "2027-03-01", completed: false, owner: "Controller" },
      ],
    };
    setCycles((prev) => [...prev, fullCycle]);
    setActiveCycleId(cycleId);
    addAuditLog("PLANNING_CYCLE_CREATED", `Cycle: ${fullCycle.name}`, undefined, `Status: ${fullCycle.status}`);
    addNotification("New Cycle Created", `${fullCycle.name} was successfully initiated.`, "success");
  };

  const updateCycleStatus = (cycleId: string, status: PlanningCycle["status"], reason?: string) => {
    setCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) {
          addAuditLog("CYCLE_STATUS_CHANGED", `Cycle: ${c.name}`, `Status: ${c.status}`, `Status: ${status}`, reason);
          return { ...c, status };
        }
        return c;
      })
    );
    addNotification("Cycle Status Updated", `Planning cycle status set to ${status}.`, "info");
  };

  const updateMilestone = (cycleId: string, milestoneId: string, completed: boolean) => {
    setCycles((prev) =>
      prev.map((c) => {
        if (c.id === cycleId) {
          const updatedMilestones = c.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed } : m
          );
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const rate = Math.round((completedCount / updatedMilestones.length) * 100);
          return { ...c, milestones: updatedMilestones, completionRate: rate };
        }
        return c;
      })
    );
  };

  // Scenarios actions
  const createScenario = (scenarioData: Partial<Scenario>) => {
    const id = `SCN-${Date.now()}`;
    const baseRev = consolidatedPnL.totalRevenue;
    const basePersonnel = consolidatedPnL.totalPersonnelCosts;
    const baseCosts = consolidatedPnL.totalCosts;

    const revGrowth = scenarioData.revenueGrowthAdjustmentPercent || 0;
    const hireAdj = scenarioData.hiringRateAdjustmentPercent || 0;
    const salAdj = scenarioData.salaryInflationAdjustmentPercent || 0;
    const travAdj = scenarioData.travelBudgetAdjustmentPercent || 0;

    const calcRev = baseRev * (1 + revGrowth / 100);
    const calcPers = basePersonnel * (1 + hireAdj / 100) * (1 + salAdj / 100);
    const otherCosts = baseCosts - basePersonnel;
    const calcOther = otherCosts * (1 + travAdj / 200);
    const calcTotalCost = calcPers + calcOther;
    const calcEbit = calcRev - calcTotalCost;
    const calcMargin = (calcEbit / calcRev) * 100;

    const newScenario: Scenario = {
      id,
      name: scenarioData.name || "Custom Scenario",
      description: scenarioData.description || "What-if simulation branch",
      isBaseCase: false,
      hiringRateAdjustmentPercent: hireAdj,
      revenueGrowthAdjustmentPercent: revGrowth,
      salaryInflationAdjustmentPercent: salAdj,
      travelBudgetAdjustmentPercent: travAdj,
      itBudgetAdjustmentPercent: scenarioData.itBudgetAdjustmentPercent || 0,
      fxAdjustmentPercent: scenarioData.fxAdjustmentPercent || 0,
      calculatedRevenue: Math.round(calcRev),
      calculatedPersonnelCost: Math.round(calcPers),
      calculatedTotalCost: Math.round(calcTotalCost),
      calculatedEbit: Math.round(calcEbit),
      calculatedEbitMargin: Number(calcMargin.toFixed(1)),
      tags: scenarioData.tags || ["Custom", "What-if"],
    };

    setScenarios((prev) => [...prev, newScenario]);
    setActiveScenarioId(id);
    addAuditLog("SCENARIO_CREATED", `Scenario: ${newScenario.name}`, undefined, `EBIT Margin: ${calcMargin.toFixed(1)}%`);
    addNotification("Scenario Created", `Scenario "${newScenario.name}" was initialized.`, "success");
  };

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const merged = { ...s, ...updates };
          const baseRev = 57400000;
          const basePers = 25680000;
          const baseOther = 21620000;

          const calcRev = baseRev * (1 + merged.revenueGrowthAdjustmentPercent / 100);
          const calcPers =
            basePers *
            (1 + merged.hiringRateAdjustmentPercent / 100) *
            (1 + merged.salaryInflationAdjustmentPercent / 100);
          const calcOther =
            baseOther *
            (1 + merged.travelBudgetAdjustmentPercent / 200 + merged.itBudgetAdjustmentPercent / 200);
          const calcTotalCost = calcPers + calcOther;
          const calcEbit = calcRev - calcTotalCost;
          const calcMargin = (calcEbit / calcRev) * 100;

          return {
            ...merged,
            calculatedRevenue: Math.round(calcRev),
            calculatedPersonnelCost: Math.round(calcPers),
            calculatedTotalCost: Math.round(calcTotalCost),
            calculatedEbit: Math.round(calcEbit),
            calculatedEbitMargin: Number(calcMargin.toFixed(1)),
          };
        }
        return s;
      })
    );
  };

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Variances
  const addVarianceExplanation = (id: string, reason: string, action: string) => {
    setVariances((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updated = {
            ...v,
            status: "DOCUMENTED" as const,
            documentedReason: reason,
            correctiveAction: action,
            submitter: currentUser.name,
          };
          addAuditLog("VARIANCE_EXPLAINED", `Variance on: ${v.lineItemName} (${v.period})`, undefined, reason);
          return updated;
        }
        return v;
      })
    );
    addNotification("Variance Documented", "Explanation and corrective action logged for controller review.", "success");
  };

  const approveVariance = (id: string) => {
    setVariances((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "APPROVED_BY_CONTROLLER" as const } : v))
    );
    addAuditLog("VARIANCE_APPROVED", `Controller signed off on variance ID: ${id}`);
  };

  // Submissions
  const submitDepartmentPlan = (
    departmentId: DepartmentId,
    totalRequested: number,
    headcountCount: number
  ) => {
    const dept = departments.find((d) => d.id === departmentId);
    const existing = submissions.find(
      (s) => s.cycleId === activeCycleId && s.departmentId === departmentId
    );

    if (existing) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                status: "SUBMITTED",
                totalRequestedBudget: totalRequested,
                headcountRequested: headcountCount,
                submittedBy: currentUser.name,
                submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              }
            : s
        )
      );
    } else {
      const newSub: PlanSubmission = {
        id: `SUB-${departmentId}-${Date.now()}`,
        cycleId: activeCycleId,
        departmentId,
        departmentName: dept?.name || departmentId,
        submittedBy: currentUser.name,
        submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        totalRequestedBudget: totalRequested,
        headcountRequested: headcountCount,
        status: "SUBMITTED",
        checklist: {
          headcountAligned: true,
          travelPolicyCompliant: true,
          itSoftwareAudited: true,
          driverMultipliersApplied: true,
        },
      };
      setSubmissions((prev) => [...prev, newSub]);
    }

    addAuditLog("PLAN_SUBMITTED", `Department Plan: ${dept?.name}`, undefined, `Requested Budget: $${totalRequested.toLocaleString()}`);
    addNotification("Plan Submitted", `${dept?.name} business plan submitted for Controller approval.`, "info");
  };

  const reviewSubmission = (
    submissionId: string,
    status: "APPROVED" | "REJECTED",
    feedback: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          const updated = {
            ...s,
            status,
            controllerFeedback: feedback,
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          };
          addAuditLog(`PLAN_${status}`, `Submission for ${s.departmentName}`, `Status: ${s.status}`, `Status: ${status}`, feedback);
          return updated;
        }
        return s;
      })
    );
    addNotification(`Plan ${status === "APPROVED" ? "Approved" : "Returned"}`, `Feedback: ${feedback}`, status === "APPROVED" ? "success" : "warning");
  };

  // Integration sync simulation
  const triggerIntegrationSync = async (id: string) => {
    setIntegrations((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: "SYNCING" as const } : conn))
    );

    await new Promise((res) => setTimeout(res, 1200));

    setIntegrations((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              status: "CONNECTED" as const,
              lastSyncTimestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
              recordsSynced: conn.recordsSynced + Math.floor(10 + Math.random() * 50),
              healthScore: 100.0,
            }
          : conn
      )
    );

    const target = integrations.find((i) => i.id === id);
    addAuditLog("DATA_INTEGRATION_SYNCED", `Synchronized Connector: ${target?.name}`);
    addNotification("Data Sync Completed", `${target?.name} refreshed live records successfully.`, "success");
  };

  // Formatting helpers
  const formatCurrency = (amount: number, compact = false): string => {
    if (compact) {
      if (Math.abs(amount) >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(amount) >= 1_000) {
        return `$${(amount / 1_000).toFixed(1)}k`;
      }
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (val: number, decimals = 1): string => {
    return `${val >= 0 ? "" : ""}${val.toFixed(decimals)}%`;
  };

  return (
    <PlanningContext.Provider
      value={{
        activeTab,
        setActiveTab,
        cycles,
        activeCycleId,
        setActiveCycleId,
        activeCycle,
        createCycle,
        updateCycleStatus,
        updateMilestone,
        departments,
        selectedDepartmentId,
        setSelectedDepartmentId,
        headcountList,
        addHeadcountPosition,
        updateHeadcountPosition,
        deleteHeadcountPosition,
        monthlyHeadcount,
        totalHeadcountStats,
        pnlItems,
        updatePnLItem,
        consolidatedPnL,
        recalculateDrivers,
        costDrivers,
        updateCostDriver,
        macro,
        updateMacro,
        scenarios,
        activeScenarioId,
        setActiveScenarioId,
        activeScenario,
        createScenario,
        updateScenario,
        deleteScenario,
        variances,
        addVarianceExplanation,
        approveVariance,
        submissions,
        submitDepartmentPlan,
        reviewSubmission,
        auditLogs,
        addAuditLog,
        integrations,
        triggerIntegrationSync,
        currentUser,
        setCurrentUser,
        switchRole,
        toggleSalaryMasking,
        notifications,
        markNotificationRead,
        addNotification,
        formatCurrency,
        formatPercent,
      }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider");
  }
  return context;
};
