import { useMemo, useState } from 'react';
import { bracketCompleto, progresoBracket, aplicarPick } from '../utils/bracket.js';
import './BracketEditor.css';

const RONDAS = [
  { id: 'd32', label: 'Dieciseisavos', total: 16 },
  { id: 'o16', label: 'Octavos',       total: 8 },
  { id: 'qf',  label: 'Cuartos',       total: 4 },
  { id: 'sf',  label: 'Semifinales',   total: 2 },
  { id: 'finals', label: 'Final · 3.º puesto', total: 2 },
];

/**
 * Editor reutilizable del bracket eliminatorio. Lo usan tanto la
 * pantalla del usuario (con su predicción de grupos) como el panel
 * del admin (con los resultados oficiales de grupos).
 *
 * Props:
 *  - grupoStandings: clasificación de cada grupo (objeto letra → tabla)
 *  - ganadores: { matchId → code } estado actual
 *  - onChange: (nuevoMap) => void; recibe el map de ganadores ya limpio
 *  - readOnly: si true, las tarjetas no son interactivas
 */
export default function BracketEditor({ grupoStandings, ganadores, onChange, readOnly = false }) {
  const [ronda, setRonda] = useState('d32');

  const bracket = useMemo(
    () => bracketCompleto(grupoStandings, ganadores),
    [grupoStandings, ganadores],
  );
  const progreso = useMemo(() => progresoBracket(bracket, ganadores), [bracket, ganadores]);

  const handlePick = (matchId, code) => {
    if (readOnly) return;
    // Si vuelvo a pulsar el mismo equipo, deselecciono.
    const current = ganadores[matchId];
    const nextCode = current === code ? null : code;
    const next = aplicarPick(grupoStandings, ganadores, matchId, nextCode);
    onChange(next);
  };

  return (
    <div className="be">
      {/* ---------- Selector de ronda ---------- */}
      <nav className="be-rounds" role="tablist">
        {RONDAS.map((r) => {
          const counts = countsForRound(r.id, progreso);
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={ronda === r.id}
              className={`be-round-tab ${ronda === r.id ? 'is-active' : ''} ${counts.hechos === counts.total && counts.total > 0 ? 'is-complete' : ''}`}
              onClick={() => setRonda(r.id)}
            >
              <span className="be-round-tab-label">{r.label}</span>
              <span className="be-round-tab-count">
                {counts.hechos}/{counts.total || r.total}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ---------- Contenido de la ronda activa ---------- */}
      {ronda === 'd32' && (
        <MatchGrid
          matches={orderedMatches(bracket.d32)}
          ganadores={ganadores}
          onPick={handlePick}
        />
      )}
      {ronda === 'o16' && (
        <MatchGrid
          matches={orderedMatches(bracket.o16)}
          ganadores={ganadores}
          onPick={handlePick}
          emptyMsg="Completa los dieciseisavos para desbloquear los cruces de octavos."
        />
      )}
      {ronda === 'qf' && (
        <MatchGrid
          matches={orderedMatches(bracket.qf)}
          ganadores={ganadores}
          onPick={handlePick}
          emptyMsg="Completa los octavos para desbloquear los cuartos."
        />
      )}
      {ronda === 'sf' && (
        <MatchGrid
          matches={orderedMatches(bracket.sf)}
          ganadores={ganadores}
          onPick={handlePick}
          emptyMsg="Completa los cuartos para desbloquear las semifinales."
        />
      )}
      {ronda === 'finals' && (
        <FinalsRound
          bracket={bracket}
          ganadores={ganadores}
          onPick={handlePick}
        />
      )}
    </div>
  );
}

/* ============================================================
   Sub-componentes
   ============================================================ */

function MatchGrid({ matches, ganadores, onPick, emptyMsg }) {
  const usable = matches.filter((m) => m.local || m.visitante);
  if (usable.length === 0) {
    return <div className="be-empty">{emptyMsg || 'Sin partidos disponibles todavía.'}</div>;
  }
  return (
    <ul className="be-matches">
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} winner={ganadores[m.id]} onPick={onPick} />
      ))}
    </ul>
  );
}

function MatchCard({ match, winner, onPick, label }) {
  const ready = match.local && match.visitante;
  return (
    <li className={`be-match ${ready ? '' : 'be-match--pending'}`}>
      <div className="be-match-head">{label || `Partido ${match.id}`}</div>
      <div className="be-match-teams">
        <TeamBtn
          team={match.local}
          selected={winner === match.local?.code}
          onClick={() => match.local && onPick(match.id, match.local.code)}
          disabled={!ready}
        />
        <span className="be-match-vs">vs</span>
        <TeamBtn
          team={match.visitante}
          selected={winner === match.visitante?.code}
          onClick={() => match.visitante && onPick(match.id, match.visitante.code)}
          disabled={!ready}
        />
      </div>
    </li>
  );
}

function TeamBtn({ team, selected, onClick, disabled }) {
  if (!team) {
    return <span className="be-team be-team--placeholder">Por decidir</span>;
  }
  return (
    <button
      type="button"
      className={`be-team ${selected ? 'is-winner' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {team.name}
    </button>
  );
}

function FinalsRound({ bracket, ganadores, onPick }) {
  const t = bracket.tercerPuesto;
  const f = bracket.final;
  const semisListas = t.local && t.visitante;

  return (
    <div className="be-finals">
      <section className="be-final-block be-final-block--third">
        <header className="be-final-block-head">
          <span className="eyebrow">Tercer y cuarto puesto</span>
          <h3>Lo juegan los perdedores de las semifinales</h3>
        </header>
        {semisListas ? (
          <>
            <MatchCard
              match={{ ...t, id: 103 }}
              winner={ganadores[103]}
              onPick={onPick}
              label="Partido por el bronce"
            />
            {ganadores[103] && (
              <p className="be-finals-note">
                Cuarto puesto: <strong>{otroEquipoName(t, ganadores[103])}</strong>
              </p>
            )}
          </>
        ) : (
          <div className="be-empty">Completa las semifinales para desbloquearlo.</div>
        )}
      </section>

      <section className="be-final-block be-final-block--champion">
        <header className="be-final-block-head">
          <span className="eyebrow">Final del Mundial</span>
          <h3>Campeón del Mundial 2026</h3>
        </header>
        {f.local && f.visitante ? (
          <>
            <MatchCard
              match={{ ...f, id: 104 }}
              winner={ganadores[104]}
              onPick={onPick}
              label="Final"
            />
            {ganadores[104] && (
              <p className="be-finals-note be-finals-note--gold">
                Tu campeón: <strong>{teamNameByCode(f, ganadores[104])}</strong>
              </p>
            )}
          </>
        ) : (
          <div className="be-empty">Completa las semifinales para desbloquearla.</div>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function countsForRound(rondaId, progreso) {
  if (rondaId === 'finals') {
    return {
      hechos: progreso.tercer.hechos + progreso.final.hechos,
      total: progreso.tercer.total + progreso.final.total,
    };
  }
  return progreso[rondaId];
}

function orderedMatches(mapMatches) {
  return Object.values(mapMatches).sort((a, b) => a.id - b.id);
}

function teamNameByCode(match, code) {
  if (match.local?.code === code) return match.local.name;
  if (match.visitante?.code === code) return match.visitante.name;
  return '—';
}

function otroEquipoName(match, code) {
  if (match.local?.code === code) return match.visitante?.name || '—';
  if (match.visitante?.code === code) return match.local?.name || '—';
  return '—';
}
