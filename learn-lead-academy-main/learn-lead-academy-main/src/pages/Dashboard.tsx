import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Clock, Award, Bell, TrendingUp,
  GraduationCap, LogOut, LayoutDashboard, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authApi, userApi, coursesApi, type Enrollment, type AuthUser, type Course } from "@/lib/api";
import { toast } from "sonner";

const STATIC_NOTIFICATIONS = [
  { id: 1, text: "New lesson available in AI & Prompt Engineering", time: "2h ago" },
  { id: 2, text: "You earned a certificate for completing Module 3!",  time: "1d ago" },
  { id: 3, text: "Internship applications are now open",               time: "3d ago" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser]               = useState<AuthUser | null>(authApi.currentUser());
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!authApi.isLoggedIn()) {
      navigate("/login");
      return;
    }

    const init = async () => {
      try {
        const [freshUser, enrData, recData] = await Promise.all([
          userApi.getMe(),
          userApi.getEnrollments(),
          coursesApi.getAll({ page: 1, pageSize: 6 }),
        ]);
        setUser(freshUser);
        setEnrollments(enrData);

        // Recommended = published courses not already enrolled
        const enrolledIds = new Set(enrData.map((e) => e.courseId));
        setRecommended(recData.items.filter((c) => !enrolledIds.has(c.id)).slice(0, 6));
      } catch (err: any) {
        toast.error(err.message ?? "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate("/");
  };

  // ── Computed stats ──────────────────────────────────────────────────────────
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length)
    : 0;
  const certificates = enrollments.filter((e) => e.completedAt).length;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border h-16 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-hero flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">Dashboard</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-secondary transition"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            </button>
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-lg">
                Explore
              </Button>
            </Link>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-elevated p-4 space-y-3 z-50">
                <h3 className="font-display font-semibold text-sm text-foreground">Notifications</h3>
                {STATIC_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-secondary/50 text-sm">
                    <p className="text-foreground">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-hero flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? "S"}
          </div>

          {/* Logout */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-16 container mx-auto px-4">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-3xl text-foreground">
            Welcome back, {user?.name?.split(" ")[0] ?? "Student"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Continue where you left off.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen,    label: "Enrolled",      value: String(enrollments.length),  color: "bg-primary/10 text-primary" },
            { icon: Clock,       label: "Hours Learned",  value: String(enrollments.length * 14), color: "bg-accent/10 text-accent" },
            { icon: Award,       label: "Certificates",   value: String(certificates),        color: "bg-gold/10 text-gold-dark" },
            { icon: TrendingUp,  label: "Avg Progress",   value: `${avgProgress}%`,           color: "bg-purple-light/10 text-purple-light" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl bg-card border border-border shadow-card">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">
          <LayoutDashboard className="w-5 h-5 inline mr-2" />My Courses
        </h2>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border mb-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
            <Link to="/courses">
              <Button className="bg-hero text-primary-foreground rounded-xl">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {enrollments.map((e) => (
              <div key={e.id} className="p-6 rounded-2xl bg-card border border-border shadow-card">
                <div className="h-32 bg-hero rounded-xl mb-4 overflow-hidden">
                  {e.courseThumbnailUrl && (
                    <img src={e.courseThumbnailUrl} alt={e.courseTitle} className="w-full h-full object-cover" />
                  )}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-1">{e.courseTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3">by {e.instructor}</p>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-foreground">{e.progressPercent}%</span>
                </div>
                <Progress value={e.progressPercent} className="h-2" />
                {e.completedAt && (
                  <p className="text-xs text-green-600 font-medium mt-2">✓ Completed</p>
                )}
                <Link to={`/courses/${e.courseId}`}>
                  <Button className="w-full mt-4 bg-hero text-primary-foreground rounded-xl hover:opacity-90" size="sm">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <>
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">Recommended for You</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recommended.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-card border border-border shadow-card flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-hero flex-shrink-0 overflow-hidden">
                    {c.thumbnailUrl && (
                      <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.instructor} · {c.duration}</p>
                    <Link to={`/courses/${c.id}`} className="text-xs text-primary font-semibold hover:underline mt-1 inline-block">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
