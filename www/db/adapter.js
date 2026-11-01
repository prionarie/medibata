// db/adapter.js  — normalized SQLite backing, same API as before
// Requires sql.js loaded as `initSqlJs`

let _db = null;
let _SQL = null;
let _lastLoadedRev = 0;
let _cachedState = null;

const DB_NAME = "medibata.sqlite";
const IDB_NAME = "medibata-db";
const IDB_STORE = "sqlite";
const SCHEMA_VERSION = 2;

async function _idb() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function _loadBytes() {
  const db = await _idb();
  return new Promise((res, rej) => {
    const req = db
      .transaction(IDB_STORE, "readonly")
      .objectStore(IDB_STORE)
      .get("main");
    req.onsuccess = () => res(req.result || null);
    req.onerror = () => rej(req.error);
  });
}
async function _saveBytes(bytes) {
  const db = await _idb();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(bytes, "main");
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error || new Error("IDB write failed"));
    tx.onabort = () => rej(tx.error || new Error("IDB write aborted"));
  });
}
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
  email TEXT, fullName TEXT, position TEXT
);
CREATE TABLE IF NOT EXISTS parents (
  id TEXT PRIMARY KEY, firstName TEXT, middleName TEXT, lastName TEXT,
  parentType TEXT, sex TEXT, dob TEXT, age INTEGER,
  occupation TEXT, email TEXT, contactNumber TEXT, address TEXT,
  password TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS pending_parents (
  id TEXT PRIMARY KEY, firstName TEXT, middleName TEXT, lastName TEXT,
  parentType TEXT, sex TEXT, dob TEXT, age INTEGER,
  occupation TEXT, email TEXT, contactNumber TEXT, address TEXT,
  password TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY, firstName TEXT, middleName TEXT, lastName TEXT,
  sex TEXT, dob TEXT, address TEXT, ageLevel TEXT,
  parentsJson TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY, childId TEXT NOT NULL, date TEXT NOT NULL,
  height REAL, weight REAL, bmi TEXT, status TEXT,
  heightPhotoKey TEXT, weightPhotoKey TEXT,
  FOREIGN KEY (childId) REFERENCES children(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id TEXT PRIMARY KEY, ageLevelsJson TEXT NOT NULL DEFAULT '[]',
  statusesJson TEXT NOT NULL DEFAULT '[]', weekStart TEXT, weekEnd TEXT,
  mealsJson TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS health_programs (
  id TEXT PRIMARY KEY, title TEXT, type TEXT, dateTime TEXT, location TEXT,
  ageLevelsJson TEXT NOT NULL DEFAULT '[]', statusesJson TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS pending_updates (
  id TEXT PRIMARY KEY, childId TEXT, parentId TEXT,
  height REAL, weight REAL, date TEXT,
  heightPhotoKey TEXT, weightPhotoKey TEXT
);
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY, programId TEXT NOT NULL, parentId TEXT NOT NULL,
  confirmedAt TEXT NOT NULL, UNIQUE (programId, parentId)
);
CREATE TABLE IF NOT EXISTS child_parents (
  childId TEXT NOT NULL, parentId TEXT NOT NULL, PRIMARY KEY (childId, parentId)
);
`;

// Start of sample data
const SEED_DATA = {
  children: [
    {
      id: "seed_child_1",
      firstName: "Mika",
      middleName: "Reyes",
      lastName: "Santos",
      sex: "Female",
      dob: "2021-03-15",       // ~5 years old -> Toddlers/Preschool boundary; adjust as needed
      address: "12 Mabini St, Brgy. San Isidro",
      ageLevel: "Preschool",
      parents: [{ name: "Ana Santos", contact: "09170000001", type: "Mother" }],
      measurements: [
        { id: "seed_m_1", date: "2026-10-01", height: 105, weight: 12.5, bmi: "11.3", status: "Underweight" },
      ],
    },
    {
      id: "seed_child_2",
      firstName: "Luis",
      middleName: "Cruz",
      lastName: "Dela Cruz",
      sex: "Male",
      dob: "2019-07-22",       // ~7 years old -> School Age
      address: "45 Rizal Ave, Brgy. San Isidro",
      ageLevel: "School Age",
      parents: [{ name: "Rosa Dela Cruz", contact: "09170000002", type: "Mother" }],
      measurements: [
        { id: "seed_m_2", date: "2026-10-01", height: 118, weight: 32.0, bmi: "23.0", status: "Overweight" },
      ],
    },
    {
      id: "seed_child_3",
      firstName: "Bea",
      middleName: "Lopez",
      lastName: "Ramos",
      sex: "Female",
      dob: "2020-11-05",       // ~6 years old -> School Age
      address: "8 Luna St, Brgy. San Isidro",
      ageLevel: "School Age",
      parents: [{ name: "Carlo Ramos", contact: "09170000003", type: "Father" }],
      measurements: [
        { id: "seed_m_3", date: "2026-10-01", height: 112, weight: 18.5, bmi: "14.7", status: "Normal" },
      ],
    },
  ],

  nutritionPlans: [
    makeWeek("plan_2026_11_02", "2026-11-02", "2026-11-08"),
    makeWeek("plan_2026_11_09", "2026-11-09", "2026-11-15"),
    makeWeek("plan_2026_11_16", "2026-11-16", "2026-11-22"),
    makeWeek("plan_2026_11_23", "2026-11-23", "2026-11-29"),
  ],

  healthPrograms: [
    {
      id: "seed_prog_underweight",
      title: "Feeding Program — Underweight Children",
      type: "Nutrition Support",
      dateTime: "2026-11-10T09:00",
      location: "Barangay Health Center, Hall A",
      ageLevels: ["Toddlers", "Preschool", "School Age"],
      nutritionalStatuses: ["Underweight"],
    },
    {
      id: "seed_prog_overweight",
      title: "Healthy Habits Workshop — Overweight Children",
      type: "Lifestyle Seminar",
      dateTime: "2026-11-17T14:00",
      location: "Barangay Health Center, Hall B",
      ageLevels: ["Preschool", "School Age", "Adolescent"],
      nutritionalStatuses: ["Overweight"],
    },
    {
      id: "seed_prog_normal",
      title: "Growth Monitoring & Wellness Check",
      type: "Check-up",
      dateTime: "2026-11-24T09:30",
      location: "Barangay Health Center, Main Lobby",
      ageLevels: ["Toddlers", "Preschool", "School Age", "Adolescent"],
      nutritionalStatuses: ["Normal"],
    },
  ],
};

//End of sample data

function makeWeek(id, weekStart, weekEnd) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = {};
  days.forEach((day) => {
    meals[day] = {
      breakfast: `Oatmeal + banana (${day})`,
      lunch: `Rice + monggo + malunggay (${day})`,
      dinner: `Rice + grilled fish + vegetables (${day})`,
      snacks: `Fruit or milk (${day})`,
    };
  });
  return {
    id,
    ageLevels: ["Toddlers", "Preschool", "School Age"],
    nutritionalStatuses: ["Underweight", "Normal", "Overweight"],
    weekStart,
    weekEnd,
    meals,
  };
}

async function init() {
  if (_db) return _db;
  _SQL = await initSqlJs({
    locateFile: (f) => `vendor/sql.js/${f}`,
  });
  const saved = await _loadBytes();
  _db = saved ? new _SQL.Database(saved) : new _SQL.Database();
  _db.run(SCHEMA_SQL);
  _db.run("PRAGMA foreign_keys = ON;");
  await _seedSampleData(); // Sample data function
  return _db;
}

// Start of sample data seed
async function _seedSampleData() {

  const marker = _all("SELECT value FROM meta WHERE key='seeded_v1'")[0];
  if (marker) return;

  _db.run("BEGIN");
  try {

    for (const c of SEED_DATA.children) {
      _db.run(
        `INSERT OR IGNORE INTO children(id,firstName,middleName,lastName,sex,dob,address,ageLevel,parentsJson)
         VALUES(?,?,?,?,?,?,?,?,?)`,
        [
          c.id, c.firstName, c.middleName, c.lastName, c.sex, c.dob,
          c.address, c.ageLevel, JSON.stringify(c.parents || []),
        ],
      );
      for (const m of c.measurements || []) {
        _db.run(
          `INSERT OR IGNORE INTO measurements(id,childId,date,height,weight,bmi,status,heightPhotoKey,weightPhotoKey)
           VALUES(?,?,?,?,?,?,?,?,?)`,
          [m.id, c.id, m.date, m.height, m.weight, m.bmi, m.status, null, null],
        );
      }
    }

    for (const p of SEED_DATA.nutritionPlans) {
      _db.run(
        `INSERT OR IGNORE INTO nutrition_plans(id,ageLevelsJson,statusesJson,weekStart,weekEnd,mealsJson)
         VALUES(?,?,?,?,?,?)`,
        [
          p.id,
          JSON.stringify(p.ageLevels || []),
          JSON.stringify(p.nutritionalStatuses || []),
          p.weekStart,
          p.weekEnd,
          JSON.stringify(p.meals || {}),
        ],
      );
    }

    for (const p of SEED_DATA.healthPrograms) {
      _db.run(
        `INSERT OR IGNORE INTO health_programs(id,title,type,dateTime,location,ageLevelsJson,statusesJson)
         VALUES(?,?,?,?,?,?,?)`,
        [
          p.id, p.title, p.type, p.dateTime, p.location,
          JSON.stringify(p.ageLevels || []),
          JSON.stringify(p.nutritionalStatuses || []),
        ],
      );
    }

    _db.run(
      "INSERT INTO meta(key,value) VALUES('seeded_v1','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value"
    );
    _db.run("COMMIT");
  } catch (e) {
    try { _db.run("ROLLBACK"); } catch (_) {}
    throw e;
  }

  try {
    await _saveBytes(_db.export());
  } catch (e) {
    console.error("Seed persist failed:", e);
  }

  _cachedState = null;
  _lastLoadedRev = 0;
}

// End of sample data seed

function _all(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function get() {
  await init();

  const hasUsers =
    _all("SELECT COUNT(*) AS n FROM admins")[0].n +
    _all("SELECT COUNT(*) AS n FROM parents")[0].n +
    _all("SELECT COUNT(*) AS n FROM pending_parents")[0].n;
  if (hasUsers === 0) {
    _db.run(
      "INSERT INTO admins(id,username,password,email,fullName,position) VALUES(?,?,?,?,?,?)",
      [
        "admin1",
        "admin",
        "admin123",
        "admin@medibata.ph",
        "Dr. Maria Santos",
        "Head Health Worker",
      ],
    );
    _db.run(
      `INSERT INTO parents(id,firstName,middleName,lastName,parentType,sex,dob,age,
        occupation,email,contactNumber,address,password,verified)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1)`,
      [
        "parent1",
        "Juan",
        "M",
        "Dela Cruz",
        "Father",
        "Male",
        "1990-05-10",
        36,
        "Driver",
        "juan@email.com",
        "09171234567",
        "123 Orphiucus St",
        "parent123",
      ],
    );
    await _saveBytes(_db.export());
  }

  const revRow = _all("SELECT value FROM meta WHERE key='rev'")[0];
  const rev = revRow ? parseInt(revRow.value, 10) : 0;
  if (_cachedState && rev === _lastLoadedRev) return _cachedState;

  const admins = _all("SELECT * FROM admins");
  const parents = _all("SELECT * FROM parents").map((p) => ({
    ...p,
    verified: !!p.verified,
    childrenIds: [],
  }));
  const pendingParents = _all("SELECT * FROM pending_parents").map((p) => ({
    ...p,
    verified: !!p.verified,
    childrenIds: [],
  }));
  const children = _all("SELECT * FROM children").map((c) => ({
    ...c,
    parents: JSON.parse(c.parentsJson || "[]"),
    measurements: [],
  }));
  const childMap = Object.fromEntries(children.map((c) => [c.id, c]));

  _all("SELECT * FROM measurements ORDER BY date ASC").forEach((m) => {
    if (childMap[m.childId]) childMap[m.childId].measurements.push(m);
  });

  _all("SELECT * FROM child_parents").forEach(({ childId, parentId }) => {
    const p = parents.find((x) => x.id === parentId);
    if (p && !p.childrenIds.includes(childId)) p.childrenIds.push(childId);
  });

  const nutritionPlans = _all("SELECT * FROM nutrition_plans").map((p) => ({
    id: p.id,
    ageLevels: JSON.parse(p.ageLevelsJson || "[]"),
    nutritionalStatuses: JSON.parse(p.statusesJson || "[]"),
    weekStart: p.weekStart,
    weekEnd: p.weekEnd,
    meals: JSON.parse(p.mealsJson || "{}"),
  }));

  const healthPrograms = _all("SELECT * FROM health_programs").map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    dateTime: p.dateTime,
    location: p.location,
    ageLevels: JSON.parse(p.ageLevelsJson || "[]"),
    nutritionalStatuses: JSON.parse(p.statusesJson || "[]"),
  }));

  const pendingUpdates = _all("SELECT * FROM pending_updates");
  const attendance = _all("SELECT * FROM attendance");

  _cachedState = {
    _rev: rev,
    admins,
    parents,
    pendingParents,
    children,
    nutritionPlans,
    healthPrograms,
    pendingUpdates,
    attendance,
  };
  _lastLoadedRev = rev;
  return _cachedState;
}

async function set(state) {
  await init();
  const rev = (_lastLoadedRev || 0) + 1;
  _db.run("BEGIN");
  try {
    for (const t of [
      "admins",
      "parents",
      "pending_parents",
      "children",
      "measurements",
      "nutrition_plans",
      "health_programs",
      "pending_updates",
      "attendance",
      "child_parents",
    ])
      _db.run(`DELETE FROM ${t}`);

    for (const a of state.admins || []) {
      _db.run(
        "INSERT INTO admins(id,username,password,email,fullName,position) VALUES(?,?,?,?,?,?)",
        [
          a.id,
          a.username,
          a.password,
          a.email || null,
          a.fullName || null,
          a.position || null,
        ],
      );
    }
    for (const [tbl, arr] of [
      ["parents", state.parents],
      ["pending_parents", state.pendingParents],
    ]) {
      for (const p of arr || []) {
        _db.run(
          `INSERT INTO ${tbl}(id,firstName,middleName,lastName,parentType,sex,dob,age,
            occupation,email,contactNumber,address,password,verified) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            p.id,
            p.firstName,
            p.middleName,
            p.lastName,
            p.parentType,
            p.sex,
            p.dob,
            p.age,
            p.occupation,
            p.email,
            p.contactNumber,
            p.address,
            p.password,
            p.verified ? 1 : 0,
          ],
        );
        for (const cid of p.childrenIds || []) {
          _db.run(
            "INSERT OR IGNORE INTO child_parents(childId,parentId) VALUES(?,?)",
            [cid, p.id],
          );
        }
      }
    }
    for (const c of state.children || []) {
      _db.run(
        `INSERT INTO children(id,firstName,middleName,lastName,sex,dob,address,ageLevel,parentsJson)
         VALUES(?,?,?,?,?,?,?,?,?)`,
        [
          c.id,
          c.firstName,
          c.middleName,
          c.lastName,
          c.sex,
          c.dob,
          c.address,
          c.ageLevel,
          JSON.stringify(c.parents || []),
        ],
      );
      for (const m of c.measurements || []) {
        _db.run(
          `INSERT INTO measurements(id,childId,date,height,weight,bmi,status,heightPhotoKey,weightPhotoKey)
           VALUES(?,?,?,?,?,?,?,?,?)`,
          [
            m.id || "m_" + Math.random().toString(36).slice(2),
            c.id,
            m.date,
            m.height,
            m.weight,
            m.bmi,
            m.status,
            m.heightPhotoKey || null,
            m.weightPhotoKey || null,
          ],
        );
      }
    }
    for (const p of state.nutritionPlans || []) {
      _db.run(
        `INSERT INTO nutrition_plans(id,ageLevelsJson,statusesJson,weekStart,weekEnd,mealsJson)
         VALUES(?,?,?,?,?,?)`,
        [
          p.id,
          JSON.stringify(p.ageLevels || []),
          JSON.stringify(p.nutritionalStatuses || []),
          p.weekStart,
          p.weekEnd,
          JSON.stringify(p.meals || {}),
        ],
      );
    }
    for (const p of state.healthPrograms || []) {
      _db.run(
        `INSERT INTO health_programs(id,title,type,dateTime,location,ageLevelsJson,statusesJson)
         VALUES(?,?,?,?,?,?,?)`,
        [
          p.id,
          p.title,
          p.type,
          p.dateTime,
          p.location,
          JSON.stringify(p.ageLevels || []),
          JSON.stringify(p.nutritionalStatuses || []),
        ],
      );
    }
    for (const u of state.pendingUpdates || []) {
      _db.run(
        `INSERT INTO pending_updates(id,childId,parentId,height,weight,date,heightPhotoKey,weightPhotoKey)
         VALUES(?,?,?,?,?,?,?,?)`,
        [
          u.id || "u_" + Math.random().toString(36).slice(2),
          u.childId,
          u.parentId,
          u.height,
          u.weight,
          u.date,
          u.heightPhotoKey || null,
          u.weightPhotoKey || null,
        ],
      );
    }
    for (const a of state.attendance || []) {
      _db.run(
        "INSERT OR IGNORE INTO attendance(id,programId,parentId,confirmedAt) VALUES(?,?,?,?)",
        [a.id, a.programId, a.parentId, a.confirmedAt],
      );
    }
    _db.run(
      "INSERT INTO meta(key,value) VALUES('rev',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [String(rev)],
    );
    _db.run("COMMIT");
  } catch (e) {
    try { _db.run("ROLLBACK"); } catch (_) {}
    throw e;
  }

  _lastLoadedRev = rev;
  _cachedState = state;
  state._rev = rev;

  try {
    await _saveBytes(_db.export());
  } catch (e) {
    console.error(
      "Persist to IndexedDB failed (data is in SQLite but may not survive reload):",
      e,
    );
  }
  return true;
}

async function mutate(fn) {
  const current = await get();
  const working = structuredClone(current);
  const result = await fn(working);
  await set(working);
  return result;
}

async function safeMutate(fn) {
  try {
    return await mutate(fn);
  } catch (e) {
    console.error("safeMutate failed:", e);
    _cachedState = null;
    _lastLoadedRev = 0;
    return null;
  }
}
const PhotoStore = {
  async put(key, dataUrl) {
    const db = await _idb();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(dataUrl, "photo:" + key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },
  async get(key) {
    const db = await _idb();
    return new Promise((res, rej) => {
      const req = db
        .transaction(IDB_STORE, "readonly")
        .objectStore(IDB_STORE)
        .get("photo:" + key);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  },
  async del(key) {
    const db = await _idb();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete("photo:" + key);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },
};

function newPhotoKey() {
  return "ph_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}

window.DB = { get, set, init };
window.PhotoStore = PhotoStore;
window.newPhotoKey = newPhotoKey;
window.safeMutate = safeMutate;
