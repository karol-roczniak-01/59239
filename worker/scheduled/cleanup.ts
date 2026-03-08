import type { Env } from '..'

export const cleanup = async (env: Env) => {
  const expired = await env.DB.prepare(
    'SELECT id FROM demand WHERE endingAt < unixepoch()'
  ).all()

  const ids = expired.results.map(r => r.id as string)

  if (ids.length === 0) {
    console.log('[Cron] No expired demands to clean up')
    return
  }

  // Delete orphaned supplies first
  const placeholders = ids.map(() => '?').join(',')
  await env.DB.prepare(
    `DELETE FROM supply WHERE demandId IN (${placeholders})`
  ).bind(...ids).run()

  // Delete from Vectorize
  await env.VECTORIZE.deleteByIds(ids)

  // Delete from D1
  await env.DB.prepare(
    `DELETE FROM demand WHERE id IN (${placeholders})`
  ).bind(...ids).run()

  console.log(`[Cron] Cleaned up ${ids.length} expired demands and their supplies`)
}