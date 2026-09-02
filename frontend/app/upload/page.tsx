'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, File, Loader2, CheckCircle2 } from 'lucide-react';
import { documentService } from '../../services/api';
import { Button, Card } from '../../components/ui';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const extension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));

      if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(extension)) {
        alert('Invalid file format. Please upload only PDF or Word documents.');
        return;
      }

      setFile(selectedFile);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setStatus('uploading');
    try {
      const response = await documentService.upload(file);
      setStatus('processing');
      
      // Artificial delay to show the "Processing" state to the user
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          router.push(`/documents/${response.id}`);
        }, 1000);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setStatus('idle');
    }
  };

  const isIdle = status === 'idle';
  const isUploading = status === 'uploading';
  const isProcessing = status === 'processing';
  const isSuccess = status === 'success';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Document</h1>
        <p className="text-slate-500">Your document will be automatically analyzed by our AI pipeline.</p>
      </div>

      <Card className="p-8">
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${
            !isIdle ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (isIdle && e.dataTransfer.files && e.dataTransfer.files[0]) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            disabled={!isIdle}
            accept=".pdf,.doc,.docx"
          />
          
          <label htmlFor="file-upload" className={`flex flex-col items-center gap-6 ${isIdle ? 'cursor-pointer' : 'cursor-default'}`}>
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              isSuccess ? 'bg-emerald-500 text-white shadow-emerald-100' : 
              isProcessing || isUploading ? 'bg-blue-600 text-white shadow-blue-100 animate-pulse' : 
              'bg-blue-50 text-blue-600 shadow-blue-50'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-10 h-10" /> : 
               isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> :
               isUploading ? <Upload className="w-10 h-10 animate-bounce" /> :
               <Upload className="w-10 h-10" />}
            </div>
            
            <div className="space-y-2">
              {file ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xl font-bold text-slate-900">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{file.type || 'Document'}</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold text-slate-900">Drop your file here</p>
                  <p className="text-sm text-slate-400 font-medium">Support for PDF and Word documents only</p>
                </>
              )}
            </div>

            {(isUploading || isProcessing) && (
              <div className="w-full max-w-xs space-y-3 animate-in fade-in zoom-in duration-500">
                <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-600 transition-all duration-1000 ${isProcessing ? 'w-full' : 'w-1/2'}`} />
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                  {isUploading ? 'Uploading to Cloud...' : 'Starting AI Pipeline...'}
                </p>
              </div>
            )}
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => setFile(null)} 
            disabled={!file || !isIdle}
          >
            Clear
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || !isIdle}
            className="px-10 shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700"
          >
            {isSuccess ? 'Redirecting...' : isProcessing ? 'Processing...' : isUploading ? 'Uploading...' : 'Begin Analysis'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
