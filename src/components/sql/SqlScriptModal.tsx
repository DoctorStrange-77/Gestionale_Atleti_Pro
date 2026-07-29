import React, { useState } from 'react';
import { Database, Copy, Check, X, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SqlScriptModalProps {
  onClose: () => void;
}

export const SqlScriptModal: React.FC<SqlScriptModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useToast();

  const SQL_SCRIPT = `-- ====================================================================
-- BUILDER ATHLETE MANAGER - MULTI-TENANT & MULTI-ORGANIZATION SCHEMA
-- Run this script in Supabase SQL Editor
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    vat_number TEXT,
    fiscal_code TEXT,
    logo_url TEXT,
    currency TEXT DEFAULT 'EUR',
    settings JSONB DEFAULT '{"coach_financials_default": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SYSTEM ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO public.roles (code, name, description) VALUES
    ('proprietario', 'Proprietario', 'Accesso completo a tutto e gestione proprietà'),
    ('amministratore', 'Amministratore', 'Accesso completo operativo, esclusa proprietà'),
    ('coach', 'Coach', 'Visualizzazione e gestione atleti assegnati'),
    ('segreteria', 'Segreteria', 'Gestione anagrafiche, pagamenti, rate, scadenze, rinnovi, documenti'),
    ('atleta', 'Atleta', 'Accesso al portale atleta')
ON CONFLICT (code) DO NOTHING;

-- 5. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    UNIQUE(role_code, resource, action)
);

-- 6. ORGANIZATION MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE RESTRICT,
    can_view_financials BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 7. RLS HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.auth_user_can_view_financials(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id 
          AND user_id = auth.uid() 
          AND status = 'active'
          AND (
            role_code IN ('proprietario', 'amministratore', 'segreteria') 
            OR (role_code = 'coach' AND can_view_financials = TRUE)
          )
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orgs" ON public.organizations FOR SELECT
    USING (id IN (SELECT public.get_auth_user_org_ids()));

CREATE POLICY "Owners update org" ON public.organizations FOR UPDATE
    USING (public.get_auth_user_org_ids() CONTAINS id);

CREATE POLICY "Members view org members" ON public.organization_members FOR SELECT
    USING (organization_id IN (SELECT public.get_auth_user_org_ids()));

-- Complete scripts available in /supabase/schema.sql
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    showSuccess('Copiato negli appunti', 'Script SQL completo copiato. Incollalo nell\'Editor SQL di Supabase.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                Schema SQL Multi-Tenant & Row Level Security (RLS)
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Predisposizione futura — non attiva nella demo
                </span>
              </h3>
              <p className="text-xs text-zinc-300">
                Tabelle: organizations, profiles, roles, permissions, organization_members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiato!' : 'Copia Query SQL'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badges / Information */}
        <div className="p-4 bg-zinc-900/40 border-b border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block">Row Level Security (RLS)</span>
              <span className="text-zinc-300 text-[11px]">Ogni organizzazione vede esclusivamente i propri dati.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block">5 Ruoli Predefiniti</span>
              <span className="text-zinc-300 text-[11px]">Proprietario, Amministratore, Coach, Segreteria, Atleta.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-200 block">Esecuzione Semplice</span>
              <span className="text-zinc-300 text-[11px]">Incolla nello SQL Editor della Dashboard Supabase.</span>
            </div>
          </div>
        </div>

        {/* Code Container */}
        <div className="flex-1 p-4 overflow-y-auto bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800">
          <pre className="whitespace-pre-wrap">{SQL_SCRIPT}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-300 shrink-0">
          <span>File salvato nel progetto: <code className="text-amber-400 font-mono">/supabase/schema.sql</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-700 font-semibold"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
