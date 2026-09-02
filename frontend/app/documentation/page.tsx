'use client';

import React from 'react';
import { 
  BookOpen, 
  Rocket, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Search, 
  Edit3, 
  FileCheck,
  Zap,
  ShieldCheck,
  Cloud,
  Database,
  Globe
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import Link from 'next/link';

export default function DocumentationPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-500">
          <BookOpen size={14} />
          Project Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Async Document Processor
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade platform for intelligent document extraction, processing, and review using an asynchronous event-driven architecture.
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-xl transition-shadow border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <Rocket className="text-blue-600 mb-4" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">What is this?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            A system that takes raw PDF/Word documents and converts them into structured, actionable JSON data using rule-based AI.
          </p>
        </Card>
        <Card className="p-6 hover:shadow-xl transition-shadow border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
          <Cpu className="text-emerald-600 mb-4" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">Why Async?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Heavy processing is offloaded to background workers (Celery), keeping the UI lightning fast and responsive at all times.
          </p>
        </Card>
        <Card className="p-6 hover:shadow-xl transition-shadow border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <ShieldCheck className="text-purple-600 mb-4" size={32} />
          <h3 className="font-bold text-slate-900 mb-2">Cloud Ready</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Integrated with Google Cloud Storage for reliable file persistence and Neon/Upstash for global scalability.
          </p>
        </Card>
      </div>

      {/* How it Works - Timeline */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Zap className="text-amber-500" />
          How to Use
        </h2>
        
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {/* Step 1 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Upload size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-1">1. Upload Document</h4>
              <p className="text-sm text-slate-500">Go to the "Upload" page and drop a PDF or Word file. The system will immediately store it in the cloud.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Search size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-1">2. Async Extraction</h4>
              <p className="text-sm text-slate-500">The system triggers a background worker that parses the file, extracts line items, taxes, and metadata in real-time.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <Edit3 size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-1">3. Human Review</h4>
              <p className="text-sm text-slate-500">Review the extracted data in the visual dashboard. Correct any errors directly in the built-in JSON editor.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <FileCheck size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-slate-900 mb-1">4. Finalize & Export</h4>
              <p className="text-sm text-slate-500">Once satisfied, click "Finalize". You can then export the clean data as a structured JSON or CSV file.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Layers className="text-blue-600" />
          Technical Architecture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Globe size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Frontend</h4>
            </div>
            <ul className="space-y-4">
              <TechItem label="Next.js 15+" desc="App Router, Server Components, Client Hydration" />
              <TechItem label="Tailwind CSS" desc="Utility-first styling for a polished modern UI" />
              <TechItem label="Lucide Icons" desc="Consistent, beautiful iconography" />
              <TechItem label="Context API" desc="Efficient global state management for documents" />
            </ul>
          </Card>

          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Backend</h4>
            </div>
            <ul className="space-y-4">
              <TechItem label="FastAPI" desc="High-performance Python API framework" />
              <TechItem label="Celery & Redis" desc="Distributed task queue for async processing" />
              <TechItem label="SQLAlchemy" desc="Async ORM with Neon (PostgreSQL) support" />
              <TechItem label="PyPDF & Docx" desc="Real document parsing and text extraction" />
            </ul>
          </Card>
        </div>
      </div>

      {/* Cloud & Infrastructure */}
      <Card className="p-10 bg-slate-900 text-white border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">Infrastructure</h2>
            <p className="text-slate-400 leading-relaxed">
              Designed for the modern web, the system utilizes top-tier infrastructure providers to ensure your data is safe, processed quickly, and always available.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Cloud size={16} className="text-blue-400" />
                <span className="text-sm font-bold">GCP Storage</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Database size={16} className="text-emerald-400" />
                <span className="text-sm font-bold">Neon DB</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                < Zap size={16} className="text-amber-400" />
                <span className="text-sm font-bold">Upstash Redis</span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
            <h4 className="font-bold text-xl">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Processing Time</p>
                <p className="text-2xl font-black text-white">~15s</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Max File Size</p>
                <p className="text-2xl font-black text-white">10MB</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Formats</p>
                <p className="text-2xl font-black text-white">PDF, DOCX</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Architecture</p>
                <p className="text-2xl font-black text-white">Async</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Link href="/upload">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-10 h-14 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all hover:scale-105 group">
            Start Processing <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TechItem({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </li>
  );
}
