/**
 * Seed para entornos de demo / desarrollo.
 *
 * Cuando la app arranca en DEMO_MODE comprobamos si existe una cuenta
 * "admin". Si no existe la creamos con credenciales triviales y los
 * flags isAdmin + pagado activados, para poder probar el panel del
 * administrador y desbloquear las plantillas sin pasos manuales.
 *
 * En modo real (Firestore) este seed no hace nada.
 */

import { DEMO_MODE } from '../firebase.js';
import { findUserByNickname, createUser, updateUser } from './users.js';

const ADMIN_NICK = 'admin';
const ADMIN_PASSWORD = 'admin';

export async function seedDemoAdmin() {
  if (!DEMO_MODE) return;
  try {
    const existing = await findUserByNickname(ADMIN_NICK);
    if (existing) {
      // Aseguramos que sigue siendo admin y está marcado como pagado
      // por si alguien los desmarcó en una sesión anterior.
      if (!existing.isAdmin || !existing.pagado) {
        await updateUser(existing.id, { isAdmin: true, pagado: true });
      }
      return;
    }
    const user = await createUser({
      nombre: 'Admin',
      apellidos: 'Demo',
      email: 'admin@demo.local',
      nickname: ADMIN_NICK,
      password: ADMIN_PASSWORD,
    });
    await updateUser(user.id, { isAdmin: true, pagado: true });
    // eslint-disable-next-line no-console
    console.info('[seed] Cuenta admin de demo creada: admin / admin');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[seed] No se pudo crear la cuenta admin de demo:', err);
  }
}
