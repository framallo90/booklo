USE booklo_db;

INSERT IGNORE INTO roles (name) VALUES ('admin'), ('client');

INSERT IGNORE INTO users (name, email, password, role_id) VALUES (
  'Administrador',
  'admin@booklo.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  1
);

INSERT IGNORE INTO categories (name) VALUES
  ('Literatura'),
  ('Ciencia Ficción'),
  ('Terror'),
  ('Manga'),
  ('Cómics'),
  ('Infantil'),
  ('Historia'),
  ('Tecnología');