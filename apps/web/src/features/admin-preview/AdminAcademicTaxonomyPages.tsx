import { Navigate, useLocation, useParams } from 'react-router-dom';

const ADMIN_APP_URL = (import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:4174').replace(/\/$/, '');

function AdminAppRedirect({ detail = false }: { detail?: boolean }) {
  const location = useLocation();
  const { nodeId } = useParams<{ nodeId: string }>();

  if (detail && !nodeId) {
    return <Navigate to="/admin/academic-taxonomy" replace />;
  }

  const path = detail
    ? `/academic-taxonomy/${encodeURIComponent(nodeId!)}`
    : '/academic-taxonomy';
  window.location.replace(`${ADMIN_APP_URL}${path}${location.search}`);
  return null;
}

export function AdminAcademicTaxonomyPage() {
  return <AdminAppRedirect />;
}

export function AdminAcademicTaxonomyDetailPage() {
  return <AdminAppRedirect detail />;
}
