import { GraduationCap } from "lucide-react";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen w-full bg-white font-sans">
      {/* Left: Brand panel (hidden on mobile) */}
      <aside
        aria-hidden
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-8 lg:flex"
        style={{
          backgroundColor: "#d8e2ff",
          backgroundImage:
            "linear-gradient(141deg, rgba(0,26,66,0.63) 0%, rgba(0,88,190,0.53) 40%, rgba(33,112,228,0.59) 100%), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo */}
        <div className="relative flex items-center gap-2 text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-[32px] font-bold leading-10 tracking-tight">
            EduSmart K-12
          </span>
        </div>

        {/* Motivational quote */}
        <div className="relative max-w-[448px] pb-12">
          <h1 className="text-[48px] font-bold leading-[56px] tracking-tight text-white">
            Empowering the
            <br />
            next generation.
          </h1>
          <p className="mt-4 text-lg leading-7 text-brand-100">
            Join our digital campus to connect, learn, and grow. Everything you
            need for academic success in one secure platform.
          </p>
        </div>

        {/* Carousel dots */}
        <div className="relative flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-100/50" />
          <span className="h-2 w-12 rounded-full bg-brand-100" />
          <span className="size-2 rounded-full bg-brand-100/50" />
        </div>
      </aside>

      {/* Right: Form panel */}
      <section className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <RegisterForm />
      </section>
    </main>
  );
}
