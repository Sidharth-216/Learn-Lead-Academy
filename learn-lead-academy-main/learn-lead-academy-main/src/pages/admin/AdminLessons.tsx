import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Loader2, ArrowLeft,
  GripVertical, BookOpen, Play, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { adminLessonsApi, adminApi, type Lesson, type Course } from "@/lib/api";
import { toast } from "sonner";

type LessonForm = {
  title: string;
  description: string;
  duration: string;
  order: number;
  isFree: boolean;
  videoId: string;
};

const emptyForm: LessonForm = {
  title:       "",
  description: "",
  duration:    "",
  order:       1,
  isFree:      false,
  videoId:     "",
};

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const toObjectId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (OBJECT_ID_REGEX.test(trimmed)) return trimmed.toLowerCase();

  const hex = Array.from(trimmed)
    .map((ch) => ch.charCodeAt(0).toString(16))
    .join("");

  return (hex + "0".repeat(24)).slice(0, 24).toLowerCase();
};

const AdminLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate     = useNavigate();

  const [course,        setCourse]        = useState<Course | null>(null);
  const [lessons,       setLessons]       = useState<Lesson[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData,      setFormData]      = useState<LessonForm>(emptyForm);

  // Load course info + lessons
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);

    Promise.all([
      adminLessonsApi.getCourseById(courseId),
      adminLessonsApi.getLessons(courseId),
    ])
      .then(([courseData, lessonData]) => {
        setCourse(courseData);
        setLessons(lessonData.sort((a, b) => a.order - b.order));
      })
      .catch((err) => toast.error(err.message ?? "Failed to load lessons."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const openAdd = () => {
    setEditingLesson(null);
    setFormData({
      ...emptyForm,
      order: lessons.length + 1,  // default to next order
    });
    setDialogOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title:       lesson.title,
      description: lesson.description,
      duration:    lesson.duration,
      order:       lesson.order,
      isFree:      lesson.isFree,
      videoId:     lesson.videoId ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!courseId) return;
    if (!formData.title.trim()) {
      toast.error("Lesson title is required.");
      return;
    }

    const normalizedVideoId = toObjectId(formData.videoId);

    setSaving(true);
    try {
      const payload = {
        title:       formData.title.trim(),
        description: formData.description.trim() || undefined,
        duration:    formData.duration.trim()    || undefined,
        order:       formData.order,
        isFree:      formData.isFree,
        videoId:     normalizedVideoId || undefined,
      };

      if (editingLesson) {
        const updated = await adminLessonsApi.updateLesson(editingLesson.id, payload);
        setLessons((prev) =>
          prev.map((l) => l.id === editingLesson.id ? updated : l)
              .sort((a, b) => a.order - b.order)
        );
        toast.success(`"${updated.title}" updated.`);
      } else {
        const created = await adminLessonsApi.createLesson(courseId, payload);
        setLessons((prev) =>
          [...prev, created].sort((a, b) => a.order - b.order)
        );
        toast.success(`"${created.title}" added.`);
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    setDeleting(lesson.id);
    try {
      await adminLessonsApi.deleteLesson(lesson.id);
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      toast.success(`"${lesson.title}" deleted.`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to delete lesson.");
    } finally {
      setDeleting(null);
    }
  };

  const f = (field: keyof LessonForm, value: string | number | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/courses")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <h1 className="font-display font-bold text-3xl text-foreground">
            Lessons
          </h1>
          {course && (
            <p className="text-muted-foreground mt-1 text-sm">
              {course.title} · {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button
          onClick={openAdd}
          className="bg-hero text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Lesson
        </Button>
      </div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No lessons yet.</p>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first lesson to build out this course's curriculum.
          </p>
          <Button onClick={openAdd} className="bg-hero text-primary-foreground hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Add First Lesson
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Order indicator */}
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-sm font-bold text-muted-foreground">
                    {lesson.order}
                  </div>

                  {/* Play/Lock icon */}
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {lesson.isFree
                      ? <Play className="w-4 h-4 text-primary" />
                      : <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground text-sm">
                        {lesson.title}
                      </p>
                      {lesson.isFree && (
                        <Badge variant="outline" className="text-accent border-accent/30 text-xs">
                          Free preview
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {lesson.duration && (
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration}
                        </span>
                      )}
                      {lesson.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                          {lesson.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => openEdit(lesson)}
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      disabled={deleting === lesson.id}
                      onClick={() => handleDelete(lesson)}
                    >
                      {deleting === lesson.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4 text-destructive" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="e.g. Introduction & Setup"
                disabled={saving}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => f("description", e.target.value)}
                rows={2}
                placeholder="Brief description of this lesson"
                disabled={saving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => f("duration", e.target.value)}
                  placeholder="e.g. 30 min"
                  disabled={saving}
                />
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  inputMode="numeric"
                  value={formData.order === 0 ? "" : String(formData.order)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    f("order", val === "" ? 1 : Number(val));
                  }}
                  placeholder="1"
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <Label>Video ID (optional)</Label>
              <Input
                value={formData.videoId}
                onChange={(e) => f("videoId", e.target.value)}
                placeholder="Any text (auto-converted to ID)"
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(v) => f("isFree", v)}
                disabled={saving}
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                Free preview — visible without enrollment
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
                : editingLesson ? "Save Changes" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLessons;