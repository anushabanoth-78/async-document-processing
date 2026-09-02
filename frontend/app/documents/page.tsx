'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  ChevronRight,
  Upload
} from 'lucide-react';
import { documentService } from '../../services/api';
import { DocumentResponse } from '../../types';
import { Badge, Card, Button } from '../../components/ui';

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.list();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-500 mt-1">Manage and track your document processing pipeline.</p>
        </div>
        <Link href="/upload">
          <Button className="shadow-lg shadow-blue-100 px-6">
            Upload New
          </Button>
        </Link>
      </div>

      <Card className="p-1">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Document</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded At</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-500 mt-2 text-sm">Loading your documents...</p>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
                      <div className="relative bg-white border-2 border-slate-100 rounded-3xl w-full h-full flex items-center justify-center shadow-xl shadow-blue-100/50">
                        <FileText className="w-10 h-10 text-blue-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-white">
                        <Upload size={12} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No documents found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                      Your document pipeline is currently empty. Upload an invoice or document to start the automated extraction process.
                    </p>
                    <Link href="/upload">
                      <Button className="px-8 shadow-lg shadow-blue-200">
                        Upload First Document
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none mb-1">{doc.original_filename}</p>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">ID: #{doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={doc.current_status}>{doc.current_status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-300" />
                        {format(new Date(doc.uploaded_at), 'MMM d, yyyy • HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '--'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/documents/${doc.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                        >
                          View Details
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
