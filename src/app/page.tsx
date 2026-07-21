import { QrCode, ScanLine, BookHeart, Flame } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchForm } from "@/components/SearchForm";
import { AmbientGlow } from "@/components/AmbientGlow";

const steps = [
  {
    icon: QrCode,
    title: "Coloca un código QR",
    description:
      "Cada lugar recibe un código único que enlaza a su página conmemorativa.",
  },
  {
    icon: ScanLine,
    title: "Escanea al visitar",
    description:
      "Cualquier visitante escanea el código con la cámara de su teléfono, sin apps ni registros.",
  },
  {
    icon: BookHeart,
    title: "Conoce su historia",
    description:
      "Aparecen todas las personas que descansan ahí, con fotos, biografía y fechas importantes.",
  },
  {
    icon: Flame,
    title: "Deja un homenaje",
    description:
      "Enciende una vela virtual o deja un mensaje que la familia podrá leer después.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden px-5 py-24 sm:py-32">
          <AmbientGlow />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
            <span className="rounded-full border border-border px-4 py-1 font-technical text-xs uppercase tracking-[0.2em] text-muted">
              Un homenaje digital
            </span>
            <h1 className="font-serif-display text-4xl leading-tight sm:text-6xl">
              Cada lugar tiene una historia.
              <br />
              <span className="italic text-accent">Ayúdanos a contarla.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Escanea el código QR en el cementerio y descubre quiénes
              descansan ahí: su historia, sus fotos y los recuerdos que
              dejaron en quienes los amaron.
            </p>
            <SearchForm />
          </div>
        </section>

        <section className="border-t border-border/80 px-5 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif-display text-3xl">
              ¿Cómo funciona?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="card-glass flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-colors"
                >
                  <span className="font-technical text-xs text-muted">
                    0{i + 1}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <step.icon size={22} className="text-accent" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/80 px-5 py-20">
          <div className="card-glass glow-ring relative mx-auto max-w-3xl rounded-3xl p-10 text-center">
            <h2 className="font-serif-display text-3xl">
              ¿Buscás a alguien en particular?
            </h2>
            <p className="mt-3 text-muted">
              Escribí su nombre, o el código del lugar si lo tenés a mano.
            </p>
            <div className="mt-6 flex justify-center">
              <SearchForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
