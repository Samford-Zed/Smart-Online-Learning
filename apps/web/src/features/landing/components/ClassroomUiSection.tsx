import { Phone, LayoutGrid, Square, Users, Hand } from "lucide-react";

/**
 * "A user interface designed for the classroom" — bespoke mock illustration
 * matching the reference: a browser-window frame with a 2x2 video tile grid,
 * Present + Call action buttons, a floating raised-hand badge, and decorative
 * shapes (green semicircle, dots, purple circle). Right column shows three
 * bulleted benefits with colored icon squares.
 */
export function ClassroomUiSection() {
  const tiles = [
    {
      name: "Selam Tadesse",
      img: "https://media.gettyimages.com/id/490486272/photo/beautiful-teenage-high-school-student-smiling-before-class.jpg?s=612x612&w=gi&k=20&c=YhXeCmBXBvsc1BpbZ319fofhWJ4zAAVHH981JNxzfPs=",
      tag: "bg-brand",
      large: true,
    },
    {
      name: "Hana Bekele",
      img: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80",
      tag: "bg-emerald-500",
    },
    {
      name: "Dawit Girma",
      img: "https://i.pinimg.com/736x/70/93/1e/70931eeed024cd7e1c21177bff898652.jpg",
      tag: "bg-rose-500",
    },
    {
      name: "Yonas Haile",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      tag: "bg-amber-500",
    },
    {
      name: "Tigist Alemu",
      img: "https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=400&q=80",
      tag: "bg-rose-500",
      large: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        {/* MOCK */}
        <div className="relative">
          {/* Decorative shapes */}
          <span
            aria-hidden
            className="absolute -left-2 -top-4 size-24 rounded-b-full bg-emerald-400"
          />
          <span
            aria-hidden
            className="absolute left-32 top-2 size-3 rounded-full bg-brand"
          />
          <span
            aria-hidden
            className="absolute -bottom-6 left-32 size-3 rounded-full bg-rose-500"
          />
          <span
            aria-hidden
            className="absolute -bottom-4 right-12 size-32 rounded-full bg-indigo-500/80"
          />

          {/* Browser window */}
          <div className="relative rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100">
            <div className="mb-3 flex gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Big tile (Sarah) */}
              <div className="col-span-1 row-span-2">
                <Tile {...tiles[0]} aspect="aspect-[3/4]" />
              </div>
              <Tile {...tiles[1]} />
              <Tile {...tiles[2]} />
              <Tile {...tiles[3]} />
              <div className="col-span-1">
                <Tile {...tiles[4]} aspect="aspect-[4/5]" />
              </div>
            </div>

            {/* Floating raised hand */}
            <span
              aria-hidden
              className="absolute left-[34%] top-[42%] flex size-10 items-center justify-center rounded-full bg-white text-amber-500 shadow-card ring-1 ring-ink-100"
            >
              <Hand className="size-5" />
            </span>

            {/* Present + Call buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-card"
              >
                <LayoutGrid className="size-3.5" aria-hidden />
                Present
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow-card"
              >
                <Phone className="size-3.5" aria-hidden />
                Call
              </button>
            </div>
          </div>
        </div>

        {/* COPY */}
        <div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand sm:text-4xl">
            A <span className="text-amber-500">user interface</span> designed
            <br /> for the classroom
          </h2>

          <ul className="mt-6 space-y-5">
            <BulletRow
              icon={<LayoutGrid className="size-4 text-brand" />}
              tone="bg-brand/10"
              text="Teachers don't get lost in the grid view and have a dedicated Podium space."
            />
            <BulletRow
              icon={<Square className="size-4 text-amber-600" />}
              tone="bg-amber-100"
              text="TA's and presenters can be moved to the front of the class."
            />
            <BulletRow
              icon={<Users className="size-4 text-ink-700" />}
              tone="bg-ink-100"
              text="Teachers can easily see all students and class data at one time."
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

function Tile({
  name,
  img,
  tag,
  aspect = "aspect-square",
}: {
  name: string;
  img: string;
  tag: string;
  aspect?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${aspect}`}>
      <img src={img} alt={name} className="h-full w-full object-cover" />
      <span
        className={`absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white ${tag}`}
      >
        {name}
      </span>
    </div>
  );
}

function BulletRow({
  icon,
  tone,
  text,
}: {
  icon: React.ReactNode;
  tone: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone} shadow-card`}
      >
        {icon}
      </span>
      <p className="text-sm leading-relaxed text-ink-700">{text}</p>
    </li>
  );
}
