# Porra Mundial 2026

Aplicación web para organizar una porra entre amigos del Mundial de Fútbol 2026 (11 junio – 19 julio 2026, 48 equipos, 104 partidos).

## Stack

- **React 18** + **Vite** + **React Router v6**
- **Firebase Firestore** (sin Firebase Auth — sesión vía localStorage)
- **CSS** puro con variables custom (tema light pastel premium con acentos dorados antiguos)
- **lucide-react** únicamente para los iconos interiores de los avatares predefinidos

## Funcionalidades principales

- Registro y login sencillos (datos guardados en texto plano por petición explícita).
- Pantalla de bienvenida y guía "¿Cómo funciona esta porra?".
- Plantilla de apuestas para fase de grupos (resultado de los 72 partidos + máximo goleador + balones oro/plata/bronce).
- Plantilla de eliminatoria con bracket guiado: a partir de los pronósticos del usuario en la fase de grupos, el sistema solo permite seleccionar equipos compatibles con los cruces oficiales.
- Pantalla pública de resultados de la fase de grupos con cálculo automático de clasificaciones.
- Tabla de clasificación de la porra con cálculo de puntos según ponderación.
- Panel de administración para gestionar resultados, pagos y premios.

## Sistema de puntos

### Fase de grupos
- **+1 punto** por acertar ganador / empate / perdedor.
- **+3 puntos extra** por acertar el resultado exacto (máximo 4 puntos por partido).
- **+10 puntos** por acertar el máximo goleador.
- **+20 puntos** por cada balón acertado (oro, plata, bronce).

### Fase eliminatoria
- **+4 puntos** por cada equipo que acierte que pasa a octavos (desde los 32 de dieciseisavos).
- **+6 puntos** por cada equipo que pase a cuartos.
- **+8 puntos** por cada equipo que pase a semifinales.
- **+10 puntos** por acertar el 3.º y 4.º puesto.
- **+10 puntos** por cada equipo que llegue a la final.
- **+10 puntos** por acertar el ganador del Mundial.

## Fases de desarrollo

1. **Cimientos** — setup del proyecto, design system, Welcome y HowItWorks (esta fase).
2. **Autenticación y perfil** — registro, login y perfil con avatares premium.
3. **Admin y resultados de grupos** — pantalla pública de grupos + panel admin mínimo.
4. **Apuestas fase de grupos** — plantilla y simulación personal de clasificación.
5. **Bracket eliminatorio** — selección guiada a partir de los propios pronósticos de grupos del usuario.
6. **Clasificación** — tabla con puntos calculados y bote total.

## Cómo arrancar el proyecto

```bash
npm install
npm run dev
```

Configura las variables de Firebase en `.env`:

```
VITE_DEMO_MODE=false
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

En modo demo (`VITE_DEMO_MODE=true`), la app arranca sin conexión real a Firebase para poder iterar en local sobre el diseño.
