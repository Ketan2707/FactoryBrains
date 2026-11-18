import type { AIRecommendation, AIPrediction, AIInvestigation, Simulation, AIAgent, DataTrustScore, Workflow, Approval, AuditEntry, Alert } from '@/lib/types/ai';

// ─── AI Recommendations ─────────────────────────────────────

export const RETAIL_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rar_1', type: 'inventory', title: 'Restock Canvas Sneakers', description: 'Canvas Sneakers stock is critically low (8 units). Based on current sales velocity of 3.2 units/day, stockout is predicted in 2 days.', confidence: 96, confidenceLevel: 'high', risk: 'low',
    evidence: [{ label: 'Current stock', value: '8 units', source: 'Inventory' }, { label: 'Daily sales rate', value: '3.2 units/day', source: 'Sales History' }, { label: 'Predicted stockout', value: '2 days', source: 'Demand Forecast' }, { label: 'Supplier lead time', value: '10 days', source: 'Supplier Data' }],
    expectedImpact: 'Prevent ₹35,000 in lost sales', alternativeAction: 'Order 30 units instead of 50 to reduce inventory cost', status: 'pending', createdAt: '2026-08-31T08:00:00Z',
  },
  {
    id: 'rar_2', type: 'inventory', title: 'Restock Aviator Sunglasses', description: 'Aviator Sunglasses are below reorder point. Only 5 units remaining with 15 unit reorder point.', confidence: 91, confidenceLevel: 'high', risk: 'low',
    evidence: [{ label: 'Current stock', value: '5 units', source: 'Inventory' }, { label: 'Reorder point', value: '15 units', source: 'Product Settings' }, { label: 'Monthly demand', value: '22 units', source: 'Sales History' }],
    expectedImpact: 'Maintain product availability', status: 'pending', createdAt: '2026-08-31T08:00:00Z',
  },
  {
    id: 'rar_3', type: 'sales', title: 'Follow up with 3 customers', description: 'Three customers have outstanding payments totaling ₹17,900. Payment is overdue by 5-15 days.', confidence: 88, confidenceLevel: 'high', risk: 'low',
    evidence: [{ label: 'Karan Mehta', value: '₹3,247 (15 days overdue)', source: 'Sales' }, { label: 'Arjun Kapoor', value: '₹4,102 (17 days overdue)', source: 'Sales' }, { label: 'Rohit Singh', value: '₹1,634 (7 days overdue)', source: 'Sales' }],
    expectedImpact: 'Recover ₹17,900 in outstanding payments', status: 'pending', createdAt: '2026-08-31T08:00:00Z',
  },
];

