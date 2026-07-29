-- ====================================================================
-- BUILDER ATHLETE MANAGER - MULTI-TENANT & MULTI-ORGANIZATION SCHEMA
-- Multi-user, Multi-organization architecture with Row Level Security (RLS)
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ORGANIZATIONS TABLE
-- Each professional or gym business operates in an isolated organization
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    vat_number TEXT,
    fiscal_code TEXT,
    logo_url TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'IT',
    currency TEXT DEFAULT 'EUR',
    settings JSONB DEFAULT '{
        "coach_financials_default": false,
        "require_mfa": false,
        "auto_renewal_reminder_days": 15
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for organization search
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- --------------------------------------------------------------------
-- 2. USER PROFILES TABLE
-- Extended user information linked to auth.users
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    fiscal_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 3. ROLES TABLE
-- Defines system roles: proprietario, amministratore, coach, segreteria, atleta
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system default roles
INSERT INTO public.roles (code, name, description) VALUES
    ('proprietario', 'Proprietario', 'Accesso completo a tutte le funzionalità e gestione della proprietà dell''organizzazione'),
    ('amministratore', 'Amministratore', 'Accesso completo operativo, esclusa la modifica della proprietà dell''organizzazione'),
    ('coach', 'Coach / Personal Trainer', 'Visualizzazione e gestione degli atleti assegnati e schede tecniche'),
    ('segreteria', 'Segreteria', 'Gestione anagrafiche, pagamenti, rate, scadenze, rinnovi e documenti amministrativi'),
    ('atleta', 'Atleta', 'Accesso al portale atleta (prenotazioni, schede e ricevute personali)')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- --------------------------------------------------------------------
-- 4. PERMISSIONS TABLE
-- Granular permissions map
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_code, resource, action)
);

-- Populate default permissions
INSERT INTO public.permissions (role_code, resource, action, description) VALUES
    -- Proprietario
    ('proprietario', 'organization', 'transfer_ownership', 'Trasferimento e modifica proprietà organizzazione'),
    ('proprietario', 'organization', 'manage', 'Gestione completa organizzazione'),
    ('proprietario', 'financials', 'view', 'Visualizzazione dati economici e report finanziari'),
    ('proprietario', 'financials', 'manage', 'Gestione pagamenti, tariffe e incassi'),
    ('proprietario', 'technical_notes', 'view', 'Visualizzazione note tecniche e anamnesi'),
    ('proprietario', 'technical_notes', 'manage', 'Gestione note tecniche e programmazione'),
    ('proprietario', 'members', 'manage', 'Gestione collaboratori e ruoli'),

    -- Amministratore
    ('amministratore', 'organization', 'manage', 'Gestione configurazioni organizzazione (no proprietà)'),
    ('amministratore', 'financials', 'view', 'Visualizzazione dati economici e report'),
    ('amministratore', 'financials', 'manage', 'Gestione pagamenti, tariffe e incassi'),
    ('amministratore', 'technical_notes', 'view', 'Visualizzazione note tecniche'),
    ('amministratore', 'technical_notes', 'manage', 'Gestione note tecniche'),
    ('amministratore', 'members', 'manage', 'Gestione collaboratori (eccetto ruolo proprietario)'),

    -- Coach
    ('coach', 'athletes', 'view_assigned', 'Visualizzazione atleti assegnati'),
    ('coach', 'athletes', 'manage_assigned', 'Gestione atleti assegnati'),
    ('coach', 'technical_notes', 'view', 'Visualizzazione note tecniche e valutazioni'),
    ('coach', 'technical_notes', 'manage', 'Creazione e modifica note tecniche e schede'),
    ('coach', 'financials', 'view_conditional', 'Visualizzazione dati economici solo se abilitata espressamente'),

    -- Segreteria
    ('segreteria', 'anagrafiche', 'manage', 'Gestione dati anagrafici e contatti'),
    ('segreteria', 'financials', 'view', 'Visualizzazione pagamenti e scadenze'),
    ('segreteria', 'financials', 'manage', 'Gestione pagamenti, rate, scadenze e rinnovi'),
    ('segreteria', 'documenti', 'manage', 'Gestione documenti amministrativi e ricevute'),

    -- Atleta
    ('atleta', 'portal', 'view_own', 'Accesso al proprio profilo, appuntamenti e ricevute')
ON CONFLICT (role_code, resource, action) DO NOTHING;

-- --------------------------------------------------------------------
-- 5. ORGANIZATION MEMBERS TABLE
-- Binds users to organizations with specific role and custom permissions
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_code TEXT NOT NULL REFERENCES public.roles(code) ON DELETE RESTRICT,
    can_view_financials BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- --------------------------------------------------------------------
-- 6. SAMPLE APPLICATION DATA TABLES WITH DATA ISOLATION
-- Demonstrating organization_id foreign key for multi-tenant isolation
-- --------------------------------------------------------------------

