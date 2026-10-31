import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileText,
  Lock,
  Layers,
  RefreshCw,
  Zap,
  Info,
  Sliders,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { MetricCard } from '../components/common/MetricCard';
import { apiService } from '../services/api';

export const ResponsePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'recommendations' | 'approvals' | 'playbooks' | 'monitor'>('plans');
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [dryRunData, setDryRunData] = useState<any | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, recsRes, apprsRes, pbsRes, metRes] = await Promise.all([
        apiService.getResponsePlans().catch(() => null),
        apiService.getResponseRecommendations().catch(() => null),
        apiService.getResponseApprovals().catch(() => null),
        apiService.getResponsePlaybooks().catch(() => null),
        apiService.getResponseMetrics().catch(() => null)
      ]);

      if (plansRes && plansRes.data) setPlans(plansRes.data);
      if (recsRes && recsRes.data) setRecommendations(recsRes.data);
      if (apprsRes && apprsRes.data) setApprovals(apprsRes.data);
      if (pbsRes && pbsRes.data) setPlaybooks(pbsRes.data);
      if (metRes && metRes.data) setMetrics(metRes.data);
    } catch (err) {
      console.warn('Failed to load response data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprovePlan = async (planId: number | string) => {
    try {
      await apiService.approveResponsePlan(planId, 'Analyst verified lab safety requirements');
      setExecutionMessage(`Plan #${planId} APPROVED successfully.`);
      await loadData();
    } catch (err: any) {
      setExecutionMessage(`Approval Failed: ${err.message}`);
    }
  };

  const handleExecutePlan = async (planId: number | string, dryRun: boolean) => {
    try {
      const res = await apiService.executeResponsePlan(planId, dryRun);
      if (dryRun) {
        setDryRunData(res.data);
        setExecutionMessage(`Dry-run preview generated for plan #${planId}`);
      } else {
        setExecutionMessage(`Plan #${planId} EXECUTED in Lab Simulator! Status: ${res.data.status}`);
        await loadData();
      }
    } catch (err: any) {
      setExecutionMessage(`Execution Error: ${err.message}`);
    }
  };

  const handleRollbackPlan = async (planId: number | string) => {
    try {
      const res = await apiService.rollbackResponsePlan(planId);
      setExecutionMessage(`Plan #${planId} ROLLED BACK! Restored state.`);
      await loadData();
    } catch (err: any) {
      setExecutionMessage(`Rollback Error: ${err.message}`);
    }
  };

  const handleAcceptRec = async (recId: number | string) => {
    try {
      await apiService.acceptRecommendation(recId);
      setExecutionMessage(`Recommendation accepted and converted to Response Plan.`);
      await loadData();
    } catch (err: any) {
      setExecutionMessage(`Accept Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Defense & Controlled Response Engine"
        description="Approval-Based Incident Mitigation & Safe ICS Laboratory Simulation Engine"
        actions={
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-xs font-bold uppercase tracking-wider">
              LAB SIMULATION MODE
            </span>
            <button
              onClick={loadData}
              className="flex items-center space-x-1 px-3 py-1.5 bg-soc-bg font-mono text-xs text-soc-textMuted border border-soc-panelBorder rounded hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Engine</span>
            </button>
          </div>
        }
      />

      {/* Lab Safety Banner */}
      <div className="p-3 bg-soc-panelBg border-l-4 border-amber-500 border-soc-panelBorder rounded flex justify-between items-center font-mono text-xs">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-soc-text font-bold">SAFETY GUARANTEE:</span>
          <span className="text-soc-textMuted">
            All execution actions target the isolated software simulation laboratory. Real physical PLC commands are strictly disabled.
          </span>
        </div>
        <span className="text-emerald-400 font-bold">Lab Environment: ISOLATED</span>
      </div>

      {executionMessage && (
        <div className="p-3 bg-sky-950/80 border border-sky-800 text-sky-300 rounded font-mono text-xs flex justify-between items-center">
          <span>{executionMessage}</span>
          <button onClick={() => setExecutionMessage('')} className="text-sky-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Plans"
          value={plans.length || 1}
          subtitle="Response Plans in Engine"
          icon={<ShieldAlert className="w-5 h-5 text-sky-400" />}
        />
        <MetricCard
          title="Pending Approvals"
          value={approvals.filter(a => a.status === 'PENDING').length || 1}
          subtitle="Separation of Duties"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Recommendations"
          value={recommendations.length || 1}
          subtitle="Auto-Generated"
          icon={<Zap className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="Engine Status"
          value="ONLINE"
          subtitle="Safe Lab Simulation"
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-soc-panelBorder space-x-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'plans'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Response Plans ({plans.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Recommendations ({recommendations.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'approvals'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Approval Center ({approvals.filter(a => a.status === 'PENDING').length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('playbooks')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'playbooks'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Playbook Library</span>
        </button>
      </div>

      {/* TAB 1: RESPONSE PLANS */}
      {activeTab === 'plans' && (
        <Panel title="Response Plans Portfolio" subtitle="Approval-Controlled Execution Plans" icon={<Layers className="w-4 h-4 text-soc-accent" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="overflow-x-auto border border-soc-panelBorder rounded">
              <table className="w-full text-left">
                <thead className="bg-soc-bg text-soc-textMuted border-b border-soc-panelBorder uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Plan Number</th>
                    <th className="p-3">Title & Context</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Simulation Mode</th>
                    <th className="p-3 text-right">Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-panelBorder">
                  {(plans.length > 0 ? plans : [
                    {
                      id: 1,
                      response_number: 'RSP-2026-000001',
                      title: 'Simulated Network Isolation for PLC-001',
                      description: 'Isolate PLC-001 in lab simulator to prevent unauthorized Modbus coil writes',
                      risk_level: 'HIGH_RISK',
                      status: 'PENDING_APPROVAL',
                      simulation_mode: true
                    }
                  ]).map((plan: any) => (
                    <tr key={plan.id} className="hover:bg-soc-panelBg/60 transition-colors">
                      <td className="p-3 font-bold text-sky-400">{plan.response_number}</td>
                      <td className="p-3">
                        <span className="text-white font-semibold block">{plan.title}</span>
                        <span className="text-soc-textMuted text-[11px] block">{plan.description}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          plan.risk_level === 'HIGH_RISK' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {plan.risk_level}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          plan.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          plan.status === 'APPROVED' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                          plan.status === 'ROLLED_BACK' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400 font-bold text-[11px]">
                        LAB SIMULATION ONLY
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {plan.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => handleApprovePlan(plan.id)}
                            className="px-2.5 py-1 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 rounded text-[10px]"
                          >
                            Approve Plan
                          </button>
                        )}
                        <button
                          onClick={() => handleExecutePlan(plan.id, true)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          Dry-Run Preview
                        </button>
                        {(plan.status === 'APPROVED' || plan.status === 'PENDING_APPROVAL') && (
                          <button
                            onClick={() => handleExecutePlan(plan.id, false)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px]"
                          >
                            Execute Simulated Isolation
                          </button>
                        )}
                        {plan.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleRollbackPlan(plan.id)}
                            className="px-2.5 py-1 bg-purple-900/70 hover:bg-purple-800 text-purple-300 rounded text-[10px]"
                          >
                            Rollback Simulation
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dry Run Result Preview Card */}
            {dryRunData && (
              <div className="p-4 bg-soc-bg border border-sky-800 rounded space-y-3">
                <div className="flex justify-between items-center text-sky-400 font-bold">
                  <span>Dry-Run Simulation Preview ({dryRunData.plan_number})</span>
                  <button onClick={() => setDryRunData(null)} className="text-soc-textMuted hover:text-white">✕</button>
                </div>
                <div className="space-y-2 text-[11px]">
                  {dryRunData.expected_actions?.map((act: any, idx: number) => (
                    <div key={idx} className="p-2 bg-soc-panelBg rounded border border-soc-panelBorder flex justify-between items-center">
                      <div>
                        <span className="text-emerald-400 font-bold block">{act.action_type}</span>
                        <span className="text-soc-textMuted">Target: {act.target_type} #{act.target_id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-soc-textMuted block">Current: {act.current_state}</span>
                        <span className="text-sky-400 font-bold block">Expected: {act.expected_state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* TAB 2: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <Panel title="Auto-Generated Response Recommendations" subtitle="Evidence & Context Driven Recommendations" icon={<Zap className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-4 font-mono text-xs">
            {(recommendations.length > 0 ? recommendations : [
              {
                id: 1,
                title: 'Recommend Simulated Modbus Communication Isolation',
                description: 'Isolate target PLC communication in laboratory simulation following unauthorized Modbus write coil attempt.',
                reason: 'Unexpected Modbus write activity observed on PLC-001. Recommended action is simulated isolation.',
                risk_level: 'HIGH_RISK',
                confidence: 0.92,
                status: 'NEW'
              }
            ]).map((rec: any) => (
              <div key={rec.id} className="p-4 bg-soc-bg border border-soc-panelBorder rounded space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-purple-400 font-bold text-sm block">{rec.title}</span>
                    <span className="text-soc-textMuted text-[11px] mt-0.5 block">{rec.description}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold text-[10px]">
                    {rec.risk_level}
                  </span>
                </div>

                <div className="p-3 bg-soc-panelBg rounded border border-soc-panelBorder/60 text-[11px] space-y-1">
                  <span className="text-soc-accent font-bold block">RECOMMENDATION EXPLANATION:</span>
                  <p className="text-soc-textMuted">{rec.reason}</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-emerald-400 font-bold text-[11px]">Confidence: {Math.round((rec.confidence || 0.9) * 100)}%</span>
                  {rec.status === 'NEW' && (
                    <button
                      onClick={() => handleAcceptRec(rec.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                    >
                      Accept & Generate Response Plan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* TAB 3: APPROVAL CENTER */}
      {activeTab === 'approvals' && (
        <Panel title="Response Approval Center" subtitle="Separation of Duties & Authorization Controls" icon={<UserCheck className="w-4 h-4 text-emerald-400" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-soc-bg border border-soc-panelBorder rounded text-[11px] text-soc-textMuted flex items-center space-x-2">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>
                Separation of Duties Policy: High-risk response plans created by an analyst cannot be self-approved by the same user.
              </span>
            </div>

            <div className="overflow-x-auto border border-soc-panelBorder rounded">
              <table className="w-full text-left">
                <thead className="bg-soc-bg text-soc-textMuted border-b border-soc-panelBorder uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Plan Reference</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Approval Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-panelBorder">
                  {(approvals.length > 0 ? approvals : [
                    { id: 1, response_plan_id: 1, plan_number: 'RSP-2026-000001', requested_by: 1, approval_type: 'ADMIN_APPROVAL', reason: 'Pending admin approval for high-risk simulated network isolation', status: 'PENDING' }
                  ]).map((appr: any) => (
                    <tr key={appr.id} className="hover:bg-soc-panelBg/60 transition-colors">
                      <td className="p-3 font-bold text-sky-400">{appr.plan_number || `Plan #${appr.response_plan_id}`}</td>
                      <td className="p-3 text-white">Analyst #{appr.requested_by}</td>
                      <td className="p-3 text-purple-400 font-bold">{appr.approval_type}</td>
                      <td className="p-3 text-soc-textMuted text-[11px]">{appr.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appr.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {appr.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {appr.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprovePlan(appr.response_plan_id)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px]"
                          >
                            Authorize & Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 4: PLAYBOOKS */}
      {activeTab === 'playbooks' && (
        <Panel title="Defensive Playbook Library" subtitle="Controlled Laboratory Response Workflows" icon={<FileText className="w-4 h-4 text-sky-400" />}>
          <div className="space-y-4 font-mono text-xs">
            {(playbooks.length > 0 ? playbooks : [
              { id: 1, title: 'Suspicious Modbus Activity Response', version: 'v1.0', category: 'MODBUS', severity: 'CRITICAL', status: 'ACTIVE' },
              { id: 2, title: 'Abnormal Device Communication Response', version: 'v1.0', category: 'NETWORK', severity: 'HIGH', status: 'ACTIVE' },
              { id: 3, title: 'Compromised Engineering Workstation Containment', version: 'v1.0', category: 'WORKSTATION', severity: 'HIGH', status: 'ACTIVE' },
              { id: 4, title: 'Process Anomaly Safe-State Mitigation', version: 'v1.0', category: 'PROCESS', severity: 'CRITICAL', status: 'ACTIVE' }
            ]).map((pb: any) => (
              <div key={pb.id} className="p-4 bg-soc-bg border border-soc-panelBorder rounded flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-sm">{pb.title}</span>
                    <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-900">{pb.version}</span>
                  </div>
                  <span className="text-soc-textMuted text-[11px] mt-1 block">Category: {pb.category} | Severity: {pb.severity}</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-[10px]">
                  {pb.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export const Response = ResponsePage;
