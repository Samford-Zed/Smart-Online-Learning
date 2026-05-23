import { Star, BookOpen } from "lucide-react";

/**
 * "Class Management" — bespoke gradebook mock matching the reference: a card
 * with a blue "GradeBook" header, four student rows (avatar + score pill on
 * a colored progress bar), an Export button, and floating star + book badges.
 */
export function ClassManagementSection() {
  const rows = [
    {
      avatar:
        "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=200&q=80",
      score: "100",
      bar: "bg-brand",
      pill: "bg-amber-400 text-ink-900",
      width: "w-11/12",
      star: true,
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80",
      score: "9",
      bar: "bg-brand",
      pill: "bg-emerald-100 text-emerald-700",
      width: "w-3/4",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=200&q=80",
      score: "85",
      bar: "bg-emerald-500",
      pill: "bg-emerald-100 text-emerald-700",
      width: "w-5/6",
    },
    {
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
      score: "75",
      bar: "bg-rose-400",
      pill: "bg-rose-100 text-rose-700",
      width: "w-2/3",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        {/* COPY */}
        <div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand sm:text-4xl">
            <span className="text-amber-500">Class Management</span>
            <br /> Tools for Educators
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-700">
            EduSmart provides tools to help run and manage the class such as
            Class Roster, Attendance, and more. With the Gradebook, teachers
            can review and grade tests and quizzes in real-time.
          </p>
        </div>

        {/* MOCK */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Decorative shapes */}
          <span
            aria-hidden
            className="absolute -right-2 -top-2 size-3 rounded-full bg-brand"
          />
          <span
            aria-hidden
            className="absolute right-6 top-3 size-2 rounded-full bg-brand/60"
          />
          <span
            aria-hidden
            className="absolute -bottom-3 left-10 h-3 w-16 rounded-full bg-ink-200"
          />
          <span
            aria-hidden
            className="absolute -bottom-7 left-14 h-3 w-12 rounded-full bg-ink-100"
          />

          {/* Floating star badge */}
          <span
            aria-hidden
            className="absolute -left-4 top-2 z-10 flex size-12 items-center justify-center rounded-full bg-white text-amber-500 shadow-card ring-1 ring-amber-200"
          >
            <Star className="size-6 fill-current" />
          </span>
          {/* Floating book badge */}
          <span
            aria-hidden
            className="absolute -right-4 top-12 z-10 flex size-12 items-center justify-center rounded-full bg-white text-brand shadow-card ring-1 ring-brand/30"
          >
            <BookOpen className="size-5" />
          </span>

          {/* Gradebook card */}
          <div className="relative ml-4 mr-4 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100">
            <div className="bg-brand py-3 text-center text-sm font-semibold text-white">
              GradeBook
            </div>
            <div className="space-y-4 p-5">
              {rows.map((r, i) => (
                <div key={i} className="relative">
                  <div
                    className={`h-3 rounded-full ${r.bar} ${r.width} opacity-60`}
                  />
                  <div className="mt-1 flex items-center gap-3">
                    <img
                      src={r.avatar}
                      alt=""
                      className="size-9 rounded-full object-cover ring-2 ring-white"
                    />
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${r.pill}`}
                    >
                      {r.star && (
                        <Star
                          className="size-3 fill-current text-amber-500"
                          aria-hidden
                        />
                      )}
                      {r.score}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="rounded-full bg-brand px-5 py-1.5 text-xs font-semibold text-white shadow-card transition hover:bg-brand-600"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
