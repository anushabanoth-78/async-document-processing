'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Cloud, 
  Save, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Cpu,
  Globe,
  HardDrive,
  Zap
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { healthService } from '../../services/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [health, setHealth] = useState<{ redis: string; celery: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await healthService.check();
        setHealth(data);
      } catch (e) {
        setHealth({ redis: 'error', celery: 'error' });
      }
    };
    fetchHealth();
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
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
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="text-blue-600" size={32} />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage your account, preferences, and system integrations.</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="bg-blue-600 shadow-lg shadow-blue-100">
          <Save size={18} className="mr-2" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')}
            icon={<User size={18} />}
            label="Profile"
          />
          <TabButton 
            active={activeTab === 'system'} 
            onClick={() => setActiveTab('system')}
            icon={<Cpu size={18} />}
            label="System Health"
          />
          <TabButton 
            active={activeTab === 'integrations'} 
            onClick={() => setActiveTab('integrations')}
            icon={<Cloud size={18} />}
            label="Integrations"
          />
          <TabButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')}
            icon={<Bell size={18} />}
            label="Notifications"
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle icon={<User className="text-blue-500" />} title="Profile Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name" placeholder="Abhishek" defaultValue="Abhishek" />
                <InputGroup label="Email Address" placeholder="user@example.com" defaultValue="abhishek@docflow.ai" />
                <InputGroup label="Role" placeholder="Administrator" defaultValue="System Architect" disabled />
                <InputGroup label="Organization" placeholder="Acme Corp" defaultValue="DocFlow Open Source" />
              </div>
            </Card>
          )}

          {activeTab === 'system' && (
            <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle icon={<Activity className="text-emerald-500" />} title="System Architecture" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatusCard 
                  icon={<Globe className="text-blue-500" />} 
                  label="FastAPI Backend" 
                  status="online" 
                  details="Port 8000 (Uvicorn)"
                />
                <StatusCard 
                  icon={<Zap className="text-amber-500" />} 
                  label="Celery Worker" 
                  status={health?.celery || 'loading'} 
                  details="Concurrency: 12 (Solo Mode)"
                />
                <StatusCard 
                  icon={<Database className="text-purple-500" />} 
                  label="Upstash Redis" 
                  status={health?.redis || 'loading'} 
                  details="Global Serverless Broker"
                />
                <StatusCard 
                  icon={<HardDrive className="text-indigo-500" />} 
                  label="Neon Database" 
                  status="online" 
                  details="PostgreSQL 15 (Serverless)"
                />
              </div>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle icon={<Cloud className="text-sky-500" />} title="Cloud Infrastructure" />
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                        <Cloud size={20} className="text-sky-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Google Cloud Storage</p>
                        <p className="text-xs text-slate-400">Object persistence and file storage</p>
                      </div>
                    </div>
                    <Badge status="connected">Active</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Bucket Name" defaultValue="async-document-processor" disabled />
                    <InputGroup label="Project ID" defaultValue="gen-lang-client-..." disabled />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                        <Database size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Database Engine</p>
                        <p className="text-xs text-slate-400">Neon Serverless PostgreSQL</p>
                      </div>
                    </div>
                    <Badge status="connected">Active</Badge>
                  </div>
                  <InputGroup label="Connection URL" defaultValue="postgresql://alex:****@ep-bold-sky-..." disabled />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle icon={<Bell className="text-amber-500" />} title="Notification Preferences" />
              <div className="space-y-4">
                <ToggleItem label="Email on Extraction Complete" description="Receive a summary when a document is fully parsed." checked />
                <ToggleItem label="Browser Push Notifications" description="Real-time alerts for system errors or failed jobs." checked />
                <ToggleItem label="Slack Integration" description="Post extraction results to your company workspace." />
                <ToggleItem label="Webhooks" description="Trigger custom API endpoints on document finalization." />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
          : 'text-slate-500 hover:bg-white hover:text-blue-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      {icon}
      <h3 className="font-bold text-slate-900">{title}</h3>
    </div>
  );
}

function InputGroup({ label, placeholder, defaultValue, disabled = false }: { label: string; placeholder?: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        className={`w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
      />
    </div>
  );
}

function StatusCard({ icon, label, status, details }: { icon: React.ReactNode; label: string; status: string; details: string }) {
  const isOk = status === 'connected' || status === 'online';
  const isLoading = status === 'loading';
  
  return (
    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
          {icon}
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
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
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            isOk ? 'text-emerald-600' : 
            isLoading ? 'text-slate-400' : 
            'text-rose-600'
          }`}>
            {isOk ? 'Running' : isLoading ? 'Syncing' : 'Offline'}
          </span>
        </div>
      </div>
      <div>
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{details}</p>
      </div>
    </div>
  );
}

function ToggleItem({ label, description, checked = false }: { label: string; description: string; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
      <div>
        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${checked ? 'left-7' : 'left-1'}`} />
      </div>
    </div>
  );
}
