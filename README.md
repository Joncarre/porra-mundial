# ⚽ Porra Mundial 2026

Aplicación web para organizar una porra del Mundial de fútbol 2026 entre amigos.
**11 de junio – 19 de julio de 2026 · 48 equipos · 104 partidos · 29 días**

---

## Características

- Registro e inicio de sesión con nickname y contraseña
- **Fase 1**: Predicciones de 72 partidos de la fase de grupos + premios individuales (Máximo Goleador, Balón de Oro/Plata/Bronce)
- **Fase 2**: Bracket completo de eliminatoria (Dieciseisavos → Final), disponible el 28 de junio
- Clasificación en tiempo real con tabla de posiciones y pódium
- Resultados de grupos con tabla de clasificación por grupo
- Bracket visual de la fase eliminatoria
- Panel de administración completo

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Base de datos | Firebase Firestore |
| Autenticación | Custom (sesión localStorage) |
| Estilos | CSS puro con variables custom |
| Iconos | Lucide React |

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Activa **Firestore Database** en modo de prueba (o producción con las reglas adecuadas)
4. En Configuración del proyecto > Tus apps, registra una app web y copia las credenciales

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con las credenciales de tu proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

### 5. Build para producción

```bash
npm run build
```

---

## Cuenta de administrador

1. Regístrate con una cuenta normal a través de la interfaz
2. En la consola de Firebase > Firestore > colección `users`, busca el documento del usuario admin
3. Añade/edita el campo: `isAdmin: true`

El usuario con `isAdmin: true` verá el enlace **Admin** en la navegación.

---

## Estructura de Firestore

```
users/
  {userId}
    nombre, apellidos, email, nickname, password, isAdmin, pagado, createdAt

predicciones_fase1/
  {userId}
    partidos: { [matchId]: { g1, g2 } }
    maxGoleador, balonOro, balonPlata, balonBronce
    userId, updatedAt

predicciones_fase2/
  {userId}
    d32: [{ team1, team2, g1, g2 }]  × 16
    o16: [{ team1, team2, g1, g2 }]  × 8
    qf:  [{ team1, team2, g1, g2 }]  × 4
    sf:  [{ team1, team2, g1, g2 }]  × 2
    tercerPuesto: { team1, team2, g1, g2 }
    final: { team1, team2, g1, g2 }
    userId, updatedAt

resultados/
  grupos
    partidos: { [matchId]: { g1, g2 } }
    maxGoleador, balonOro, balonPlata, balonBronce
    updatedAt
  eliminatoria
    d32, o16, qf, sf, tercerPuesto, final
    updatedAt

torneo/
  config
    fase1Cerrada: bool
    fase2Habilitada: bool
    d32Matchups: [{ team1, team2 }] × 16
    boteTotal: number
    maxGoleadorActual: string
    updatedAt
```

---

## Sistema de puntuación

### Fase de Grupos

| Acierto | Puntos |
|---------|--------|
| Ganador del partido | **+1** |
| Resultado exacto | **+3** |
| Máximo goleador | **+4** |
| Balón de Oro | **+3** |
| Balón de Plata | **+2** |
| Balón de Bronce | **+1** |

> El resultado exacto incluye el ganador. Si aciertas el marcador exacto, obtienes 3 puntos en total (no 1+3).

### Fase Eliminatoria

| Ronda | Ganador | Resultado exacto |
|-------|---------|:---:|
| Dieciseisavos | +2 | **+5** |
| Octavos | +3 | **+6** |
| Cuartos | +4 | **+8** |
| Semifinales | +5 | **+10** |
| Tercer puesto | +4 | **+8** |
| Final | +6 | **+12** |

---

## Grupos del Mundial 2026

| Grupo | Equipos |
|-------|---------|
| A | México · Sudáfrica · Corea del Sur · Chequia |
| B | Canadá · Bosnia-Herzegovina · Catar · Suiza |
| C | Brasil · Marruecos · Haití · Escocia |
| D | Estados Unidos · Paraguay · Australia · Turquía |
| E | Alemania · Curazao · Costa de Marfil · Ecuador |
| F | Países Bajos · Japón · Suecia · Túnez |
| G | Bélgica · Egipto · Irán · Nueva Zelanda |
| H | España · Cabo Verde · Arabia Saudí · Uruguay |
| I | Francia · Senegal · Irak · Noruega |
| J | Argentina · Argelia · Austria · Jordania |
| K | Portugal · Congo DR · Uzbekistán · Colombia |
| L | Inglaterra · Croacia · Ghana · Panamá |

---

## Fases del desarrollo

| Fase | Descripción |
|------|-------------|
| ✅ 1 | Setup del proyecto, Firebase, diseño, autenticación, Fase 1 de predicciones |
| 🔜 2 | Mejoras UX, diseño responsive móvil, notificaciones |
| 🔜 3 | Deploy (Firebase Hosting / Netlify / Vercel) |

---

## Licencia

MIT
