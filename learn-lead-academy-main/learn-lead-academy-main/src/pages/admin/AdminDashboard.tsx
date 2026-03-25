import { useEffect, useState } from "react";
import { BookOpen, Users, Video, TrendingUp, DollarSign, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, type AdminDashboard } from "@/lib/api";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [data, setData]       = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setData)
      .catch((err) => toast.error(err.message ?? "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const formatRevenue = (v: number) => {
    if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`;
    if (v >= 1_000)   return `₹${(v / 1_000).toFixed(1)}K`;
    return `₹${v}`;
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const stats = [
    {
      label: "Total Courses",
      value: loading ? "—" : String(data?.totalCourses ?? 0),
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total Students",
      value: loading ? "—" : (data?.totalStudents ?? 0).toLocaleString(),
      icon: Users,
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      label: "Videos Uploaded",
      value: loading ? "—" : String(data?.totalVideos ?? 0),
      icon: Video,
      color: "bg-gold/10 text-gold-dark",
    },
    {
      label: "Revenue",
      value: loading ? "—" : formatRevenue(data?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "bg-purple-light/10 text-purple-light",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your academy.</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  : <TrendingUp className="w-4 h-4 text-green-500" />}
              </div>
              <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Enrollments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-primary" />
            Recent Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !data?.recentEnrollments?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No enrollments yet. They will appear here once students enroll.
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentEnrollments.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-hero flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                      {e.userName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{e.userName}</p>
                      <p className="text-xs text-muted-foreground">{e.courseName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(e.enrolledAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;