export const MFG_AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'mar_1', type: 'purchase', title: 'Purchase 1,600 kg Copper Wire', description: 'Copper stockout predicted in 9 days based on production schedule and current demand. Recommended purchase from Bharat Copper Corp.', confidence: 93, confidenceLevel: 'high', risk: 'low',
    evidence: [{ label: 'Current inventory', value: '890 kg (690 available)', source: 'Inventory' }, { label: 'Production demand', value: '480 kg/week', source: 'Production Schedule' }, { label: 'Open orders', value: '500 kg incoming', source: 'Purchase Orders' }, { label: 'Supplier lead time', value: '7 days', source: 'Supplier Data' }],
    expectedImpact: 'Prevent production stoppage. Estimated cost: ₹11.8L', alternativeAction: 'Order 1,300 kg instead to reduce working capital', status: 'pending', createdAt: '2026-08-31T06:00:00Z', agentId: 'agent_procurement', agentName: 'Procurement Agent',
  },
  {
    id: 'mar_2', type: 'maintenance', title: 'Schedule maintenance for Machine #07', description: 'Injection Molder IM-800 showing 82% failure probability. Vibration levels elevated 3.4x above baseline. Bearing replacement recommended within 3-6 days.', confidence: 82, confidenceLevel: 'high', risk: 'high',
    evidence: [{ label: 'Vibration', value: '4.1 mm/s (baseline: 1.2)', source: 'Machine Sensors' }, { label: 'Temperature', value: '68°C (normal: 45°C)', source: 'Machine Sensors' }, { label: 'Runtime since maintenance', value: '1,580 hours', source: 'Maintenance Log' }, { label: 'Similar failure history', value: '2 incidents in 12 months', source: 'Maintenance History' }],
    expectedImpact: 'Prevent unplanned downtime of 24-48 hours. Estimated production loss: ₹4.2L', status: 'pending', createdAt: '2026-08-31T06:00:00Z', agentId: 'agent_maintenance', agentName: 'Maintenance Agent',
  },
  {
    id: 'mar_3', type: 'quality', title: 'Investigate P100 quality decline', description: 'Industrial Pump P100 defect rate spiked from 1.9% to 22.2% in latest batch. Strong correlation with Material Batch #882.', confidence: 78, confidenceLevel: 'medium', risk: 'high',
    evidence: [{ label: 'Current defect rate', value: '22.2% (batch B-2026-099)', source: 'Quality' }, { label: 'Previous defect rate', value: '1.9% (30-day avg)', source: 'Quality History' }, { label: 'Material batch', value: '#882 from new supplier lot', source: 'Quality Notes' }, { label: 'Defect type', value: 'Seal leakage (3 units)', source: 'Quality' }],
    expectedImpact: 'Identify root cause to prevent further quality issues', status: 'pending', createdAt: '2026-08-31T07:00:00Z', agentId: 'agent_quality', agentName: 'Quality Agent',
  },
  {
    id: 'mar_4', type: 'production', title: 'Reschedule Order #482 delivery', description: 'SO-2026-0482 for Tata Power Solutions at 67% on-time delivery risk. Production is 8 units behind schedule.', confidence: 74, confidenceLevel: 'medium', risk: 'medium',
    evidence: [{ label: 'Ordered', value: '50 Electric Motor X200', source: 'Sales' }, { label: 'Completed', value: '42 units', source: 'Production' }, { label: 'Due date', value: 'Sep 10', source: 'Sales' }, { label: 'Machine #07 risk', value: '82% failure probability', source: 'Machines' }],
    expectedImpact: 'Proactive customer communication. Consider priority scheduling.', status: 'pending', createdAt: '2026-08-31T07:00:00Z', agentId: 'agent_production', agentName: 'Production Agent',
  },
  {
    id: 'mar_5', type: 'purchase', title: 'Switch bearing supplier for urgency', description: 'Precision Parts Ltd has 10-day lead time for bearings. Chennai Castings can deliver in 5 days at +8% cost.', confidence: 71, confidenceLevel: 'medium', risk: 'low',
    evidence: [{ label: 'Current supplier', value: 'Precision Parts Ltd (10 days)', source: 'Supplier Data' }, { label: 'Alternative', value: 'Chennai Castings (5 days)', source: 'Supplier Data' }, { label: 'Cost difference', value: '+8%', source: 'Price History' }, { label: 'Quality rating', value: '91% vs 96%', source: 'Supplier Performance' }],
    expectedImpact: 'Faster delivery at slightly higher cost', alternativeAction: 'Stay with Precision Parts and accept longer lead time', status: 'pending', createdAt: '2026-08-31T08:00:00Z',
  },
];

// ─── AI Predictions ─────────────────────────────────────────

export const MFG_PREDICTIONS: AIPrediction[] = [
  { id: 'pred_1', type: 'stockout', entityId: 'mp_5', entityName: 'Copper Wire Coil', prediction: 'Stockout predicted in 9 days', value: 9, unit: 'days', timeframe: 'Next 2 weeks', confidence: 93, evidence: [{ label: 'Demand rate', value: '480 kg/week', source: 'Production' }, { label: 'Available', value: '690 kg', source: 'Inventory' }], createdAt: '2026-08-31T06:00:00Z' },
  { id: 'pred_2', type: 'failure', entityId: 'mch_7', entityName: 'Injection Molder IM-800 (MCH-007)', prediction: 'Bearing failure likely within 3-6 days', value: 82, unit: '%', timeframe: '3-6 days', confidence: 82, evidence: [{ label: 'Vibration', value: '4.1 mm/s', source: 'Sensors' }, { label: 'Temperature', value: '68°C', source: 'Sensors' }], createdAt: '2026-08-31T06:00:00Z' },
  { id: 'pred_3', type: 'delivery', entityId: 'mso_1', entityName: 'Order SO-2026-0482 (Tata Power)', prediction: '67% probability of late delivery', value: 67, unit: '%', timeframe: 'By Sep 10', confidence: 74, evidence: [{ label: 'Production gap', value: '8 units behind', source: 'Production' }, { label: 'Machine risk', value: 'MCH-007 at 82%', source: 'Machines' }], createdAt: '2026-08-31T07:00:00Z' },
  { id: 'pred_4', type: 'demand', entityId: 'mp_1', entityName: 'Electric Motor X200', prediction: 'Demand increase expected next month (+18%)', value: 18, unit: '%', timeframe: 'September', confidence: 68, evidence: [{ label: 'Seasonal pattern', value: 'Q3 uptick', source: 'History' }, { label: 'Pipeline orders', value: '3 in discussion', source: 'Sales' }], createdAt: '2026-08-31T06:00:00Z' },
];

