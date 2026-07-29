import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocalOwnerProfile, UserProfile, UserRole, Organization, OrganizationMember } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';
import {
  DEFAULT_ORGANIZATION_NAME,
  DEFAULT_OWNER_EMAIL,
  LOCAL_OWNER_ID,
  readOwnerProfile,
  saveOwnerProfile,
} from '../lib/ownerProfile';

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
  ownerProfile: LocalOwnerProfile;
  updateOwnerProfile: (profile: LocalOwnerProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const createDemoOrganizations = (owner: LocalOwnerProfile): Organization[] => [
  {
    id: 'org-doctor-strength',
    name: owner.organizationName || DEFAULT_ORGANIZATION_NAME,
    slug: 'doctor-strength',
    ownerId: LOCAL_OWNER_ID,
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
    ownerId: LOCAL_OWNER_ID,
    vatNumber: 'IT09876543210',
    fiscalCode: '09876543210',
    createdAt: '2024-03-01T00:00:00.000Z',
    settings: {
      coachFinancialsDefault: true,
      currency: 'EUR',
    },
  },
];

const createInitialDemoMembers = (owner: LocalOwnerProfile): OrganizationMember[] => [
  {
    id: 'mem-1',
    organizationId: 'org-doctor-strength',
    userId: LOCAL_OWNER_ID,
    userEmail: owner.email || DEFAULT_OWNER_EMAIL,
    userFullName: owner.fullName,
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

const createInitialDemoUser = (
  owner: LocalOwnerProfile,
  organizations: Organization[] = createDemoOrganizations(owner)
): UserProfile => ({
  id: LOCAL_OWNER_ID,
  email: owner.email || DEFAULT_OWNER_EMAIL,
  fullName: owner.fullName,
  role: 'proprietario',
  organizationId: 'org-doctor-strength',
  organizationName: owner.organizationName || DEFAULT_ORGANIZATION_NAME,
  canViewFinancials: true,
  organizations,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownerProfile, setOwnerProfile] = useState<LocalOwnerProfile>(() => {
    const storedOwner = readOwnerProfile();
    if (!storedOwner) throw new Error('Configurazione proprietario non disponibile');
    return storedOwner;
  });
  const [organizations, setOrganizations] = useState<Organization[]>(() =>
    createDemoOrganizations(ownerProfile)
  );
  const [members, setMembers] = useState<OrganizationMember[]>(() =>
    createInitialDemoMembers(ownerProfile)
  );
  const [user, setUser] = useState<UserProfile | null>(null);
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
            const userOrgs: Organization[] = userMemberships.map((m) => ({
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
              organizationName: ownerProfile.organizationName || DEFAULT_ORGANIZATION_NAME,
              canViewFinancials: true,
              organizations,
            });
          }
        }
      } catch (err: unknown) {
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
    showSuccess('Collaboratore Aggiunto', `${fullName} (${email}) aggiunto alla demo (invito simulato)`);
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
          ...createInitialDemoUser(ownerProfile, organizations),
          email: email || ownerProfile.email || DEFAULT_OWNER_EMAIL,
        });
        setIsLoading(false);
        showInfo('Accesso Demo Effettuato', 'Accesso demo effettuato. Nessuna autenticazione reale è stata eseguita.');
      }, 400);
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
          fullName: data.user.user_metadata?.full_name || ownerProfile.fullName,
          role: 'proprietario',
          organizationId: 'org-doctor-strength',
          organizationName: ownerProfile.organizationName || DEFAULT_ORGANIZATION_NAME,
          canViewFinancials: true,
          organizations,
        });
        showSuccess('Accesso effettuato con successo');
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error('Login error:', err);
      showError(
        'Errore di accesso',
        err instanceof Error ? err.message : 'Credenziali non valide'
      );
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
      showInfo('Funzione Dimostrativa', 'Funzione dimostrativa: nessuna email è stata realmente inviata.');
      return true;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      showInfo('Funzione Dimostrativa', 'Funzione dimostrativa: nessuna email è stata realmente inviata.');
      return true;
    } catch (err: unknown) {
      showError(
        'Errore invio',
        err instanceof Error ? err.message : 'Impossibile inviare l\'email'
      );
      return false;
    }
  };

  const updateOwnerProfile = (profile: LocalOwnerProfile) => {
    saveOwnerProfile(profile);
    setOwnerProfile(profile);
    const organizationName = profile.organizationName || DEFAULT_ORGANIZATION_NAME;
    setOrganizations((previous) =>
      previous.map((organization) =>
        organization.id === 'org-doctor-strength'
          ? { ...organization, name: organizationName }
          : organization
      )
    );
    setMembers((previous) =>
      previous.map((member) =>
        member.userId === LOCAL_OWNER_ID
          ? {
              ...member,
              userEmail: profile.email || DEFAULT_OWNER_EMAIL,
              userFullName: profile.fullName,
            }
          : member
      )
    );
    setUser((previous) =>
      previous
        ? {
            ...previous,
            email: profile.email || DEFAULT_OWNER_EMAIL,
            fullName: profile.fullName,
            organizationName,
            organizations: previous.organizations?.map((organization) =>
              organization.id === 'org-doctor-strength'
                ? { ...organization, name: organizationName }
                : organization
            ),
          }
        : previous
    );
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
        organizationName: user?.organizationName || ownerProfile.organizationName || DEFAULT_ORGANIZATION_NAME,
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
        ownerProfile,
        updateOwnerProfile,
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
