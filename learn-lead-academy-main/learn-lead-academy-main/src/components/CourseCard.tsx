import { Link } from "react-router-dom";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { type Course } from "@/lib/api";

interface Props {
  course: Course;
}

const CourseCard = ({ course }: Props) => {
  return (
    <div className="group rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col">

      {/* Thumbnail */}
      <div className="h-44 bg-hero overflow-hidden flex-shrink-0">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary-foreground/40" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Category badge */}
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3 w-fit">
          {course.category}
        </span>

        {/* Title */}
        <h3 className="font-display font-bold text-foreground text-base leading-snug mb-1 line-clamp-2 flex-1">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-muted-foreground mb-3">by {course.instructor}</p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            {course.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.studentCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessonCount} lessons
          </span>
        </div>

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <p className="font-display font-bold text-primary text-lg">
            ₹{course.price.toLocaleString()}
          </p>
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 rounded-xl bg-hero text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
          >
            View Course
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CourseCard;