// ─── AI Investigations ──────────────────────────────────────

export const MFG_INVESTIGATIONS: AIInvestigation[] = [
  {
    id: 'inv_1', question: 'Why did defect rate increase in August?', status: 'completed',
    summary: 'Defect rate increased from 1.9% to 4.8% in August. The primary driver is a spike in Industrial Pump P100 defects (22.2% in latest batch). Investigation identified Material Batch #882, Machine #07 operating conditions, and Shift B patterns as likely contributors.',
    contributors: [
      { factor: 'Material Batch #882', contribution: 71, description: 'New supplier lot of mechanical seals showed higher failure rate under pressure testing. 3 out of 4 failed units used seals from this batch.', severity: 'high' },
      { factor: 'Machine #07 (Injection Molder)', contribution: 64, description: 'Elevated temperature and vibration levels may have affected component precision. Machine health score dropped from 89 to 71 over the past month.', severity: 'high' },
      { factor: 'Shift B Operations', contribution: 38, description: '3 of 4 defective units were produced during Shift B. Possible correlation with operator experience level (2 new operators joined in August).', severity: 'medium' },
    ],
    evidence: [
      { label: 'Defect rate trend', value: '1.9% → 4.8%', source: 'Quality Data' },
      { label: 'Worst batch', value: 'B-2026-099 (22.2% defects)', source: 'Quality' },
      { label: 'Primary defect', value: 'Seal leakage (3 units)', source: 'Inspection Reports' },
      { label: 'Material batch', value: '#882 from new lot', source: 'Procurement' },
    ],
    recommendedActions: [
      'Quarantine remaining seals from Material Batch #882',
      'Schedule maintenance inspection for Machine #07',
      'Review Shift B operator training for pump assembly',
      'Request replacement batch from supplier with quality documentation',
    ],
    createdAt: '2026-08-31T09:00:00Z', completedAt: '2026-08-31T09:02:00Z',
    dataSourcesAnalyzed: ['Quality', 'Production', 'Inventory', 'Machines', 'Workforce', 'Procurement'],
  },
  {
    id: 'inv_2', question: 'Why did profit decrease in August?', status: 'completed',
    summary: 'Monthly profit declined 8.7% from ₹10.7L (July) to ₹7.4L (August). The decline is primarily driven by increased material costs (42%), machine downtime (27%), quality-related costs (19%), and higher logistics expenses (12%).',
    contributors: [
      { factor: 'Material cost increase', contribution: 42, description: 'Copper prices rose 6% in August. Additional emergency procurement at premium rates for production continuity.', severity: 'high' },
      { factor: 'Machine downtime', contribution: 27, description: 'CNC Milling Center MC-1 down since Aug 28 (48 hours). Grinding Machine GR-300 in maintenance (18 hours). Total unplanned downtime: 66 hours.', severity: 'high' },
      { factor: 'Defect-related costs', contribution: 19, description: 'Higher defect rate in P100 batch led to rework costs, scrap, and delayed deliveries. Estimated cost: ₹1.8L.', severity: 'medium' },
      { factor: 'Logistics costs', contribution: 12, description: 'Expedited shipping for 2 orders to meet delivery deadlines after production delays.', severity: 'low' },
    ],
    evidence: [
      { label: 'Profit change', value: '₹10.7L → ₹7.4L (-8.7%)', source: 'Finance' },
      { label: 'Material cost change', value: '+₹2.8L vs July', source: 'Procurement' },
      { label: 'Downtime hours', value: '66 hours', source: 'Machines' },
      { label: 'Rework costs', value: '₹1.8L', source: 'Production' },
    ],
    recommendedActions: [
      'Negotiate long-term copper supply contract to hedge price volatility',
      'Prioritize Machine #07 maintenance to prevent further downtime',
      'Address quality root cause in P100 production',
      'Review logistics contracts for better rates',
    ],
    createdAt: '2026-08-31T10:00:00Z', completedAt: '2026-08-31T10:03:00Z',
    dataSourcesAnalyzed: ['Finance', 'Procurement', 'Production', 'Quality', 'Machines', 'Logistics'],
  },
];

