import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index        from "./pages/Index.tsx";
import Courses      from "./pages/Courses.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import Login        from "./pages/Login.tsx";
import Dashboard    from "./pages/Dashboard.tsx";
import NotFound     from "./pages/NotFound.tsx";
import AdminLayout  from "./layouts/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminCourses   from "./pages/admin/AdminCourses.tsx";
import AdminUsers     from "./pages/admin/AdminUsers.tsx";
import AdminVideos    from "./pages/admin/AdminVideos.tsx";
import AdminResources from "./pages/admin/AdminResources.tsx";
import AdminSettings  from "./pages/admin/AdminSettings.tsx";
import AdminLogin     from "./pages/admin/AdminLogin.tsx";
import AdminLessons   from "./pages/admin/AdminLessons.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"               element={<Index />} />
          <Route path="/courses"        element={<Courses />} />
          <Route path="/courses/:id"    element={<CourseDetail />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/dashboard"      element={<Dashboard />} />

          {/* Admin login — outside layout (no sidebar) */}
          <Route path="/admin/login"    element={<AdminLogin />} />

          {/* Admin panel — all inside AdminLayout (has sidebar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                              element={<AdminDashboard />} />
            <Route path="courses"                     element={<AdminCourses />} />
            <Route path="courses/:courseId/lessons"   element={<AdminLessons />} />
            <Route path="users"                       element={<AdminUsers />} />
            <Route path="videos"                      element={<AdminVideos />} />
            <Route path="resources"                   element={<AdminResources />} />
            <Route path="settings"                    element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;