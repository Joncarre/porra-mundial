// ─────────────────────────────────────────────────────────────────────────────
// Mock completo de firebase/firestore para modo demo
// ─────────────────────────────────────────────────────────────────────────────

// ── Base de datos en memoria ──────────────────────────────────────────────────

const DB = {
  // ── Usuarios ────────────────────────────────────────────────────────────────
  users: {
    demo:   { nombre: 'Usuario',   apellidos: 'Demo',              email: 'demo@demo.com',    nickname: 'demo',       password: 'demo',  isAdmin: false, pagado: true  },
    admin1: { nombre: 'Admin',     apellidos: 'Mundial',           email: 'admin@demo.com',   nickname: 'admin',      password: 'admin', isAdmin: true,  pagado: true  },
    u1:     { nombre: 'Carlos',    apellidos: 'García López',      email: 'carlos@demo.com',  nickname: 'ElGarrón',   password: 'demo',  isAdmin: false, pagado: true  },
    u2:     { nombre: 'María',     apellidos: 'Rodríguez Pérez',   email: 'maria@demo.com',   nickname: 'TigresFC',   password: 'demo',  isAdmin: false, pagado: true  },
    u3:     { nombre: 'Pedro',     apellidos: 'Martínez Silva',    email: 'pedro@demo.com',   nickname: 'Pichichi26', password: 'demo',  isAdmin: false, pagado: false },
    u4:     { nombre: 'Ana',       apellidos: 'Sánchez Ruiz',      email: 'ana@demo.com',     nickname: 'GolDeOro',   password: 'demo',  isAdmin: false, pagado: true  },
    u5:     { nombre: 'Luis',      apellidos: 'Fernández Torres',  email: 'luis@demo.com',    nickname: 'LaFuria',    password: 'demo',  isAdmin: false, pagado: true  },
    u6:     { nombre: 'Sara',      apellidos: 'González Díaz',     email: 'sara@demo.com',    nickname: 'MundialPro', password: 'demo',  isAdmin: false, pagado: false },
    u7:     { nombre: 'Javi',      apellidos: 'López Moreno',      email: 'javi@demo.com',    nickname: 'CañoneroMX', password: 'demo',  isAdmin: false, pagado: true  },
  },

  // ── Configuración del torneo ─────────────────────────────────────────────────
  torneo: {
    config: {
      fase1Cerrada: false,
      fase2Habilitada: false,
      boteTotal: 180,
      maxGoleadorActual: 'Kylian Mbappé',
      d32Matchups: [],
    },
  },

  // ── Resultados reales de la fase de grupos ────────────────────────────────────
  resultados: {
    grupos: {
      partidos: {
        // Grupo A — completo
        GA_1: { g1: 2, g2: 1 }, // México 2-1 Sudáfrica
        GA_2: { g1: 1, g2: 1 }, // Corea del Sur 1-1 Chequia
        GA_3: { g1: 1, g2: 0 }, // México 1-0 Corea del Sur
        GA_4: { g1: 0, g2: 2 }, // Sudáfrica 0-2 Chequia
        GA_5: { g1: 3, g2: 1 }, // México 3-1 Chequia
        GA_6: { g1: 2, g2: 1 }, // Sudáfrica 2-1 Corea del Sur
        // Grupo B — completo
        GB_1: { g1: 3, g2: 0 }, // Canadá 3-0 Bosnia-Herzegovina
        GB_2: { g1: 1, g2: 2 }, // Catar 1-2 Suiza
        GB_3: { g1: 2, g2: 1 }, // Canadá 2-1 Catar
        GB_4: { g1: 1, g2: 3 }, // Bosnia-Herzegovina 1-3 Suiza
        GB_5: { g1: 1, g2: 1 }, // Canadá 1-1 Suiza
        GB_6: { g1: 2, g2: 0 }, // Bosnia-Herzegovina 2-0 Catar
        // Grupo C — jornada 1 y 2
        GC_1: { g1: 4, g2: 0 }, // Brasil 4-0 Marruecos
        GC_2: { g1: 0, g2: 2 }, // Haití 0-2 Escocia
        GC_3: { g1: 2, g2: 2 }, // Brasil 2-2 Haití
        GC_4: { g1: 0, g2: 1 }, // Marruecos 0-1 Escocia
        // Grupo D — jornada 1
        GD_1: { g1: 2, g2: 0 }, // Estados Unidos 2-0 Paraguay
        GD_2: { g1: 1, g2: 1 }, // Australia 1-1 Turquía
        // Grupo E — jornada 1
        GE_1: { g1: 5, g2: 0 }, // Alemania 5-0 Curazao
        GE_2: { g1: 2, g2: 1 }, // Costa de Marfil 2-1 Ecuador
        // Grupo H — jornada 1
        GH_1: { g1: 3, g2: 0 }, // España 3-0 Cabo Verde
        GH_2: { g1: 0, g2: 2 }, // Arabia Saudí 0-2 Uruguay
        // Grupo I — jornada 1
        GI_1: { g1: 2, g2: 0 }, // Francia 2-0 Senegal
        GI_2: { g1: 1, g2: 3 }, // Irak 1-3 Noruega
        // Grupo J — jornada 1
        GJ_1: { g1: 3, g2: 0 }, // Argentina 3-0 Argelia
        GJ_2: { g1: 2, g2: 0 }, // Austria 2-0 Jordania
        // Grupo L — jornada 1
        GL_1: { g1: 1, g2: 0 }, // Inglaterra 1-0 Croacia
        GL_2: { g1: 2, g2: 2 }, // Ghana 2-2 Panamá
      },
      maxGoleador: '',
      balonOro: '',
      balonPlata: '',
      balonBronce: '',
    },
    eliminatoria: {},
  },

  // ── Predicciones fase 1 por usuario ──────────────────────────────────────────
  predicciones_fase1: {
    u1: {
      userId: 'u1',
      partidos: {
        // ElGarrón — muy bueno, acertó casi todo
        GA_1: { g1: 2, g2: 1 }, // exacto ✓✓
        GA_2: { g1: 0, g2: 1 }, // ganador ✓ (pred visitante, real empate) ✗
        GA_3: { g1: 1, g2: 0 }, // exacto ✓✓
        GA_4: { g1: 0, g2: 1 }, // ganador ✓
        GA_5: { g1: 2, g2: 0 }, // ganador ✓
        GA_6: { g1: 2, g2: 0 }, // ganador ✓
        GB_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GB_2: { g1: 0, g2: 2 }, // exacto ✓✓
        GB_3: { g1: 2, g2: 1 }, // exacto ✓✓
        GB_4: { g1: 0, g2: 2 }, // ganador ✓
        GB_5: { g1: 0, g2: 1 }, // ganador ✓
        GB_6: { g1: 1, g2: 0 }, // ganador ✓
        GC_1: { g1: 3, g2: 0 }, // ganador ✓
        GC_2: { g1: 0, g2: 2 }, // exacto ✓✓
        GC_3: { g1: 2, g2: 2 }, // exacto ✓✓
        GC_4: { g1: 0, g2: 1 }, // exacto ✓✓
        GD_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GD_2: { g1: 1, g2: 0 }, // ganador ✗ (real empate)
        GE_1: { g1: 4, g2: 0 }, // ganador ✓
        GE_2: { g1: 2, g2: 1 }, // exacto ✓✓
        GH_1: { g1: 2, g2: 0 }, // ganador ✓
        GH_2: { g1: 0, g2: 2 }, // exacto ✓✓
        GI_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GI_2: { g1: 1, g2: 3 }, // exacto ✓✓
        GJ_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GJ_2: { g1: 1, g2: 0 }, // ganador ✓
        GL_1: { g1: 1, g2: 0 }, // exacto ✓✓
        GL_2: { g1: 1, g2: 2 }, // ganador ✗
      },
      maxGoleador: 'Kylian Mbappé',
      balonOro: 'Lionel Messi',
      balonPlata: 'Kylian Mbappé',
      balonBronce: 'Erling Haaland',
    },
    u2: {
      userId: 'u2',
      partidos: {
        // TigresFC — bueno
        GA_1: { g1: 1, g2: 0 }, // ganador ✓
        GA_2: { g1: 1, g2: 1 }, // exacto ✓✓
        GA_3: { g1: 2, g2: 0 }, // ganador ✓
        GA_4: { g1: 0, g2: 1 }, // ganador ✓
        GA_5: { g1: 2, g2: 1 }, // ganador ✓
        GA_6: { g1: 1, g2: 0 }, // ganador ✓
        GB_1: { g1: 2, g2: 0 }, // ganador ✓
        GB_2: { g1: 1, g2: 2 }, // exacto ✓✓
        GB_3: { g1: 1, g2: 0 }, // ganador ✓
        GB_4: { g1: 0, g2: 2 }, // ganador ✓
        GB_5: { g1: 0, g2: 2 }, // ganador ✓
        GB_6: { g1: 0, g2: 1 }, // ✗
        GC_1: { g1: 4, g2: 0 }, // exacto ✓✓
        GC_2: { g1: 0, g2: 1 }, // ganador ✓
        GD_1: { g1: 1, g2: 0 }, // ganador ✓
        GE_1: { g1: 3, g2: 0 }, // ganador ✓
        GH_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GH_2: { g1: 0, g2: 1 }, // ganador ✓
        GI_1: { g1: 1, g2: 0 }, // ganador ✓
        GJ_1: { g1: 2, g2: 0 }, // ganador ✓
        GL_1: { g1: 1, g2: 0 }, // exacto ✓✓
      },
      maxGoleador: 'Erling Haaland',
      balonOro: 'Kylian Mbappé',
      balonPlata: 'Vinicius Jr.',
      balonBronce: 'Lionel Messi',
    },
    u3: {
      userId: 'u3',
      partidos: {
        // Pichichi26 — regular
        GA_1: { g1: 1, g2: 1 }, // ✗
        GA_2: { g1: 1, g2: 0 }, // ganador ✗
        GA_3: { g1: 0, g2: 1 }, // ganador ✗
        GA_4: { g1: 1, g2: 0 }, // ✗
        GA_5: { g1: 2, g2: 1 }, // ganador ✓
        GA_6: { g1: 1, g2: 1 }, // ✗
        GB_1: { g1: 2, g2: 1 }, // ganador ✓
        GB_2: { g1: 2, g2: 1 }, // ✗
        GB_3: { g1: 1, g2: 1 }, // ✗
        GB_4: { g1: 1, g2: 1 }, // ✗
        GC_1: { g1: 2, g2: 0 }, // ganador ✓
        GE_1: { g1: 3, g2: 1 }, // ganador ✓
        GH_1: { g1: 1, g2: 0 }, // ganador ✓
        GJ_1: { g1: 2, g2: 1 }, // ganador ✓
      },
      maxGoleador: 'Lionel Messi',
      balonOro: 'Erling Haaland',
      balonPlata: 'Kylian Mbappé',
      balonBronce: 'Jude Bellingham',
    },
    u4: {
      userId: 'u4',
      partidos: {
        // GolDeOro — bastante buena
        GA_1: { g1: 2, g2: 0 }, // ganador ✓
        GA_2: { g1: 1, g2: 1 }, // exacto ✓✓
        GA_3: { g1: 1, g2: 0 }, // exacto ✓✓
        GA_4: { g1: 0, g2: 2 }, // exacto ✓✓
        GA_5: { g1: 2, g2: 1 }, // ganador ✓
        GA_6: { g1: 2, g2: 1 }, // exacto ✓✓
        GB_1: { g1: 2, g2: 0 }, // ganador ✓
        GB_2: { g1: 0, g2: 1 }, // ganador ✓
        GB_3: { g1: 2, g2: 1 }, // exacto ✓✓
        GB_4: { g1: 0, g2: 2 }, // ganador ✓
        GC_1: { g1: 3, g2: 0 }, // ganador ✓
        GC_2: { g1: 0, g2: 2 }, // exacto ✓✓
        GD_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GE_1: { g1: 5, g2: 0 }, // exacto ✓✓
        GH_1: { g1: 2, g2: 0 }, // ganador ✓
        GI_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GJ_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GL_1: { g1: 1, g2: 0 }, // exacto ✓✓
      },
      maxGoleador: 'Kylian Mbappé',
      balonOro: 'Lionel Messi',
      balonPlata: 'Erling Haaland',
      balonBronce: 'Kylian Mbappé',
    },
    u5: {
      userId: 'u5',
      partidos: {
        // LaFuria — malo
        GA_1: { g1: 0, g2: 1 }, // ✗
        GA_2: { g1: 2, g2: 1 }, // ✗
        GA_3: { g1: 0, g2: 2 }, // ✗
        GA_4: { g1: 1, g2: 0 }, // ✗
        GA_5: { g1: 1, g2: 2 }, // ✗
        GB_1: { g1: 1, g2: 1 }, // ✗
        GB_2: { g1: 2, g2: 0 }, // ✗
        GC_1: { g1: 1, g2: 0 }, // ganador ✓
        GH_1: { g1: 2, g2: 0 }, // ganador ✓
        GI_1: { g1: 0, g2: 0 }, // ✗
        GJ_1: { g1: 1, g2: 1 }, // ✗
      },
      maxGoleador: 'Vinicius Jr.',
      balonOro: 'Vinicius Jr.',
      balonPlata: 'Pedri',
      balonBronce: 'Lamine Yamal',
    },
    u6: {
      userId: 'u6',
      partidos: {
        // MundialPro — regular tirando a bueno
        GA_1: { g1: 1, g2: 0 }, // ganador ✓
        GA_2: { g1: 2, g2: 1 }, // ganador ✗
        GA_3: { g1: 1, g2: 0 }, // exacto ✓✓
        GA_4: { g1: 0, g2: 1 }, // ganador ✓
        GA_5: { g1: 2, g2: 0 }, // ganador ✓
        GB_1: { g1: 3, g2: 1 }, // ganador ✓
        GB_2: { g1: 0, g2: 2 }, // ganador ✓
        GB_3: { g1: 2, g2: 1 }, // exacto ✓✓
        GC_1: { g1: 3, g2: 0 }, // ganador ✓
        GE_1: { g1: 4, g2: 0 }, // ganador ✓
        GH_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GI_1: { g1: 1, g2: 0 }, // ganador ✓
        GJ_1: { g1: 2, g2: 0 }, // ganador ✓
        GL_1: { g1: 0, g2: 0 }, // ✗
      },
      maxGoleador: 'Kylian Mbappé',
      balonOro: 'Kylian Mbappé',
      balonPlata: 'Lionel Messi',
      balonBronce: 'Erling Haaland',
    },
    u7: {
      userId: 'u7',
      partidos: {
        // CañoneroMX — bueno para México
        GA_1: { g1: 2, g2: 1 }, // exacto ✓✓
        GA_3: { g1: 2, g2: 0 }, // ganador ✓
        GA_5: { g1: 3, g2: 1 }, // exacto ✓✓
        GA_6: { g1: 1, g2: 2 }, // ✗
        GB_1: { g1: 2, g2: 0 }, // ganador ✓
        GB_2: { g1: 1, g2: 1 }, // ✗
        GC_1: { g1: 4, g2: 0 }, // exacto ✓✓
        GD_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GE_1: { g1: 3, g2: 0 }, // ganador ✓
        GH_2: { g1: 0, g2: 2 }, // exacto ✓✓
        GI_1: { g1: 2, g2: 0 }, // exacto ✓✓
        GJ_1: { g1: 3, g2: 0 }, // exacto ✓✓
        GL_1: { g1: 1, g2: 0 }, // exacto ✓✓
      },
      maxGoleador: 'Kylian Mbappé',
      balonOro: 'Lionel Messi',
      balonPlata: 'Erling Haaland',
      balonBronce: 'Vinicius Jr.',
    },
    demo: {
      userId: 'demo',
      partidos: {},
      maxGoleador: '',
      balonOro: '',
      balonPlata: '',
      balonBronce: '',
    },
  },

  predicciones_fase2: {},
};

