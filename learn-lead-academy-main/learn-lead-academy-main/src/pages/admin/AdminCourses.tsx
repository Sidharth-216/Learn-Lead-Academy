import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { adminApi, type Course } from "@/lib/api";
import { toast } from "sonner";

type CourseForm = {
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  lessonCount: number;
  price: number;
  rating: number;
  thumbnailUrl: string;
  isPublished: boolean;
};

const emptyForm: CourseForm = {
  title:        "",
  category:     "",
  description:  "",
  instructor:   "",
  duration:     "",
  lessonCount:  0,
  price:        0,
  rating:       0,
  thumbnailUrl: "",
  isPublished:  false,
};

const AdminCourses = () => {
  const navigate = useNavigate();

  const [courses,         setCourses]         = useState<Course[]>([]);
  const [total,           setTotal]           = useState(0);
  const [page,            setPage]            = useState(1);
  const [totalPages,      setTotalPages]      = useState(1);
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [deleting,        setDeleting]        = useState<string | null>(null);
  const [editingCourse,   setEditingCourse]   = useState<Course | null>(null);
  const [formData,        setFormData]        = useState<CourseForm>(emptyForm);
  const [dialogOpen,      setDialogOpen]      = useState(false);

  // Raw string states for decimal inputs
  const [priceRaw,  setPriceRaw]  = useState("");
  const [ratingRaw, setRatingRaw] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load courses
  useEffect(() => {
    setLoading(true);
    adminApi
      .getAdminCourses({ page, pageSize: 20, search: debouncedSearch || undefined })
      .then((res) => {
        setCourses(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load courses."))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  const openAdd = () => {
    setEditingCourse(null);
    setFormData(emptyForm);
    setPriceRaw("");
    setRatingRaw("");
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title:        course.title,
      category:     course.category,
      description:  course.description,
      instructor:   course.instructor,
      duration:     course.duration,
      lessonCount:  course.lessonCount,
      price:        course.price,
      rating:       course.rating,
      thumbnailUrl: course.thumbnailUrl ?? "",
      isPublished:  course.isPublished,
    });
    setPriceRaw(course.price === 0 ? "" : String(course.price));
    setRatingRaw(course.rating === 0 ? "" : String(course.rating));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { toast.error("Title is required.");    return; }
    if (!formData.category.trim()) { toast.error("Category is required."); return; }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        description:  formData.description.trim()  || undefined,
        instructor:   formData.instructor.trim()    || undefined,
        duration:     formData.duration.trim()      || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim()  || undefined,
      };

      if (editingCourse) {
        const updated = await adminApi.updateCourse(editingCourse.id, payload);
        setCourses((prev) => prev.map((c) => c.id === editingCourse.id ? updated : c));
        toast.success(`"${updated.title}" updated.`);
      } else {
        const created = await adminApi.createCourse(payload);
        setCourses((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        toast.success(`"${created.title}" created.`);
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeleting(course.id);
    try {
      await adminApi.deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setTotal((t) => t - 1);
      toast.success(`"${course.title}" deleted.`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete course.");
    } finally {
      setDeleting(null);
    }
  };

  const f = (field: keyof CourseForm, value: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">{total} courses total</p>
        </div>
        <Button onClick={openAdd} className="bg-hero text-primary-foreground hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Instructor</TableHead>
                  <TableHead className="hidden md:table-cell">Students</TableHead>
                  <TableHead className="hidden lg:table-cell">Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No courses found. Click "Add Course" to create your first one.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium text-foreground max-w-[180px] truncate">
                        {course.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {course.category}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {course.instructor}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {course.studentCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        ₹{course.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={course.isPublished ? "default" : "secondary"}
                          className={course.isPublished
                            ? "bg-green-500/15 text-green-700 border-green-200" : ""}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* ── Manage Lessons button ── */}
                          <Button
                            variant="ghost" size="icon"
                            title="Manage Lessons"
                            onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                          >
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </Button>

                          <Button
                            variant="ghost" size="icon"
                            onClick={() => openEdit(course)}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            disabled={deleting === course.id}
                            onClick={() => handleDelete(course)}
                          >
                            {deleting === course.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="e.g. Full Stack Web Development"
                disabled={saving}
              />
            </div>
            <div>
              <Label>Category *</Label>
              <Input
                value={formData.category}
                onChange={(e) => f("category", e.target.value)}
                placeholder="e.g. Web Development"
                disabled={saving}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => f("description", e.target.value)}
                rows={3}
                disabled={saving}
                placeholder="What will students learn in this course?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instructor</Label>
                <Input
                  value={formData.instructor}
                  onChange={(e) => f("instructor", e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => f("duration", e.target.value)}
                  placeholder="e.g. 8 weeks"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Lessons</Label>
                <Input
                  inputMode="numeric"
                  value={formData.lessonCount === 0 ? "" : String(formData.lessonCount)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    f("lessonCount", val === "" ? 0 : Number(val));
                  }}
                  placeholder="e.g. 24"
                  disabled={saving}
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input
                  inputMode="decimal"
                  value={priceRaw}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setPriceRaw(val);
                      f("price", val === "" || val === "." ? 0 : Number(val));
                    }
                  }}
                  onBlur={() => {
                    const num = Number(priceRaw);
                    const clean = isNaN(num) ? 0 : Math.max(0, num);
                    f("price", clean);
                    setPriceRaw(clean === 0 ? "" : String(clean));
                  }}
                  placeholder="e.g. 4999"
                  disabled={saving}
                />
              </div>
              <div>
                <Label>Rating (0–5)</Label>
                <Input
                  inputMode="decimal"
                  value={ratingRaw}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setRatingRaw(val);
                      f("rating", val === "" || val === "." ? 0 : Math.min(5, Number(val)));
                    }
                  }}
                  onBlur={() => {
                    const num = Number(ratingRaw);
                    const clean = isNaN(num) ? 0 : Math.min(5, Math.max(0, num));
                    f("rating", clean);
                    setRatingRaw(clean === 0 ? "" : String(clean));
                  }}
                  placeholder="e.g. 4.5"
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <Label>Thumbnail URL</Label>
              <Input
                value={formData.thumbnailUrl}
                onChange={(e) => f("thumbnailUrl", e.target.value)}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="published"
                checked={formData.isPublished}
                onCheckedChange={(v) => f("isPublished", v)}
                disabled={saving}
              />
              <Label htmlFor="published" className="cursor-pointer">
                Published — visible to students
              </Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-hero text-primary-foreground hover:opacity-90"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                : editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;