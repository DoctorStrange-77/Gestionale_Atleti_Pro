import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Organization, OrganizationMember } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  organizationName: string;
  organizations: Organization[];
  members: OrganizationMember[];
  switchOrganization: (orgId: string) => void;
  switchRole: (role: UserRole) => void;
  toggleCoachFinancials: (enabled?: boolean) => void;
  addOrganization: (name: string, vatNumber?: string) => void;
  inviteMember: (email: string, fullName: string, role: UserRole) => void;
  updateMemberRole: (memberId: string, newRole: UserRole) => void;
  toggleMemberFinancials: (memberId: string, canView: boolean) => void;
  transferOwnership: (newOwnerId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Demo Organizations
const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-doctor-strength',
    name: 'Doctor Strength Performance Center',
    slug: 'doctor-strength',
    ownerId: 'demo-user-owner',
    vatNumber: 'IT01234567890',
    fiscalCode: '01234567890',
    createdAt: '2024-01-15T00:00:00.000Z',
    settings: {
      coachFinancialsDefault: false,
      currency: 'EUR',
    },
  },
  {
    id: 'org-apex-fitness',
    name: 'Apex Power & Conditioning Studio',
    slug: 'apex-fitness',
    ownerId: 'demo-user-owner',
    vatNumber: 'IT09876543210',
    fiscalCode: '09876543210',
    createdAt: '2024-03-01T00:00:00.000Z',
    settings: {
      coachFinancialsDefault: true,
      currency: 'EUR',
    },
  },
];

