import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Supabase environment variables are not set.');
    }

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ message: 'Unauthorized: Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !userData?.user) {
      console.error("Auth error in Edge Function:", authError?.message);
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const { data: profileData, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || profileData?.role !== 'developer') {
      console.error("Permission denied: User is not a developer.", profileError?.message);
      return new Response(JSON.stringify({ message: 'Forbidden: Only developers can access this resource' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: authUsers, error: authUsersError } = await supabaseServiceRole.auth.admin.listUsers();
    if (authUsersError) {
      throw authUsersError;
    }

    const { data: profiles, error: profilesError } = await supabaseServiceRole
      .from('profiles')
      .select('id, username, total_time_spent_seconds, last_seen_at, role, balance'); // Add balance
    if (profilesError) {
      throw profilesError;
    }

    // Fetch purchased courses data for all users to calculate total spent and count
    const { data: userCoursesData, error: userCoursesError } = await supabaseServiceRole
      .from('user_courses')
      .select('user_id, price_at_purchase');
    if (userCoursesError) {
      throw userCoursesError;
    }

    const userFinancials = new Map<string, { totalSpent: number, purchasedCoursesCount: number }>();
    userCoursesData.forEach(uc => {
      const current = userFinancials.get(uc.user_id) || { totalSpent: 0, purchasedCoursesCount: 0 };
      current.totalSpent += uc.price_at_purchase || 0;
      current.purchasedCoursesCount += 1;
      userFinancials.set(uc.user_id, current);
    });

    const combinedUsers = profiles
      .filter(profile => profile.role !== 'developer')
      .map(profile => {
        const authUser = authUsers.users.find(au => au.id === profile.id);
        const financials = userFinancials.get(profile.id) || { totalSpent: 0, purchasedCoursesCount: 0 };
        return {
          id: profile.id,
          username: profile.username || authUser?.email?.split('@')[0] || 'Noma\'lum',
          email: authUser?.email || 'Noma\'lum',
          created_at: authUser?.created_at || '',
          total_time_spent_seconds: profile.total_time_spent_seconds || 0,
          last_seen_at: profile.last_seen_at,
          role: profile.role,
          balance: profile.balance || 0,
          total_spent: financials.totalSpent,
          purchased_courses_count: financials.purchasedCoursesCount,
        };
      });

    return new Response(JSON.stringify(combinedUsers), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ message: `Internal Server Error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});