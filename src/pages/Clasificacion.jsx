import { useEffect, useState, useMemo } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import Avatar from '../components/Avatar.jsx';
import { getAllUsers } from '../services/users.js';
import {
  getPrediccionesFase1,
  getPrediccionesFase2,
  getPrediccionesExtras,
} from '../services/predicciones.js';
import {
  getResultadosGrupos,
  getResultadosEliminatoria,
  getResultadosPremios,
} from '../services/resultados.js';
import { getTorneoConfig } from '../services/torneo.js';
import { calcularPuntos } from '../utils/puntos.js';
import './Clasificacion.css';

export default function Clasificacion() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [config, setConfig] = useState({ boteTotal: 0, maxGoleadorActual: '' });

  useEffect(() => {
    (async () => {
      const [users, resGruposDoc, resEliDoc, resPremiosDoc, cfg] = await Promise.all([
        getAllUsers(),
        getResultadosGrupos(),
        getResultadosEliminatoria(),
        getResultadosPremios(),
        getTorneoConfig(),
      ]);

      const resGrupos = resGruposDoc.partidos || {};
      const resBracket = resEliDoc.ganadores || {};
      const resPremios = resPremiosDoc;

      // Para cada usuario, cargar sus 3 documentos de predicciones y calcular.
      const computed = await Promise.all(
        users.map(async (u) => {
          const [pf1, pf2, pex] = await Promise.all([
            getPrediccionesFase1(u.id),
            getPrediccionesFase2(u.id),
            getPrediccionesExtras(u.id),
          ]);
          const stats = calcularPuntos({
            predGrupos: pf1.partidos || {},
            predBracket: pf2.ganadores || {},
            predExtras: pex,
            resGrupos,
            resBracket,
            resPremios,
          });
          return { user: u, ...stats };
        }),
      );

      // Orden: puntos desc → exactos desc → ganadores desc → nickname asc.
      computed.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.aciertosExacto !== a.aciertosExacto) return b.aciertosExacto - a.aciertosExacto;
        if (b.aciertosGanador !== a.aciertosGanador) return b.aciertosGanador - a.aciertosGanador;
        return a.user.nickname.localeCompare(b.user.nickname);
      });

      // Posición con manejo de empates: misma posición si mismos puntos
      // y mismos desempates principales.
      let prev = null;
      let posActual = 0;
      const conPos = computed.map((row, idx) => {
        const key = `${row.puntos}-${row.aciertosExacto}-${row.aciertosGanador}`;
        if (key !== prev) {
          posActual = idx + 1;
          prev = key;
        }
        return { ...row, posicion: posActual };
      });

      setRows(conPos);
      setConfig(cfg);
      setLoading(false);
    })();
  }, []);

  const boteFmt = useMemo(() => {
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(config.boteTotal || 0);
    } catch {
      return `${config.boteTotal || 0} €`;
    }
  }, [config.boteTotal]);

  return (
    <div className="cl-page">
      <AppHeader />
      <main className="cl-main">
        <div className="container">
          <header className="cl-page-header">
            <span className="eyebrow">Clasificación general</span>
            <h1 className="cl-page-title">La porra en vivo</h1>
            <p className="cl-page-sub">
              Los puntos se calculan cruzando tus pronósticos con los resultados
              oficiales del torneo a medida que el admin los va apuntando.
            </p>
          </header>

          {loading ? (
            <div className="cl-loading">Calculando puntos…</div>
          ) : rows.length === 0 ? (
            <div className="cl-empty">
              Todavía no hay participantes registrados en la porra.
            </div>
          ) : (
            <>
              <section className="cl-table-wrap">
                <table className="cl-table">
                  <thead>
                    <tr>
                      <th className="cl-col-pos">#</th>
                      <th className="cl-col-user">Participante</th>
                      <th className="cl-col-pts">Pts</th>
                      <th>Ganadores</th>
                      <th>Exactos</th>
                      <th>Bracket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.user.id} className={`cl-row cl-row--${r.posicion <= 3 ? r.posicion : 'n'}`}>
                        <td className="cl-col-pos">{r.posicion}</td>
                        <td className="cl-col-user">
                          <div className="cl-user">
                            <Avatar id={r.user.avatarId} size="sm" />
                            <div className="cl-user-text">
                              <span className="cl-user-nick">@{r.user.nickname}</span>
                              <span className="cl-user-name">
                                {r.user.nombre} {r.user.apellidos}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="cl-col-pts">{r.puntos}</td>
                        <td>{r.aciertosGanador}</td>
                        <td>{r.aciertosExacto}</td>
                        <td>{r.aciertosBracket}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="cl-footer-cards">
                <div className="cl-card">
                  <span className="cl-card-label">Bote total</span>
                  <span className="cl-card-value">{boteFmt}</span>
                  <span className="cl-card-hint">Suma de las aportaciones de los participantes.</span>
                </div>
                <div className="cl-card">
                  <span className="cl-card-label">Máximo goleador actual</span>
                  <span className="cl-card-value cl-card-value--text">
                    {config.maxGoleadorActual || 'Sin asignar todavía'}
                  </span>
                  <span className="cl-card-hint">Lo actualiza el admin con el goleador líder del torneo.</span>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
