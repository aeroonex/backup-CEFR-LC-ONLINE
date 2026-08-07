"use client";

import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export interface Profile {
  id: string;
  created_at: string;
  username: string | null;
  role: string;
  balance: number;
  score: number;
  phone: string;
  bio: string;
  total_time_spent_seconds: number;
  streak: number;
  xp: number;
  level: number;
  last_checkin_date: string | null;
  last_test_date: string | null;
  last_seen_at: string | null;
}

interface SessionContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean; // This will now reflect session AND profile loading
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LAST_SEEN_UPDATE_INTERVAL = 30 * 1000; // 30 soniya

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state for session and profile
  const lastSeenIntervalRef = useRef<number | null>(null);

  const fetchUserProfile = useCallback(async (currentUser: User) => {
    console.log(`[fetchUserProfile] Attempting to fetch profile for user: ${currentUser.id}`);
    let fetchedProfile: Profile | null = null;
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, created_at, username, role, balance, score, phone, bio, total_time_spent_seconds, streak, xp, level, last_checkin_date, last_test_date, last_seen_at')
      .eq('id', currentUser.id)
      .single();

    console.log(`[fetchUserProfile] Supabase response for user ${currentUser.id}: data=`, data, "error=", fetchError); // NEW LOG

    if (fetchError) {
      console.error(`[fetchUserProfile] Error fetching profile for user ${currentUser.id} (code: ${fetchError.code}):`, fetchError.message, fetchError);
      if (fetchError.code === 'PGRST116') {
        console.warn(`[fetchUserProfile] Profile not found for user ${currentUser.id}. Attempting to create new profile.`);
        // Attempt to create profile if not found
        const { data: newProfileData, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: currentUser.id,
              username: currentUser.email?.split('@')[0] || 'user',
              role: 'user',
              balance: 0,
              score: 0,
              phone: '',
              bio: '',
              total_time_spent_seconds: 0,
              streak: 0,
              xp: 0,
              level: 0,
              last_checkin_date: null,
              last_seen_at: new Date().toISOString(),
            },
          ])
          .select('id, created_at, username, role, balance, score, phone, bio, total_time_spent_seconds, streak, xp, level, last_checkin_date, last_test_date, last_seen_at')
          .single();

        if (insertError) {
          console.error(`[fetchUserProfile] Error creating new profile for user ${currentUser.id}:`, insertError.message, insertError);
          showError("Profil yaratishda xato yuz berdi.");
          fetchedProfile = null;
        } else if (newProfileData) {
          console.log(`[fetchUserProfile] New profile successfully created for user ${currentUser.id}:`, newProfileData);
          fetchedProfile = newProfileData as Profile;
        }
      } else {
        // Other database errors during fetch
        showError("Profil ma'lumotlarini yuklashda xato yuz berdi.");
        fetchedProfile = null;
      }
    } else if (data) {
      console.log(`[fetchUserProfile] Profile successfully fetched for user ${currentUser.id}:`, data);
      fetchedProfile = data as Profile;
    } else {
      // This case should ideally not happen with .single() if no error, but let's log it.
      console.warn(`[fetchUserProfile] Supabase returned no data and no error for user ${currentUser.id}. This is unexpected.`);
      fetchedProfile = null;
    }
    console.log(`[fetchUserProfile] Returning profile for user ${currentUser.id}:`, fetchedProfile);
    return fetchedProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user);
      setProfile(updatedProfile);
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    if (user && profile && profile.role !== 'developer') {
      const updateLastSeen = async () => {
        try {
          await supabase
            .from('profiles')
            .update({ last_seen_at: new Date().toISOString() })
            .eq('id', user.id);
        } catch (error) {
          console.error("[SessionContext] last_seen_at ni yangilashda xato:", error);
        }
      };

      updateLastSeen();
      lastSeenIntervalRef.current = setInterval(updateLastSeen, LAST_SEEN_UPDATE_INTERVAL) as unknown as number;
    }

    return () => {
      if (lastSeenIntervalRef.current) {
        clearInterval(lastSeenIntervalRef.current);
        lastSeenIntervalRef.current = null;
      }
    };
  }, [user, profile]);

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      console.log(`[SessionContext] Auth state changed: ${event}, Session: ${!!currentSession}`);
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);
      let userProfile: Profile | null = null;

      if (event === 'SIGNED_OUT') {
        console.log("[SessionContext] User SIGNED_OUT. Clearing session and profile.");
        setProfile(null); // Explicitly clear profile on sign out
        setIsLoading(false); // <-- Here, isLoading is set to false
        return; // No need to fetch profile for a signed out user
      }

      if (currentUser) {
        try {
          userProfile = await fetchUserProfile(currentUser); // Await here
        } catch (error) {
          console.error("[SessionContext] Error fetching user profile:", error);
          showError("Profil ma'lumotlarini yuklashda kutilmagan xato yuz berdi.");
          userProfile = null; // Ensure profile is null on error
        }
      }
      setProfile(userProfile); // Set profile after it's fetched/created
      setIsLoading(false); // ALWAYS set to false here, even if profile fetching failed
      console.log(`[SessionContext] Loading finished. Session: ${!!currentSession}, User: ${!!currentUser}, Profile: ${!!userProfile}, Profile Data:`, userProfile);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      console.log(`[SessionContext] Initial session check. Session: ${!!initialSession}`);
      await handleAuthStateChange('INITIAL_SESSION', initialSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return (
    <SessionContext.Provider value={{ session, user, profile, isLoading, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};