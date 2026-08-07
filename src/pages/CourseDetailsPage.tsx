"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'; // NEW: useRef added
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlayCircle, BookOpen, Video, ChevronDown, ArrowLeft, ArrowRight, Star, ShoppingBag, CheckCircle, Check, Loader2, Circle, Music } from 'lucide-react'; // Added Music icon
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import PurchaseCourseDialog from '@/components/courses/PurchaseCourseDialog';
import AnimatedPurchaseButton from '@/components/ui/AnimatedPurchaseButton';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components
import { Label } from "@/components/ui/label"; // Import Label for radio buttons

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  category: string;
  duration_days: number;
  average_rating: number;
  review_count: number;
  discount_percentage: number;
}

interface Lesson {
  id: string;
  title: string;
  video_url: string;
  description?: string;
  order_index: number;
}

interface CoursePart {
  id: string;
  title: string;
  description?: string;
  part_number: number;
  lessons: Lesson[];
}

interface ProfileData {
  username: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: ProfileData | null;
}

interface Exercise {
  id: string;
  lesson_id: string;
  question_text: string;
  type: 'multiple_choice' | 'open_ended' | 'listening'; // NEW: Added 'listening' type
  options: string[] | null; // For multiple choice
  correct_answer: string;
  order_index: number;
  audio_url?: string; // NEW: Optional audio URL for listening exercises
}

interface UserSubmission {
  id: string;
  user_id: string;
  exercise_id: string;
  submitted_answer: string;
  is_correct: boolean;
  submitted_at: string;
}

const findLessonNavigation = (courseParts: CoursePart[], currentLessonId: string | null) => {
  let prevLesson: Lesson | null = null;
  let nextLesson: Lesson | null = null;
  let foundCurrent = false;

  for (let i = 0; i < courseParts.length; i++) {
    const part = courseParts[i];
    for (let j = 0; j < part.lessons.length; j++) {
      const lesson = part.lessons[j];

      if (foundCurrent) {
        nextLesson = lesson;
        return { prevLesson, nextLesson };
      }

      if (lesson.id === currentLessonId) {
        foundCurrent = true;
        if (j > 0) {
          prevLesson = part.lessons[j - 1];
        } else if (i > 0) {
          const prevPart = courseParts[i - 1];
          if (prevPart && prevPart.lessons.length > 0) {
            prevLesson = prevPart.lessons[prevPart.lessons.length - 1];
          }
        }
      } else if (!foundCurrent) {
        prevLesson = lesson;
      }
    }
  }
  return { prevLesson, nextLesson };
};