// ─── Simulations ────────────────────────────────────────────

export const MFG_SIMULATIONS: Simulation[] = [
  {
    id: 'sim_1', name: 'Machine #07 downtime impact', description: 'What happens if Injection Molder IM-800 is unavailable for 3 days?',
    type: 'machine_downtime',
    parameters: [
      { name: 'machine', label: 'Machine', currentValue: 'MCH-007 (Running)', simulatedValue: 'MCH-007 (Down)', unit: '' },
      { name: 'duration', label: 'Downtime Duration', currentValue: 0, simulatedValue: 3, unit: 'days' },
    ],
    results: {
      metrics: [
        { label: 'Production Output', currentValue: 155, projectedValue: 128, change: -27, changePercent: -17.4, unit: 'units/month', impact: 'negative' },
        { label: 'On-time Delivery', currentValue: 92, projectedValue: 78, change: -14, changePercent: -15.2, unit: '%', impact: 'negative' },
        { label: 'Monthly Revenue', currentValue: 3520000, projectedValue: 3040000, change: -480000, changePercent: -13.6, unit: '₹', impact: 'negative' },
        { label: 'Overtime Cost', currentValue: 120000, projectedValue: 280000, change: 160000, changePercent: 133, unit: '₹', impact: 'negative' },
      ],
      confidence: 76,
      warnings: ['Order SO-2026-0482 would likely miss delivery deadline', 'Line 4 would be completely halted'],
      disclaimer: 'These results are estimates based on historical data and current production schedules. Actual impact may vary.',
    },
    status: 'completed', createdAt: '2026-08-31T11:00:00Z', createdBy: 'Priya Sharma',
  },
];

export const RETAIL_SIMULATIONS: Simulation[] = [
  {
    id: 'sim_r1', name: 'Price increase impact', description: 'What if we increase all T-shirt prices by 5%?',
    type: 'price_change',
    parameters: [
      { name: 'category', label: 'Category', currentValue: 'T-Shirts', simulatedValue: 'T-Shirts', unit: '' },
      { name: 'priceChange', label: 'Price Change', currentValue: 0, simulatedValue: 5, unit: '%' },
    ],
    results: {
      metrics: [
        { label: 'Monthly Profit', currentValue: 48000, projectedValue: 53200, change: 5200, changePercent: 10.8, unit: '₹', impact: 'positive' },
        { label: 'Expected Demand', currentValue: 142, projectedValue: 138, change: -4, changePercent: -2.8, unit: 'units', impact: 'negative' },
        { label: 'Revenue', currentValue: 72400, projectedValue: 74800, change: 2400, changePercent: 3.3, unit: '₹', impact: 'positive' },
      ],
      confidence: 78,
      warnings: ['Price-sensitive customers may shift to competitors'],
      disclaimer: 'These results are estimates based on historical price elasticity data. Actual results may vary.',
    },
    status: 'completed', createdAt: '2026-08-31T11:00:00Z', createdBy: 'Rajesh Kumar',
  },
];

// ─── AI Agents ──────────────────────────────────────────────

