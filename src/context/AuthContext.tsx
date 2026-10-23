import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting state for login attempts (in-memory lock)
let failedAttemptsCount = 0;
let lockoutUntilTimestamp = 0;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Load user profile from Supabase profiles table
  const fetchProfile = async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback default profile if trigger hasn't fired yet
        return {
          id: userId,
          email: userEmail,
          full_name: userEmail.split('@')[0],
          role: 'viewer', // default safe fallback
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
      }

      return data as UserProfile;
    } catch {
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id, user.email || '');
      setProfile(p);
    }
  };

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '').then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id, newSession.user.email || '');
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured || !supabase) {
      return {
        success: false,
        error:
          'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment or see the setup guide.',
      };
    }

    // Client-side rate-limiting check
    const now = Date.now();
    if (now < lockoutUntilTimestamp) {
      const secondsLeft = Math.ceil((lockoutUntilTimestamp - now) / 1000);
      return {
        success: false,
        error: `Too many failed login attempts. Security lock active. Please retry in ${secondsLeft} seconds.`,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        failedAttemptsCount++;
        if (failedAttemptsCount >= 5) {
          lockoutUntilTimestamp = Date.now() + 60 * 1000; // 1-minute lockout
          failedAttemptsCount = 0;
          return {
            success: false,
            error: 'Maximum failed attempts reached. Please wait 60 seconds before trying again.',
          };
        }
        return { success: false, error: error.message };
      }

      // Reset failed attempts on success
      failedAttemptsCount = 0;
      setSession(data.session);
      setUser(data.user);

      if (data.user) {
        const p = await fetchProfile(data.user.id, data.user.email || '');
        setProfile(p);
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured || !supabase) {
      return {
        success: false,
        error: 'Authentication provider is not configured. Setup Supabase to enable password resets.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        // Return clean message to avoid leaking user existence
        return { success: true };
      }

      return { success: true };
    } catch {
      return { success: true };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured || !supabase) {
      return {
        success: false,
        error: 'Authentication provider is not configured.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        isLoading,
        isConfigured,
        login,
        logout,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
