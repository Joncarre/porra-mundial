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
import { CUOTA_PARTICIPANTE } from '../data/puntuacion.js';
import './Clasificacion.css';

export default function Clasificacion() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [config, setConfig] = useState({ maxGoleadorActual: '' });
  const [premios, setPremios] = useState({
    maxGoleador: '', balonOro: '', balonPlata: '', balonBronce: '',
  });
  const [pagados, setPagados] = useState(0);

  useEffect(() => {
    (async () => {
      const [usersAll, resGruposDoc, resEliDoc, resPremiosDoc, cfg] = await Promise.all([
        getAllUsers(),
        getResultadosGrupos(),
        getResultadosEliminatoria(),
        getResultadosPremios(),
        getTorneoConfig(),
      ]);

      // El administrador no participa en la porra: no aparece en la
      // clasificación ni cuenta para el bote recaudado.
      const users = usersAll.filter((u) => !u.isAdmin);

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

      // Posición ordinal (1, 2, 3...) y bucket para el color de la celda #.
      // Si hay menos de 7 participantes, evitamos solapar verde/rojo y
      // dejamos el resto en neutro.
      const total = computed.length;
      const conPos = computed.map((row, idx) => {
        const pos = idx + 1;
        let bucket = 'mid';
        if (pos === 1) bucket = 'top1';
        else if (pos === 2) bucket = 'top2';
        else if (pos === 3) bucket = 'top3';
        else if (total > 6 && pos === total) bucket = 'bot1';
        else if (total > 6 && pos === total - 1) bucket = 'bot2';
        else if (total > 6 && pos === total - 2) bucket = 'bot3';
        return { ...row, posicion: pos, rankBucket: bucket };
      });

      setRows(conPos);
      setConfig(cfg);
      setPremios(resPremios);
      setPagados(users.filter((u) => u.pagado).length);
      setLoading(false);
    })();
  }, []);

  const bote = pagados * CUOTA_PARTICIPANTE;
  const boteFmt = useMemo(() => {
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(bote);
    } catch {
      return `${bote} €`;
    }
  }, [bote]);

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
            <div className="cl-loading">
              <div className="cl-loading-spinner" aria-hidden="true" />
              <span className="cl-loading-text">Calculando puntos…</span>
            </div>
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
                      <th className="cl-col-pts">Puntos</th>
                      <th>Partidos<br />acertados</th>
                      <th>Resultados<br />exactos</th>
                      <th className="cl-col-acierto">Aciertos<br />dieciseisavos</th>
                      <th className="cl-col-acierto">Aciertos<br />octavos</th>
                      <th className="cl-col-acierto">Aciertos<br />cuartos</th>
                      <th className="cl-col-acierto">Aciertos<br />semis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.user.id} className={`cl-row cl-row--${r.rankBucket}`}>
                        <td className="cl-col-pos">{r.posicion}</td>
                        <td className="cl-col-user">
                          <div className="cl-user">
                            <Avatar foto={r.user.avatarFoto} name={r.user.nombre || r.user.nickname} size={72} />
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
                        <td>{r.aciertosDieciseisavos}</td>
                        <td>{r.aciertosOctavos}</td>
                        <td>{r.aciertosCuartos}</td>
                        <td>{r.aciertosSemis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="cl-footer-cards cl-footer-cards--stats">
                <div className="cl-card">
                  <span className="cl-card-label">Bote total</span>
                  <span className="cl-card-value">{boteFmt}</span>
                  <span className="cl-card-hint">
                    {pagados} {pagados === 1 ? 'participante' : 'participantes'} pagado{pagados === 1 ? '' : 's'} × {CUOTA_PARTICIPANTE}€.
                  </span>
                </div>
                <div className="cl-card">
                  <span className="cl-card-label">Máximo goleador actual</span>
                  <span className="cl-card-value cl-card-value--text">
                    {config.maxGoleadorActual || 'Sin asignar todavía'}
                  </span>
                  <span className="cl-card-hint">Lo actualiza el admin con el goleador líder del torneo.</span>
                </div>
              </section>

              <section className="cl-footer-cards cl-footer-cards--prizes">
                <div className="cl-card cl-card--gold">
                  <span className="cl-card-label">Balón de Oro</span>
                  <span className="cl-card-value cl-card-value--text">
                    {premios.balonOro || 'Por anunciar'}
                  </span>
                  <span className="cl-card-hint">El mejor jugador del Mundial.</span>
                </div>
                <div className="cl-card cl-card--silver">
                  <span className="cl-card-label">Balón de Plata</span>
                  <span className="cl-card-value cl-card-value--text">
                    {premios.balonPlata || 'Por anunciar'}
                  </span>
                  <span className="cl-card-hint">El segundo mejor del torneo.</span>
                </div>
                <div className="cl-card cl-card--bronze">
                  <span className="cl-card-label">Balón de Bronce</span>
                  <span className="cl-card-value cl-card-value--text">
                    {premios.balonBronce || 'Por anunciar'}
                  </span>
                  <span className="cl-card-hint">El tercero del torneo.</span>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