export const MFG_AI_AGENTS: AIAgent[] = [
  { id: 'agent_sales', name: 'Sales Agent', description: 'Analyzes sales trends, customer behavior, and order risks', type: 'sales', status: 'active', permissions: [{ action: 'Read sales data', allowed: true, description: 'Access sales orders, invoices, payments' }, { action: 'Read customer data', allowed: true, description: 'Access customer profiles and history' }, { action: 'Create draft quotations', allowed: true, description: 'Generate quotation drafts for review' }, { action: 'Modify pricing', allowed: false, description: 'Cannot change product prices directly' }], allowedTools: ['get_sales', 'get_customers', 'forecast_demand'], approvalRequired: true, confidenceThreshold: 70, totalActions: 48, successRate: 94 },
  { id: 'agent_inventory', name: 'Inventory Agent', description: 'Forecasts stock requirements and generates reorder recommendations', type: 'inventory', status: 'active', permissions: [{ action: 'Read inventory data', allowed: true, description: 'Access stock levels and movements' }, { action: 'Read purchase history', allowed: true, description: 'Access purchase orders and supplier data' }, { action: 'Create purchase requests', allowed: true, description: 'Generate purchase request drafts' }, { action: 'Approve purchases above ₹1L', allowed: false, description: 'Cannot approve high-value orders' }], allowedTools: ['get_inventory', 'get_products', 'forecast_demand', 'get_supplier_metrics'], approvalRequired: true, confidenceThreshold: 80, totalActions: 124, successRate: 91 },
  { id: 'agent_finance', name: 'Finance Agent', description: 'Analyzes revenue, expenses, cost drivers, and profitability trends', type: 'finance', status: 'active', permissions: [{ action: 'Read financial data', allowed: true, description: 'Access revenue, expenses, payments' }, { action: 'Generate reports', allowed: true, description: 'Create financial analysis reports' }, { action: 'Modify records', allowed: false, description: 'Cannot edit financial records' }, { action: 'Delete records', allowed: false, description: 'Cannot delete any records' }], allowedTools: ['get_sales', 'get_expenses', 'get_inventory'], approvalRequired: false, confidenceThreshold: 75, totalActions: 36, successRate: 97 },
  { id: 'agent_procurement', name: 'Procurement Agent', description: 'Compares suppliers, optimizes purchasing, and manages supply chain risks', type: 'procurement', status: 'active', permissions: [{ action: 'Read inventory', allowed: true, description: 'Access stock and demand data' }, { action: 'Compare suppliers', allowed: true, description: 'Analyze supplier performance' }, { action: 'Create draft PO', allowed: true, description: 'Generate purchase order drafts' }, { action: 'Approve PO above ₹1L', allowed: false, description: 'Cannot approve high-value orders' }, { action: 'Modify supplier master', allowed: false, description: 'Cannot change supplier records' }], allowedTools: ['get_inventory', 'get_supplier_metrics', 'create_purchase_order', 'forecast_demand'], spendingLimit: 100000, approvalRequired: true, confidenceThreshold: 80, lastRunAt: '2026-08-31T06:00:00Z', totalActions: 87, successRate: 92 },
  { id: 'agent_production', name: 'Production Agent', description: 'Optimizes production schedules and identifies bottlenecks', type: 'production', status: 'active', permissions: [{ action: 'Read production data', allowed: true, description: 'Access orders and schedules' }, { action: 'Read machine data', allowed: true, description: 'Access machine status and health' }, { action: 'Suggest schedule changes', allowed: true, description: 'Recommend production adjustments' }, { action: 'Execute schedule changes', allowed: false, description: 'Cannot directly modify schedules' }], allowedTools: ['get_production_orders', 'get_machine_health', 'run_simulation'], approvalRequired: true, confidenceThreshold: 75, totalActions: 62, successRate: 89 },
  { id: 'agent_maintenance', name: 'Maintenance Agent', description: 'Predicts machine failures and recommends maintenance actions', type: 'maintenance', status: 'active', permissions: [{ action: 'Read machine sensors', allowed: true, description: 'Access real-time sensor data' }, { action: 'Read maintenance history', allowed: true, description: 'Access past maintenance records' }, { action: 'Create maintenance tasks', allowed: true, description: 'Generate maintenance task recommendations' }, { action: 'Order spare parts', allowed: false, description: 'Cannot place parts orders directly' }], allowedTools: ['get_machine_health', 'analyze_quality', 'create_maintenance_task'], approvalRequired: true, confidenceThreshold: 70, lastRunAt: '2026-08-31T06:00:00Z', totalActions: 43, successRate: 88 },
  { id: 'agent_quality', name: 'Quality Agent', description: 'Investigates defect patterns and identifies root causes', type: 'quality', status: 'active', permissions: [{ action: 'Read quality data', allowed: true, description: 'Access inspections and defects' }, { action: 'Read production data', allowed: true, description: 'Cross-reference with production' }, { action: 'Generate investigations', allowed: true, description: 'Run root cause analysis' }, { action: 'Quarantine batches', allowed: false, description: 'Cannot directly quarantine' }], allowedTools: ['analyze_quality', 'get_production_orders', 'get_machine_health', 'get_inventory'], approvalRequired: true, confidenceThreshold: 70, totalActions: 28, successRate: 86 },
];

