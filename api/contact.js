export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, telefono, email, mensaje, municipio } = req.body;

  if (!nombre || !telefono) {
    return res.status(400).json({ error: 'Nombre y teléfono son obligatorios' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Configuración de notificaciones no disponible' });
  }

  const fecha = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  const zonaTexto = municipio ? `📍 *Municipio:* ${municipio}\n` : '';

  const text = `🌞 *Nuevo lead — AutoSolar Valencia*\n\n` +
    `👤 *Nombre:* ${nombre}\n` +
    `📞 *Teléfono:* ${telefono}\n` +
    (email ? `📧 *Email:* ${email}\n` : '') +
    zonaTexto +
    (mensaje ? `💬 *Mensaje:* ${mensaje}\n` : '') +
    `\n🕐 ${fecha}`;

  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const telegramRes = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }),
  });

  if (!telegramRes.ok) {
    const err = await telegramRes.text();
    console.error('Telegram error:', err);
    return res.status(500).json({ error: 'Error enviando notificación' });
  }

  return res.status(200).json({ ok: true, message: 'Mensaje enviado correctamente' });
}
