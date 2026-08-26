export type PlanningCycleType = "OCTOBER_PLAN" | "APRIL_REFORECAST" | "CUSTOM_CYCLE";

export type CycleStatus = "DRAFT" | "OPEN_FOR_SUBMISSIONS" | "UNDER_REVIEW" | "APPROVED" | "LOCKED" | "ARCHIVED";

export interface PlanningCycle {
  id: string;
  name: string;
  type: PlanningCycleType;
  fiscalYear: number;
  startDate: string;
  submissionDeadline: string;
  reviewDeadline: string;
  status: CycleStatus;
  isBaseline: boolean;
  description: string;
  completionRate: number; // 0 - 100
  milestones: {
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    owner: string;
  }[];
}

export type DepartmentId = "ENG" | "SALES" | "MKT" | "GNA" | "OPS" | "PROD";

export interface Department {
  id: DepartmentId;
  name: string;
  head: string;
  costCenter: string;
  color: string;
}

export interface HeadcountPosition {
  id: string;
  departmentId: DepartmentId;
  role: string;
  level: "Junior" | "Mid" | "Senior" | "Lead" | "Director" | "VP";
  location: "US HQ (San Francisco)" | "London (UK)" | "Berlin (DE)" | "Singapore" | "Tokyo (JP)" | "Remote";
  type: "FTE" | "Contractor" | "Intern";
  currentCount: number;
  plannedHires: number;
  plannedExits: number;
  plannedTransfers: number;
  targetHireMonth: number; // 1 - 12
  baseAnnualSalary: number;
  benefitsRate: number; // e.g. 0.22 (22%)
  bonusRate: number; // e.g. 0.15 (15%)
  onboardingCost: number; // e.g. 3500
  status: "FILLED" | "RECRUITING" | "PLANNED" | "ON_HOLD";
  recruiterLeadTimeWeeks: number;
}

export interface MonthlyHeadcountRecord {
  month: string;
  monthIndex: number;
  plannedFTE: number;
  actualFTE: number;
  plannedContractors: number;
  actualContractors: number;
  totalPlannedCost: number;
  totalActualCost: number;
  openVacancies: number;
}

export interface PnLLineItem {
  id: string;
  code: string;
  name: string;
  category:
    | "Income"
    | "Personnel Costs"
    | "Personnel-Oriented Costs"
    | "Material Costs"
    | "Other Costs"
    | "Depreciation"
    | "Allocations"
    | "Business Results";
  subCategory?: string;
  isHeader?: boolean;
  isTotal?: boolean;
  isCalculated?: boolean;
  departmentBreakdown: Record<DepartmentId, number>; // Annual base
  monthlyPlan: number[]; // 12 elements
  monthlyActual: number[]; // 12 elements
  monthlyForecast: number[]; // 12 elements
  driverType?: "HEADCOUNT_SCALED" | "REVENUE_PERCENT" | "FIXED_CONTRACT" | "SQUARE_FOOTAGE" | "MANUAL";
  driverMultiplier?: number;
}

export interface CostDriverRule {
  id: string;
  name: string;
  category: string;
  driverMetric: "HEADCOUNT" | "REVENUE" | "FLOORSPACE_SQFT" | "TRANSACTIONS" | "CUSTOM";
  defaultMultiplier: number;
  unit: string;
  description: string;
  sensitivityEbitImpactPercent: number; // Sensitivity ranking score
  departmentOverrides?: Partial<Record<DepartmentId, number>>;
}

export interface MacroAssumptions {
  inflationRate: number; // e.g. 3.5%
  eurUsdRate: number; // e.g. 1.08
  gbpUsdRate: number; // e.g. 1.28
  jpyUsdRate: number; // e.g. 152.5
  marketGdpGrowth: number; // e.g. 2.4%
  corporateTaxRate: number; // e.g. 21%
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isBaseCase: boolean;
  hiringRateAdjustmentPercent: number; // e.g. +10%
  revenueGrowthAdjustmentPercent: number; // e.g. +5%
  salaryInflationAdjustmentPercent: number; // e.g. +3%
  travelBudgetAdjustmentPercent: number; // e.g. -20%
  itBudgetAdjustmentPercent: number; // e.g. 0%
  fxAdjustmentPercent: number; // e.g. -2%
  calculatedRevenue: number;
  calculatedPersonnelCost: number;
  calculatedTotalCost: number;
  calculatedEbit: number;
  calculatedEbitMargin: number;
  tags: string[];
}

export interface VarianceRecord {
  id: string;
  period: string; // e.g. "2027-M04"
  departmentId: DepartmentId;
  lineItemId: string;
  lineItemName: string;
  planAmount: number;
  actualAmount: number;
  forecastAmount: number;
  varianceDollar: number; // actual - plan (or plan - actual for revenue)
  variancePercent: number;
  favorable: boolean;
  status: "DOCUMENTED" | "PENDING_EXPLANATION" | "APPROVED_BY_CONTROLLER";
  documentedReason?: string;
  submitter?: string;
  correctiveAction?: string;
  aiSuggestedRootCause?: string;
}

export type UserRole = "ADMINISTRATOR" | "CONTROLLER" | "DEPARTMENT_MANAGER" | "EXECUTIVE" | "AUDITOR" | "COMPLIANCE_OFFICER";

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  departmentId?: DepartmentId;
  maskSensitiveSalaries: boolean;
}

export interface PlanSubmission {
  id: string;
  cycleId: string;
  departmentId: DepartmentId;
  departmentName: string;
  submittedBy: string;
  submittedAt: string;
  totalRequestedBudget: number;
  headcountRequested: number;
  status: "DRAFT" | "SUBMITTED" | "CONTROLLER_REVIEW" | "APPROVED" | "REJECTED";
  controllerFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  checklist: {
    headcountAligned: boolean;
    travelPolicyCompliant: boolean;
    itSoftwareAudited: boolean;
    driverMultipliersApplied: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetEntity: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface MBRSlide {
  id: string;
  title: string;
  category: "FINANCIAL_SUMMARY" | "P_AND_L_DETAILS" | "HEADCOUNT_ANALYSIS" | "VARIANCE_WATERFALL" | "AI_OUTLOOK";
  bullets: string[];
  metricsSnapshot: Record<string, string | number>;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  systemType: "ERP" | "HRIS" | "CRM" | "FILE_UPLOAD";
  status: "CONNECTED" | "SYNCING" | "ERROR" | "IDLE";
  lastSyncTimestamp: string;
  recordsSynced: number;
  healthScore: number;
}