const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, session, isLoading: isSessionLoading, profile, refreshProfile } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseParts, setCourseParts] = useState<CoursePart[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string | null>(null);
  const [selectedLessonDescription, setSelectedLessonDescription] = useState<string | null>(null);
  const [signedVideoUrl, setSignedVideoUrl] = useState<string | null>(null);
  const [prevNextLessons, setPrevNextLessons] = useState<{ prevLesson: Lesson | null, nextLesson: Lesson | null }>({ prevLesson: null, nextLesson: null });
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [monthlyPurchasesCount, setMonthlyPurchasesCount] = useState(0);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]); // NEW: State for exercises
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]); // NEW: State for user submissions
  const [selectedAnswers, setSelectedAnswers] = useState<{ [exerciseId: string]: string }>({}); // NEW: State for selected answers
  const [isSubmittingExercise, setIsSubmittingExercise] = useState(false); // NEW: State for exercise submission loading
  const [showScore, setShowScore] = useState(false); // NEW: State to show score
  const [score, setScore] = useState(0); // NEW: State for the score
  const [totalExercises, setTotalExercises] = useState(0); // NEW: State for total exercises in lesson

  const audioRef = useRef<HTMLAudioElement>(null); // NEW: Ref for audio player

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId || !user || !profile) {
      setIsLoadingPageData(false);
      return;
    }

    setIsLoadingPageData(true);
    try {
      const { data: userCourseData, error: userCourseError } = await supabase
        .from('user_courses')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (userCourseError) {
        console.error("Error checking user course purchase:", userCourseError);
        showError("Kursga kirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.");
        navigate('/courses');
        return;
      }

      setIsPurchased(!!userCourseData);

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_parts (
            id,
            title,
            description,
            part_number,
            lessons (
              id,
              title,
              video_url,
              description,
              order_index
            )
          )
        `)
        .eq('id', courseId)
        .order('part_number', { foreignTable: 'course_parts', ascending: true })
        .order('order_index', { foreignTable: 'course_parts.lessons', ascending: true })
        .single();

      if (courseError) {
        console.error("Error fetching course details:", courseError);
        showError("Kurs ma'lumotlarini yuklashda xato yuz berdi.");
        navigate('/courses');
      } else if (courseData) {
        setCourse(courseData as Course);
        const parts = courseData.course_parts as CoursePart[];
        setCourseParts(parts);

        if (!!userCourseData && parts.length > 0 && parts[0].lessons.length > 0) {
          const firstLesson = parts[0].lessons[0];
          setSelectedLessonId(firstLesson.id);
          setSelectedLessonTitle(firstLesson.title);
          setSelectedLessonDescription(firstLesson.description || null);
          setOpenAccordionItems([`part-${parts[0].id}`]);
        }
      }

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('course_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (
            username
          )
        `)
        .eq('course_id', courseId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
        showError("Izohlarni yuklashda xato yuz berdi.");
        setReviews([]);
      } else {
        const mappedReviews: Review[] = (reviewsData as any[] || []).map((item: any) => ({
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          created_at: item.created_at,
          profiles: item.profiles ? { username: item.profiles.username || 'Noma\'lum foydalanuvchi' } : null,
        }));
        setReviews(mappedReviews);
      }

      const today = new Date();
      const monthStart = format(startOfMonth(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const monthEnd = format(endOfMonth(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const { count: monthlyCount, error: monthlyCountError } = await supabase
        .from('user_courses')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .gte('purchased_at', monthStart)
        .lt('purchased_at', monthEnd);

      if (monthlyCountError) {
        console.error("Error fetching monthly purchases count:", monthlyCountError);
        setMonthlyPurchasesCount(0);
      } else {
        setMonthlyPurchasesCount(monthlyCount || 0);
      }

    } catch (error) {
      console.error("Error in fetching course details data:", error);
      showError("Ma'lumotlarni yuklashda kutilmagan xato yuz berdi.");
    } finally {
      setIsLoadingPageData(false);
    }
  }, [courseId, user, profile, navigate]);

  const checkLessonCompletion = useCallback(async () => {
    if (!user || !selectedLessonId) {
      setIsLessonCompleted(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', selectedLessonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setIsLessonCompleted(!!data);
    } catch (error: any) {
      console.error("Darslik tugallanganligini tekshirishda xato:", error);
      setIsLessonCompleted(false);
    }
  }, [user, selectedLessonId]);

  // NEW: Effect to fetch exercises and user submissions for the selected lesson
  const fetchExercisesAndSubmissions = useCallback(async () => {
    if (!user || !selectedLessonId || !isPurchased) {
      setExercises([]);
      setUserSubmissions([]);
      setSelectedAnswers({});
      setShowScore(false); // Reset score display
      setScore(0); // Reset score
      setTotalExercises(0); // Reset total exercises
      return;
    }

    try {
      // Fetch exercises for the selected lesson
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('lesson_id', selectedLessonId)
        .order('order_index', { ascending: true });

      if (exercisesError) {
        throw exercisesError;
      }
      setExercises(exercisesData || []);
      setTotalExercises((exercisesData || []).length);

      // Fetch user's submissions for these exercises
      const exerciseIds = (exercisesData || []).map(ex => ex.id);
      if (exerciseIds.length > 0) {
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('user_exercise_submissions')
          .select('*')
          .eq('user_id', user.id)
          .in('exercise_id', exerciseIds);

        if (submissionsError) {
          throw submissionsError;
        }
        setUserSubmissions(submissionsData || []);

        // Pre-fill selected answers if submissions exist
        const initialSelectedAnswers: { [exerciseId: string]: string } = {};
        (submissionsData || []).forEach(submission => {
          initialSelectedAnswers[submission.exercise_id] = submission.submitted_answer;
        });
        setSelectedAnswers(initialSelectedAnswers);

        // Calculate score if all exercises are submitted
        if (submissionsData && submissionsData.length === (exercisesData || []).length && (exercisesData || []).length > 0) {
          const correctCount = submissionsData.filter(sub => sub.is_correct).length;
          setScore(correctCount);
          setShowScore(true);
        } else {
          setShowScore(false);
          setScore(0);
        }

      } else {
        setUserSubmissions([]);
        setSelectedAnswers({});
        setShowScore(false);
        setScore(0);
      }

    } catch (error: any) {
      console.error("Mashqlarni yoki foydalanuvchi javoblarini yuklashda xato:", error);
      showError("Mashqlarni yuklashda xato yuz berdi.");
      setExercises([]);
      setUserSubmissions([]);
      setSelectedAnswers({});
      setShowScore(false);
      setScore(0);
    }
  }, [user, selectedLessonId, isPurchased]);

  useEffect(() => {
    checkLessonCompletion();
    fetchExercisesAndSubmissions(); // Fetch exercises when lesson changes
  }, [checkLessonCompletion, fetchExercisesAndSubmissions]);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!selectedLessonId || !user || !courseId || !session?.access_token) {
        setSignedVideoUrl(null);
        return;
      }

      try {
        const response = await fetch(`https://bpeyprktacfufxonzjac.supabase.co/functions/v1/get-signed-video-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            lessonId: selectedLessonId,
            courseId: courseId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get signed video URL');
        }

        const data = await response.json();
        setSignedVideoUrl(data.signedUrl);
      } catch (error: any) {
        console.error("Error fetching signed video URL:", error);
        showError(`Video yuklashda xato: ${error.message}`);
        setSignedVideoUrl(null);
      }
    };

    if (isPurchased) {
      getSignedUrl();
    } else {
      setSignedVideoUrl(null);
    }
  }, [selectedLessonId, user, courseId, session?.access_token, isPurchased]);

  useEffect(() => {
    setPrevNextLessons(findLessonNavigation(courseParts, selectedLessonId));
  }, [selectedLessonId, courseParts]);


  // VAQTINCHALIK: login talabi o'chirilgan (TODO: qayta yoqish kerak)
  useEffect(() => {
    if (!isSessionLoading) {
      fetchCourseDetails();
    }
  }, [isSessionLoading, user, profile, navigate, fetchCourseDetails]);

  const handleLessonSelect = (lesson: Lesson, partId: string) => {
    setSelectedLessonId(lesson.id);
    setSelectedLessonTitle(lesson.title);
    setSelectedLessonDescription(lesson.description || null);
    setOpenAccordionItems([`part-${partId}`]);
    // Stop audio if playing when switching lessons
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handlePrevNextLesson = (lesson: Lesson | null) => {
    if (lesson) {
      const part = courseParts.find(p => p.lessons.some(l => l.id === lesson.id));
      if (part) {
        handleLessonSelect(lesson, part.id);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !courseId || !selectedLessonId || isMarkingComplete) return;

    setIsMarkingComplete(true);
    const toastId = showLoading("Darslik tugallangan deb belgilanmoqda...");

    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            lesson_id: selectedLessonId,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );

      if (error) {
        throw error;
      }
      showSuccess("Darslik muvaffaqiyatli tugallangan deb belgilandi!");
      setIsLessonCompleted(true);
      refreshProfile();
    } catch (error: any) {
      console.error("Darslikni tugallangan deb belgilashda xato:", error);
      showError(`Belgilashda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsMarkingComplete(false);
    }
  };

  const handlePurchaseSuccess = useCallback(() => {
    setIsPurchased(true);
    refreshProfile();
    fetchCourseDetails();
  }, [refreshProfile, fetchCourseDetails]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // NEW: Handle exercise answer selection
  const handleAnswerChange = (exerciseId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  // NEW: Handle exercise submission
  const handleSubmitExercise = async (exercise: Exercise) => {
    if (!user || !selectedLessonId || !selectedAnswers[exercise.id] || isSubmittingExercise) {
      showError("Iltimos, javobni tanlang.");
      return;
    }

    setIsSubmittingExercise(true);
    const toastId = showLoading("Javob yuborilmoqda...");

    try {
      const submittedAnswer = selectedAnswers[exercise.id];
      const isCorrect = submittedAnswer === exercise.correct_answer;

      const { error } = await supabase
        .from('user_exercise_submissions')
        .upsert(
          {
            user_id: user.id,
            exercise_id: exercise.id,
            submitted_answer: submittedAnswer,
            is_correct: isCorrect,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,exercise_id' }
        );

      if (error) {
        throw error;
      }

      if (isCorrect) {
        showSuccess("Javobingiz to'g'ri!");
      } else {
        showError("Javobingiz noto'g'ri. Qayta urinib ko'ring.");
      }
      await fetchExercisesAndSubmissions(); // Refresh submissions to show updated status and score
    } catch (error: any) {
      console.error("Mashq javobini yuborishda xato:", error);
      showError(`Javobni yuborishda xato: ${error.message || "Noma'lum xato"}`);
    } finally {
      dismissToast(toastId);
      setIsSubmittingExercise(false);
    }
  };

  if (isSessionLoading || isLoadingPageData) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-lg text-gray-700">Kurs topilmadi.</p>
      </div>
    );
  }

  const discountedPrice = course.discount_percentage > 0 ? course.price * (1 - course.discount_percentage / 100) : course.price;

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <Button variant="outline" onClick={() => navigate('/dashboard/active-courses')} className="self-start text-ferrari-red border-ferrari-red hover:bg-ferrari-red hover:text-white transition-colors">
        <ChevronLeft className="h-4 w-4 mr-2" /> Mening kurslarimga qaytish
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="shadow-lg border-t-4 border-ferrari-red bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-gray-900">{course.title}</CardTitle>
              <div className="text-gray-600">{course.description}</div>
            </CardHeader>
            <CardContent className="pt-0">
              {isPurchased ? (
                signedVideoUrl ? (
                  <div className="w-full bg-black rounded-lg overflow-hidden shadow-xl">
                    <video
                      controls
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      src={signedVideoUrl}
                      className="w-full h-auto max-h-[60vh] object-contain"
                      poster={course.image_url}
                    >
                      Sizning brauzeringiz video tegini qo'llab-quvvatlamaydi.
                    </video>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500 text-lg">
                    Video darslik tanlanmagan yoki yuklanmoqda...
                  </div>
                )
              ) : (
                <div className="w-full h-64 bg-gray-200 flex flex-col items-center justify-center rounded-lg text-gray-500 text-lg p-4">
                  <Video className="h-16 w-16 mb-4 text-gray-400" />
                  <p className="text-center">Bu kursni sotib olmagansiz. Darsliklarni ko'rish uchun kursni xarid qiling.</p>
                  <AnimatedPurchaseButton
                    onClick={() => setIsPurchaseDialogOpen(true)}
                  >
                    1 klikda xarid qilish
                  </AnimatedPurchaseButton>
                </div>
              )}

              {selectedLessonTitle && isPurchased && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-2xl font-bold text-ferrari-red mb-2">{selectedLessonTitle}</h4>
                  {selectedLessonDescription && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between text-gray-700 hover:text-ferrari-red">
                          <span>Darslik tavsifi</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="text-gray-700 mt-2 whitespace-pre-wrap">
                        {selectedLessonDescription}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              {isPurchased && (
                <div className="flex justify-between mt-6 space-x-4">
                  <Button
                    onClick={() => handlePrevNextLesson(prevNextLessons.prevLesson)}
                    disabled={!prevNextLessons.prevLesson}
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Oldingi dars
                  </Button>
                  {selectedLessonId && (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isMarkingComplete || isLessonCompleted}
                      className={`flex-1 ${isLessonCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {isMarkingComplete ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Belgilanmoqda...
                        </>
                      ) : isLessonCompleted ? (
                        <>
                          <Check className="h-4 w-4 mr-2" /> Tugallangan
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" /> Tugatildi deb belgilash
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handlePrevNextLesson(prevNextLessons.nextLesson)}
                    disabled={!prevNextLessons.nextLesson}
                    className="flex-1 bg-ferrari-red hover:bg-red-700 text-white"
                  >
                    Keyingi dars <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {!isPurchased && (
            <Card className="shadow-lg border-t-4 border-green-500 bg-white p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">Kurs haqida</CardTitle>
              <div className="flex items-center text-gray-700 mb-2">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                <span>Qismlar soni: <strong className="text-ferrari-red">{courseParts.length || 0}</strong> ta</span>
              </div>
              <div className="flex items-center text-gray-700 mb-4">
                <Video className="h-5 w-5 mr-2 text-green-500" />
                <span>Video darsliklar soni: <strong className="text-ferrari-red">{courseParts.reduce((sum, part) => sum + part.lessons.length, 0)}</strong> ta</span>
              </div>
              <div className="flex items-center text-gray-700 mb-4">
                <ShoppingBag className="h-5 w-5 mr-2 text-orange-500" />
                <span>Bu oy sotib olganlar: <strong className="text-ferrari-red">{monthlyPurchasesCount}</strong> kishi</span>
              </div>
              <div className="mt-4">
                {course.discount_percentage > 0 && (
                  <p className="text-lg text-gray-500 line-through">{course.price.toLocaleString()} UZS</p>
                )}
                <p className="text-4xl font-extrabold text-ferrari-red">
                  {discountedPrice.toLocaleString()} UZS
                </p>
              </div>
              <AnimatedPurchaseButton
                onClick={() => setIsPurchaseDialogOpen(true)}
                disabled={false}
              >
                1 klikda xarid qilish
              </AnimatedPurchaseButton>
            </Card>
          )}

          <Card className="shadow-lg border-t-4 border-green-500 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Izohlar ({course.review_count})
              </CardTitle>
              <div className="text-gray-600 flex items-center">
                <div className="flex items-center mr-2">
                  {renderStars(Math.round(course.average_rating))}
                </div>
                <span className="font-semibold text-ferrari-red">{course.average_rating.toFixed(1)}</span> o'rtacha reyting
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500">Bu kurs uchun hali izohlar mavjud emas.</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <span className="font-semibold text-gray-800 mr-2">{review.profiles?.username || "Noma'lum foydalanuvchi"}</span>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-3 text-sm text-gray-500">{format(new Date(review.created_at), 'dd.MM.yyyy')}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
              {reviews.length > 0 && (
                <div className="text-center mt-6">
                  <Button variant="outline" className="text-ferrari-red border-ferrari-red hover:bg-ferrari-red hover:text-white">
                    Hamma sharhlarni ko'rish
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="shadow-lg border-t-4 border-blue-500 bg-white lg:sticky lg:top-6 lg:max-h-[calc(100vh-24px)] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Kurs Ma'lumotlari</CardTitle>
              <CardDescription className="text-gray-600">Kurs tavsifi, ko'rsatmalar va darsliklar.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="content" className="w-full"> {/* Changed default value to 'content' */}
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-gray-200 bg-gray-50">
                  <TabsTrigger value="content" className="rounded-none data-[state=active]:bg-ferrari-red data-[state=active]:text-white">Tarkib</TabsTrigger> {/* NEW: Content tab */}
                  <TabsTrigger value="exercises" className="rounded-none data-[state=active]:bg-ferrari-red data-[state=active]:text-white">Mashqlar</TabsTrigger> {/* NEW: Exercises tab */}
                  <TabsTrigger value="instructions" className="rounded-none data-[state=active]:bg-ferrari-red data-[state=active]:text-white">Ko'rsatma</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="p-0"> {/* NEW: Content tab content */}
                  {courseParts.length === 0 ? (
                    <p className="text-gray-500 p-4">Bu kurs uchun darsliklar hali yuklanmagan.</p>
                  ) : (
                    <Accordion
                      type="multiple"
                      value={openAccordionItems}
                      onValueChange={setOpenAccordionItems}
                      className="w-full"
                    >
                      {courseParts.map((part) => (
                        <AccordionItem key={part.id} value={`part-${part.id}`} className="border-b last:border-b-0">
                          <AccordionTrigger className="flex justify-between items-center py-4 px-4 text-lg font-semibold text-gray-800 hover:text-ferrari-red transition-colors">
                            <span className="flex items-center">
                              <BookOpen className="h-5 w-5 mr-3 text-blue-500" />
                              {part.part_number}. {part.title}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-2 py-2 bg-gray-50 border-t border-gray-100">
                            {part.description && <p className="text-gray-600 mb-4 px-6 text-sm">{part.description}</p>}
                            {part.lessons.length === 0 ? (
                              <p className="text-gray-500 pl-8 text-sm">Bu bo'limda darsliklar mavjud emas.</p>
                            ) : (
                              <div className="space-y-1">
                                {part.lessons.map((lesson) => (
                                  <Button
                                    key={lesson.id}
                                    variant="ghost"
                                    className={`w-full justify-start text-left py-3 px-4 rounded-lg transition-colors ${
                                      selectedLessonId === lesson.id && isPurchased ? 'bg-ferrari-red text-white hover:bg-red-700' : 'hover:bg-gray-100 text-gray-700'
                                    } ${!isPurchased ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => isPurchased && handleLessonSelect(lesson, part.id)}
                                    disabled={!isPurchased}
                                  >
                                    <PlayCircle className="h-5 w-5 mr-3" />
                                    {lesson.order_index}. {lesson.title}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
                <TabsContent value="exercises" className="p-4 text-gray-700"> {/* NEW: Exercises tab content */}
                  {!isPurchased ? (
                    <p className="text-gray-500">Mashqlarni ko'rish uchun kursni xarid qiling.</p>
                  ) : !selectedLessonId ? (
                    <p className="text-gray-500">Mashqlarni ko'rish uchun darslik tanlang.</p>
                  ) : exercises.length === 0 ? (
                    <p className="text-gray-500">Bu darslik uchun mashqlar hali yuklanmagan.</p>
                  ) : (
                    <div className="space-y-6">
                      {showScore && (
                        <Card className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-semibold text-center">
                          Siz {totalExercises} ta mashqdan {score} tasini to'g'ri bajardingiz!
                        </Card>
                      )}
                      {exercises.map((exercise, index) => {
                        const userSubmission = userSubmissions.find(sub => sub.exercise_id === exercise.id);
                        const isSubmitted = !!userSubmission;
                        const isCorrect = userSubmission?.is_correct;

                        return (
                          <Card key={exercise.id} className="p-4 border-l-4 border-blue-500">
                            {exercise.type === 'listening' && exercise.audio_url && (
                              <div className="mb-4">
                                <h4 className="text-lg font-semibold flex items-center mb-2">
                                  <Music className="h-5 w-5 mr-2 text-purple-500" /> Audio tinglang:
                                </h4>
                                <audio ref={audioRef} controls src={exercise.audio_url} className="w-full"></audio>
                              </div>
                            )}
                            <CardTitle className="text-lg font-semibold mb-3">
                              {index + 1}. {exercise.question_text}
                            </CardTitle>
                            {(exercise.type === 'multiple_choice' || exercise.type === 'listening') && exercise.options && (
                              <RadioGroup
                                value={selectedAnswers[exercise.id] || ''}
                                onValueChange={(value) => handleAnswerChange(exercise.id, value)}
                                disabled={isSubmitted || isSubmittingExercise}
                              >
                                {exercise.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center space-x-2 mb-2">
                                    <RadioGroupItem
                                      value={option}
                                      id={`ex-${exercise.id}-opt-${optIndex}`}
                                      className={
                                        isSubmitted && option === exercise.correct_answer
                                          ? 'border-green-500 text-green-500'
                                          : isSubmitted && option === userSubmission?.submitted_answer && !isCorrect
                                            ? 'border-red-500 text-red-500'
                                            : ''
                                      }
                                    />
                                    <Label
                                      htmlFor={`ex-${exercise.id}-opt-${optIndex}`}
                                      className={
                                        isSubmitted && option === exercise.correct_answer
                                          ? 'text-green-600 font-medium'
                                          : isSubmitted && option === userSubmission?.submitted_answer && !isCorrect
                                            ? 'text-red-600 font-medium'
                                            : 'text-gray-800'
                                      }
                                    >
                                      {option}
                                      {isSubmitted && option === exercise.correct_answer && (
                                        <Check className="inline-block h-4 w-4 ml-2 text-green-500" />
                                      )}
                                      {isSubmitted && option === userSubmission?.submitted_answer && !isCorrect && (
                                        <Circle className="inline-block h-4 w-4 ml-2 text-red-500" /> // Changed from CircleOff to Circle for consistency
                                      )}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}
                            {/* Add handling for 'open_ended' type if needed */}
                            <div className="mt-4">
                              {isSubmitted ? (
                                <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {isCorrect ? "Sizning javobingiz to'g'ri!" : `Sizning javobingiz noto'g'ri. To'g'ri javob: "${exercise.correct_answer}"`}
                                </p>
                              ) : (
                                <Button
                                  onClick={() => handleSubmitExercise(exercise)}
                                  disabled={isSubmittingExercise || !selectedAnswers[exercise.id]}
                                  className="bg-ferrari-red hover:bg-red-700 text-white"
                                >
                                  {isSubmittingExercise ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuborilmoqda...
                                    </>
                                  ) : (
                                    "Javobni yuborish"
                                  )}
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="instructions" className="p-4 text-gray-700">
                  <p>Bu kursdan maksimal foydalanish uchun quyidagi ko'rsatmalarga amal qiling:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Har bir darsni diqqat bilan tomosha qiling.</li>
                    <li>Berilgan topshiriqlarni o'z vaqtida bajaring.</li>
                    <li>Savollaringiz bo'lsa, forumda yoki ustozdan so'rang.</li>
                    <li>Muntazam ravishda takrorlashni unutmang.</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <PurchaseCourseDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        coursePrice={discountedPrice}
        coursePartsCount={courseParts.length}
        courseLessonsCount={courseParts.reduce((sum, part) => sum + part.lessons.length, 0)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};

export default CourseDetailsPage;