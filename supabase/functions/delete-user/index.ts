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

    // Initialize Supabase client for authentication (using anon key)
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    // Initialize Supabase client with service role key for admin operations
    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // 1. Authenticate the caller (must be a developer)
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
    const callerUserId = userData.user.id;

    // Check if the caller is a 'developer'
    const { data: profileData, error: profileError } = await supabaseServiceRole
      .from('profiles')
      .select('role')
      .eq('id', callerUserId)
      .single();

    if (profileError || profileData?.role !== 'developer') {
      console.error("Permission denied: Caller is not a developer.", profileError?.message);
      return new Response(JSON.stringify({ message: 'Forbidden: Only developers can delete users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse request body to get the user ID to delete
    const { userIdToDelete } = await req.json();
    if (!userIdToDelete) {
      return new Response(JSON.stringify({ message: 'Bad Request: Missing userIdToDelete' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent a developer from deleting themselves
    if (callerUserId === userIdToDelete) {
      return new Response(JSON.stringify({ message: 'Forbidden: You cannot delete your own account' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Delete user from auth.users (this also triggers RLS on public.profiles if configured)
    const { error: deleteAuthUserError } = await supabaseServiceRole.auth.admin.deleteUser(userIdToDelete);

    if (deleteAuthUserError) {
      console.error("Error deleting auth user:", deleteAuthUserError.message);
      throw new Error(`Foydalanuvchini auth.users dan o'chirishda xato: ${deleteAuthUserError.message}`);
    }

    // Note: If public.profiles has a foreign key constraint with ON DELETE CASCADE,
    // the profile will be automatically deleted. If not, you'd need to explicitly delete it here.
    // Given the existing schema, it should cascade.

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
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