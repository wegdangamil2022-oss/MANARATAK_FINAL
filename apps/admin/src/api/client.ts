import { CsrfClientManager } from '@manaratak/shared';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
const csrfManager = CsrfClientManager.getInstance(API_BASE_URL);

export const adminApiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('manaratak_access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await csrfManager.fetchWithCsrf(url, { ...options, headers });
    
    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else {
            errorMessage = JSON.stringify(errorData.error);
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  listInternationalTests(params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<any>(`/admin/international-tests${query}`);
  },

  getInternationalTest(id: string) {
    return this.request<any>(`/admin/international-tests/${id}`);
  },

  upsertInternationalTestVariant(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/variants`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestSection(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/sections`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestScoreScale(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/score-scale`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestFeeMetadata(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/fees`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestOfficialLink(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/official-links`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestAvailability(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/availability`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  upsertInternationalTestPreparationMaterial(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/preparation-materials`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addInternationalTestEvidence(testId: string, payload: any) {
    return this.request<any>(`/admin/international-tests/${testId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markInternationalTestReadyToPublish(testId: string) {
    return this.request<any>(`/admin/international-tests/${testId}/mark-publishable`, {
      method: 'POST',
    });
  },

  publishInternationalTest(testId: string) {
    return this.request<any>(`/admin/international-tests/${testId}/publish`, {
      method: 'POST',
    });
  },

  archiveInternationalTest(testId: string) {
    return this.request<any>(`/admin/international-tests/${testId}/archive`, {
      method: 'POST',
    });
  }
};
