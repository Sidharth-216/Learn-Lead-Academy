import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Users, BookOpen, Star,
  Play, Download, Loader2, CheckCircle, Lock, Video, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { coursesApi, userApi, authApi, type Course, type Lesson, type LessonResource } from "@/lib/api";
import { toast } from "sonner";

const getYoutubeEmbedUrl = (url?: string) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.replace("/", "");
    } else if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/").filter(Boolean).at(-1) ?? null;
      }
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course,    setCourse]    = useState<Course | null>(null);
  const [lessons,   setLessons]   = useState<Lesson[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled,  setEnrolled]  = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [error,     setError]     = useState("");

  // Load course + lessons in parallel
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      coursesApi.getById(id),
      coursesApi.getLessons(id).catch(() => [] as Lesson[]), // lessons may be empty — don't fail
      coursesApi.getResources(id).catch(() => [] as LessonResource[]),
    ])
      .then(([courseData, lessonData, resourceData]) => {
        setCourse(courseData);
        setLessons(lessonData);
        setResources(resourceData);
      })
      .catch((err) => setError(err.message ?? "Course not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // Check enrollment status
  useEffect(() => {
    if (!id || !authApi.isLoggedIn()) return;
    userApi
      .getEnrollments()
      .then((enrollments) => setEnrolled(enrollments.some((e) => e.courseId === id)))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    const firstPlayable = lessons.find((lesson) =>
      (lesson.isFree || enrolled) && !!lesson.videoUrl
    );
    setActiveLessonId(firstPlayable?.id ?? null);
  }, [lessons, enrolled]);

  const handleEnroll = async () => {
    if (!authApi.isLoggedIn()) {
      navigate("/login?tab=signup");
      return;
    }
    if (!id) return;
    setEnrolling(true);
    try {
      await userApi.enroll(id);
      setEnrolled(true);
      toast.success("Successfully enrolled! Head to your dashboard to start learning.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message ?? "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">{error || "Course not found."}</p>
          <Link to="/courses">
            <Button variant="outline">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  const canPlayActive = !!activeLesson && (activeLesson.isFree || enrolled) && !!activeLesson.videoUrl;
  const youtubeEmbedUrl = getYoutubeEmbedUrl(activeLesson?.videoUrl);
  const resourceTypeLabel = (type: LessonResource["resourceType"]) => {
    if (type === "notes") return "Notes";
    if (type === "practice") return "Practice Questions";
    return "Project Starter Files";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">

        {/* Hero */}
        <div className="bg-hero py-16">
          <div className="container mx-auto px-4">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            <div className="max-w-3xl">
              <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-xs font-semibold text-accent">
                {course.category}
              </span>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-primary-foreground mt-4 mb-4">
                {course.title}
              </h1>
              <p className="text-primary-foreground/70 mb-6 leading-relaxed">
                {course.description}
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  {course.rating.toFixed(1)} rating
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.studentCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.lessonCount} lessons
                </span>
              </div>
              <p className="text-sm text-primary-foreground/60 mt-3">
                Instructor: {course.instructor}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left – Curriculum & Resources */}
            <div className="lg:col-span-2">
              <h2 className="font-display font-bold text-2xl text-foreground mb-4">
                Lesson Player
              </h2>

              <div className="bg-card border border-border rounded-xl p-4 mb-8">
                {canPlayActive ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="w-4 h-4 text-primary" />
                      <p className="font-medium text-sm text-foreground">
                        {activeLesson?.title}
                      </p>
                    </div>
                    {youtubeEmbedUrl ? (
                      <iframe
                        key={activeLesson?.id}
                        className="w-full rounded-lg bg-black aspect-video"
                        src={youtubeEmbedUrl}
                        title={activeLesson?.title ?? "YouTube video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={activeLesson?.id}
                        controls
                        className="w-full rounded-lg bg-black"
                        src={activeLesson?.videoUrl}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    {enrolled
                      ? "No playable video is linked to the selected lesson yet."
                      : "Enroll to unlock lesson videos (free lessons are available without enrollment)."}
                  </div>
                )}
              </div>

              <h2 className="font-display font-bold text-2xl text-foreground mb-6">
                Course Curriculum
              </h2>

              {lessons.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Curriculum coming soon. Enroll now to get notified when lessons are added.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson) => {
                    const canView = lesson.isFree || enrolled;
                    const canPlay = canView && !!lesson.videoUrl;
                    const isActive = activeLessonId === lesson.id;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (canPlay) setActiveLessonId(lesson.id);
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl bg-card border border-border transition-shadow ${
                          canPlay ? "hover:shadow-card cursor-pointer" : "opacity-80"
                        } ${isActive ? "ring-1 ring-primary/40" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            {canView
                              ? <Play className="w-4 h-4 text-primary" />
                              : <Lock className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration}
                              {canPlay ? " · Click to play" : " · Video not linked"}
                            </p>
                          </div>
                        </div>
                        {lesson.isFree && (
                          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full flex-shrink-0">
                            Free
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <h2 className="font-display font-bold text-2xl text-foreground mt-12 mb-6">
                Resources
              </h2>
              {lessons.length === 0 ? (
                <div className="text-center py-10 bg-card rounded-xl border border-border text-sm text-muted-foreground">
                  Resources will appear here once lessons are added.
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson) => {
                    const lessonResources = resources.filter((resource) => resource.lessonId === lesson.id);
                    const grouped = {
                      notes: lessonResources.filter((resource) => resource.resourceType === "notes"),
                      practice: lessonResources.filter((resource) => resource.resourceType === "practice"),
                      starter: lessonResources.filter((resource) => resource.resourceType === "starter"),
                    };
                    const canAccessLessonResources = lesson.isFree || enrolled;

                    return (
                      <div key={lesson.id} className="rounded-xl bg-card border border-border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-medium text-foreground text-sm">
                            Lesson {lesson.order}: {lesson.title}
                          </p>
                          {lesson.isFree ? (
                            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                              Free
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {enrolled ? "Enrolled access" : "Locked until enrolled"}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {(["notes", "practice", "starter"] as const).map((type) => {
                            const items = grouped[type];
                            return (
                              <div key={type}>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  {resourceTypeLabel(type)}
                                </p>
                                {items.length === 0 ? (
                                  <div className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3">
                                    No {resourceTypeLabel(type).toLowerCase()} added yet.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {items.map((resource) => (
                                      <div
                                        key={resource.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-3"
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm text-foreground truncate">{resource.title}</p>
                                          <p className="text-xs text-muted-foreground">{resource.formattedSize}</p>
                                        </div>
                                        {canAccessLessonResources ? (
                                          <a href={resource.url} target="_blank" rel="noreferrer">
                                            <Button variant="ghost" size="sm">
                                              {resource.isExternalLink
                                                ? <ExternalLink className="w-4 h-4" />
                                                : <Download className="w-4 h-4" />}
                                            </Button>
                                          </a>
                                        ) : (
                                          <Button variant="ghost" size="sm" disabled>
                                            <Lock className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right – Enroll card */}
            <div>
              <div className="sticky top-24 p-6 rounded-2xl bg-card border border-border shadow-elevated">
                <p className="font-display font-bold text-3xl text-primary mb-1">
                  ₹{course.price.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  One-time payment • Lifetime access
                </p>

                {enrolled ? (
                  <div className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    You are enrolled
                  </div>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-gold-gradient text-accent-foreground font-display font-bold rounded-xl py-6 text-lg shadow-gold"
                  >
                    {enrolling
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enrolling...</>
                      : authApi.isLoggedIn() ? "Enroll Now" : "Sign up to Enroll"}
                  </Button>
                )}

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <p>✓ Certificate of completion</p>
                  <p>✓ Lifetime access to materials</p>
                  <p>✓ Internship assistance</p>
                  <p>✓ 1-on-1 mentorship sessions</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;