// Initial Demo Members
const INITIAL_DEMO_MEMBERS: OrganizationMember[] = [
  {
    id: 'mem-1',
    organizationId: 'org-doctor-strength',
    userId: 'demo-user-owner',
    userEmail: 'salvatore.carotenuto77@gmail.com',
    userFullName: 'Salvatore Carotenuto',
    roleCode: 'proprietario',
    canViewFinancials: true,
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'mem-2',
    organizationId: 'org-doctor-strength',
    userId: 'demo-user-admin',
    userEmail: 'admin@doctorstrength.it',
    userFullName: 'Marco Rossi (Admin)',
    roleCode: 'amministratore',
    canViewFinancials: true,
    status: 'active',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'mem-3',
    organizationId: 'org-doctor-strength',
    userId: 'demo-user-coach',
    userEmail: 'coach.luca@doctorstrength.it',
    userFullName: 'Luca Bianchi (Coach)',
    roleCode: 'coach',
    canViewFinancials: false,
    status: 'active',
    createdAt: '2024-02-10T00:00:00.000Z',
  },
  {
    id: 'mem-4',
    organizationId: 'org-doctor-strength',
    userId: 'demo-user-segreteria',
    userEmail: 'segreteria@doctorstrength.it',
    userFullName: 'Elena Verdi (Segreteria)',
    roleCode: 'segreteria',
    canViewFinancials: true,
    status: 'active',
    createdAt: '2024-02-15T00:00:00.000Z',
  },
  {
    id: 'mem-5',
    organizationId: 'org-doctor-strength',
    userId: 'demo-user-atleta',
    userEmail: 'atleta.giovanni@gmail.com',
    userFullName: 'Giovanni Neri (Atleta Demo)',
    roleCode: 'atleta',
    canViewFinancials: false,
    status: 'active',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
];

// Initial Demo User
const INITIAL_DEMO_USER: UserProfile = {
  id: 'demo-user-owner',
  email: 'salvatore.carotenuto77@gmail.com',
  fullName: 'Salvatore Carotenuto',
  role: 'proprietario',
  organizationId: 'org-doctor-strength',
  organizationName: 'Doctor Strength Performance Center',
  canViewFinancials: true,
  organizations: DEMO_ORGANIZATIONS,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(INITIAL_DEMO_USER);
  const [organizations, setOrganizations] = useState<Organization[]>(DEMO_ORGANIZATIONS);
  const [members, setMembers] = useState<OrganizationMember[]>(INITIAL_DEMO_MEMBERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          // Fetch user profile & organization membership from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const { data: userMemberships } = await supabase
            .from('organization_members')
            .select('*, organization:organizations(*)')
            .eq('user_id', session.user.id)
            .eq('status', 'active');

          if (userMemberships && userMemberships.length > 0) {
            const activeMem = userMemberships[0];
            const activeOrg = activeMem.organization;
            const userOrgs: Organization[] = userMemberships.map((m: any) => ({
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug,
              ownerId: m.organization.owner_id,
              vatNumber: m.organization.vat_number,
              createdAt: m.organization.created_at,
              settings: m.organization.settings || { coachFinancialsDefault: false, currency: 'EUR' },
            }));

            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Utente',
              role: (activeMem.role_code as UserRole) || 'proprietario',
              organizationId: activeOrg.id,
              organizationName: activeOrg.name,
              canViewFinancials: activeMem.can_view_financials,
              organizations: userOrgs,
            });
            setOrganizations(userOrgs);
          } else {
            // Fallback user metadata if no org table entry exists yet
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || 'Utente',
              role: 'proprietario',
              organizationId: 'org-doctor-strength',
              organizationName: 'Doctor Strength Performance Center',
              canViewFinancials: true,
              organizations: DEMO_ORGANIZATIONS,
            });
          }
        }
      } catch (err: any) {
        console.error('Auth check error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
        isMounted = false;
      };
    }
  }, []);

  // Switch Active Organization
  const switchOrganization = (orgId: string) => {
    const targetOrg = organizations.find((o) => o.id === orgId);
    if (!targetOrg || !user) return;

    setUser((prev) =>
      prev
        ? {
            ...prev,
            organizationId: targetOrg.id,
            organizationName: targetOrg.name,
          }
        : null
    );
    showSuccess('Organizzazione cambiata', `Ora stai operando in: ${targetOrg.name}`);
  };

  // Switch Active Role (Dynamic preview & role testing)
  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const canView =
      newRole === 'proprietario' ||
      newRole === 'amministratore' ||
      newRole === 'segreteria' ||
      (newRole === 'coach' && user.canViewFinancials);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            role: newRole,
            canViewFinancials: canView,
          }
        : null
    );

    showInfo('Ruolo attivo cambiato', `Stai visualizzando il sistema come ${newRole.toUpperCase()}`);
  };

  // Toggle coach financial visibility
  const toggleCoachFinancials = (enabled?: boolean) => {
    if (!user) return;
    const nextVal = enabled !== undefined ? enabled : !user.canViewFinancials;

    setUser((prev) => (prev ? { ...prev, canViewFinancials: nextVal } : null));

    setMembers((prev) =>
      prev.map((m) => (m.roleCode === 'coach' ? { ...m, canViewFinancials: nextVal } : m))
    );

    showSuccess(
      'Permessi Economici Coach',
      nextVal ? 'Visibilità dati economici attivata per i Coach' : 'Visibilità dati economici disattivata per i Coach'
    );
  };

  // Add a new organization
  const addOrganization = (name: string, vatNumber?: string) => {
    if (!user) return;
    const newOrgId = `org-${Date.now()}`;
    const newOrg: Organization = {
      id: newOrgId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      ownerId: user.id,
      vatNumber: vatNumber || 'IT' + Math.floor(10000000000 + Math.random() * 90000000000),
      createdAt: new Date().toISOString(),
      settings: {
        coachFinancialsDefault: false,
        currency: 'EUR',
      },
    };

    const updatedOrgs = [...organizations, newOrg];
    setOrganizations(updatedOrgs);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            organizationId: newOrg.id,
            organizationName: newOrg.name,
            organizations: updatedOrgs,
            role: 'proprietario',
          }
        : null
    );

    showSuccess('Organizzazione Creata', `Nuova organizzazione "${name}" creata e attivata`);
  };

  // Invite team member
  const inviteMember = (email: string, fullName: string, roleCode: UserRole) => {
    if (!user) return;
    const newMember: OrganizationMember = {
      id: `mem-${Date.now()}`,
      organizationId: user.organizationId,
      userId: `user-${Date.now()}`,
      userEmail: email,
      userFullName: fullName,
      roleCode,
      canViewFinancials: roleCode === 'proprietario' || roleCode === 'amministratore' || roleCode === 'segreteria',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    showSuccess('Invito Inviato', `${fullName} (${email}) aggiunto come ${roleCode}`);
  };

  // Update member role
  const updateMemberRole = (memberId: string, newRole: UserRole) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              roleCode: newRole,
              canViewFinancials: newRole === 'proprietario' || newRole === 'amministratore' || newRole === 'segreteria',
            }
          : m
      )
    );
    showSuccess('Ruolo Aggiornato', `Ruolo del collaboratore aggiornato a ${newRole.toUpperCase()}`);
  };

  // Toggle member financials specifically
  const toggleMemberFinancials = (memberId: string, canView: boolean) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, canViewFinancials: canView } : m))
    );
    showSuccess('Permesso Aggiornato', `Visibilità economica impostata a ${canView ? 'SI' : 'NO'}`);
  };

  // Transfer ownership
  const transferOwnership = (newOwnerUserId: string) => {
    const targetMember = members.find((m) => m.userId === newOwnerUserId || m.id === newOwnerUserId);
    if (!targetMember) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.roleCode === 'proprietario') {
          return { ...m, roleCode: 'amministratore' };
        }
        if (m.id === targetMember.id) {
          return { ...m, roleCode: 'proprietario', canViewFinancials: true };
        }
        return m;
      })
    );

    if (user?.role === 'proprietario') {
      setUser((prev) => (prev ? { ...prev, role: 'amministratore' } : null));
    }

    showSuccess('Proprietà Trasferita', `La proprietà dell'organizzazione è stata trasferita a ${targetMember.userFullName}`);
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setTimeout(() => {
        setUser({
          ...INITIAL_DEMO_USER,
          email: email || INITIAL_DEMO_USER.email,
        });
        setIsLoading(false);
        showSuccess('Accesso effettuato con successo (Modalità Demo)');
      }, 500);
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || 'Coach',
          role: 'proprietario',
          organizationId: 'org-doctor-strength',
          organizationName: 'Doctor Strength Performance Center',
          canViewFinancials: true,
          organizations: DEMO_ORGANIZATIONS,
        });
        showSuccess('Accesso effettuato con successo');
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      showError('Errore di accesso', err.message || 'Credenziali non valide');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsLoading(false);
    showSuccess('Disconnessione effettuata');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!email) {
      showError('Email richiesta', 'Inserisci il tuo indirizzo email');
      return false;
    }

    if (!isSupabaseConfigured || !supabase) {
      showSuccess('Istruzioni inviate', `(Modalità Demo) Email inviata a ${email}`);
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      showSuccess('Email inviata', `Abbiamo inviato un link a ${email}`);
      return true;
    } catch (err: any) {
      showError('Errore invio', err.message || 'Impossibile inviare l\'email');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        logout,
        resetPassword,
        organizationName: user?.organizationName || 'Doctor Strength Performance',
        organizations,
        members,
        switchOrganization,
        switchRole,
        toggleCoachFinancials,
        addOrganization,
        inviteMember,
        updateMemberRole,
        toggleMemberFinancials,
        transferOwnership,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};
