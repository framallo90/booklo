-- Migración 002: campos ampliados del libro + condición nuevo/usado
-- Ejecutar: mysql -u root -p booklo_db < migrations/002_book_fields.sql

ALTER TABLE books
  ADD COLUMN `condition`    ENUM('nuevo', 'usado') NOT NULL DEFAULT 'nuevo' AFTER category_id,
  ADD COLUMN binding        VARCHAR(50)  NULL AFTER `condition`,
  ADD COLUMN collection     VARCHAR(200) NULL AFTER binding,
  ADD COLUMN weight_grams   INT          NULL AFTER collection,
  ADD COLUMN country        VARCHAR(100) NULL AFTER weight_grams,
  ADD COLUMN dimensions     VARCHAR(50)  NULL AFTER country;

ALTER TABLE book_authors
  ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'autor' AFTER author_id;
