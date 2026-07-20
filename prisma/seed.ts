import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cemetery = await prisma.cemetery.create({
    data: {
      name: "Cementerio Parque de la Paz",
      city: "Ciudad de México",
      country: "México",
      address: "Av. de los Cipreses 245",
    },
  });

  const niche = await prisma.niche.create({
    data: {
      code: "A-104",
      section: "A",
      row: "10",
      number: "4",
      cemeteryId: cemetery.id,
      note: "Jardín de los Robles",
    },
  });

  await prisma.person.create({
    data: {
      firstName: "Rosa María",
      lastName: "Fernández Luna",
      nickname: "Chayito",
      birthDate: new Date("1938-03-12"),
      deathDate: new Date("2019-11-02"),
      epitaph: "Su risa vive en cada uno de nosotros.",
      biography:
        "Rosa María dedicó su vida a la enseñanza primaria durante más de 35 años. Le encantaba la jardinería, el café por las mañanas y reunir a toda la familia los domingos para comer juntos. Fue abuela de seis nietos que la recuerdan como su mayor maestra de vida.",
      nicheId: niche.id,
      photos: {
        create: [
          { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80", caption: "Rosa María, 1975", order: 0 },
        ],
      },
      tributes: {
        create: [
          { type: "MESSAGE", authorName: "Familia Fernández", message: "Te extrañamos cada día, abuela. Gracias por tanto amor." },
          { type: "CANDLE", authorName: "Luis" },
        ],
      },
    },
  });

  await prisma.person.create({
    data: {
      firstName: "Eduardo",
      lastName: "Fernández Ríos",
      birthDate: new Date("1935-07-22"),
      deathDate: new Date("2021-05-19"),
      epitaph: "Un hombre de palabra y de trabajo.",
      biography:
        "Eduardo fue carpintero de oficio y construyó con sus propias manos la casa donde crió a sus cuatro hijos. Amante del fútbol y de las tardes de dominó con los vecinos, siempre tenía una historia que contar.",
      nicheId: niche.id,
    },
  });

  const niche2 = await prisma.niche.create({
    data: {
      code: "B-207",
      section: "B",
      row: "20",
      number: "7",
      cemeteryId: cemetery.id,
      note: "Jardín de los Cipreses",
    },
  });

  await prisma.person.create({
    data: {
      firstName: "Manuel",
      lastName: "Torres Gómez",
      birthDate: new Date("1950-01-08"),
      deathDate: new Date("2023-09-30"),
      epitaph: "Caminó por la vida sembrando amistad.",
      biography:
        "Manuel fue músico autodidacta y tocaba la guitarra en reuniones familiares. Trabajó como mecánico y era conocido en su barrio por ayudar a quien lo necesitara sin pedir nada a cambio.",
      nicheId: niche2.id,
    },
  });

  console.log("Seed completado.");
  console.log(`Prueba el nicho: /n/${niche.code}`);
  console.log(`Prueba el nicho: /n/${niche2.code}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
