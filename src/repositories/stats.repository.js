// Repositorio Stats - queries analíticas
import pool from '../configs/db.js';

/**
 * Estadística 1 (para el usuario):
 * Cantidad de eventos a los que asistió un usuario, agrupados por mes.
 * Considera solo eventos ya ocurridos (event_date <= NOW()).
 *
 * Devuelve: [{ year, month, month_name, count }] ordenado cronológicamente.
 */
const getEventsPerMonthByUser = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT
       EXTRACT(YEAR  FROM e.event_date)::int  AS year,
       EXTRACT(MONTH FROM e.event_date)::int  AS month,
       TO_CHAR(e.event_date, 'Mon YYYY')      AS month_name,
       COUNT(*)::int                          AS count
     FROM event_participants ep
     JOIN events e ON e.id = ep.event_id
     WHERE ep.user_id = $1
       AND e.event_date <= NOW()
     GROUP BY year, month, month_name
     ORDER BY year ASC, month ASC`,
    [user_id]
  );
  return rows;
};

/**
 * Estadística 2 (para el creador del evento):
 * Participantes del evento agrupados por rango de edad (intervalos de 3 años).
 * Solo incluye participantes con birth_date cargado.
 *
 * Devuelve: [{ range, count }] ordenado por edad ascendente.
 * Ejemplo de range: "18-20", "21-23", "24-26", "Sin datos"
 */
const getParticipantAgeRangesByEvent = async (event_id) => {
  const { rows } = await pool.query(
    `SELECT
       CASE
         WHEN u.birth_date IS NULL THEN 'Sin datos'
         ELSE
           -- Calcular el inicio del rango: floor((edad - 18) / 3) * 3 + 18
           -- Clamp mínimo en 18 para no generar rangos negativos raros
           CONCAT(
             GREATEST(
               FLOOR((DATE_PART('year', AGE(u.birth_date)) - 18) / 3) * 3 + 18,
               0
             )::int,
             '-',
             (
               GREATEST(
                 FLOOR((DATE_PART('year', AGE(u.birth_date)) - 18) / 3) * 3 + 18,
                 0
               ) + 2
             )::int
           )
       END                        AS range,
       COUNT(*)::int              AS count,
       -- Para ordenar correctamente los rangos (NULL al final)
       CASE
         WHEN u.birth_date IS NULL THEN 9999
         ELSE GREATEST(
                FLOOR((DATE_PART('year', AGE(u.birth_date)) - 18) / 3) * 3 + 18,
                0
              )::int
       END                        AS sort_order
     FROM event_participants ep
     JOIN users u ON u.id = ep.user_id
     WHERE ep.event_id = $1
     GROUP BY range, sort_order
     ORDER BY sort_order ASC`,
    [event_id]
  );

  // Devolver sin el campo interno sort_order
  return rows.map(function(r) { return { range: r.range, count: r.count }; });
};

/**
 * Verifica si un usuario es el creador de un evento.
 * Usado para autorizar el acceso a la estadística de rangos de edad.
 */
const isEventCreator = async ({ user_id, event_id }) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM events WHERE id = $1 AND creator_id = $2 LIMIT 1`,
    [event_id, user_id]
  );
  return rows.length > 0;
};

export { getEventsPerMonthByUser, getParticipantAgeRangesByEvent, isEventCreator };
