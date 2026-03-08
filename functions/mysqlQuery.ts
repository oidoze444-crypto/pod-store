import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createConnection } from 'npm:mysql2@3.11.3/promise';

async function getConn() {
  return await createConnection({
    host: Deno.env.get("MYSQL_HOST"),
    port: 3306,
    user: Deno.env.get("MYSQL_USER"),
    password: Deno.env.get("MYSQL_PASSWORD"),
    database: Deno.env.get("MYSQL_DATABASE"),
    ssl: { rejectUnauthorized: false }
  });
}

// Helper to parse JSON fields from MySQL rows
function parseJsonFields(rows, fields) {
  return rows.map(row => {
    const parsed = { ...row };
    fields.forEach(f => {
      if (parsed[f] && typeof parsed[f] === 'string') {
        try { parsed[f] = JSON.parse(parsed[f]); } catch {}
      }
    });
    return parsed;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity, action, data, id, filters, sort, limit } = body;

    const conn = await getConn();
    let result;

    // ---- PRODUCTS ----
    if (entity === 'products') {
      if (action === 'list') {
        let q = 'SELECT * FROM products';
        const where = [];
        if (filters?.is_active !== undefined) where.push(`is_active = ${filters.is_active ? 1 : 0}`);
        if (filters?.is_featured !== undefined) where.push(`is_featured = ${filters.is_featured ? 1 : 0}`);
        if (where.length) q += ' WHERE ' + where.join(' AND ');
        q += ` ORDER BY ${sort || 'created_at'} DESC`;
        if (limit) q += ` LIMIT ${limit}`;
        const [rows] = await conn.execute(q);
        result = parseJsonFields(rows, ['flavor_ids']);
      } else if (action === 'get') {
        const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [id]);
        result = parseJsonFields(rows, ['flavor_ids'])[0] || null;
      } else if (action === 'create') {
        const { name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids } = data;
        const [res] = await conn.execute(
          'INSERT INTO products (name, description, price, image_url, category, stock, is_active, is_featured, low_stock_threshold, flavor_ids) VALUES (?,?,?,?,?,?,?,?,?,?)',
          [name, description||null, price, image_url||null, category||null, stock||0, is_active!==false?1:0, is_featured?1:0, low_stock_threshold||5, JSON.stringify(flavor_ids||[])]
        );
        const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [res.insertId]);
        result = parseJsonFields(rows, ['flavor_ids'])[0];
      } else if (action === 'update') {
        const fields = [];
        const vals = [];
        const allowed = ['name','description','price','image_url','category','stock','is_active','is_featured','low_stock_threshold','flavor_ids'];
        allowed.forEach(k => {
          if (data[k] !== undefined) {
            fields.push(`${k} = ?`);
            vals.push(k === 'flavor_ids' ? JSON.stringify(data[k]) : (k === 'is_active' || k === 'is_featured') ? (data[k] ? 1 : 0) : data[k]);
          }
        });
        vals.push(id);
        await conn.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, vals);
        const [rows] = await conn.execute('SELECT * FROM products WHERE id = ?', [id]);
        result = parseJsonFields(rows, ['flavor_ids'])[0];
      } else if (action === 'delete') {
        await conn.execute('DELETE FROM products WHERE id = ?', [id]);
        result = { success: true };
      }

    // ---- FLAVORS ----
    } else if (entity === 'flavors') {
      if (action === 'list') {
        let q = 'SELECT * FROM flavors';
        if (filters?.is_active !== undefined) q += ` WHERE is_active = ${filters.is_active ? 1 : 0}`;
        q += ' ORDER BY name ASC';
        const [rows] = await conn.execute(q);
        result = rows;
      } else if (action === 'create') {
        const [res] = await conn.execute('INSERT INTO flavors (name, is_active) VALUES (?,?)', [data.name, data.is_active !== false ? 1 : 0]);
        const [rows] = await conn.execute('SELECT * FROM flavors WHERE id = ?', [res.insertId]);
        result = rows[0];
      } else if (action === 'update') {
        const fields = [], vals = [];
        if (data.name !== undefined) { fields.push('name = ?'); vals.push(data.name); }
        if (data.is_active !== undefined) { fields.push('is_active = ?'); vals.push(data.is_active ? 1 : 0); }
        vals.push(id);
        await conn.execute(`UPDATE flavors SET ${fields.join(', ')} WHERE id = ?`, vals);
        const [rows] = await conn.execute('SELECT * FROM flavors WHERE id = ?', [id]);
        result = rows[0];
      } else if (action === 'delete') {
        await conn.execute('DELETE FROM flavors WHERE id = ?', [id]);
        result = { success: true };
      }

    // ---- BANNERS ----
    } else if (entity === 'banners') {
      if (action === 'list') {
        let q = 'SELECT * FROM banners';
        if (filters?.is_active !== undefined) q += ` WHERE is_active = ${filters.is_active ? 1 : 0}`;
        q += ' ORDER BY `order` ASC';
        const [rows] = await conn.execute(q);
        result = rows;
      } else if (action === 'create') {
        const { title, subtitle, image_url, is_active, order } = data;
        const [res] = await conn.execute(
          'INSERT INTO banners (title, subtitle, image_url, is_active, `order`) VALUES (?,?,?,?,?)',
          [title, subtitle||null, image_url||null, is_active!==false?1:0, order||0]
        );
        const [rows] = await conn.execute('SELECT * FROM banners WHERE id = ?', [res.insertId]);
        result = rows[0];
      } else if (action === 'update') {
        const fields = [], vals = [];
        ['title','subtitle','image_url','is_active','order'].forEach(k => {
          if (data[k] !== undefined) {
            fields.push(k === 'order' ? '`order` = ?' : `${k} = ?`);
            vals.push(k === 'is_active' ? (data[k] ? 1 : 0) : data[k]);
          }
        });
        vals.push(id);
        await conn.execute(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, vals);
        const [rows] = await conn.execute('SELECT * FROM banners WHERE id = ?', [id]);
        result = rows[0];
      } else if (action === 'delete') {
        await conn.execute('DELETE FROM banners WHERE id = ?', [id]);
        result = { success: true };
      }

    // ---- ORDERS ----
    } else if (entity === 'orders') {
      if (action === 'list') {
        let q = 'SELECT * FROM orders';
        const where = [];
        if (filters?.status) where.push(`status = '${filters.status}'`);
        if (filters?.created_by) where.push(`created_by = '${filters.created_by}'`);
        if (where.length) q += ' WHERE ' + where.join(' AND ');
        q += ' ORDER BY created_at DESC';
        if (limit) q += ` LIMIT ${limit}`;
        const [rows] = await conn.execute(q);
        result = parseJsonFields(rows, ['address', 'items']);
      } else if (action === 'get') {
        const [rows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [id]);
        result = parseJsonFields(rows, ['address', 'items'])[0] || null;
      } else if (action === 'create') {
        const { customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status } = data;
        const [res] = await conn.execute(
          'INSERT INTO orders (customer_name, customer_phone, address, items, subtotal, delivery_fee, total, status, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
          [customer_name, customer_phone||null, JSON.stringify(address||{}), JSON.stringify(items||[]), subtotal||0, delivery_fee||0, total||0, status||'pending', user.email]
        );
        const [rows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [res.insertId]);
        result = parseJsonFields(rows, ['address', 'items'])[0];
      } else if (action === 'update') {
        const fields = [], vals = [];
        ['customer_name','customer_phone','address','items','subtotal','delivery_fee','total','status'].forEach(k => {
          if (data[k] !== undefined) {
            fields.push(`${k} = ?`);
            vals.push(['address','items'].includes(k) ? JSON.stringify(data[k]) : data[k]);
          }
        });
        vals.push(id);
        await conn.execute(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, vals);
        const [rows] = await conn.execute('SELECT * FROM orders WHERE id = ?', [id]);
        result = parseJsonFields(rows, ['address', 'items'])[0];
      } else if (action === 'delete') {
        await conn.execute('DELETE FROM orders WHERE id = ?', [id]);
        result = { success: true };
      }

    // ---- SITE SETTINGS ----
    } else if (entity === 'site_settings') {
      if (action === 'list' || action === 'get') {
        const [rows] = await conn.execute('SELECT * FROM site_settings LIMIT 1');
        result = rows[0] || null;
      } else if (action === 'upsert') {
        const [existing] = await conn.execute('SELECT id FROM site_settings LIMIT 1');
        const fields = ['store_name','logo_url','whatsapp_number','primary_color','button_color','background_color','header_text','delivery_fee','min_order_value','opening_time','closing_time','is_open_override','closed_message'];
        if (existing.length > 0) {
          const f = [], v = [];
          fields.forEach(k => { if (data[k] !== undefined) { f.push(`${k} = ?`); v.push(k === 'is_open_override' ? (data[k] ? 1 : 0) : data[k]); } });
          v.push(existing[0].id);
          await conn.execute(`UPDATE site_settings SET ${f.join(', ')} WHERE id = ?`, v);
        } else {
          const cols = fields.filter(k => data[k] !== undefined);
          const vals = cols.map(k => k === 'is_open_override' ? (data[k] ? 1 : 0) : data[k]);
          await conn.execute(`INSERT INTO site_settings (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`, vals);
        }
        const [rows] = await conn.execute('SELECT * FROM site_settings LIMIT 1');
        result = rows[0];
      }

    } else {
      result = { error: 'Entidade inválida' };
    }

    await conn.end();
    return Response.json(result);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});