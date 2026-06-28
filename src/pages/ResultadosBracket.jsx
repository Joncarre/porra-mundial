import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import BracketEditor from '../components/BracketEditor.jsx';
import { clasificacionTodosLosGrupos } from '../utils/bracket.js';
import {
  getResultadosGrupos,
  getResultadosEliminatoria,
} from '../services/resultados.js';
import './ResultadosBracket.css';

/**
 * Réplica de SOLO LECTURA del bracket oficial que rellena el admin.
 * Los usuarios ven aquí, en directo, cómo va avanzando la eliminatoria
 * según los resultados oficiales (mismo cuadro que el panel Eliminatoria
 * del admin: usa las preferencias de terceros del cuadro oficial).
 */
export default function ResultadosBracket() {
  const [grupoStandings, setGrupoStandings] = useState({});
  const [ganadores, setGanadores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [gru, eli] = await Promise.all([
        getResultadosGrupos(),
        getResultadosEliminatoria(),
      ]);
      setGrupoStandings(clasificacionTodosLosGrupos(gru.partidos || {}));
      setGanadores(eli.ganadores || {});
      setLoading(false);
    })();
  }, []);

  return (
    <div className="rb-page">
      <AppHeader />
      <main className="rb-main">
        <div className="container">
          <header className="rb-page-header">
            <span className="eyebrow">Fase eliminatoria</span>
            <h1 className="rb-page-title">Resultados del bracket</h1>
            <p className="rb-page-sub">
              El cuadro oficial que actualiza el administrador a medida que se
              juegan las rondas. Aquí solo puedes consultarlo, no editarlo.
            </p>
          </header>

          {loading ? (
            <div className="rb-loading">Cargando el cuadro…</div>
          ) : (
            <div className="rb-panel">
              <BracketEditor
                grupoStandings={grupoStandings}
                ganadores={ganadores}
                onChange={() => {}}
                readOnly
                preferenciasTerceros
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
