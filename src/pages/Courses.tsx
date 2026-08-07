"use client";

import React, { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/dashboard/CourseCard";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useNavigate, Link } from "react-router-dom";
import { showError } from "@/utils/toast";
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  user_id: string;
  duration_days: number;
  is_active: boolean;
  created_at: string;
  average_rating: number | null; // Allow null from DB
  review_count: number | null; // Allow null from DB
  discount_percentage: number | null; // Allow null from DB
  course_parts?: Array<{
    id: string;
    lessons?: Array<{ id: string }>;
  }>;
  parts_count?: number;
  lessons_count?: number;
  lessonsCompleted?: number; // Added lessonsCompleted
  progress?: number; // Added progress
}

interface UserLessonProgress {
  lesson_id: string;
  course_id: string;
}

const Courses = () => {
  const { session, isLoading, user, profile, refreshProfile } = useSession();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());
  const [reviewedCourseIds, setReviewedCourseIds] = useState<Set<string>>(new Set());
  const [userLessonProgress, setUserLessonProgress] = useState<UserLessonProgress[]>([]); // NEW: State for user lesson progress
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllCourseData = useCallback(async () => {
    if (!user || !profile) {
      setIsLoadingPageData(false);
      return;
    }

    if (!user.id) {
      console.error("[CoursesPage] User ID is missing when attempting to fetch courses.");
      showError("Foydalanuvchi identifikatori topilmadi. Iltimos, qayta kiring.");
      setIsLoadingPageData(false);
      return;
    }

    setIsLoadingPageData(true);
    let purchasedIds = new Set<string>();
    let reviewedIds = new Set<string>();
    let lessonProgress: UserLessonProgress[] = []; // NEW: Local array for lesson progress

    try {
      // Fetch all active courses with their parts and lessons (to count them)
      // Also fetch average_rating, review_count, and discount_percentage
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          created_at,
          average_rating,
          review_count,
          discount_percentage,
          course_parts (
            id,
            lessons (
              id
            )
          )
        `)
        .eq('is_active', true);

      if (coursesError) {
        console.error("[CoursesPage] Error fetching courses:", coursesError);
        showError(`Kurslarni yuklashda xato yuz berdi: ${coursesError.message}`);
        setCourses([]);
        setIsLoadingPageData(false);
        return;
      }

      // Fetch purchased courses for the current user
      const { data: userCoursesData, error: userCoursesError } = await supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (userCoursesError) {
        console.error("[CoursesPage] Error fetching purchased courses:", userCoursesError);
        setPurchasedCourseIds(new Set());
      } else {
        purchasedIds = new Set(userCoursesData?.map(pc => pc.course_id) || []);
        setPurchasedCourseIds(purchasedIds);
      }

      // Fetch reviews for the current user
      const { data: userReviewsData, error: userReviewsError } = await supabase
        .from('course_reviews')
        .select('course_id')
        .eq('user_id', user.id);

      if (userReviewsError) {
        console.error("[CoursesPage] Error fetching user reviews:", userReviewsError);
        setReviewedCourseIds(new Set());
      } else {
        reviewedIds = new Set(userReviewsData?.map(review => review.course_id) || []);
        setReviewedCourseIds(reviewedIds);
      }

      // NEW: Fetch user's lesson progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, course_id')
        .eq('user_id', user.id);

      if (progressError) {
        console.error("[CoursesPage] Error fetching user lesson progress:", progressError);
        setUserLessonProgress([]);
      } else {
        lessonProgress = progressData || [];
        setUserLessonProgress(lessonProgress);
      }

      // Calculate parts_count and lessons_count for each course
      const coursesWithCounts = (coursesData || []).map(course => {
        const parts = course.course_parts || [];
        const parts_count = parts.length;
        const lessons_count = parts.reduce((sum, part) => sum + (part.lessons?.length || 0), 0);

        // NEW: Calculate lessonsCompleted and progress for purchased courses
        let lessonsCompleted = 0;
        let progress = 0;
        if (purchasedIds.has(course.id)) {
          lessonsCompleted = lessonProgress.filter(p => p.course_id === course.id).length;
          progress = lessons_count > 0 ? Math.round((lessonsCompleted / lessons_count) * 100) : 0;
        }

        return { ...course, parts_count, lessons_count, lessonsCompleted, progress };
      });

      // Sort courses: unpurchased first, then by created_at descending (newest first)
      const sortedCourses = coursesWithCounts.sort((a, b) => {
        const aIsPurchased = purchasedIds.has(a.id);
        const bIsPurchased = purchasedIds.has(b.id);

        if (!aIsPurchased && bIsPurchased) return -1;
        if (aIsPurchased && !bIsPurchased) return 1;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setCourses(sortedCourses);

    } catch (error: any) {
      console.error("[CoursesPage] General error in fetchAllCourseData:", error.message || error);
      showError(`Ma'lumotlarni yuklashda kutilmagan xato yuz berdi: ${error.message || 'Noma\'lum xato'}`);
      setCourses([]);
    } finally {
      setIsLoadingPageData(false);
    }
  }, [user, profile]);

  const handlePurchaseSuccess = useCallback(async () => {
    await fetchAllCourseData();
    await refreshProfile();
  }, [fetchAllCourseData, refreshProfile]);

  const handleReviewSubmitted = useCallback(async () => {
    await fetchAllCourseData(); // Refresh courses to update ratings/review counts and review status
  }, [fetchAllCourseData]);

  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  // useEffect(() => {
  //   if (!isLoading && !session) {
  //     showError("Bu sahifaga kirish uchun avval tizimga kiring.");
  //     navigate("/login");
  //   }
  // }, [session, isLoading, navigate]);

  useEffect(() => {
    if (!isLoading && session && user && profile) {
      fetchAllCourseData();
    } else if (!isLoading && !session) {
      setIsLoadingPageData(false);
    }
  }, [isLoading, session, user, profile, fetchAllCourseData]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingPageData) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Barcha Kurslar</h2>
        <div className="search">
          <input
            placeholder="Qidiruv..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Go</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">Hozircha kurslar mavjud emas. <Link to="/courses" className="text-ferrari-red hover:underline">Kurslarni ko'rish</Link></p>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              imageSrc={course.image_url || "https://placehold.co/550x350/FF2800/FFFFFF?text=Kurs+Rasmi"}
              title={course.title}
              description={course.description}
              category={course.category}
              price={course.price}
              isPurchased={purchasedCourseIds.has(course.id)}
              purchasedAt={course.created_at}
              durationDays={course.duration_days}
              partsCount={course.parts_count}
              lessonsCount={course.lessons_count}
              averageRating={course.average_rating ?? 0} // Ensure it's a number
              reviewCount={course.review_count ?? 0} // Ensure it's a number
              discountPercentage={course.discount_percentage ?? 0} // Ensure it's a number
              onPurchaseSuccess={handlePurchaseSuccess}
              onReviewSubmitted={handleReviewSubmitted} // Pass review submitted callback
              hasUserReviewed={reviewedCourseIds.has(course.id)} // NEW: Pass review status
              lessonsCompleted={course.lessonsCompleted || 0} // Pass calculated lessonsCompleted
              totalLessons={course.lessons_count || 0} // Pass total lessons count
              progress={course.progress || 0} // Pass calculated progress
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;