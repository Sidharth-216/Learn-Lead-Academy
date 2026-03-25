// =============================================================================
// src/lib/api.ts
// =============================================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5216/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem("ll_access_token");
export const getRefreshToken = () => localStorage.getItem("ll_refresh_token");

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("ll_access_token",  access);
  localStorage.setItem("ll_refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("ll_access_token");
  localStorage.removeItem("ll_refresh_token");
  localStorage.removeItem("ll_user");
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> ?? {}),
  };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    clearTokens();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch { return false; }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  lessonCount: number;
  price: number;
  rating: number;
  studentCount: number;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseThumbnailUrl?: string;
  instructor: string;
  duration: string;
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  enrolledCourses: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Video {
  id: string;
  fileName: string;
  courseId: string;
  lessonId?: string;
  courseName: string;
  formattedSize: string;
  mimeType: string;
  uploadedAt: string;
}

export interface AdminDashboard {
  totalCourses: number;
  totalStudents: number;
  totalVideos: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: {
    userName: string;
    userEmail: string;
    courseName: string;
    enrolledAt: string;
  }[];
}

export interface AcademySettings {
  id?: string;
  academyName: string;
  contactEmail: string;
  phone: string;
  about: string;
  logoUrl?: string;
}

// Add Lesson interface with the other interfaces
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isFree: boolean;
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  createdAt: string;
}

export type LessonResourceType = "notes" | "practice" | "starter";

export interface LessonResource {
  id: string;
  title: string;
  resourceType: LessonResourceType;
  url: string;
  isExternalLink: boolean;
  courseId: string;
  courseName: string;
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  lessonIsFree: boolean;
  formattedSize: string;
  mimeType: string;
  uploadedAt: string;
}

