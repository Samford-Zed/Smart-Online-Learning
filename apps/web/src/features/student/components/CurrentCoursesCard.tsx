import { BookOpen, FlaskConical, Languages } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import { useT } from "@/i18n/I18nProvider";

type Course = {
  title: string;
  /** URL-safe slug used for the detail route. */
  slug: string;
  teacher: string;
  progress: number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** tailwind bg + text classes for the icon tile */
  tileClass: string;
  /** tailwind bg class for the progress fill */
  barClass: string;
};

const courses: Course[] = [
  {
    title: "Mathematics",
    slug: "advanced-mathematics",
    teacher: "Mr. Dawit",
    progress: 82,
    icon: BookOpen,
    tileClass: "bg-brand/10 text-brand",
    barClass: "bg-brand",
  },
  {
    title: "Science",
    slug: "biology-101",
    teacher: "Ms. Tigist",
    progress: 65,
    icon: FlaskConical,
    tileClass: "bg-emerald-100 text-emerald-600",
    barClass: "bg-emerald-500",
  },
  {
    title: "Amharic",
    slug: "amharic-literature",
    teacher: "Dr. Alemu",
    progress: 90,
    icon: Languages,
    tileClass: "bg-amber-100 text-amber-600",
    barClass: "bg-amber-500",
  },
];

/**
 * Current Courses — grid of enrolled subjects with per-course progress bars.
 */
export function CurrentCoursesCard({ courses: apiCourses }: { courses?: unknown[] }) {
  const { t } = useT();
  // Use API data if available, otherwise fall back to mock data
  const displayCourses = apiCourses && apiCourses.length > 0
    ? apiCourses.map((c: any) => ({
        title: c.title || c.name || "Untitled",
        slug: c.slug || c.id || c.title?.toLowerCase().replace(/\s+/g, "-") || "course",
        teacher: c.teacher || c.instructor || "Unknown",
        progress: c.progress || 0,
        icon: BookOpen,
        tileClass: "bg-brand/10 text-brand",
        barClass: "bg-brand",
      }))
    : courses;

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">
          {t("student.currentCourses")}
        </h3>
        <Link
          to="/student/classes"
          className="text-xs font-semibold text-brand hover:underline"
        >
          {t("common.viewAll")}
        </Link>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {displayCourses.map((c) => (
          <CourseCard key={c.slug} course={c} />
        ))}
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: Course }) {
  const Icon = course.icon;
  return (
    <Link
      to={`/student/classes/${course.slug}`}
      className="flex flex-col gap-3 rounded-xl border border-ink-200 p-3 transition hover:border-brand/40 hover:bg-brand/5 hover:shadow-card"
    >
      <div className="flex items-start gap-2">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${course.tileClass}`}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink-900">{course.title}</div>
          <div className="text-xs text-ink-500">{course.teacher}</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-500">Progress</span>
          <span className="font-semibold text-ink-900">{course.progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full ${course.barClass}`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
