'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Upload, FileText, Settings, LogOut, ChevronRight, Activity, ShieldCheck, ShieldAlert, BookOpen } from 'lucide-react';
import './globals.css';
import { healthService } from '../services/api';
import { DocumentProvider } from '../lib/DocumentContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  
}) {
  const [health, setHealth] = useState<{ redis: string; celery: string } | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await healthService.check();
        setHealth(data);
      } catch (e) {
        setHealth({ redis: 'error', celery: 'error' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

    return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-100 antialiased">
        <DocumentProvider>
          <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">DocFlow</h1>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Async System</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
              <NavItem href="/documents" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <NavItem href="/upload" icon={<Upload size={20} />} label="Upload" />
              <NavItem href="/documentation" icon={<BookOpen size={20} />} label="Documentation" />
              <div className="pt-4 pb-2 px-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Management</p>
              </div>
              <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>

            {/* Health Status */}
            <div className="p-4 mx-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                <Activity size={12} className="text-blue-500" />
                System Health
              </p>
              <div className="space-y-2">
                <HealthItem 
                  label="API Node" 
                  status={health ? 'connected' : 'loading'} 
                />
                <HealthItem 
                  label="Task Worker" 
                  status={health?.celery || 'loading'} 
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-slate-500 hover:bg-slate-50 transition-all duration-200">
                <LogOut size={20} />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="lg:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  Pages <ChevronRight size={14} className="text-slate-300" /> <span className="text-slate-900">Dashboard</span>
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">AU</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
              <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
              </div>
            </main>
          </div>
          </div>
        </DocumentProvider>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-slate-50 hover:translate-x-1 group"
    >
      <span className="text-slate-400 group-hover:text-blue-600 transition-colors">{icon}</span>
      <span className="text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    </Link>
  );
}

function HealthItem({ label, status }: { label: string; status: string }) {
  const isOk = status === 'connected';
  const isLoading = status === 'loading';
  
  return (
    <div className="flex items-center justify-between text-[11px] font-bold">
      <span className="text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`${
          isOk ? 'text-emerald-500' : 
          isLoading ? 'text-slate-400' : 
          'text-rose-500'
        } transition-colors duration-500`}>
          {isOk ? 'Running' : isLoading ? 'Syncing...' : 'Offline'}
        </span>
        <div className="relative flex h-2 w-2">
          {isOk && (
            <span className="animate-server-blink absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            isOk ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
            isLoading ? 'bg-slate-300' : 
            'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
          }`}></span>
        </div>
      </div>
    </div>
  );
}
