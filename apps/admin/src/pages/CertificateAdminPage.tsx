import { FormEvent, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Award, Ban, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

interface Certificate {
  id: string;
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  status: string;
  studentReferenceId: string;
  recipientDisplayName?: string | null;
  courseId: string;
  courseDisplayName: string;
  courseCompletionId: string;
  courseCompletedAt: string;
  issuedAt: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

interface CertificateListResponse {
  data: Certificate[];
}

export function CertificateAdminPage() {
    const { t } = useTranslation();
  const [studentReferenceId, setStudentReferenceId] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [issueForm, setIssueForm] = useState({
    courseId: '',
    studentReferenceId: '',
    completionId: '',
    completedAt: new Date().toISOString().slice(0, 10),
    recipientDisplayName: ''
  });

  const loadCertificates = async () => {
    if (!studentReferenceId.trim()) {
      setError('Student reference is required.');
      return;
    }
    setLoadingList(true);
    setError(null);
    setMessage(null);
    try {
      const response = await adminApiClient.request<CertificateListResponse>(`/admin/certificates/students/${encodeURIComponent(studentReferenceId.trim())}`);
      setCertificates(response.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load certificates.');
    } finally {
      setLoadingList(false);
    }
  };

  const issueCertificate = async (event: FormEvent) => {
    event.preventDefault();
    setIssuing(true);
    setError(null);
    setMessage(null);
    try {
      const certificate = await adminApiClient.request<Certificate>('/admin/certificates/course-completions/issue', {
        method: 'POST',
        body: JSON.stringify({
          courseId: issueForm.courseId.trim(),
          studentReferenceId: issueForm.studentReferenceId.trim(),
          completionId: issueForm.completionId.trim(),
          completedAt: new Date(issueForm.completedAt).toISOString(),
          eligibleForCertificate: true,
          recipientDisplayName: issueForm.recipientDisplayName.trim() || null
        })
      });
      setMessage(`Certificate issued: ${certificate.serialNumber}`);
      setStudentReferenceId(issueForm.studentReferenceId.trim());
      setCertificates((current) => [certificate, ...current.filter((item) => item.id !== certificate.id)]);
    } catch (err: any) {
      setError(err.message || 'Unable to issue certificate.');
    } finally {
      setIssuing(false);
    }
  };

  const revokeCertificate = async (certificateId: string) => {
    const reason = window.prompt('Revocation reason');
    if (!reason?.trim()) {
      return;
    }
    setRevokingId(certificateId);
    setError(null);
    setMessage(null);
    try {
      const revoked = await adminApiClient.request<Certificate>(`/admin/certificates/${certificateId}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() })
      });
      setMessage(`Certificate revoked: ${revoked.serialNumber}`);
      setCertificates((current) => current.map((item) => item.id === revoked.id ? revoked : item));
    } catch (err: any) {
      setError(err.message || 'Unable to revoke certificate.');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('certificates')}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('issue_review_and_revoke_certificates_phase_14_owns')}</p>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={issueCertificate} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold">{t('issue_from_course_completion')}</h3>
          </div>

          <Field label={t('course_id')} value={issueForm.courseId} onChange={(value) => setIssueForm({ ...issueForm, courseId: value })} />
          <Field label={t('student_reference_id')} value={issueForm.studentReferenceId} onChange={(value) => setIssueForm({ ...issueForm, studentReferenceId: value })} />
          <Field label={t('course_completion_id')} value={issueForm.completionId} onChange={(value) => setIssueForm({ ...issueForm, completionId: value })} />
          <Field label={t('recipient_display_name')} value={issueForm.recipientDisplayName} onChange={(value) => setIssueForm({ ...issueForm, recipientDisplayName: value })} optional />
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('completed_at')}</span>
            <input
              type="date"
              value={issueForm.completedAt}
              onChange={(event) => setIssueForm({ ...issueForm, completedAt: event.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </label>

          <button
            type="submit"
            disabled={issuing || !issueForm.courseId || !issueForm.studentReferenceId || !issueForm.completionId}
            className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t('issue_certificate')}</button>
        </form>

        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
            <div className="flex-1">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">{t('search_by_student_reference_id')}</span>
                <input
                  value={studentReferenceId}
                  onChange={(event) => setStudentReferenceId(event.target.value)}
                  placeholder={t('student_reference_id_1')}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={loadCertificates}
              disabled={loadingList || !studentReferenceId.trim()}
              className="inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t('load_certificates')}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3 font-medium">{t('certificate')}</th>
                  <th className="px-6 py-3 font-medium">{t('course')}</th>
                  <th className="px-6 py-3 font-medium">{t('status')}</th>
                  <th className="px-6 py-3 font-medium">{t('issued')}</th>
                  <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      {t('no_certificates_loaded_yet')}</td>
                  </tr>
                ) : certificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{certificate.serialNumber}</div>
                      <div className="text-xs text-gray-500">{t('verify')}{certificate.verificationCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{certificate.courseDisplayName}</div>
                      <div className="text-xs text-gray-500">{certificate.recipientDisplayName || certificate.studentReferenceId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${certificate.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {certificate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(certificate.issuedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => revokeCertificate(certificate.id)}
                        disabled={certificate.status === 'REVOKED' || revokingId === certificate.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 disabled:opacity-40"
                      >
                        {revokingId === certificate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                        {t('revoke')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, optional }: { label: string; value: string; onChange: (value: string) => void; optional?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}{optional ? ' (optional)' : ''}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </label>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
}
