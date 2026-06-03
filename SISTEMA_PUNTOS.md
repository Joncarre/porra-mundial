# Sistema de puntos — Porra Mundial 2026

> Fuente de verdad: [`src/data/puntuacion.js`](src/data/puntuacion.js) (constantes) y [`src/utils/puntos.js`](src/utils/puntos.js) (cálculo).

---

## Fase de grupos

Aplica por cada uno de los **72 partidos** de la fase de grupos.

| Concepto | Puntos | Detalle |
|---|---:|---|
| Acertar ganador / empate / perdedor | **+1** | El "tipo" del marcador coincide (local gana, empate, o visitante gana). |
| Resultado exacto | **+3 extra** | Se suma sobre el +1 anterior. Marcador exacto coincidente. |

> Máximo por partido: **+4**
> Máximo total fase de grupos: **72 × 4 = 288**

---

## Clasificados a dieciseisavos

Cuando el admin ha cerrado los 12 grupos enteros, se determinan los 32 que pasan (1.º + 2.º de cada grupo + 8 mejores terceros).

> **Criterio de orden** (dentro de grupo y para los mejores terceros):
> puntos → diferencia de goles → partidos ganados → partidos perdidos → goles a favor → goles en contra. Por cada equipo del usuario (de los 32 según su porra) que coincida con los 32 reales:

| Concepto | Puntos |
|---|---:|
| Equipo clasificado acertado | **+2** |

> Máximo: **32 × 2 = 64**

> ⚠️ Solo se cuentan estos puntos cuando los 72 partidos de grupos están registrados por el admin. Si falta uno, este apartado da 0.

---

## Bracket eliminatorio

Comparación **por conjuntos** (no por llave/cruce): un equipo cuenta en una ronda si tanto el usuario como la realidad lo tenían en esa ronda, sin exigir que coincida la posición concreta del cuadro.

Las rondas se evalúan de forma **acumulativa e independiente**: un equipo que llega a cuartos puntúa por octavos Y por cuartos; un campeón puntúa por octavos, cuartos, semis, "llega a la final" y "gana el Mundial".

| Ronda | Partidos | Puntos por acierto | Máximo |
|---|:---:|---:|---:|
| Pasa a octavos | 73-88 (16) | **+4** | 64 |
| Pasa a cuartos | 89-96 (8) | **+6** | 48 |
| Pasa a semifinales | 97-100 (4) | **+8** | 32 |
| Llega a la final | 101-102 (2) | **+10** | 20 |
| Tercer puesto | 103 (1) | **+10** | 10 |
| Campeón (ganador final) | 104 (1) | **+30** | 30 |

> Máximo bracket: **204**

> ⚠️ El **cuarto puesto NO puntúa**.

---

## Premios individuales

Comparación de texto **case-insensitive** y con **trim** (ignora mayúsculas/minúsculas y espacios al inicio/final).

| Premio | Puntos |
|---|---:|
| Máximo goleador | **+10** |
| Balón de Oro | **+20** |
| Balón de Plata | **+20** |
| Balón de Bronce | **+20** |

> Máximo: **+70**

---

## Resumen total

| Bloque | Máximo |
|---|---:|
| Fase de grupos | 288 |
| Clasificados a dieciseisavos | 64 |
| Bracket | 204 |
| Premios | 70 |
| **TOTAL** | **626** |

---

## Condiciones para que se cuenten los puntos

1. Tiene que existir **predicción del usuario** Y **resultado oficial del admin** para ese partido/dato. Si falta cualquiera de los dos, ese punto no suma.
2. Los **+2 por clasificado a dieciseisavos** solo cuentan cuando los 12 grupos están cerrados (72 partidos con resultado real).
3. Los **premios** se comparan ignorando mayúsculas y espacios al inicio/final.
4. El bracket compara el equipo que el usuario marcó como ganador de cada partido con el que el admin haya marcado como ganador en el bracket oficial.
