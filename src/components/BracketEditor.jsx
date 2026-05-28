import { useMemo } from 'react';
import { bracketCompleto, progresoBracket, aplicarPick } from '../utils/bracket.js';
import './BracketEditor.css';

/**
 * Bracket eliminatorio en formato árbol. La mitad superior del cuadro
 * juega 97 + 98 → semifinal 101; la mitad inferior juega 99 + 100 →
 * semifinal 102. Las dos semis se cruzan en la final central.
 *
 *   d32(8) → o16(4) → qf(2) → sf(1) ─┐         ┌─ sf(1) ← qf(2) ← o16(4) ← d32(8)
 *                                     ├─ FINAL ─┤
 *                                     └─ 3.º ──┘
 */

const TOP_HALF = {
  d32_pairs: [
    [74, 77],   // → 89
    [73, 75],   // → 90
    [81, 82],   // → 94
    [83, 84],   // → 93
  ],
  o16: [89, 90, 94, 93],
  qf: [97, 98],
  sf: [101],
};

const BOTTOM_HALF = {
  d32_pairs: [
    [76, 78],   // → 91
    [79, 80],   // → 92
    [86, 88],   // → 95
    [85, 87],   // → 96
  ],
  o16: [91, 92, 95, 96],
  qf: [99, 100],
  sf: [102],
};

