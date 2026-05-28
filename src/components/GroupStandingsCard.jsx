import { clasificacionDelGrupo, partidosConResultado } from '../utils/standings.js';
import './GroupStandingsCard.css';

/**
 * Tarjeta de clasificación de un grupo a partir de un map de partidos
 * jugados. Se usa tanto en la pantalla pública "Grupos" (con los
 * resultados oficiales) como en la pantalla "Bracket" (con los
 * pronósticos de grupos del propio usuario, para que vea cómo
 * quedarían sus grupos según su hipótesis).
 *
 * Props:
 *  - letra: identificador del grupo (A..L)
 *  - partidos: map de partidoId → { golesLocal, golesVisitante }
 *  - showMatches: si true, lista los partidos ya jugados bajo la tabla
 */
export default function GroupStandingsCard({ letra, partidos, showMatches = true }) {
  const clasif = clasificacionDelGrupo(letra, partidos);
  const matchesWithResult = partidosConResultado(letra, partidos);
  const jugados = matchesWithResult.filter((p) => p.resultado);

  return (
    <section className="gs-group">
      <header className="gs-group-header">
        <h3 className="gs-group-title">
          <span className="gs-group-letter">Grupo</span> {letra}
        </h3>
      </header>

      <div className="gs-table-wrap">
        <table className="gs-table">
          <thead>
            <tr>
              <th className="gs-col-pos">#</th>
              <th className="gs-col-team">Equipo</th>
              <th className="gs-col-pts">Pts</th>
              <th>PJ</th>
              <th>G</th>
              <th>E</th>
              <th>P</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
            </tr>
          </thead>
          <tbody>
            {clasif.map((equipo) => (
              <tr key={equipo.code} className={`gs-row gs-row--${equipo.posicion}`}>
                <td className="gs-col-pos">{equipo.posicion}</td>
                <td className="gs-col-team">
                  <div className="gs-team">
                    <span className="gs-team-name">{equipo.name}</span>
                    <span className="gs-team-code">{equipo.code}</span>
                  </div>
                </td>
                <td className="gs-col-pts">{equipo.pts}</td>
                <td>{equipo.pj}</td>
                <td>{equipo.g}</td>
                <td>{equipo.em}</td>
                <td>{equipo.p}</td>
                <td>{equipo.gf}</td>
                <td>{equipo.gc}</td>
                <td className={equipo.dg > 0 ? 'gs-dg-pos' : equipo.dg < 0 ? 'gs-dg-neg' : ''}>
                  {equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMatches && jugados.length > 0 && (
        <div className="gs-matches">
          {[1, 2, 3].map((j) => {
            const partidosJ = jugados.filter((p) => p.jornada === j);
            if (partidosJ.length === 0) return null;
            return (
              <div key={j} className="gs-jornada">
                <div className="gs-jornada-label">Jornada {j}</div>
                <ul className="gs-matches-list">
                  {partidosJ.map((p) => (
                    <li key={p.id} className="gs-match">
                      <span className="gs-match-team gs-match-team--local">
                        <span className="gs-match-code">{p.local.code}</span>
                        {p.local.name}
                      </span>
                      <span className="gs-match-score">
                        <strong>{p.resultado.golesLocal}</strong>
                        <span className="gs-match-dash">—</span>
                        <strong>{p.resultado.golesVisitante}</strong>
                      </span>
                      <span className="gs-match-team gs-match-team--visitante">
                        <span className="gs-match-code">{p.visitante.code}</span>
                        {p.visitante.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
