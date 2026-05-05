const RECIPIENT = 'manager@bonesscarehome.co.uk';

const ENQUIRY_LABELS = {
  admission: 'Care Admission Enquiry',
  visit: 'Arrange a Visit',
  services: 'Care Services Information',
  facilities: 'Facilities Information',
  other: 'General Enquiry',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request.' }) };
  }

  const { firstName, lastName, email, phone, enquiry, message } = body;

  if (!firstName || !lastName || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields.' }) };
  }

  const enquiryLabel = ENQUIRY_LABELS[enquiry] || enquiry || 'Not specified';

  const html = `
    <h2>New Contact Form Submission</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
      <tr><td style="color:#666;width:140px">Name</td><td><strong>${firstName} ${lastName}</strong></td></tr>
      <tr><td style="color:#666">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="color:#666">Phone</td><td>${phone || 'Not provided'}</td></tr>
      <tr><td style="color:#666">Enquiry Type</td><td>${enquiryLabel}</td></tr>
      <tr><td style="color:#666;vertical-align:top">Message</td><td>${message ? message.replace(/\n/g, '<br>') : 'No message provided'}</td></tr>
    </table>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bo\'ness Care Home <noreply@updates.sensiapp.care>',
      to: [RECIPIENT],
      reply_to: email,
      subject: `New Enquiry: ${enquiryLabel} — ${firstName} ${lastName}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to send email. Please try again.' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
