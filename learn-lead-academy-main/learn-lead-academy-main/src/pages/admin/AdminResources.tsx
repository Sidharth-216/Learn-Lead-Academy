import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Loader2, FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { adminApi, adminLessonsApi, type Course, type Lesson, type LessonResource, type LessonResourceType } from "@/lib/api";
import { toast } from "sonner";

const ALL = "__all__";
const UPLOAD_MODE_FILE = "file";
const UPLOAD_MODE_LINK = "link";

const resourceTypeOptions: { value: LessonResourceType; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "practice", label: "Practice Questions" },
  { value: "starter", label: "Project Starter Files" },
];

const typeLabel = (value: string) =>
  resourceTypeOptions.find((x) => x.value === value)?.label ?? value;

const AdminResources = () => {
  const [resources,      setResources]      = useState<LessonResource[]>([]);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [deleting,       setDeleting]       = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [resourceType,   setResourceType]   = useState<LessonResourceType>("notes");
  const [title,          setTitle]          = useState("");
  const [uploadMode,     setUploadMode]     = useState(UPLOAD_MODE_FILE);
  const [externalUrl,    setExternalUrl]    = useState("");
  const [courseLessons,  setCourseLessons]  = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [filterCourse,   setFilterCourse]   = useState(ALL);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi
      .getAdminCourses({ pageSize: 100 })
      .then((res) => setCourses(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getResources({
        page,
        pageSize: 20,
        courseId: filterCourse === ALL ? undefined : filterCourse,
      })
      .then((res) => {
        setResources(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err: any) => toast.error(err.message ?? "Failed to load resources."))
      .finally(() => setLoading(false));
  }, [page, filterCourse]);

  useEffect(() => {
    if (!selectedCourse) {
      setCourseLessons([]);
      setSelectedLesson("");
      return;
    }

    setLoadingLessons(true);
    adminLessonsApi
      .getLessons(selectedCourse)
      .then((items) => {
        setCourseLessons([...items].sort((a, b) => a.order - b.order));
        setSelectedLesson("");
      })
      .catch((err: any) => {
        toast.error(err.message ?? "Failed to load lessons for selected course.");
        setCourseLessons([]);
      })
      .finally(() => setLoadingLessons(false));
  }, [selectedCourse]);

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedLesson("");
    setCourseLessons([]);
    setResourceType("notes");
    setTitle("");
    setUploadMode(UPLOAD_MODE_FILE);
    setExternalUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];

    if (!selectedCourse) { toast.error("Please select a course first."); return; }
    if (!selectedLesson) { toast.error("Please select a lesson."); return; }
    if (!title.trim())   { toast.error("Please enter a resource title."); return; }

    if (uploadMode === UPLOAD_MODE_FILE && !file) {
      toast.error("Please choose a file.");
      return;
    }

    if (uploadMode === UPLOAD_MODE_LINK && !externalUrl.trim()) {
      toast.error("Please provide an external URL.");
      return;
    }

    setUploading(true);
    try {
      const resource = uploadMode === UPLOAD_MODE_FILE
        ? await adminApi.uploadResource({
            file: file!,
            title: title.trim(),
            resourceType,
            courseId: selectedCourse,
            lessonId: selectedLesson,
          })
        : await adminApi.uploadResourceLink({
            title: title.trim(),
            resourceType,
            courseId: selectedCourse,
            lessonId: selectedLesson,
            externalUrl: externalUrl.trim(),
          });

      setResources((prev) => [resource, ...prev]);
      setTotal((t) => t + 1);
      toast.success(`"${resource.title}" uploaded successfully.`);
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resource: LessonResource) => {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;

    setDeleting(resource.id);
    try {
      await adminApi.deleteResource(resource.id);
      setResources((prev) => prev.filter((x) => x.id !== resource.id));
      setTotal((t) => t - 1);
      toast.success(`"${resource.title}" deleted.`);
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Resource Management</h1>
        <p className="text-muted-foreground mt-1">{total} resources uploaded</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload Resource
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label className="mb-2 block">Upload Type</Label>
              <Select value={uploadMode} onValueChange={setUploadMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select upload type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UPLOAD_MODE_FILE}>File Upload</SelectItem>
                  <SelectItem value={UPLOAD_MODE_LINK}>External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Lesson</Label>
              <Select
                value={selectedLesson}
                onValueChange={setSelectedLesson}
                disabled={!selectedCourse || loadingLessons || courseLessons.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedCourse
                        ? "Select course first"
                        : loadingLessons
                          ? "Loading lessons..."
                          : courseLessons.length === 0
                            ? "No lessons available"
                            : "Select lesson"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courseLessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.order}. {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Resource Category</Label>
              <Select value={resourceType} onValueChange={(v) => setResourceType(v as LessonResourceType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-2">
              <Label className="mb-2 block">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lesson 3 Notes"
                disabled={uploading}
              />
            </div>

            {uploadMode === UPLOAD_MODE_FILE ? (
              <div className="xl:col-span-2">
                <Label className="mb-2 block">File</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.csv"
                  className="cursor-pointer"
                  disabled={uploading}
                />
              </div>
            ) : (
              <div className="xl:col-span-2">
                <Label className="mb-2 block">External URL</Label>
                <Input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={uploading}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-hero text-primary-foreground hover:opacity-90"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                : <><Upload className="w-4 h-4 mr-2" />Add Resource</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-xs">
        <Select value={filterCourse} onValueChange={(v) => { setFilterCourse(v); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No resources found. Upload your first one above.
        </div>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{resource.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {resource.courseName} · {resource.lessonTitle}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{typeLabel(resource.resourceType)}</Badge>
                    <span className="text-xs text-muted-foreground">{resource.formattedSize}</span>
                  </div>
                </div>
                <a href={resource.url} target="_blank" rel="noreferrer" className="hidden sm:block">
                  <Button variant="ghost" size="icon">
                    {resource.isExternalLink
                      ? <ExternalLink className="w-4 h-4" />
                      : <Download className="w-4 h-4" />}
                  </Button>
                </a>
                <span className="text-xs text-muted-foreground hidden md:block">
                  {formatDate(resource.uploadedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deleting === resource.id}
                  onClick={() => handleDelete(resource)}
                >
                  {deleting === resource.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4 text-destructive" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3 py-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
