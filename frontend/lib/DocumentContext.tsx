'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { documentService } from '../services/api';
import { DocumentResponse, JobResponse, ReviewResponse } from '../types';

interface DocumentContextType {
  documents: DocumentResponse[];
  loading: boolean;
  error: string | null;
  fetchDocuments: () => Promise<void>;
  getDocument: (id: number) => Promise<DocumentResponse | null>;
  getLatestJob: (id: number) => Promise<JobResponse | null>;
  getReview: (id: number) => Promise<ReviewResponse | null>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.list();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocument = useCallback(async (id: number) => {
    try {
      return await documentService.get(id);
    } catch (err: any) {
      console.error(`Failed to fetch document ${id}:`, err);
      return null;
    }
  }, []);

  const getLatestJob = useCallback(async (id: number) => {
    try {
      return await documentService.getLatestJob(id);
    } catch (err: any) {
      console.error(`Failed to fetch latest job for document ${id}:`, err);
      return null;
    }
  }, []);

  const getReview = useCallback(async (id: number) => {
    try {
      return await documentService.getReview(id);
    } catch (err: any) {
      console.error(`Failed to fetch review for document ${id}:`, err);
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    documents,
    loading,
    error,
    fetchDocuments,
    getDocument,
    getLatestJob,
    getReview
  }), [documents, loading, error, fetchDocuments, getDocument, getLatestJob, getReview]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
