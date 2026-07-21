-- Búsqueda de nombres insensible a acentos: "fernandez" debe encontrar
-- "Fernández". ILIKE resuelve mayúsculas, pero no las tildes.
CREATE EXTENSION IF NOT EXISTS unaccent;
