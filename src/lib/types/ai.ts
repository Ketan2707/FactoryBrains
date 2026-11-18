// ─── AI Types ───────────────────────────────────────────────

export type AIConfidenceLevel = 'high' | 'medium' | 'low';
export type AIRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'dismissed' | 'modified' | 'expired';

export interface AIRecommendation {
  id: string;
  type: 'purchase' | 'maintenance' | 'production' | 'inventory' | 'quality' | 'sales' | 'general';
  title: string;
  description: string;
  confidence: number; // 0-100
  confidenceLevel: AIConfidenceLevel;
  risk: AIRiskLevel;
  evidence: AIEvidence[];
  expectedImpact: string;
  alternativeAction?: string;
  status: RecommendationStatus;
  createdAt: string;
  expiresAt?: string;
  agentId?: string;
  agentName?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface AIEvidence {
  label: string;
  value: string;
  source: string;
  confidence?: number;
}

// ─── Predictions ────────────────────────────────────────────

export interface AIPrediction {
  id: string;
  type: 'stockout' | 'demand' | 'failure' | 'quality' | 'delivery' | 'cost';
  entityId: string;
  entityName: string;
  prediction: string;
  value?: number;
  unit?: string;
  timeframe: string;
  confidence: number;
  evidence: AIEvidence[];
  createdAt: string;
}

// ─── Investigations ─────────────────────────────────────────

export interface AIInvestigation {
  id: string;
  question: string;
  status: 'running' | 'completed' | 'failed';
  summary: string;
  contributors: AIContributor[];
  evidence: AIEvidence[];
  recommendedActions: string[];
  createdAt: string;
  completedAt?: string;
  dataSourcesAnalyzed: string[];
}

export interface AIContributor {
  factor: string;
  contribution: number; // percentage
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// ─── Simulations ────────────────────────────────────────────

export interface Simulation {
  id: string;
  name: string;
  description: string;
  type: 'supplier_change' | 'demand_change' | 'machine_downtime' | 'price_change' | 'capacity_change' | 'workforce_change' | 'custom';
  parameters: SimulationParameter[];
  results?: SimulationResult;
  status: 'draft' | 'running' | 'completed';
  createdAt: string;
  createdBy: string;
}

export interface SimulationParameter {
  name: string;
  label: string;
  currentValue: number | string;
  simulatedValue: number | string;
  unit?: string;
}

export interface SimulationResult {
  metrics: SimulationMetric[];
  confidence: number;
  warnings: string[];
  disclaimer: string;
}

export interface SimulationMetric {
  label: string;
  currentValue: number;
  projectedValue: number;
  change: number;
  changePercent: number;
  unit: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// ─── AI Agents ──────────────────────────────────────────────

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'finance' | 'procurement' | 'production' | 'maintenance' | 'quality';
  status: 'active' | 'paused' | 'disabled';
  permissions: AIAgentPermission[];
  allowedTools: string[];
  spendingLimit?: number;
  approvalRequired: boolean;
  confidenceThreshold: number;
  lastRunAt?: string;
  totalActions: number;
  successRate: number;
}

export interface AIAgentPermission {
  action: string;
  allowed: boolean;
  description: string;
}

// ─── Data Trust ─────────────────────────────────────────────

export interface DataTrustScore {
  source: string;
  score: number; // 0-100
  issues: DataTrustIssue[];
  lastEvaluated: string;
  recordCount: number;
}

export interface DataTrustIssue {
  type: 'missing' | 'duplicate' | 'stale' | 'conflict' | 'outlier' | 'invalid';
  severity: 'low' | 'medium' | 'high';
  count: number;
  description: string;
}

// ─── Workflows ──────────────────────────────────────────────

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'disabled';
  trigger: string;
  conditions: string[];
  actions: string[];
  lastTriggered?: string;
  totalRuns: number;
  successRate: number;
}

// ─── Approvals ──────────────────────────────────────────────

export interface Approval {
  id: string;
  type: 'purchase_order' | 'maintenance' | 'production' | 'inventory_transfer' | 'expense' | 'workflow';
  title: string;
  description: string;
  amount?: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  aiRecommended: boolean;
  aiConfidence?: number;
  expectedImpact?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Audit ──────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  description: string;
  aiRecommended: boolean;
  aiConfidence?: number;
  result: 'success' | 'failure';
  ipAddress?: string;
}

// ─── AI Copilot ─────────────────────────────────────────────

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: CopilotToolCall[];
  sources?: string[];
}

export interface CopilotToolCall {
  tool: string;
  input: string;
  output: string;
  duration: number; // ms
}

// ─── Alerts ─────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'recommendation' | 'approval';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  module: string;
  entityId?: string;
  entityType?: string;
  read: boolean;
  actionRequired: boolean;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
}
