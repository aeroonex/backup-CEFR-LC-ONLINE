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
    // Initialize Supabase client with service role key for storage operations
    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // 1. Authenticate user
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
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    // 2. Parse request body
    const { lessonId, courseId } = await req.json();
    if (!lessonId || !courseId) {
      return new Response(JSON.stringify({ message: 'Bad Request: Missing lessonId or courseId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Check if user has purchased the course
    const { data: userCourse, error: userCourseError } = await supabaseServiceRole
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (userCourseError || !userCourse) {
      console.error("User course check error:", userCourseError?.message);
      return new Response(JSON.stringify({ message: 'Forbidden: User has not purchased this course' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Get video path from lessons table
    const { data: lessonData, error: lessonError } = await supabaseServiceRole
      .from('lessons')
      .select('video_url')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData?.video_url) {
      console.error("Lesson data error:", lessonError?.message);
      return new Response(JSON.stringify({ message: 'Not Found: Lesson video not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const videoPath = lessonData.video_url; // This is now the relative path, e.g., 'lesson_videos/some_video.mp4'

    // 5. Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseServiceRole.storage
      .from('lesson_videos')
      .createSignedUrl(videoPath, 3600); // URL valid for 1 hour (3600 seconds)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Signed URL generation error:", signedUrlError?.message);
      return new Response(JSON.stringify({ message: 'Internal Server Error: Could not generate signed URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ signedUrl: signedUrlData.signedUrl }), {
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