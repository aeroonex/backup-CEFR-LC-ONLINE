"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import CourseCard from "@/components/dashboard/CourseCard";
import { useSession } from "@/components/auth/SessionContextProvider";
import { showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner

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

const ActiveCoursesPage: React.FC = () => {
  const { session, isLoading, user, profile, refreshProfile } = useSession(); // Add profile to destructuring
  const navigate = useNavigate();
  const [activeCourses, setActiveCourses] = useState<UserCourse[]>([]);
  const [reviewedCourseIds, setReviewedCourseIds] = useState<Set<string>>(new Set()); // NEW: State for reviewed course IDs
  const [userLessonProgress, setUserLessonProgress] = useState<UserLessonProgress[]>([]); // NEW: State for user lesson progress
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); // Page-specific loading state

  const fetchActiveCourses = useCallback(async () => {
    if (!user || !profile) { // Ensure both user and profile are available
      setIsLoadingPageData(false);
      return;
    }

    // Ensure user.id is available before making Supabase calls
    if (!user.id) {
      console.error("[ActiveCoursesPage] User ID is missing when attempting to fetch active courses.");
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
        .eq('user_id', user.id);

      if (error) {
        console.error("[ActiveCoursesPage] Error fetching active courses:", error);
        showError(`Faol kurslarni yuklashda xato yuz berdi: ${error.message}`);
        setActiveCourses([]);
      } else {
        const validActiveCourses = (data || []).filter(
          (userCourse: UserCourse) => userCourse.courses !== null
        ) as UserCourse[];

        // NEW: Fetch user's lesson progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, course_id')
          .eq('user_id', user.id);

        if (progressError) {
          console.error("[ActiveCoursesPage] Error fetching user lesson progress:", progressError);
          setUserLessonProgress([]);
        } else {
          lessonProgress = progressData || [];
          setUserLessonProgress(lessonProgress);
        }

        // Calculate parts_count and lessons_count for each course
        const coursesWithCounts = validActiveCourses.map(userCourse => {
          const course = userCourse.courses!;
          const parts = course.course_parts || [];
          const parts_count = parts.length;
          const lessons_count = parts.reduce((sum, part) => sum + (part.lessons?.length || 0), 0);

          // NEW: Calculate lessonsCompleted and progress
          const lessonsCompleted = lessonProgress.filter(p => p.course_id === course.id).length;
          const progress = lessons_count > 0 ? Math.round((lessonsCompleted / lessons_count) * 100) : 0;

          return { ...userCourse, courses: { ...course, parts_count, lessons_count, lessonsCompleted, progress } };
        });

        setActiveCourses(coursesWithCounts);
      }

      // NEW: Fetch reviews for the current user
      const { data: userReviewsData, error: userReviewsError } = await supabase
        .from('course_reviews')
        .select('course_id')
        .eq('user_id', user.id);

      if (userReviewsError) {
        console.error("[ActiveCoursesPage] Error fetching user reviews:", userReviewsError);
        setReviewedCourseIds(new Set());
      } else {
        reviewedIds = new Set(userReviewsData?.map(review => review.course_id) || []);
        setReviewedCourseIds(reviewedIds);
      }

    } catch (error: any) {
      console.error("[ActiveCoursesPage] General error in fetchActiveCourses data:", error.message || error);
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
      fetchActiveCourses();
    } else if (!isLoading && !session) {
      setIsLoadingPageData(false);
    }
  }, [isLoading, session, user, profile, fetchActiveCourses]);

  const handleReviewSubmitted = useCallback(async () => {
    await fetchActiveCourses(); // Refresh active courses to update review status
  }, [fetchActiveCourses]);

  if (isLoading || isLoadingPageData) { // Use combined loading state, ensure profile is loaded
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Mening Faol Kurslarim</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeCourses.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">Hozircha faol kurslaringiz mavjud emas. <Link to="/courses" className="text-ferrari-red hover:underline">Kurslarni ko'rish</Link></p>
        ) : (
          activeCourses.map((userCourse) => (
            <CourseCard
              key={userCourse.id}
              id={userCourse.courses!.id}
              imageSrc={userCourse.courses!.image_url || "https://placehold.co/550x350/FF2800/FFFFFF?text=Kurs+Rasmi"}
              title={userCourse.courses!.title}
              description={userCourse.courses!.description} // Pass description
              category={userCourse.courses!.category} // Pass category
              price={userCourse.courses!.price}
              isPurchased={true}
              purchasedAt={userCourse.purchased_at} // Pass purchased_at
              durationDays={userCourse.courses!.duration_days} // Pass duration_days
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

export default ActiveCoursesPage;