// ── Escritura en memoria (para setDoc/updateDoc/addDoc) ───────────────────────
const WRITES = {};

// ── Implementación de las funciones de Firestore ──────────────────────────────

export function getFirestore() {
  return { _demo: true };
}

// Referencia a un documento
export function doc(_db, col, id) {
  return { _col: col, _id: id };
}

// Referencia a una colección
export function collection(_db, col) {
  return { _col: col };
}

// Query con condiciones (simplificado)
export function query(colRef, ...conditions) {
  return { _col: colRef._col, _conditions: conditions };
}

export function where(field, op, value) {
  return { field, op, value };
}

export function orderBy() { return {}; }
export function limit() { return {}; }

export function serverTimestamp() {
  return new Date();
}

// ── getDoc ────────────────────────────────────────────────────────────────────
export async function getDoc(ref) {
  const { _col, _id } = ref;
  const colStore = DB[_col] || WRITES[_col] || {};
  const data = colStore[_id] || WRITES[`${_col}/${_id}`] || null;
  return {
    exists: () => data !== null,
    data: () => (data ? { ...data } : undefined),
    id: _id,
  };
}

// ── getDocs ───────────────────────────────────────────────────────────────────
export async function getDocs(queryRef) {
  const col = queryRef._col;
  const colStore = { ...(DB[col] || {}), ...(WRITES[col] || {}) };
  let docs = Object.entries(colStore).map(([id, data]) => ({
    id,
    data: () => ({ ...data }),
    exists: () => true,
  }));

  // Aplicar filtros where básicos
  if (queryRef._conditions) {
    queryRef._conditions.forEach((cond) => {
      if (!cond.field) return;
      docs = docs.filter((d) => {
        const val = d.data()[cond.field];
        if (cond.op === '==') return val === cond.value;
        return true;
      });
    });
  }

  return {
    docs,
    forEach: (cb) => docs.forEach(cb),
    empty: docs.length === 0,
  };
}

// ── setDoc ────────────────────────────────────────────────────────────────────
export async function setDoc(ref, data, options = {}) {
  const { _col, _id } = ref;
  if (!WRITES[_col]) WRITES[_col] = {};
  if (options.merge) {
    WRITES[_col][_id] = { ...(DB[_col]?.[_id] || {}), ...(WRITES[_col][_id] || {}), ...data };
  } else {
    WRITES[_col][_id] = { ...data };
  }
}

// ── updateDoc ─────────────────────────────────────────────────────────────────
export async function updateDoc(ref, data) {
  const { _col, _id } = ref;
  if (!WRITES[_col]) WRITES[_col] = {};
  WRITES[_col][_id] = {
    ...(DB[_col]?.[_id] || {}),
    ...(WRITES[_col]?.[_id] || {}),
    ...data,
  };
}

// ── addDoc ────────────────────────────────────────────────────────────────────
export async function addDoc(colRef, data) {
  const col = colRef._col;
  const id = `new_${Date.now()}`;
  if (!WRITES[col]) WRITES[col] = {};
  WRITES[col][id] = { ...data };
  return { id };
}
