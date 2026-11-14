// The contact letter: friendly validation, then send to Formspree without leaving the page.
// Without JavaScript the form still posts normally.
import { $, $$ } from '../core/util.js';

export default function initContact(form) {
  const status = $('[data-status]', form);
  const btn = $('button[type="submit"]', form);
  const required = $$('[required]', form);
  const say = (msg, err = false) => { status.textContent = msg; status.classList.toggle('is-error', err); };

  required.forEach((el) => el.addEventListener('input', () => el.removeAttribute('aria-invalid')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.hasAttribute('data-preview')) { say('Preview copy — the form sends for real on eshun.net.'); return; }
    const bad = required.filter((el) => !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())));
    required.forEach((el) => el.toggleAttribute('aria-invalid', bad.includes(el)));
    if (bad.length) {
      say(bad[0].type === 'email' && bad[0].value ? 'That email address looks incomplete.' : 'A message, your name and your email, please.', true);
      bad[0].focus();
      return;
    }
    btn.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say('Sent. Thank you — I’ll write back soon.');
    } catch (err) {
      say('That didn’t go through. Please try again, or email me directly.', true);
    } finally {
      btn.disabled = false;
    }
  });
}
