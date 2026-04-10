exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': 'https://loadira.com', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const { name, email, details } = JSON.parse(event.body || '{}');
    if (!name || !email || !details) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) { console.error('RESEND_API_KEY not set'); return { statusCode: 200, headers, body: JSON.stringify({ success: true, emailSent: false }) }; }
    const html = '<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px 32px"><h1 style="margin:0;font-size:24px;color:#fff">New Quote Request</h1></div><div style="padding:32px"><p><strong>From:</strong> ' + name + '</p><p><strong>Email:</strong> <a href="mailto:' + email + '" style="color:#f97316">' + email + '</a></p><p><strong>Details:</strong></p><p>' + details.replace(/\n/g, '<br>') + '</p></div><div style="padding:16px 32px;background:#050505;text-align:center;font-size:11px;color:#444">Loadira - loadira.com</div></div>';
    const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: 'Loadira <onboarding@resend.dev>', to: ['customertek@rwxtek.com'], reply_to: email, subject: 'New Quote Request from ' + name, html: html }) });
    const result = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, emailSent: res.ok }) };
  } catch (err) { console.error(err); return { statusCode: 200, headers, body: JSON.stringify({ success: true, emailSent: false }) }; }
};
