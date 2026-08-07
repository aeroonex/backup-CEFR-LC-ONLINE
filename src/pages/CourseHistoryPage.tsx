"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import CourseCard from "@/components/dashboard/CourseCard"; // CourseCard komponentini import qilish
import { Clock } from "lucide-react"; // Clock ikonkasini import qilish
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner
import { formatTime } from '@/utils/formatters'; // Import formatTime utility

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  user_id: string; // Uploader's user_id
  duration_days: number; // New field
  average_rating: number | null;
  review_count: number | null;
  discount_percentage: number | null;
  course_parts?: Array<{
    id: string;
    lessons?: Array<{ id: string }>;
  }>;
  parts_count?: number;
  lessons_count?: number;
  lessonsCompleted?: number; // Added lessonsCompleted
  progress?: number; // Added progress
}

interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  price_at_purchase: number;
  courses: Course | null; // Joined course details, can be null if course is deleted
}

interface UserLessonProgress {
  lesson_id: string;
  course_id: string;
}

const CourseHistoryPage: React.FC = () => {
  const { session, isLoading, user, profile } = useSession(); // Add profile to destructuring
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [reviewedCourseIds, setReviewedCourseIds] = useState<Set<string>>(new Set()); // NEW: State for reviewed course IDs
  const [userLessonProgress, setUserLessonProgress] = useState<UserLessonProgress[]>([]); // NEW: State for user lesson progress
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); // Page-specific loading state

  const fetchUserCourses = useCallback(async () => {
    if (!user || !profile) { // Ensure both user and profile are available
      setIsLoadingPageData(false);
      return;
    }

    // Ensure user.id is available before making Supabase calls
    if (!user.id) {
      console.error("[CourseHistoryPage] User ID is missing when attempting to fetch user courses.");
      showError("Foydalanuvchi identifikatori topilmadi. Iltimos, qayta kiring.");
      setIsLoadingPageData(false);
      return;
    }

    setIsLoadingPageData(true);
    let reviewedIds = new Set<string>(); // NEW: Local set for reviewed IDs
    let lessonProgress: UserLessonProgress[] = []; // NEW: Local array for lesson progress

    try {
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            price,
            image_url,
            category,
            user_id,
            duration_days,
            average_rating,
            review_count,
            discount_percentage,
            course_parts (
              id,
              lessons (
                id
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false }); // Eng yangi sotib olingan kurslar birinchi ko'rinadi

      if (error) {
        console.error("[CourseHistoryPage] Error fetching user courses:", error);
        showError(`Kurslar tarixini yuklashda xato yuz berdi: ${error.message}`);
        setUserCourses([]);
      } else {
        const validUserCourses = (data || []).filter(
          (userCourse: UserCourse) => userCourse.courses !== null
        ) as UserCourse[];

        // NEW: Fetch user's lesson progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, course_id')
          .eq('user_id', user.id);

        if (progressError) {
          console.error("[CourseHistoryPage] Error fetching user lesson progress:", progressError);
          setUserLessonProgress([]);
        } else {
          lessonProgress = progressData || [];
          setUserLessonProgress(lessonProgress);
        }

        // Calculate parts_count and lessons_count for each course
        const coursesWithCounts = validUserCourses.map(userCourse => {
          const course = userCourse.courses!;
          const parts = course.course_parts || [];
          const parts_count = parts.length;
          const lessons_count = parts.reduce((sum, part) => sum + (part.lessons?.length || 0), 0);

          // NEW: Calculate lessonsCompleted and progress
          const lessonsCompleted = lessonProgress.filter(p => p.course_id === course.id).length;
          const progress = lessons_count > 0 ? Math.round((lessonsCompleted / lessons_count) * 100) : 0;

          return { ...userCourse, courses: { ...course, parts_count, lessons_count, lessonsCompleted, progress } };
        });

        setUserCourses(coursesWithCounts);
      }

      // NEW: Fetch reviews for the current user
      const { data: userReviewsData, error: userReviewsError } = await supabase
        .from('course_reviews')
        .select('course_id')
        .eq('user_id', user.id);

      if (userReviewsError) {
        console.error("[CourseHistoryPage] Error fetching user reviews:", userReviewsError);
        setReviewedCourseIds(new Set());
      } else {
        reviewedIds = new Set(userReviewsData?.map(review => review.course_id) || []);
        setReviewedCourseIds(reviewedIds);
      }

    } catch (error: any) {
      console.error("[CourseHistoryPage] General error in fetching user courses data:", error.message || error);
      showError(`Ma'lumotlarni yuklashda kutilmagan xato yuz berdi: ${error.message || 'Noma\'lum xato'}`);
    } finally {
      setIsLoadingPageData(false);
    }
  }, [user, profile]); // Depend on user and profile

  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  // useEffect(() => {
  //   if (!isLoading && !session) {
  //     showError("Bu sahifaga kirish uchun avval tizimga kiring.");
  //     navigate("/login");
  //   }
  // }, [session, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && session && user && profile) { // Only fetch if session, user AND profile are loaded
      fetchUserCourses();
    } else if (!isLoading && !session) {
      setIsLoadingPageData(false);
    }
  }, [isLoading, session, user, profile, fetchUserCourses]);

  const handleReviewSubmitted = useCallback(async () => {
    await fetchUserCourses(); // Refresh user courses to update review status
  }, [fetchUserCourses]);

  if (isLoading || isLoadingPageData) { // Use combined loading state, ensure profile is loaded
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-ferrari-red">
            Kurslarim tarixi
          </h3>
          <p className="text-sm text-muted-foreground">
            Bu yerda siz yakunlagan yoki davom etayotgan kurslaringiz tarixini ko'rishingiz mumkin.
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 bg-gray-100 p-3 rounded-lg shadow-sm">
            <Clock className="h-5 w-5 text-ferrari-red" />
            <span className="text-sm text-gray-500">Umumiy sarflangan vaqt:</span>
            <span className="text-ferrari-red">{formatTime(profile.total_time_spent_seconds || 0)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userCourses.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">Hozircha sotib olingan kurslaringiz mavjud emas. <Link to="/courses" className="text-ferrari-red hover:underline">Kurslarni ko'rish</Link></p>
        ) : (
          userCourses.map((userCourse) => (
            <CourseCard
              key={userCourse.id}
              id={userCourse.courses!.id}
              imageSrc={userCourse.courses!.image_url || "https://placehold.co/550x350/FF2800/FFFFFF?text=Kurs+Rasmi"}
              title={userCourse.courses!.title}
              description={userCourse.courses!.description}
              category={userCourse.courses!.category}
              price={userCourse.courses!.price}
              isPurchased={true}
              purchasedAt={userCourse.purchased_at}
              durationDays={userCourse.courses!.duration_days}
              progress={userCourse.courses!.progress || 0} // Pass calculated progress
              lessonsCompleted={userCourse.courses!.lessonsCompleted || 0} // Pass calculated lessonsCompleted
              totalLessons={userCourse.courses!.lessons_count || 0} // Pass total lessons count
              partsCount={userCourse.courses!.parts_count}
              lessonsCount={userCourse.courses!.lessons_count}
              averageRating={userCourse.courses!.average_rating ?? 0}
              reviewCount={userCourse.courses!.review_count ?? 0}
              discountPercentage={userCourse.courses!.discount_percentage ?? 0}
              onReviewSubmitted={handleReviewSubmitted} // Pass review submitted callback
              hasUserReviewed={reviewedCourseIds.has(userCourse.courses!.id)} // NEW: Pass review status
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CourseHistoryPage;