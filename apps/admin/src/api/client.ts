import { CsrfClientManager } from '@manaratak/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const csrfManager = CsrfClientManager.getInstance(API_BASE_URL);

type ApiErrorPayload = {
  error?: string | { message?: string };
};

export const adminApiClient = {
  clearSecuritySession(): void {
    csrfManager.clearToken();
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const response = await csrfManager.fetchWithCsrf(url, { ...options, headers, credentials: 'include' });
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json() as ApiErrorPayload;
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else {
            errorMessage = JSON.stringify(errorData.error);
          }
        }
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  listInternationalTests(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<unknown>(`/admin/international-tests${query}`);
  },

  getInternationalTest<T>(id: string) {
    return this.request<T>(`/admin/international-tests/${id}`);
  },

  upsertInternationalTestVariant(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/variants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestSection(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/sections`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestScoreScale(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/score-scale`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestFeeMetadata(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/fees`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestOfficialLink(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/official-links`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestAvailability(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/availability`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestPreparationMaterial(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/preparation-materials`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addInternationalTestEvidence(testId: string, payload: unknown) {
    return this.request<unknown>(`/admin/international-tests/${testId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markInternationalTestReadyToPublish(testId: string) {
    return this.request<unknown>(`/admin/international-tests/${testId}/mark-publishable`, {
      method: 'POST',
    });
  },

  publishInternationalTest(testId: string) {
    return this.request<unknown>(`/admin/international-tests/${testId}/publish`, {
      method: 'POST',
    });
  },

  archiveInternationalTest(testId: string) {
    return this.request<unknown>(`/admin/international-tests/${testId}/archive`, {
      method: 'POST',
    });
  }
};
