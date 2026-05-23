import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import { GRUPO_LETRAS } from '../data/grupos.js';
import { getResultadosGrupos } from '../services/resultados.js';
import { clasificacionDelGrupo, partidosConResultado } from '../utils/standings.js';
import './ResultadosGrupos.css';

export default function ResultadosGrupos() {
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState({ partidos: {} });

  useEffect(() => {
    (async () => {
      const data = await getResultadosGrupos();
      setResultados(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rg-page">
      <AppHeader />
      <main className="rg-main">
        <div className="container">
          <header className="rg-page-header">
            <span className="eyebrow">Fase de grupos</span>
            <h1 className="rg-page-title">Resultados y clasificación</h1>
            <p className="rg-page-sub">
              Los resultados los actualiza el administrador. La tabla de cada grupo
              se recalcula automáticamente con cada partido guardado.
            </p>
          </header>

          {loading ? (
            <div className="rg-loading">Cargando resultados…</div>
          ) : (
            <div className="rg-groups">
              {GRUPO_LETRAS.map((letra) => (
                <GroupCard
                  key={letra}
                  letra={letra}
                  partidos={resultados.partidos || {}}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GroupCard({ letra, partidos }) {
  const clasif = clasificacionDelGrupo(letra, partidos);
  const matchesWithResult = partidosConResultado(letra, partidos);
  const jugados = matchesWithResult.filter((p) => p.resultado);

  return (
    <section className="rg-group">
      <header className="rg-group-header">
        <h2 className="rg-group-title">
          <span className="rg-group-letter">Grupo</span> {letra}
        </h2>
        <span className="rg-group-meta">
          {jugados.length} / {matchesWithResult.length} partidos jugados
        </span>
      </header>

      <div className="rg-table-wrap">
        <table className="rg-table">
          <thead>
            <tr>
              <th className="rg-col-pos">#</th>
              <th className="rg-col-team">Equipo</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
              <th className="rg-col-pts">Pts</th>
            </tr>
          </thead>
          <tbody>
            {clasif.map((equipo) => (
              <tr key={equipo.code} className={`rg-row rg-row--${equipo.posicion}`}>
                <td className="rg-col-pos">{equipo.posicion}</td>
                <td className="rg-col-team">
                  <div className="rg-team">
                    <span className="rg-team-code">{equipo.code}</span>
                    <span className="rg-team-name">{equipo.name}</span>
                  </div>
                </td>
                <td>{equipo.pj}</td>
                <td>{equipo.g}</td>
                <td>{equipo.em}</td>
                <td>{equipo.p}</td>
                <td>{equipo.gf}</td>
                <td>{equipo.gc}</td>
                <td className={equipo.dg > 0 ? 'rg-dg-pos' : equipo.dg < 0 ? 'rg-dg-neg' : ''}>
                  {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                </td>
                <td className="rg-col-pts">{equipo.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {jugados.length > 0 && (
        <div className="rg-matches">
          <h3 className="rg-matches-title">Partidos jugados</h3>
          <ul className="rg-matches-list">
            {jugados.map((p) => (
              <li key={p.id} className="rg-match">
                <span className="rg-match-team rg-match-team--local">{p.local.name}</span>
                <span className="rg-match-score">
                  <strong>{p.resultado.golesLocal}</strong>
                  <span className="rg-match-dash">—</span>
                  <strong>{p.resultado.golesVisitante}</strong>
                </span>
                <span className="rg-match-team rg-match-team--visitante">{p.visitante.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
