import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createConnection } from 'npm:mysql2@3.11.3/promise';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const conn = await createConnection({
      host: Deno.env.get("MYSQL_HOST"),
      port: 3306,
      user: Deno.env.get("MYSQL_USER"),
      password: Deno.env.get("MYSQL_PASSWORD"),
      database: Deno.env.get("MYSQL_DATABASE"),
      ssl: { rejectUnauthorized: false }
    });

    await conn.execute('DROP TABLE IF EXISTS click_logs');
    await conn.execute('DROP TABLE IF EXISTS clicks');
    await conn.execute('DROP TABLE IF EXISTS links');
    await conn.execute('DROP TABLE IF EXISTS settings');
    await conn.end();

    return Response.json({ success: true, message: 'Tabelas removidas: click_logs, clicks, links, settings' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});