CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  studio_address TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'FOTÓGRAFA PRINCIPAL',
  avatar_url TEXT NOT NULL DEFAULT '',
  instagram_handle TEXT NOT NULL DEFAULT '',
  notify_new_orders INTEGER NOT NULL DEFAULT 1,
  notify_payment_alerts INTEGER NOT NULL DEFAULT 1,
  notify_weekly_summary INTEGER NOT NULL DEFAULT 1,
  bio TEXT NOT NULL DEFAULT '',
  instagram_widget_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portfolio_photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  camera_json TEXT,
  media_type TEXT NOT NULL DEFAULT 'photo',
  credit TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'casamentos',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS client_galleries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  cover_image TEXT NOT NULL DEFAULT '',
  max_selections INTEGER NOT NULL DEFAULT 0,
  drive_link TEXT,
  selection_submitted_at TEXT,
  package_id INTEGER REFERENCES packages(id),
  extra_photo_price_cents INTEGER NOT NULL DEFAULT 0,
  access_mode TEXT NOT NULL DEFAULT 'code',
  client_email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  gallery_id INTEGER NOT NULL REFERENCES client_galleries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  selected INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_id INTEGER REFERENCES packages(id),
  gallery_code TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  installments INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS instagram_posts (
  id TEXT PRIMARY KEY,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT NOT NULL DEFAULT '',
  permalink TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