export default function BracketEditor({ grupoStandings, ganadores, onChange, readOnly = false }) {
  const bracket = useMemo(
    () => bracketCompleto(grupoStandings, ganadores),
    [grupoStandings, ganadores],
  );
  const progreso = useMemo(() => progresoBracket(bracket, ganadores), [bracket, ganadores]);

  const handlePick = (matchId, code) => {
    if (readOnly) return;
    const current = ganadores[matchId];
    const nextCode = current === code ? null : code;
    const next = aplicarPick(grupoStandings, ganadores, matchId, nextCode);
    onChange(next);
  };

  const getMatch = (id) =>
    bracket.d32[id] || bracket.o16[id] || bracket.qf[id] || bracket.sf[id] || null;

  return (
    <div className="be">
      <div className="be-progress">
        <ProgressItem label="Dieciseisavos" {...progreso.d32} />
        <ProgressItem label="Octavos" {...progreso.o16} />
        <ProgressItem label="Cuartos" {...progreso.qf} />
        <ProgressItem label="Semifinales" {...progreso.sf} />
        <ProgressItem label="3.º puesto" {...progreso.tercer} />
        <ProgressItem label="Final" {...progreso.final} />
      </div>

      <div className={`be-tree-wrap ${readOnly ? 'is-readonly' : ''}`}>
      <div className="be-tree">
        {/* ============== LEFT HALF ============== */}
        <div className="be-col be-col--d32 be-col--left">
          {TOP_HALF.d32_pairs.map((pair, pi) => (
            <div key={pi} className="be-pair">
              {pair.map((id) => (
                <MatchCard
                  key={id}
                  match={getMatch(id)}
                  winner={ganadores[id]}
                  onPick={handlePick}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="be-col be-col--o16 be-col--left">
          {TOP_HALF.o16.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        <div className="be-col be-col--qf be-col--left">
          {TOP_HALF.qf.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        <div className="be-col be-col--sf be-col--left">
          {TOP_HALF.sf.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        {/* ============== CENTER ============== */}
        <div className="be-col be-col--center">
          <FinalCard
            match={bracket.final}
            winner={ganadores[104]}
            onPick={(code) => handlePick(104, code)}
          />
          <ThirdPlaceCard
            match={bracket.tercerPuesto}
            winner={ganadores[103]}
            onPick={(code) => handlePick(103, code)}
          />
        </div>

        {/* ============== RIGHT HALF (mirror) ============== */}
        <div className="be-col be-col--sf be-col--right">
          {BOTTOM_HALF.sf.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        <div className="be-col be-col--qf be-col--right">
          {BOTTOM_HALF.qf.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        <div className="be-col be-col--o16 be-col--right">
          {BOTTOM_HALF.o16.map((id) => (
            <MatchCard key={id} match={getMatch(id)} winner={ganadores[id]} onPick={handlePick} />
          ))}
        </div>

        <div className="be-col be-col--d32 be-col--right">
          {BOTTOM_HALF.d32_pairs.map((pair, pi) => (
            <div key={pi} className="be-pair">
              {pair.map((id) => (
                <MatchCard
                  key={id}
                  match={getMatch(id)}
                  winner={ganadores[id]}
                  onPick={handlePick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ============================================================
   Sub-componentes
   ============================================================ */

function MatchCard({ match, winner, onPick }) {
  if (!match) {
    return (
      <div className="be-match be-match--pending">
        <PlaceholderTeam />
        <PlaceholderTeam />
      </div>
    );
  }
  return (
    <div className="be-match">
      <TeamBtn
        team={match.local}
        selected={winner === match.local?.code}
        onClick={() => match.local && onPick(match.id, match.local.code)}
      />
      <TeamBtn
        team={match.visitante}
        selected={winner === match.visitante?.code}
        onClick={() => match.visitante && onPick(match.id, match.visitante.code)}
      />
    </div>
  );
}

function TeamBtn({ team, selected, onClick }) {
  if (!team) return <PlaceholderTeam />;
  return (
    <button
      type="button"
      className={`be-team ${selected ? 'is-winner' : ''}`}
      onClick={onClick}
    >
      <span className="be-team-code">{team.code}</span>
      <span className="be-team-name">{team.name}</span>
    </button>
  );
}

function PlaceholderTeam() {
  return <span className="be-team be-team--placeholder">Por decidir</span>;
}

function FinalCard({ match, winner, onPick }) {
  const listo = match?.local && match?.visitante;
  return (
    <section className="be-special be-special--final">
      <header className="be-special-head">
        <span className="eyebrow">Final del Mundial</span>
      </header>
      {listo ? (
        <>
          <div className="be-match be-match--final">
            <TeamBtn
              team={match.local}
              selected={winner === match.local.code}
              onClick={() => onPick(match.local.code)}
            />
            <TeamBtn
              team={match.visitante}
              selected={winner === match.visitante.code}
              onClick={() => onPick(match.visitante.code)}
            />
          </div>
          {winner && (
            <div className="be-result-block">
              <div className="be-result-row be-result-row--champion">
                <span className="be-result-label">Campeón</span>
                <strong className="be-result-team">{teamName(match, winner)}</strong>
              </div>
              <div className="be-result-row be-result-row--subchampion">
                <span className="be-result-label">Subcampeón</span>
                <strong className="be-result-team">{otroNombre(match, winner)}</strong>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="be-empty">Completa las semifinales para desbloquearla.</div>
      )}
    </section>
  );
}

function ThirdPlaceCard({ match, winner, onPick }) {
  const listo = match?.local && match?.visitante;
  return (
    <section className="be-special be-special--third">
      <header className="be-special-head">
        <span className="eyebrow">Tercer y cuarto puesto</span>
      </header>
      {listo ? (
        <>
          <div className="be-match">
            <TeamBtn
              team={match.local}
              selected={winner === match.local.code}
              onClick={() => onPick(match.local.code)}
            />
            <TeamBtn
              team={match.visitante}
              selected={winner === match.visitante.code}
              onClick={() => onPick(match.visitante.code)}
            />
          </div>
          {winner && (
            <div className="be-result-block">
              <div className="be-result-row be-result-row--third">
                <span className="be-result-label">Tercero</span>
                <strong className="be-result-team">{teamName(match, winner)}</strong>
              </div>
              <div className="be-result-row be-result-row--fourth">
                <span className="be-result-label">Cuarto</span>
                <strong className="be-result-team">{otroNombre(match, winner)}</strong>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="be-empty">Completa las semifinales para desbloquearlo.</div>
      )}
    </section>
  );
}

function ProgressItem({ label, hechos, total }) {
  const done = total > 0 && hechos === total;
  return (
    <div className={`be-progress-item ${done ? 'is-done' : ''}`}>
      <span className="be-progress-item-label">{label}</span>
      <span className="be-progress-item-count">
        {hechos} <span className="be-progress-item-sep">/</span> {total || '—'}
      </span>
    </div>
  );
}

/* ============================================================
   Helpers
   ============================================================ */
function teamName(match, code) {
  if (match.local?.code === code) return match.local.name;
  if (match.visitante?.code === code) return match.visitante.name;
  return '—';
}

function otroNombre(match, code) {
  if (match.local?.code === code) return match.visitante?.name || '—';
  if (match.visitante?.code === code) return match.local?.name || '—';
  return '—';
}