// Add this to coursesApi object
// getLessons: (courseId: string) => request<Lesson[]>(`/courses/${courseId}/lessons`),

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  adminLogin: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/admin/login", { method: "POST", body: JSON.stringify(body) }),

  logout: async () => {
    await request<void>("/auth/logout", { method: "POST" }).catch(() => {});
    clearTokens();
  },

  persist: (data: AuthResponse) => {
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("ll_user", JSON.stringify(data.user));
  },

  currentUser: (): AuthUser | null => {
    const raw = localStorage.getItem("ll_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },

  isLoggedIn: (): boolean => {
    const token = getAccessToken();
    return !!token && token.length > 0;
  },

  isAdmin: (): boolean => authApi.currentUser()?.role === "Admin",
};

// ── Courses API ───────────────────────────────────────────────────────────────
export const coursesApi = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page)     qs.set("page",     String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.category) qs.set("category", params.category);
    if (params?.search)   qs.set("search",   params.search);
    return request<PagedResult<Course>>(`/courses?${qs}`);
  },
  getById:      (id: string)       => request<Course>(`/courses/${id}`),
  getCategories: ()                => request<string[]>("/courses/categories"),
  getLessons:   (courseId: string) => request<Lesson[]>(`/courses/${courseId}/lessons`),
  getResources: (courseId: string) => request<LessonResource[]>(`/courses/${courseId}/resources`),
};
// ── User API ──────────────────────────────────────────────────────────────────
export const userApi = {
  getMe: () => request<AuthUser>("/users/me"),

  getEnrollments: () => request<Enrollment[]>("/users/me/enrollments"),

  enroll: (courseId: string) =>
    request<Enrollment>(`/users/me/enroll/${courseId}`, { method: "POST" }),

  updateProgress: (courseId: string, progressPercent: number) =>
    request<Enrollment>(`/users/me/progress/${courseId}`, {
      method: "PATCH",
      body:   JSON.stringify({ progressPercent }),
    }),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () => request<AdminDashboard>("/admin/dashboard"),

  getUsers: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)     qs.set("page",     String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.search)   qs.set("search",   params.search ?? "");
    return request<PagedResult<AdminUser>>(`/admin/users?${qs}`);
  },

  updateUserStatus: (id: string, status: "Active" | "Suspended") =>
    request<AdminUser>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body:   JSON.stringify({ status }),
    }),

  getAdminCourses: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)     qs.set("page",     String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.search)   qs.set("search",   params.search ?? "");
    return request<PagedResult<Course>>(`/admin/courses?${qs}`);
  },

  createCourse: (body: Partial<Course>) =>
    request<Course>("/admin/courses", { method: "POST", body: JSON.stringify(body) }),

  updateCourse: (id: string, body: Partial<Course>) =>
    request<Course>(`/admin/courses/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  deleteCourse: (id: string) =>
    request<void>(`/admin/courses/${id}`, { method: "DELETE" }),

  getVideos: (params?: { page?: number; pageSize?: number; courseId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)     qs.set("page",     String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.courseId) qs.set("courseId", params.courseId);
    return request<PagedResult<Video>>(`/admin/videos?${qs}`);
  },

  createVideo: (body: {
    fileName: string;
    courseId: string;
    lessonId?: string;
    storagePath: string;
    sizeBytes: number;
    mimeType?: string;
  }) => request<Video>("/admin/videos", { method: "POST", body: JSON.stringify(body) }),

  uploadVideo: (body: { file: File; courseId: string; lessonId?: string }) => {
    const form = new FormData();
    form.append("file", body.file);
    form.append("courseId", body.courseId);
    if (body.lessonId) form.append("lessonId", body.lessonId);

    return request<Video>("/admin/videos/upload", { method: "POST", body: form });
  },

  uploadVideoLink: (body: { youtubeUrl: string; courseId: string; lessonId?: string; title?: string }) =>
    request<Video>("/admin/videos/link", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteVideo: (id: string) =>
    request<void>(`/admin/videos/${id}`, { method: "DELETE" }),

  getResources: (params?: { page?: number; pageSize?: number; courseId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)     qs.set("page",     String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params?.courseId) qs.set("courseId", params.courseId);
    return request<PagedResult<LessonResource>>(`/admin/resources?${qs}`);
  },

  uploadResource: (body: {
    file: File;
    title: string;
    resourceType: LessonResourceType;
    courseId: string;
    lessonId: string;
  }) => {
    const form = new FormData();
    form.append("file", body.file);
    form.append("title", body.title);
    form.append("resourceType", body.resourceType);
    form.append("courseId", body.courseId);
    form.append("lessonId", body.lessonId);
    return request<LessonResource>("/admin/resources/upload", { method: "POST", body: form });
  },

  uploadResourceLink: (body: {
    title: string;
    resourceType: LessonResourceType;
    courseId: string;
    lessonId: string;
    externalUrl: string;
  }) => request<LessonResource>("/admin/resources/link", {
    method: "POST",
    body: JSON.stringify(body),
  }),

  deleteResource: (id: string) =>
    request<void>(`/admin/resources/${id}`, { method: "DELETE" }),

  getSettings: () => request<AcademySettings>("/admin/settings"),

  updateSettings: (body: AcademySettings) =>
    request<AcademySettings>("/admin/settings", { method: "PUT", body: JSON.stringify(body) }),
};

// ── Admin Lesson API ─────────────────────────────────────────────────────────────────

export const adminLessonsApi = {
  getLessons: (courseId: string) =>
    request<Lesson[]>(`/admin/courses/${courseId}/lessons`),

  createLesson: (courseId: string, body: {
    title: string;
    description?: string;
    duration?: string;
    order: number;
    isFree: boolean;
    videoId?: string;
  }) => request<Lesson>(`/admin/courses/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(body),
  }),

  updateLesson: (id: string, body: {
    title?: string;
    description?: string;
    duration?: string;
    order?: number;
    isFree?: boolean;
    videoId?: string;
  }) => request<Lesson>(`/admin/lessons/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  }),

  deleteLesson: (id: string) =>
    request<void>(`/admin/lessons/${id}`, { method: "DELETE" }),
  
  getCourseById: (id: string) => request<Course>(`/admin/courses/${id}`)
};