// ─── Data Trust Scores ──────────────────────────────────────

export const RETAIL_DATA_TRUST: DataTrustScore[] = [
  { source: 'Sales Data', score: 98, issues: [{ type: 'missing', severity: 'low', count: 2, description: '2 orders missing delivery dates' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 1240 },
  { source: 'Inventory Data', score: 96, issues: [{ type: 'stale', severity: 'low', count: 3, description: '3 products not updated in 7+ days' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 12 },
  { source: 'Customer Data', score: 94, issues: [{ type: 'missing', severity: 'low', count: 4, description: '4 customers missing email addresses' }, { type: 'duplicate', severity: 'low', count: 1, description: '1 possible duplicate customer entry' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 8 },
];

export const MFG_DATA_TRUST: DataTrustScore[] = [
  { source: 'ERP Data', score: 98, issues: [], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 4820 },
  { source: 'Production Data', score: 89, issues: [{ type: 'missing', severity: 'medium', count: 8, description: '8 work orders missing completion times' }, { type: 'conflict', severity: 'low', count: 2, description: '2 production records with conflicting quantities' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 2340 },
  { source: 'Quality Data', score: 96, issues: [{ type: 'missing', severity: 'low', count: 3, description: '3 inspections missing inspector notes' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 890 },
  { source: 'Machine Sensors', score: 74, issues: [{ type: 'stale', severity: 'high', count: 2, description: '2 machines not reporting sensor data (MCH-009 down, MCH-004 idle)' }, { type: 'outlier', severity: 'medium', count: 4, description: '4 anomalous readings flagged for review' }, { type: 'missing', severity: 'medium', count: 12, description: '12 gaps in time-series data' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 48200 },
  { source: 'Supplier Data', score: 91, issues: [{ type: 'stale', severity: 'low', count: 1, description: '1 supplier profile not updated in 90+ days' }, { type: 'missing', severity: 'low', count: 3, description: '3 suppliers missing quality certifications' }], lastEvaluated: '2026-08-31T06:00:00Z', recordCount: 520 },
];

// ─── Workflows ──────────────────────────────────────────────

export const MFG_WORKFLOWS: Workflow[] = [
  { id: 'wf_1', name: 'Auto Reorder on Low Stock', description: 'When inventory drops below reorder point and forecasted demand exceeds threshold, generate AI recommendation and request approval', status: 'active', trigger: 'Inventory < Reorder Point', conditions: ['Forecasted Demand > Safety Stock', 'Supplier is active'], actions: ['Generate AI Recommendation', 'Request Manager Approval', 'Create Purchase Order'], lastTriggered: '2026-08-31T06:00:00Z', totalRuns: 24, successRate: 92 },
  { id: 'wf_2', name: 'Predictive Maintenance Alert', description: 'When machine failure probability exceeds 70%, create maintenance task and notify maintenance team', status: 'active', trigger: 'Machine Failure Risk > 70%', conditions: ['Machine is running', 'No active maintenance task'], actions: ['Create Maintenance Task', 'Notify Maintenance Team', 'Log AI Prediction'], lastTriggered: '2026-08-31T06:00:00Z', totalRuns: 8, successRate: 88 },
  { id: 'wf_3', name: 'Quality Failure Investigation', description: 'When batch defect rate exceeds 5%, trigger AI investigation and quarantine batch', status: 'active', trigger: 'Batch Defect Rate > 5%', conditions: ['Inspection is completed'], actions: ['Trigger AI Investigation', 'Quarantine Batch', 'Notify Quality Manager'], lastTriggered: '2026-08-28T14:00:00Z', totalRuns: 3, successRate: 100 },
];

// ─── Approvals ──────────────────────────────────────────────

export const MFG_APPROVALS: Approval[] = [
  { id: 'appr_1', type: 'purchase_order', title: 'Purchase 1,600 kg Copper Wire', description: 'AI-recommended purchase order for copper wire coil from Bharat Copper Corp to prevent predicted stockout.', amount: 1184000, requestedBy: 'Procurement Agent', requestedAt: '2026-08-31T06:00:00Z', status: 'pending', aiRecommended: true, aiConfidence: 93, expectedImpact: 'Prevent production stoppage', urgency: 'high' },
  { id: 'appr_2', type: 'maintenance', title: 'Machine #07 Bearing Replacement', description: 'Predictive maintenance task for Injection Molder IM-800. AI detected elevated vibration and temperature.', amount: 84000, requestedBy: 'Maintenance Agent', requestedAt: '2026-08-31T06:00:00Z', status: 'pending', aiRecommended: true, aiConfidence: 82, expectedImpact: 'Prevent 24-48 hours unplanned downtime', urgency: 'critical' },
];

// ─── Audit Log ──────────────────────────────────────────────

export const MFG_AUDIT: AuditEntry[] = [
  { id: 'aud_1', timestamp: '2026-08-31T10:30:00Z', userId: 'user_2', userName: 'Priya Sharma', userRole: 'Plant Manager', action: 'Approved', module: 'Purchases', entityType: 'PurchaseOrder', entityId: 'mpo_2', description: 'Approved PO-2026-0890 for Steel Sheet from MetalPro Alloys (₹1,93,520)', aiRecommended: true, aiConfidence: 91, result: 'success' },
  { id: 'aud_2', timestamp: '2026-08-31T09:15:00Z', userId: 'system', userName: 'Quality Agent', userRole: 'AI Agent', action: 'Generated Investigation', module: 'Quality', entityType: 'Investigation', entityId: 'inv_1', description: 'AI investigation triggered for defect rate increase in P100 batch', aiRecommended: true, aiConfidence: 78, result: 'success' },
  { id: 'aud_3', timestamp: '2026-08-31T08:00:00Z', userId: 'system', userName: 'Procurement Agent', userRole: 'AI Agent', action: 'Created Recommendation', module: 'Procurement', entityType: 'Recommendation', entityId: 'mar_1', description: 'Generated copper wire purchase recommendation (1,600 kg, ₹11.8L)', aiRecommended: true, aiConfidence: 93, result: 'success' },
  { id: 'aud_4', timestamp: '2026-08-30T16:45:00Z', userId: 'user_2', userName: 'Priya Sharma', userRole: 'Plant Manager', action: 'Created', module: 'Production', entityType: 'ProductionOrder', entityId: 'po_5', description: 'Created production order PRD-2026-0894 for 100 Electric Motor X200', aiRecommended: false, result: 'success' },
  { id: 'aud_5', timestamp: '2026-08-30T14:20:00Z', userId: 'me_8', userName: 'Neha Patel', userRole: 'Procurement Officer', action: 'Sent', module: 'Purchases', entityType: 'PurchaseOrder', entityId: 'mpo_3', description: 'Sent PO-2026-0892 to Precision Parts Ltd for bearings and rotors', aiRecommended: false, result: 'success' },
  { id: 'aud_6', timestamp: '2026-08-29T11:00:00Z', userId: 'me_7', userName: 'Anil Kumar', userRole: 'Quality Manager', action: 'Completed Inspection', module: 'Quality', entityType: 'Inspection', entityId: 'qi_2', description: 'Completed quality inspection QI-2026-1203 for Electric Motor X500 batch', aiRecommended: false, result: 'success' },
];

// ─── Alerts ─────────────────────────────────────────────────

export const RETAIL_ALERTS: Alert[] = [
  { id: 'ra_1', severity: 'critical', title: 'Canvas Sneakers nearly out of stock', message: 'Only 8 units remaining. Stockout predicted in 2 days.', module: 'Inventory', entityId: 'rp_8', entityType: 'Product', read: false, actionRequired: true, actionLabel: 'View Recommendation', actionRoute: '/ai-insights', createdAt: '2026-08-31T08:00:00Z' },
  { id: 'ra_2', severity: 'warning', title: 'Aviator Sunglasses below reorder point', message: '5 units remaining (reorder point: 15).', module: 'Inventory', entityId: 'rp_10', entityType: 'Product', read: false, actionRequired: true, actionLabel: 'Create Purchase', actionRoute: '/purchases', createdAt: '2026-08-31T08:00:00Z' },
  { id: 'ra_3', severity: 'recommendation', title: 'Follow up on overdue payments', message: '3 customers have overdue payments totaling ₹17,900.', module: 'Sales', read: false, actionRequired: false, actionLabel: 'View Customers', actionRoute: '/customers', createdAt: '2026-08-31T08:00:00Z' },
  { id: 'ra_4', severity: 'info', title: 'Purchase order PO-2026-0411 received', message: '38 of 40 Canvas Sneakers received from StepRight Footwear.', module: 'Purchases', entityId: 'rpo_2', entityType: 'PurchaseOrder', read: true, actionRequired: false, createdAt: '2026-08-31T10:00:00Z' },
];

export const MFG_ALERTS: Alert[] = [
  { id: 'ma_1', severity: 'critical', title: 'Machine #07 failure risk at 82%', message: 'Injection Molder IM-800 showing elevated vibration and temperature. Bearing failure predicted in 3-6 days.', module: 'Machines', entityId: 'mch_7', entityType: 'Machine', read: false, actionRequired: true, actionLabel: 'View Maintenance', actionRoute: '/maintenance', createdAt: '2026-08-31T06:00:00Z' },
  { id: 'ma_2', severity: 'critical', title: 'Machine #09 is down', message: 'CNC Milling Center MC-1 down since Aug 28. Spindle motor replacement in progress.', module: 'Machines', entityId: 'mch_9', entityType: 'Machine', read: false, actionRequired: false, createdAt: '2026-08-28T14:00:00Z' },
  { id: 'ma_3', severity: 'warning', title: 'Copper stockout in 9 days', message: 'Current supply will not meet production demand. Purchase recommendation pending approval.', module: 'Inventory', entityId: 'mp_5', entityType: 'Product', read: false, actionRequired: true, actionLabel: 'View Approval', actionRoute: '/approvals', createdAt: '2026-08-31T06:00:00Z' },
  { id: 'ma_4', severity: 'warning', title: 'Order SO-2026-0482 at delivery risk', message: '67% late-delivery probability for Tata Power Solutions order.', module: 'Sales', entityId: 'mso_1', entityType: 'SalesOrder', read: false, actionRequired: true, actionLabel: 'View Order', actionRoute: '/sales', createdAt: '2026-08-31T07:00:00Z' },
  { id: 'ma_5', severity: 'warning', title: 'P100 quality failure in latest batch', message: 'Defect rate spiked to 22.2% in batch B-2026-099. Investigation recommended.', module: 'Quality', entityId: 'qi_3', entityType: 'Inspection', read: false, actionRequired: true, actionLabel: 'View Investigation', actionRoute: '/investigations', createdAt: '2026-08-28T15:00:00Z' },
  { id: 'ma_6', severity: 'approval', title: '2 approvals pending', message: 'Copper wire purchase (₹11.8L) and Machine #07 maintenance (₹84K) require approval.', module: 'Approvals', read: false, actionRequired: true, actionLabel: 'View Approvals', actionRoute: '/approvals', createdAt: '2026-08-31T06:00:00Z' },
  { id: 'ma_7', severity: 'recommendation', title: '5 AI recommendations available', message: 'New recommendations from Procurement, Maintenance, Quality, and Production agents.', module: 'AI Insights', read: false, actionRequired: false, actionLabel: 'View Insights', actionRoute: '/ai-insights', createdAt: '2026-08-31T08:00:00Z' },
];
