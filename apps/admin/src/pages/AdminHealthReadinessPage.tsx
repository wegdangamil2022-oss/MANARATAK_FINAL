import { useEffect, useMemo, useState } from 'react';
import { adminApiClient } from '../api/client';
import { getBlockingReadinessCount, productionReadinessBlockers, ProductionReadinessSeverity } from '../security/ProductionReadinessBlockers';
import { useTranslation } from "../i18n/I18nProvider";

type HealthStatus = 'UP' | 'DOWN' | 'UNKNOWN';
type ReadinessStatus = 'PASS' | 'WARN' | 'BLOCKED' | 'UNKNOWN';

interface MonitoringResponse {
  status?: HealthStatus;
  indicators?: Record<string, { status?: HealthStatus; latencyMs?: number; error?: string }>;
}

interface ReadinessCheck {
  label: string;
  category: 'Runtime' | 'Security' | 'Governance';
  status: ReadinessStatus;
  detail: string;
}

interface ProductionReadinessFinding {
  id: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  area: string;
  message: string;
  recommendation: string;
}

interface ProductionReadinessResponse {
  ready: boolean;
  blockerCount: number;
  warningCount: number;
  findings: ProductionReadinessFinding[];
}

const statusStyles: Record<ReadinessStatus, string> = {
  PASS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WARN: 'bg-amber-50 text-amber-700 border-amber-200',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200',
  UNKNOWN: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function AdminHealthReadinessPage() {
    const { t } = useTranslation();
  const [health, setHealth] = useState<MonitoringResponse | null>(null);
  const [readiness, setReadiness] = useState<MonitoringResponse | null>(null);
  const [productionReadiness, setProductionReadiness] = useState<ProductionReadinessResponse | null>(null);
  const [apiProbe, setApiProbe] = useState<HealthStatus>('UNKNOWN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthResult, readinessResult, productionReadinessResult] = await Promise.allSettled([
        adminApiClient.request<MonitoringResponse>('/monitoring/health'),
        adminApiClient.request<MonitoringResponse>('/monitoring/health/readiness'),
        adminApiClient.request<ProductionReadinessResponse>('/monitoring/production-readiness'),
      ]);

      if (healthResult.status === 'fulfilled') {
        setHealth(healthResult.value);
        setApiProbe(healthResult.value.status ?? 'UNKNOWN');
      } else {
        setApiProbe('DOWN');
        setError(healthResult.reason instanceof Error ? healthResult.reason.message : 'Monitoring health check failed.');
      }

      if (readinessResult.status === 'fulfilled') {
        setReadiness(readinessResult.value);
      }

      if (productionReadinessResult.status === 'fulfilled') {
        setProductionReadiness(productionReadinessResult.value);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const checks = useMemo<ReadinessCheck[]>(() => {
    const databaseStatus = readiness?.indicators?.database?.status ?? health?.indicators?.database?.status ?? 'UNKNOWN';
    const redisStatus = readiness?.indicators?.redis?.status ?? health?.indicators?.redis?.status ?? 'UNKNOWN';

    return [
      {
        label: 'API monitoring endpoint',
        category: 'Runtime',
        status: apiProbe === 'UP' ? 'PASS' : apiProbe === 'DOWN' ? 'BLOCKED' : 'UNKNOWN',
        detail: apiProbe === 'UP' ? 'The API monitoring route is reachable.' : 'Admin cannot confirm API monitoring availability.',
      },
      {
        label: 'Database connectivity',
        category: 'Runtime',
        status: databaseStatus === 'UP' ? 'PASS' : databaseStatus === 'DOWN' ? 'BLOCKED' : 'WARN',
        detail: databaseStatus === 'UP' ? 'Prisma health indicator is reporting healthy.' : 'Database indicator is unavailable or unhealthy.',
      },
      {
        label: 'Redis and queue foundation',
        category: 'Runtime',
        status: redisStatus === 'UP' ? 'PASS' : redisStatus === 'DOWN' ? 'WARN' : 'WARN',
        detail: redisStatus === 'UP' ? 'Redis health indicator is reporting healthy.' : 'Redis may be optional locally, but production queues require it.',
      },
      {
        label: 'AI provider mode',
        category: 'Governance',
        status: 'PASS',
        detail: 'AI execution remains routed through the internal gateway with external providers disabled until credential governance is approved.',
      },
      {
        label: 'Admin access control',
        category: 'Security',
        status: 'BLOCKED',
        detail: 'Current admin access uses a temporary demo gate and must be replaced by real authentication, sessions, and role permissions.',
      },
      {
        label: 'Production session storage',
        category: 'Security',
        status: 'BLOCKED',
        detail: 'Redis-backed authenticated sessions remain a production blocker before public launch.',
      },
      {
        label: 'Domain review queue',
        category: 'Governance',
        status: 'PASS',
        detail: 'Admin review queue is available for incomplete, failed, blocked, and ready-to-publish records.',
      },
    ];
  }, [apiProbe, health, readiness]);

  const blockers = checks.filter((check) => check.status === 'BLOCKED');
  const warnings = checks.filter((check) => check.status === 'WARN' || check.status === 'UNKNOWN');
  const securityBlockerCount = getBlockingReadinessCount();
  const productionBlockerCount = productionReadiness?.blockerCount ?? 0;
  const productionWarningCount = productionReadiness?.warningCount ?? 0;

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 mb-1">{t('operations')}</p>
          <h2 className="text-2xl font-bold">{t('health_readiness')}</h2>
          <p className="text-gray-600 mt-2 max-w-3xl">
            {t('runtime_health_checks_and_launch_readiness_signals')}</p>
        </div>
        <button
          onClick={() => void refresh()}
          disabled={loading}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t('api_status')} value={apiProbe} tone={apiProbe === 'UP' ? 'good' : 'bad'} />
        <SummaryCard label={t('production_blockers')} value={String(blockers.length + securityBlockerCount + productionBlockerCount)} tone={blockers.length || securityBlockerCount || productionBlockerCount ? 'bad' : 'good'} />
        <SummaryCard label={t('warnings')} value={String(warnings.length + productionWarningCount)} tone={warnings.length || productionWarningCount ? 'warn' : 'good'} />
      </section>

      <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">{t('production_environment_gate')}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('sanitized_configuration_findings_from_the_api_secr')}</p>
        </div>
        <div className="divide-y">
          {productionReadiness?.findings.length ? productionReadiness.findings.map((finding) => (
            <div key={finding.id} className="p-5 grid gap-3 lg:grid-cols-[150px_1fr_130px] lg:items-start">
              <span className="text-xs uppercase tracking-wide text-gray-500">{finding.area}</span>
              <div>
                <h4 className="font-semibold">{finding.message}</h4>
                <p className="text-sm text-gray-600 mt-1">{finding.recommendation}</p>
              </div>
              <span className={`text-xs font-bold border rounded-full px-3 py-1 text-center ${severityStyles[finding.severity]}`}>
                {finding.severity}
              </span>
            </div>
          )) : (
            <div className="p-5 text-sm text-emerald-700 bg-emerald-50">
              {t('no_production_environment_blockers_are_currently_r')}</div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">{t('readiness_checklist')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('clear_blockers_before_moving_from_prototype_demo_a')}</p>
        </div>
        <div className="divide-y">
          {checks.map((check) => (
            <div key={check.label} className="p-5 grid gap-3 md:grid-cols-[160px_1fr_140px] md:items-center">
              <span className="text-xs uppercase tracking-wide text-gray-500">{check.category}</span>
              <div>
                <h4 className="font-semibold">{check.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{check.detail}</p>
              </div>
              <span className={`text-xs font-bold border rounded-full px-3 py-1 text-center ${statusStyles[check.status]}`}>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-semibold">{t('security_readiness_blockers')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('these_items_must_be_cleared_before_real_users_or_p')}</p>
        </div>
        <div className="divide-y">
          {productionReadinessBlockers.map((item) => (
            <div key={item.id} className="p-5 grid gap-3 lg:grid-cols-[150px_1fr_130px] lg:items-start">
              <span className="text-xs uppercase tracking-wide text-gray-500">{item.area}</span>
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <p className="text-sm text-gray-900 mt-2"><span className="font-semibold">{t('required')}</span> {item.requiredAction}</p>
              </div>
              <span className={`text-xs font-bold border rounded-full px-3 py-1 text-center ${severityStyles[item.severity]}`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white rounded-2xl p-6">
        <h3 className="font-semibold mb-3">{t('launch_rule')}</h3>
        <p className="text-slate-200 text-sm leading-6">
          {t('public_feature_work_can_continue_but_production_la')}</p>
      </section>
    </div>
  );
}

const severityStyles: Record<ProductionReadinessSeverity, string> = {
  BLOCKER: 'bg-red-50 text-red-700 border-red-200',
  WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
};

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' | 'bad' }) {
  const toneClasses = {
    good: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    warn: 'text-amber-700 bg-amber-50 border-amber-100',
    bad: 'text-red-700 bg-red-50 border-red-100',
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClasses}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
