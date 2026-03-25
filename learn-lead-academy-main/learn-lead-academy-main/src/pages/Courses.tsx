import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import { coursesApi, type Course } from "@/lib/api";
import { Loader2, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12;

  // Debounce search input by 400 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load categories once on mount
  useEffect(() => {
    coursesApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Reload courses whenever filter/search/page changes
  useEffect(() => {
    setLoading(true);
    setError("");
    coursesApi
      .getAll({
        page,
        pageSize: PAGE_SIZE,
        category: activeCategory === "All" ? undefined : activeCategory,
        search:   debouncedSearch || undefined,
      })
      .then((res) => {
        setCourses(res.items);
        setTotalPages(res.totalPages);
      })
      .catch((err) => setError(err.message ?? "Failed to load courses."))
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch, page]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground">
              Our <span className="text-gradient-gold">Courses</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Choose from our industry-aligned courses and start your journey today.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="rounded-full h-11"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-hero text-primary-foreground shadow-elevated"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-24">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && courses.length === 0 && (
            <div className="flex flex-col items-center py-24 gap-4 text-muted-foreground">
              <SearchX className="w-12 h-12" />
              <p className="text-lg">No courses found. Try a different search or category.</p>
            </div>
          )}

          {/* Course grid */}
          {!loading && !error && courses.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-primary/10 text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-primary/10 text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
