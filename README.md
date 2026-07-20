# Memorials

Un homenaje digital: escanea el código QR de un nicho en el cementerio y descubre
la historia de quienes descansan ahí — fotos, biografía, fechas importantes, y un
espacio para dejar mensajes o encender una vela virtual.

Construido con **Next.js (App Router)**, **Tailwind CSS**, **Framer Motion** y
**Prisma** sobre **PostgreSQL**. Listo para desplegar en **Railway**.

## Cómo funciona

1. Cada **nicho** (`Niche`) tiene un código único (ej. `A-104`) y pertenece a un
   **cementerio** (`Cemetery`).
2. Un código QR apunta a `https://tu-dominio.com/n/A-104`.
3. Esa página lista a todas las **personas** (`Person`) registradas en ese nicho.
4. Cada persona tiene su propia página con biografía, fotos y un muro de
   homenajes (`Tribute`): velas y mensajes que dejan los visitantes.

## Estructura del proyecto

```
prisma/
  schema.prisma      Modelos: Cemetery, Niche, Person, Photo, Tribute
  seed.ts            Datos de ejemplo (un cementerio, dos nichos, tres personas)
src/
  app/
    page.tsx                    Landing page con buscador de nichos
    n/[code]/page.tsx            Página del nicho (lista de personas)
    n/[code]/not-found.tsx       Nicho no encontrado
    n/[code]/[personId]/page.tsx Página conmemorativa de una persona
    n/[code]/qr/page.tsx         Generador/descarga del código QR del nicho
    api/tributes/route.ts       Endpoint para dejar mensajes/velas
  components/                   UI: tarjetas, muro de homenajes, buscador, etc.
  lib/
    prisma.ts                   Cliente de Prisma (con adaptador pg)
    format.ts                   Formateo de nombres, fechas y edades
```

## Desarrollo local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y coloca tu cadena de conexión de PostgreSQL:

   ```bash
   cp .env.example .env
   ```

   Si no tienes Postgres local, puedes levantar uno rápido con:

   ```bash
   npx prisma dev
   ```

3. Aplica las migraciones y siembra datos de ejemplo:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Visita `http://localhost:3000/n/A-104` (o `B-207`) para ver una página de
   ejemplo, o usa el buscador desde la página de inicio.

Para explorar/editar los datos con una interfaz visual:

```bash
npm run db:studio
```

## Desplegar en Railway

1. Crea un nuevo proyecto en Railway y agrega el plugin de **PostgreSQL**.
2. Agrega este repositorio como un servicio (Railway detecta Next.js
   automáticamente vía Nixpacks; también se incluye `railway.json` con la
   configuración de build/start).
3. En las variables de entorno del servicio, agrega:
   - `DATABASE_URL` → referencia la del plugin de Postgres, ej.
     `${{Postgres.DATABASE_URL}}`
   - (Opcional) `NEXT_PUBLIC_SITE_URL` → tu dominio público, usado para generar
     la URL exacta codificada en cada QR. Si se omite, se infiere del header
     `host` de la petición.
4. Ejecuta las migraciones contra la base de datos de producción. Puedes usar
   el **Pre-Deploy Command** de Railway con:

   ```bash
   npx prisma migrate deploy
   ```

   o ejecutarlo manualmente desde tu máquina con la CLI de Railway:

   ```bash
   railway run npx prisma migrate deploy
   ```

5. (Opcional) Siembra datos de ejemplo la primera vez con
   `railway run npm run db:seed`.
6. Railway construirá el proyecto con `npm run build` (que ya incluye
   `prisma generate`) y lo iniciará con `npm run start`, que respeta el
   puerto asignado por Railway (`$PORT`).

## Cargar tus propios nichos y personas

Por ahora la carga de datos se hace directamente contra la base de datos
(por ejemplo con `npm run db:studio`, un script personalizado, o SQL directo).
El código de cada nicho (`Niche.code`) es lo que compone la URL pública
(`/n/[code]`) y lo que debe codificarse en el QR impreso — la página
`/n/[code]/qr` genera y permite descargar/imprimir ese código automáticamente
una vez que el nicho existe en la base de datos.
