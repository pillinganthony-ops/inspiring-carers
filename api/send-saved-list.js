import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, savedItems } = req.body;

  if (!email || !savedItems) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const html = `
      <h2>Your saved places</h2>
      <ul>
        ${savedItems.map(item => `
          <li>
            <strong>${item.name}</strong><br/>
            ${item.category} in ${item.county}
          </li>
        `).join('')}
      </ul>
    `;

    await resend.emails.send({
      from: 'Inspiring Carers <onboarding@resend.dev>',
      to: email,
      subject: 'Your saved list',
      html
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Email failed' });
  }
}
