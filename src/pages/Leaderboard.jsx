import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { calcularPuntuacion } from '../utils/scoring';
import { Trophy, Target, Zap, Euro, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [torneoConfig, setTorneoConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar configuración del torneo
      const configSnap = await getDoc(doc(db, 'torneo', 'config'));
      const config = configSnap.exists() ? configSnap.data() : {};
      setTorneoConfig(config);

      // Cargar resultados reales
      const resGruposSnap = await getDoc(doc(db, 'resultados', 'grupos'));
      const resElimSnap = await getDoc(doc(db, 'resultados', 'eliminatoria'));
      const resultados = {
        grupos: resGruposSnap.exists() ? resGruposSnap.data() : {},
        eliminatoria: resElimSnap.exists() ? resElimSnap.data() : {},
      };

      // Cargar todos los usuarios
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Cargar todas las predicciones
      const [pred1Snap, pred2Snap] = await Promise.all([
        getDocs(collection(db, 'predicciones_fase1')),
        getDocs(collection(db, 'predicciones_fase2')),
      ]);

      const pred1Map = {};
      pred1Snap.forEach((d) => { pred1Map[d.id] = d.data(); });

      const pred2Map = {};
      pred2Snap.forEach((d) => { pred2Map[d.id] = d.data(); });

      // Calcular puntuación por usuario
      const calculated = users
        .filter((u) => !u.isAdmin) // excluir admin de la clasificación
        .map((u) => {
          const { totalPuntos, ganadorAcertados, exactosAcertados } = calcularPuntuacion(
            pred1Map[u.id],
            pred2Map[u.id],
            resultados
          );
          return {
            ...u,
            totalPuntos,
            ganadorAcertados,
            exactosAcertados,
          };
        })
        .sort((a, b) => {
          if (b.totalPuntos !== a.totalPuntos) return b.totalPuntos - a.totalPuntos;
          if (b.exactosAcertados !== a.exactosAcertados) return b.exactosAcertados - a.exactosAcertados;
          return b.ganadorAcertados - a.ganadorAcertados;
        });

      setRows(calculated);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error cargando clasificación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const podium = rows.slice(0, 3);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Clasificación</h1>
            <p>Actualizada conforme se van disputando los partidos</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Stats globales */}
        {torneoConfig && (
          <div className="stats-row" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-label">Participantes</div>
              <div className="stat-value">{rows.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bote total</div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                {torneoConfig.boteTotal ? `${torneoConfig.boteTotal} €` : '—'}
              </div>
            </div>
            {torneoConfig.maxGoleadorActual && (
              <div className="stat-card">
                <div className="stat-label">⚽ Máximo goleador actual</div>
                <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--text)' }}>
                  {torneoConfig.maxGoleadorActual}
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <>
            {/* Podio top 3 */}
            {podium.length > 0 && (
              <div className="leaderboard-podium" style={{ marginBottom: '2rem' }}>
                {[podium[1], podium[0], podium[2]].map((u, displayIdx) => {
                  if (!u) return <div key={displayIdx} />;
                  const place = displayIdx === 1 ? 1 : displayIdx === 0 ? 2 : 3;
                  const medals = ['🥈', '🥇', '🥉'];
                  return (
                    <div
                      key={u.id}
                      className={`podium-card place-${place}`}
                      style={place === 1 ? { transform: 'translateY(-8px)' } : {}}
                    >
                      <div className="podium-position">{medals[displayIdx]}</div>
                      <div className="podium-nick">{u.nickname}</div>
                      <div className="podium-name">{u.nombre} {u.apellidos}</div>
                      <div className="podium-pts">{u.totalPuntos}</div>
                      <div className="podium-pts-label">puntos</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tabla completa */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={16} color="var(--gold)" />
                <span style={{ fontWeight: 700 }}>Tabla de clasificación</span>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', width: '3rem' }}>#</th>
                      <th>Participante</th>
                      <th style={{ textAlign: 'right' }}>
                        <span title="Puntos totales"><Trophy size={13} /></span>
                        &nbsp;Puntos
                      </th>
                      <th style={{ textAlign: 'right' }}>
                        <span title="Ganadores acertados"><Target size={13} /></span>
                        &nbsp;Ganadores
                      </th>
                      <th style={{ textAlign: 'right' }}>
                        <span title="Resultados exactos"><Zap size={13} /></span>
                        &nbsp;Exactos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '2.5rem' }}>
                          Aún no hay datos de clasificación
                        </td>
                      </tr>
                    ) : (
                      rows.map((u, idx) => {
                        const pos = idx + 1;
                        const rankClass = pos <= 3 ? `top${pos}` : '';
                        return (
                          <tr key={u.id}>
                            <td className={`rank ${rankClass}`}>{pos}</td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.nickname}</div>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>
                                {u.nombre} {u.apellidos}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--gold)' }}>
                              {u.totalPuntos}
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--text-2)' }}>{u.ganadorAcertados}</td>
                            <td style={{ textAlign: 'right', color: 'var(--text-2)' }}>{u.exactosAcertados}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info actualización */}
            {lastUpdate && (
              <p style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </p>
            )}

            {/* Leyenda de puntuación */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-title"><span className="icon">📊</span> Leyenda de puntuación</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
                {[
                  { label: 'Ganador (grupos)', pts: '+1 pt' },
                  { label: 'Exacto (grupos)', pts: '+3 pts' },
                  { label: 'Ganador (dieciseisavos)', pts: '+2 pts' },
                  { label: 'Exacto (dieciseisavos)', pts: '+5 pts' },
                  { label: 'Ganador (octavos)', pts: '+3 pts' },
                  { label: 'Exacto (octavos)', pts: '+6 pts' },
                  { label: 'Ganador (cuartos)', pts: '+4 pts' },
                  { label: 'Exacto (cuartos)', pts: '+8 pts' },
                  { label: 'Ganador (semis)', pts: '+5 pts' },
                  { label: 'Exacto (semis)', pts: '+10 pts' },
                  { label: 'Ganador (3er puesto)', pts: '+4 pts' },
                  { label: 'Exacto (3er puesto)', pts: '+8 pts' },
                  { label: 'Ganador (final)', pts: '+6 pts' },
                  { label: 'Exacto (final)', pts: '+12 pts' },
                  { label: 'Máximo goleador', pts: '+4 pts' },
                  { label: 'Balón de Oro', pts: '+3 pts' },
                  { label: 'Balón de Plata', pts: '+2 pts' },
                  { label: 'Balón de Bronce', pts: '+1 pt' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border-2)' }}>
                    <span>{item.label}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
