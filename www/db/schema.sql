CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT, fullName TEXT, position TEXT
);

CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY,
  firstName TEXT, middleName TEXT, lastName TEXT,
  parentType TEXT, sex TEXT, dob TEXT, age INTEGER,
  occupation TEXT, email TEXT, contactNumber TEXT, address TEXT,
  password TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  firstName TEXT, middleName TEXT, lastName TEXT,
  sex TEXT, dob TEXT, address TEXT,
  ageLevel TEXT,
  parentsJson TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY,
  childId TEXT NOT NULL,
  date TEXT NOT NULL,
  height REAL, weight REAL, bmi TEXT, status TEXT,
  heightPhotoKey TEXT, weightPhotoKey TEXT,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id TEXT PRIMARY KEY,
  ageLevelsJson TEXT NOT NULL DEFAULT '[]',
  statusesJson TEXT NOT NULL DEFAULT '[]',
  weekStart TEXT, weekEnd TEXT,
  mealsJson TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS health_programs (
  id TEXT PRIMARY KEY,
  title TEXT, type TEXT, dateTime TEXT, location TEXT,
  ageLevelsJson TEXT NOT NULL DEFAULT '[]',
  statusesJson TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS pending_parents ( /* same cols as parents */ id TEXT PRIMARY KEY, /* ... */ );
CREATE TABLE IF NOT EXISTS pending_updates (
  id TEXT PRIMARY KEY,
  childId TEXT, parentId TEXT,
  height REAL, weight REAL, date TEXT,
  heightPhotoKey TEXT, weightPhotoKey TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  programId TEXT NOT NULL,
  parentId TEXT NOT NULL,
  confirmedAt TEXT NOT NULL,
  UNIQUE (programId, parentId)
);

CREATE TABLE IF NOT EXISTS photos (
  key TEXT PRIMARY KEY,
  dataUrl TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS child_parents (
  childId TEXT NOT NULL,
  parentId TEXT NOT NULL,
  PRIMARY KEY (childId, parentId)
);