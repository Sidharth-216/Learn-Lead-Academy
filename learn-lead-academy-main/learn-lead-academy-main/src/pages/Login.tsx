import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(searchParams.get("tab") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const data = await authApi.register({
          name:     form.name.trim(),
          email:    form.email.trim(),
          password: form.password,
        });
        authApi.persist(data);
        toast.success("Account created! Welcome aboard 🎉");
        navigate("/dashboard");
      } else {
        const data = await authApi.login({
          email:    form.email.trim(),
          password: form.password,
        });
        authApi.persist(data);
        toast.success("Logged in successfully!");
        if (data.user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">GP Tech Academy</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-foreground mb-2">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignup ? "Start your learning journey today" : "Log in to continue learning"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl h-12"
                  required
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl h-12"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-xl h-12 pr-10"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignup && (
                <p className="text-xs text-muted-foreground mt-1">
                  Min 8 chars · uppercase · lowercase · number · special character
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-hero text-primary-foreground font-display font-bold rounded-xl h-12 text-base hover:opacity-90"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait...</>
                : isSignup ? "Create Account" : "Log In"}
            </Button>
          </form>

          {/* Toggle signup / login */}
          <p className="text-sm text-muted-foreground text-center mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => { setIsSignup(!isSignup); setForm({ name: "", email: "", password: "" }); }}
              className="text-primary font-semibold hover:underline"
            >
              {isSignup ? "Log in" : "Sign up"}
            </button>
          </p>

          {/* Admin login link */}
          <div className="mt-6 pt-6 border-t border-border">
            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/50 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Login
            </Link>
          </div>

        </div>
      </div>

      {/* Right – Decorative */}
      <div className="hidden lg:flex flex-1 bg-hero items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(42_90%_55%/0.1),transparent_60%)]" />
        <div className="text-center relative z-10 px-12">
          <GraduationCap className="w-24 h-24 text-accent mx-auto mb-8 animate-float" />
          <h2 className="font-display font-bold text-4xl text-primary-foreground mb-4">
            Learn Today<br /><span className="text-gradient-gold">Lead Tomorrow</span>
          </h2>
          <p className="text-primary-foreground/60 max-w-sm mx-auto">
            Join 10,000+ students building their future with in-demand tech skills.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;