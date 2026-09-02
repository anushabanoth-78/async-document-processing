import axios from 'axios';
import { DocumentResponse, JobResponse, ReviewResponse, ReviewUpdateRequest } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const documentService = {
  upload: async (file: File): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<DocumentResponse>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  list: async (): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>('/api/documents');
    return response.data;
  },

  get: async (id: number): Promise<DocumentResponse> => {
    const response = await api.get<DocumentResponse>(`/api/documents/${id}`);
    return response.data;
  },

  getLatestJob: async (id: number): Promise<JobResponse> => {
    const response = await api.get<JobResponse>(`/api/documents/${id}/job`);
    return response.data;
  },

  getReview: async (id: number): Promise<ReviewResponse> => {
    const response = await api.get<ReviewResponse>(`/api/documents/${id}/review`);
    return response.data;
  },

  review: async (id: number, data: ReviewUpdateRequest): Promise<ReviewResponse> => {
    const response = await api.put<ReviewResponse>(`/api/documents/${id}/review`, data);
    return response.data;
  },

  finalize: async (id: number): Promise<ReviewResponse> => {
    const response = await api.post<ReviewResponse>(`/api/documents/${id}/finalize`);
    return response.data;
  },

  getExportJsonUrl: (id: number) => `${API_BASE_URL}/api/documents/${id}/export/json`,
  getExportCsvUrl: (id: number) => `${API_BASE_URL}/api/documents/${id}/export/csv`,
};

export const jobService = {
  get: async (id: number): Promise<JobResponse> => {
    const response = await api.get<JobResponse>(`/api/jobs/${id}`);
    return response.data;
  },

  retry: async (id: number): Promise<JobResponse> => {
    const response = await api.post<JobResponse>(`/api/jobs/${id}/retry`);
    return response.data;
  },

  getStreamUrl: (id: number) => `${API_BASE_URL}/api/jobs/${id}/stream`,
};

export const healthService = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