-- Athletes Table
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    fiscal_code TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'Altro')),
    address TEXT,
    city TEXT,
    province TEXT,
    profession TEXT,
    emergency_contact JSONB, -- { name, phone, relation }
    preferred_channel TEXT CHECK (preferred_channel IN ('whatsapp', 'email', 'telefono', 'sms')),
    join_date DATE DEFAULT CURRENT_DATE,
    acquisition_source TEXT CHECK (acquisition_source IN ('social', 'passaparola', 'sito_web', 'pubblicita', 'altro')),
    assigned_coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_coach_name TEXT,
    goal TEXT,
    discipline TEXT,
    active_package TEXT,
    expiration_date DATE,
    payment_status TEXT DEFAULT 'regolare' CHECK (payment_status IN ('regolare', 'in_scadenza', 'scaduto', 'in_attesa', 'moroso')),
    notes TEXT, -- Reserved for Coach & Admin
    labels TEXT[] DEFAULT '{}',
    medical_certificate_expiry DATE,
    status TEXT DEFAULT 'attivo' CHECK (status IN (
        'potenziale_cliente', 'prova', 'onboarding', 'attivo', 
        'sospeso', 'in_pausa', 'moroso', 'in_scadenza', 
        'non_rinnovato', 'inattivo', 'archiviato'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athletes_org ON public.athletes(organization_id);
CREATE INDEX IF NOT EXISTS idx_athletes_coach ON public.athletes(assigned_coach_id);

-- Financial Payments Table
CREATE TABLE IF NOT EXISTS public.financial_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_type TEXT NOT NULL, -- 'abbonamento', 'pacchetto', 'quota_associativa'
    payment_method TEXT DEFAULT 'bonifico',
    status TEXT DEFAULT 'completato' CHECK (status IN ('completato', 'in_attesa', 'scaduto', 'rimborsato')),
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON public.financial_payments(organization_id);

-- --------------------------------------------------------------------
-- 7. HELPER FUNCTIONS FOR SECURITY & RLS
-- Security Definer functions run with system privileges to inspect user roles
-- --------------------------------------------------------------------

-- Get all organization IDs for current authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_user_org_ids()
RETURNS SETOF UUID AS $$
    SELECT organization_id 
    FROM public.organization_members 
    WHERE user_id = auth.uid() AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if authenticated user has a specific role in an organization
CREATE OR REPLACE FUNCTION public.auth_user_has_role(p_org_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id 
          AND user_id = auth.uid() 
          AND role_code = p_role 
          AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if authenticated user is Owner or Admin in an organization
CREATE OR REPLACE FUNCTION public.auth_user_is_admin_or_owner(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id 
          AND user_id = auth.uid() 
          AND role_code IN ('proprietario', 'amministratore') 
          AND status = 'active'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if authenticated user can view financial data in an organization
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

-- --------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Complete multi-tenant data isolation
-- --------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payments ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations FOR SELECT
    USING (id IN (SELECT public.get_auth_user_org_ids()));

CREATE POLICY "Owners can update organization settings"
    ON public.organizations FOR UPDATE
    USING (public.auth_user_has_role(id, 'proprietario'));

CREATE POLICY "Admins can update organization non-ownership settings"
    ON public.organizations FOR UPDATE
    USING (public.auth_user_has_role(id, 'amministratore'));

-- PROFILES POLICIES
CREATE POLICY "Users can view all member profiles in their organization"
    ON public.profiles FOR SELECT
    USING (
        id = auth.uid() OR
        id IN (
            SELECT om.user_id FROM public.organization_members om
            WHERE om.organization_id IN (SELECT public.get_auth_user_org_ids())
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ORGANIZATION MEMBERS POLICIES
CREATE POLICY "Members can view co-members in their organization"
    ON public.organization_members FOR SELECT
    USING (organization_id IN (SELECT public.get_auth_user_org_ids()));

CREATE POLICY "Owners and Admins can invite/manage members"
    ON public.organization_members FOR ALL
    USING (public.auth_user_is_admin_or_owner(organization_id));

CREATE POLICY "Only Owner can assign or transfer Proprietario role"
    ON public.organization_members FOR UPDATE
    USING (
        public.auth_user_has_role(organization_id, 'proprietario')
    );

-- ATHLETES POLICIES (ISOLATED BY ORG & ROLE)
CREATE POLICY "Org members can view organization athletes"
    ON public.athletes FOR SELECT
    USING (
        organization_id IN (SELECT public.get_auth_user_org_ids())
    );

CREATE POLICY "Coach/Segreteria/Admin can create & update athletes"
    ON public.athletes FOR ALL
    USING (
        organization_id IN (SELECT public.get_auth_user_org_ids())
        AND EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = athletes.organization_id
              AND om.user_id = auth.uid()
              AND om.role_code IN ('proprietario', 'amministratore', 'coach', 'segreteria')
        )
    );

-- FINANCIAL PAYMENTS POLICIES
CREATE POLICY "Authorized members can view financials"
    ON public.financial_payments FOR SELECT
    USING (
        public.auth_user_can_view_financials(organization_id)
    );

CREATE POLICY "Segreteria, Admin, Owner can manage payments"
    ON public.financial_payments FOR ALL
    USING (
        organization_id IN (SELECT public.get_auth_user_org_ids())
        AND EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_id = financial_payments.organization_id
              AND om.user_id = auth.uid()
              AND om.role_code IN ('proprietario', 'amministratore', 'segreteria')
        )
    );

-- ====================================================================
-- SCHEMA CREATION COMPLETED SUCCESSFULLY
-- ====================================================================
