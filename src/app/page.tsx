import { QrCode, ScanLine, BookHeart, Flame } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchNicheForm } from "@/components/SearchNicheForm";
import { AmbientGlow } from "@/components/AmbientGlow";

const steps = [
  {
    icon: QrCode,
    title: "Coloca un código QR",
    description:
      "Cada nicho o lote recibe un código único que enlaza a su página conmemorativa.",
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
            <span className="rounded-full border border-border px-4 py-1 text-xs uppercase tracking-[0.2em] text-muted">
              Un homenaje digital
            </span>
            <h1 className="font-serif-display text-4xl leading-tight sm:text-6xl">
              Cada nicho tiene una historia.
              <br />
              <span className="italic text-accent">Ayúdanos a contarla.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Escanea el código QR en el cementerio y descubre quiénes
              descansan ahí: su historia, sus fotos y los recuerdos que
              dejaron en quienes los amaron.
            </p>
            <SearchNicheForm />
          </div>
        </section>

        <section className="border-t border-border/80 px-5 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif-display text-3xl">
              ¿Cómo funciona?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center gap-3">
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
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-background-elevated p-10 text-center">
            <h2 className="font-serif-display text-3xl">
              ¿Tienes el código de un nicho?
            </h2>
            <p className="mt-3 text-muted">
              Escríbelo abajo para ver la página conmemorativa directamente.
            </p>
            <div className="mt-6 flex justify-center">
              <SearchNicheForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
