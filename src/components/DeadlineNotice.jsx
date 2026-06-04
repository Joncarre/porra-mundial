import { apuestasCerradas, APUESTAS_DEADLINE_LABEL } from '../utils/deadlines.js';
import './DeadlineNotice.css';

/**
 * Aviso resumido del cierre de apuestas.
 * Se renderiza en las pantallas de Apuestas / Bracket / Extras
 * mientras las apuestas siguen abiertas. Una vez pasado el deadline
 * desaparece (el footer de cada pantalla ya muestra el aviso de
 * cerradas con el mismo texto).
 */
export default function DeadlineNotice() {
  if (apuestasCerradas()) return null;
  return (
    <div className="deadline-notice">
      <span className="deadline-notice-label">Recuerda</span>
      <p className="deadline-notice-text">
        Tienes hasta el <strong>{APUESTAS_DEADLINE_LABEL}</strong> para modificar
        tus apuestas. En ese momento quedarán bloqueadas.
      </p>
    </div>
  );
}
