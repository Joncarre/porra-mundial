import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GRUPOS, PARTIDOS_POR_GRUPO, getBandera } from '../data/worldcup2026';
import { RefreshCw, Grid3X3 } from 'lucide-react';

function getResult(real, id) {
  const r = real?.partidos?.[id];
  if (!r || r.g1 === undefined || r.g1 === null || r.g1 === '') return null;
  return r;
}

function ResultBadge({ g1, g2, local, visitante }) {
  if (g1 === undefined || g1 === null || g1 === '') {
    return <span style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>— : —</span>;
  }
  const n1 = Number(g1);
  const n2 = Number(g2);
  const winner = n1 > n2 ? 'local' : n2 > n1 ? 'visitante' : 'empate';
  return (
    <span style={{
      fontWeight: 800,
      fontSize: '1rem',
      color: 'var(--text)',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: '0.2rem 0.625rem',
      display: 'inline-block',
    }}>
      {g1} <span style={{ color: 'var(--text-3)' }}>–</span> {g2}
    </span>
  );
}

// Calcula la tabla de posiciones de un grupo
function calcStandings(groupKey, resultados) {
  const equipos = GRUPOS[groupKey].equipos;
  const stats = Object.fromEntries(
    equipos.map((eq) => [eq, { eq, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }])
  );

  PARTIDOS_POR_GRUPO[groupKey].forEach((p) => {
    const r = resultados?.partidos?.[p.id];
    if (!r || r.g1 === '' || r.g1 === null || r.g1 === undefined) return;
    const g1 = Number(r.g1);
    const g2 = Number(r.g2);
    const local = p.local;
    const visitante = p.visitante;

    stats[local].pj++;
    stats[visitante].pj++;
    stats[local].gf += g1;
    stats[local].gc += g2;
    stats[visitante].gf += g2;
    stats[visitante].gc += g1;

    if (g1 > g2) {
      stats[local].pg++;
      stats[local].pts += 3;
      stats[visitante].pp++;
    } else if (g2 > g1) {
      stats[visitante].pg++;
      stats[visitante].pts += 3;
      stats[local].pp++;
    } else {
      stats[local].pe++;
      stats[visitante].pe++;
      stats[local].pts++;
      stats[visitante].pts++;
    }
  });

  return Object.values(stats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const diffA = a.gf - a.gc;
    const diffB = b.gf - b.gc;
    if (diffB !== diffA) return diffB - diffA;
    return b.gf - a.gf;
  });
}

export default function GroupResults() {
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('A');

  const loadData = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'resultados', 'grupos'));
      setResultados(snap.exists() ? snap.data() : {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Resultados — Fase de Grupos</h1>
            <p>Resultados y clasificación actualizada por el administrador</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>

        {/* Tabs de grupos */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {Object.keys(GRUPOS).map((letra) => (
            <button
              key={letra}
              className={`tab ${activeGroup === letra ? 'active' : ''}`}
              onClick={() => setActiveGroup(letra)}
            >
              Grupo {letra}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Tabla de posiciones */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="group-card-header">
                📊 Clasificación {GRUPOS[activeGroup].nombre}
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Equipo</th>
                      <th style={{ textAlign: 'center' }}>PJ</th>
                      <th style={{ textAlign: 'center' }}>PG</th>
                      <th style={{ textAlign: 'center' }}>PE</th>
                      <th style={{ textAlign: 'center' }}>PP</th>
                      <th style={{ textAlign: 'center' }}>GF</th>
                      <th style={{ textAlign: 'center' }}>GC</th>
                      <th style={{ textAlign: 'center' }}>DG</th>
                      <th style={{ textAlign: 'center', color: 'var(--gold)' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcStandings(activeGroup, resultados).map((row, idx) => (
                      <tr key={row.eq}>
                        <td>
                          <span style={{
                            width: 20, height: 20, borderRadius: '50%',
                            background: idx < 2 ? 'var(--gold)' : idx === 2 ? 'rgba(59,130,246,0.3)' : 'transparent',
                            color: idx < 2 ? '#000' : 'var(--text-2)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{getBandera(row.eq)}</span>
                            <span style={{ fontWeight: 500 }}>{row.eq}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.pj}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.pg}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.pe}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.pp}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.gf}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.gc}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-2)' }}>{row.gf - row.gc}</td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--gold)' }}>{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '0.625rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                <span style={{ color: 'var(--gold)' }}>●</span> Clasificados para dieciseisavos
                &nbsp;·&nbsp;
                <span style={{ color: 'var(--blue-accent)' }}>●</span> Posible tercer clasificado
              </div>
            </div>

            {/* Partidos del grupo */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="group-card-header">
                ⚽ Partidos — {GRUPOS[activeGroup].nombre}
              </div>
              <div className="group-card-body">
                {PARTIDOS_POR_GRUPO[activeGroup].map((partido, idx) => {
                  const jornada = partido.jornada;
                  const isFirst = idx === 0 || PARTIDOS_POR_GRUPO[activeGroup][idx - 1].jornada !== jornada;
                  const res = getResult(resultados, partido.id);
                  return (
                    <div key={partido.id}>
                      {isFirst && (
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.75rem 0 0.25rem' }}>
                          Jornada {jornada}
                        </p>
                      )}
                      <div className="match-row">
                        <div className="match-team">
                          <span className="match-flag">{getBandera(partido.local)}</span>
                          <span className="match-team-name">{partido.local}</span>
                        </div>
                        <div className="match-score-center">
                          <ResultBadge
                            g1={res?.g1}
                            g2={res?.g2}
                            local={partido.local}
                            visitante={partido.visitante}
                          />
                        </div>
                        <div className="match-team right">
                          <span className="match-flag">{getBandera(partido.visitante)}</span>
                          <span className="match-team-name">{partido.visitante}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Premios individuales */}
        {resultados && (resultados.maxGoleador || resultados.balonOro) && (
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-title"><span className="icon">🏅</span> Premios individuales</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {resultados.maxGoleador && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>⚽ Máximo goleador</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{resultados.maxGoleador}</div>
                </div>
              )}
              {resultados.balonOro && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>🥇 Balón de Oro</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gold)' }}>{resultados.balonOro}</div>
                </div>
              )}
              {resultados.balonPlata && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>🥈 Balón de Plata</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{resultados.balonPlata}</div>
                </div>
              )}
              {resultados.balonBronce && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>🥉 Balón de Bronce</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{resultados.balonBronce}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
