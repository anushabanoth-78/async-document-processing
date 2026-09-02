'use client';

import React, { useEffect, useState, use, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Save, 
  RotateCcw,
  Loader2,
  FileText,
  Activity,
  ChevronRight
} from 'lucide-react';
import { documentService, jobService } from '../../../services/api';
import { DocumentResponse, JobResponse, ReviewResponse } from '../../../types';
import { Badge, Card, Button } from '../../../components/ui';
import { useDocument } from '../../../lib/DocumentContext';
import Link from 'next/link';
import { formatDate } from 'date-fns';

export default function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const docId = parseInt(id);
  const { getDocument, getLatestJob, getReview } = useDocument();
  
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedJson, setEditedJson] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docData, jobData] = await Promise.all([
        getDocument(docId),
        getLatestJob(docId)
      ]);
      
      setDocument(docData);
      setJob(jobData);
      
      if (docData && (docData.current_status === 'completed' || docData.current_status === 'finalized')) {
        const reviewData = await getReview(docId);
        if (reviewData) {
          setReview(reviewData);
          setEditedJson(JSON.stringify(reviewData.reviewed_output_json, null, 2));
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [docId, getDocument, getLatestJob, getReview]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for updates if job is not completed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      interval = setInterval(async () => {
        const jobData = await getLatestJob(docId);
        if (jobData) {
          setJob(jobData);
          if (jobData.status === 'completed') {
            const docData = await getDocument(docId);
            setDocument(docData);
          }
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [docId, job?.status, getLatestJob, getDocument]);

  const handleRetry = async () => {
    if (!job) return;
    setIsRetrying(true);
    try {
      await jobService.retry(job.id);
      fetchData();
    } catch (error) {
      alert('Retry failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await documentService.finalize(docId);
      setSuccessMessage('Document finalized successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (error) {
      alert('Finalization failed');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleSaveReview = async () => {
    setIsSaving(true);
    try {
      const parsedJson = JSON.parse(editedJson);
      await documentService.review(docId, { reviewed_output_json: parsedJson });
      setSuccessMessage('Review saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchData();
    } catch (error) {
      alert('Failed to save review. Please check your JSON format.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Memoized derived data for the Summary Section
  const summaryData = useMemo(() => {
    if (!review || !review.reviewed_output_json) return null;
    const json = review.reviewed_output_json as any;
    
    // Format currency symbol
    const currencyMap: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    const symbol = currencyMap[json.currency] || json.currency || '$';

    return {
      vendor: json.vendor_name || 'Unknown',
      id: json.id_number || 'N/A',
      total: (json.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      subtotal: json.subtotal ? (json.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : null,
      tax: json.tax_amount ? (json.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : null,
      discount: json.discount ? (json.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : null,
      currency: symbol,
      date: json.date || 'N/A',
      items: json.line_items || []
    };
  }, [review]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
          <div className="relative bg-white border-2 border-slate-100 rounded-3xl w-full h-full flex items-center justify-center shadow-xl shadow-blue-100/50">
            <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing AI Workspace...</p>
      </div>
    );
  }

  if (!document) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-500">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Document Registry Error</h2>
      <p className="text-slate-500 mt-2">The requested document ID could not be found in our database.</p>
      <Link href="/documents" className="mt-8">
        <Button variant="outline">Return to Dashboard</Button>
      </Link>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {successMessage && (
        <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">{successMessage}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{document.original_filename}</h1>
              <Badge status={document.current_status}>{document.current_status}</Badge>
            </div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Document Registry #{document.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {document.current_status === 'failed' && (
            <Button variant="outline" onClick={handleRetry} isLoading={isRetrying}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Job
            </Button>
          )}
          {document.current_status === 'completed' && (
            <Button onClick={handleFinalize} isLoading={isFinalizing} className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-100 border-none">
              Finalize & Approve
            </Button>
          )}
          {document.current_status === 'finalized' && (
            <div className="flex gap-2">
              <a href={documentService.getExportJsonUrl(docId)} download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> JSON
                </Button>
              </a>
              <a href={documentService.getExportCsvUrl(docId)} download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Pipeline */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Pipeline Status
            </h3>
            
            <div className="space-y-8">
              <TimelineItem 
                title="Document Uploaded" 
                time={document.uploaded_at} 
                isDone={true} 
              />
              <TimelineItem 
                title="Job Queueing" 
                isDone={!!job && job.status !== 'queued'} 
                isActive={job?.status === 'queued'}
              />
              <TimelineItem 
                title="Data Extraction" 
                isDone={job?.status === 'completed'} 
                isActive={job?.status === 'processing'}
                progress={job?.progress_percentage}
                error={job?.error_message}
              />
              <TimelineItem 
                title="Human Review" 
                isDone={document.current_status === 'finalized'} 
                isActive={document.current_status === 'completed'}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Metadata</h3>
            <div className="space-y-4">
              <MetaRow label="MIME Type" value={document.mime_type || '--'} />
              <MetaRow label="File Size" value={document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : '--'} />
              <MetaRow label="Storage" value="Google Cloud Storage" />
            </div>
          </Card>
        </div>

        {/* Right Column: Content/Review */}
        <div className="lg:col-span-2">
          {job?.status === 'completed' || document.current_status === 'finalized' ? (
            <Card className="h-full flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Extracted Intelligence</h3>
                  <p className="text-sm text-slate-500">Review and correct the structured data below.</p>
                </div>
                {document.current_status === 'completed' && (
                  <Button variant="outline" size="sm" onClick={handleSaveReview} isLoading={isSaving}>
                    <Save className="w-4 h-4 mr-2" /> Save Review
                  </Button>
                )}
              </div>
              
              {/* Summary Section */}
              {summaryData && (
                <div className="border-b border-slate-100">
                  <div className="p-6 bg-blue-50/30 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vendor / Entity</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{summaryData.vendor}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ID / Ticket #</p>
                      <p className="text-sm font-bold text-slate-900">{summaryData.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-sm font-bold text-slate-900">
                        {summaryData.currency} {summaryData.total}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Doc Date</p>
                      <p className="text-sm font-bold text-slate-900">{summaryData.date}</p>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  {(summaryData.subtotal || summaryData.tax || summaryData.discount) && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-8">
                      {summaryData.subtotal && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Subtotal:</span>
                          <span className="text-xs font-bold text-slate-600">{summaryData.currency} {summaryData.subtotal}</span>
                        </div>
                      )}
                      {summaryData.tax && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Tax:</span>
                          <span className="text-xs font-bold text-slate-600">{summaryData.currency} {summaryData.tax}</span>
                        </div>
                      )}
                      {summaryData.discount && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Discount:</span>
                          <span className="text-xs font-bold text-emerald-600">-{summaryData.currency} {summaryData.discount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Line Items Table */}
                  {summaryData.items && summaryData.items.length > 0 && (
                    <div className="border-t border-slate-100">
                      <div className="bg-slate-50/30 px-6 py-3 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Line Items</p>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-white shadow-sm">
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-3 font-bold">Description</th>
                              <th className="px-6 py-3 font-bold text-right">Price</th>
                              <th className="px-6 py-3 font-bold text-center">Qty</th>
                              <th className="px-6 py-3 font-bold text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {summaryData.items.map((item: any, idx: number) => (
                              <tr key={idx} className="text-xs text-slate-600 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-3 font-medium text-slate-900">{item.description}</td>
                                <td className="px-6 py-3 text-right font-mono">{summaryData.currency} {item.price.toFixed(2)}</td>
                                <td className="px-6 py-3 text-center">{item.quantity}</td>
                                <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">{summaryData.currency} {item.total.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 p-6 bg-slate-900 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                <textarea
                  className="w-full h-full bg-transparent text-blue-100 font-mono text-sm resize-none focus:outline-none scrollbar-hide"
                  placeholder="Loading extraction results..."
                  value={editedJson}
                  onChange={(e) => setEditedJson(e.target.value)}
                  disabled={document.current_status === 'finalized'}
                />
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-12 text-center bg-white">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Activity size={40} className={`text-slate-200 ${job?.status === 'processing' ? 'animate-spin text-blue-500' : ''}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {job?.status === 'failed' ? 'Processing Failed' : 'Intelligence in Progress'}
              </h3>
              <p className="text-slate-500 max-w-md">
                {job?.status === 'failed' 
                  ? 'We encountered an error while processing this document. Please check the logs or try retrying the job.'
                  : 'Our AI agents are currently extracting structured fields from your document. This typically takes 10-30 seconds.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ title, time, isDone, isActive, progress, error }: { 
  title: string; 
  time?: string; 
  isDone?: boolean; 
  isActive?: boolean;
  progress?: number;
  error?: string;
}) {
  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500 ${
          isDone ? 'bg-green-500 border-green-500 text-white' : 
          isActive ? 'bg-white border-blue-500 text-blue-500 scale-110 shadow-lg shadow-blue-100' : 
          'bg-white border-slate-200 text-slate-200'
        }`}>
          {isDone ? <CheckCircle2 size={18} /> : isActive ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
        </div>
        <div className={`w-0.5 flex-1 mt-2 -mb-8 transition-colors duration-500 ${isDone ? 'bg-green-500' : 'bg-slate-100'}`} />
      </div>
      <div className="pb-8">
        <h4 className={`font-bold transition-colors ${isActive ? 'text-blue-600' : isDone ? 'text-slate-900' : 'text-slate-300'}`}>
          {title}
        </h4>
        {time && <p className="text-xs text-slate-400 font-medium">{formatDate(new Date(time), 'HH:mm:ss')}</p>}
        {isActive && progress !== undefined && (
          <div className="mt-2 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-900 font-bold">{value}</span>
    </div>
  );
}
