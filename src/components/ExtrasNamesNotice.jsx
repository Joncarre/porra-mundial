import './ExtrasNamesNotice.css';

/**
 * Aviso permanente en la pantalla de Extras (solo ahí) recordando que el
 * nombre que se introduce debe ser el que el jugador lleva en la camiseta.
 * Usa la misma estructura visual que DeadlineNotice (hairlines difuminadas
 * arriba y abajo) pero en tono violeta pastel para diferenciar el mensaje.
 */
export default function ExtrasNamesNotice() {
  return (
    <div className="extras-names-notice">
      <span className="extras-names-notice-label">Importante</span>
      <p className="extras-names-notice-text">
        Para estas apuestas, debes poner el nombre que usa el jugador en su
        camiseta. Por ejemplo: <strong>Ronaldo</strong>, <strong>Pedri</strong>,{' '}
        <strong>Lamine Yamal</strong>, <strong>B. Iglesias</strong>, etc.
      </p>
    </div>
  );
}
