import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, FileVideo, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { adminApi, adminLessonsApi, type Video, type Course, type Lesson } from "@/lib/api";
import { toast } from "sonner";

const ALL = "__all__";
const UPLOAD_MODE_FILE = "file";
const UPLOAD_MODE_YOUTUBE = "youtube";

const AdminVideos = () => {
  const [videos,         setVideos]         = useState<Video[]>([]);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [deleting,       setDeleting]       = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [uploadMode,     setUploadMode]     = useState(UPLOAD_MODE_FILE);
  const [youtubeUrl,     setYoutubeUrl]     = useState("");
  const [youtubeTitle,   setYoutubeTitle]   = useState("");
  const [courseLessons,  setCourseLessons]  = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [filterCourse,   setFilterCourse]   = useState(ALL);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load courses for dropdowns
  useEffect(() => {
    adminApi
      .getAdminCourses({ pageSize: 100 })
      .then((res) => setCourses(res.items))
      .catch(() => {});
  }, []);

  // Load videos whenever page or filter changes
  useEffect(() => {
    setLoading(true);
    adminApi
      .getVideos({
        page,
        pageSize: 20,
        courseId: filterCourse === ALL ? undefined : filterCourse,
      })
      .then((res) => {
        setVideos(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load videos."))
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
        const ordered = [...items].sort((a, b) => a.order - b.order);
        setCourseLessons(ordered);
        setSelectedLesson("");
      })
      .catch((err: any) => {
        toast.error(err.message ?? "Failed to load lessons for selected course.");
        setCourseLessons([]);
      })
      .finally(() => setLoadingLessons(false));
  }, [selectedCourse]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!selectedCourse) { toast.error("Please select a course first."); return; }
    if (courseLessons.length === 0) {
      toast.error("No lessons found for this course. Add lessons first.");
      return;
    }
    if (!selectedLesson) { toast.error("Please select a lesson."); return; }
    if (uploadMode === UPLOAD_MODE_FILE && !file) {
      toast.error("Please choose a video file.");
      return;
    }
    if (uploadMode === UPLOAD_MODE_YOUTUBE && !youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL.");
      return;
    }

    setUploading(true);
    try {
      const video = uploadMode === UPLOAD_MODE_FILE
        ? await adminApi.uploadVideo({
            file: file!,
            courseId: selectedCourse,
            lessonId: selectedLesson,
          })
        : await adminApi.uploadVideoLink({
            youtubeUrl: youtubeUrl.trim(),
            title: youtubeTitle.trim() || undefined,
            courseId: selectedCourse,
            lessonId: selectedLesson,
          });

      setVideos((prev) => [video, ...prev]);
      setTotal((t) => t + 1);
      toast.success(`"${video.fileName}" uploaded successfully.`);
      setSelectedCourse("");
      setSelectedLesson("");
      setUploadMode(UPLOAD_MODE_FILE);
      setYoutubeUrl("");
      setYoutubeTitle("");
      setCourseLessons([]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm(`Delete "${video.fileName}"? This cannot be undone.`)) return;
    setDeleting(video.id);
    try {
      await adminApi.deleteVideo(video.id);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      setTotal((t) => t - 1);
      toast.success(`"${video.fileName}" deleted.`);
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7)   return `${days} days ago`;
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Video Management</h1>
        <p className="text-muted-foreground mt-1">{total} videos uploaded</p>
      </div>

      {/* Upload card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Upload Type</Label>
              <Select value={uploadMode} onValueChange={setUploadMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select upload type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UPLOAD_MODE_FILE}>File Upload</SelectItem>
                  <SelectItem value={UPLOAD_MODE_YOUTUBE}>YouTube Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
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
            <div className="flex-1">
              {uploadMode === UPLOAD_MODE_FILE ? (
                <>
                  <Label className="mb-2 block">File</Label>
                  <Input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    className="cursor-pointer"
                    disabled={uploading}
                  />
                </>
              ) : (
                <>
                  <Label className="mb-2 block">YouTube URL</Label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={uploading}
                  />
                </>
              )}
            </div>
            {uploadMode === UPLOAD_MODE_YOUTUBE && (
              <div className="flex-1">
                <Label className="mb-2 block">Title (optional)</Label>
                <Input
                  value={youtubeTitle}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                  placeholder="e.g. Introduction Video"
                  disabled={uploading}
                />
              </div>
            )}
            <div className="flex items-end">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-hero text-primary-foreground hover:opacity-90"
              >
                {uploading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                  : <><Upload className="w-4 h-4 mr-2" />Add Video</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter by course */}
      <div className="max-w-xs">
        <Select
          value={filterCourse}
          onValueChange={(v) => { setFilterCourse(v); setPage(1); }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Video list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No videos found. Upload your first video above.
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{video.fileName}</p>
                  <p className="text-xs text-muted-foreground">{video.courseName}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {video.formattedSize}
                </span>
                <span className="text-xs text-muted-foreground hidden md:block">
                  {formatDate(video.uploadedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deleting === video.id}
                  onClick={() => handleDelete(video)}
                >
                  {deleting === video.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4 text-destructive" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminVideos;