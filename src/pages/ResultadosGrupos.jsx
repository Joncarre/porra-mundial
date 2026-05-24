import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import GroupStandingsCard from '../components/GroupStandingsCard.jsx';
import { GRUPO_LETRAS } from '../data/grupos.js';
import { getResultadosGrupos } from '../services/resultados.js';
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
                <GroupStandingsCard
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
