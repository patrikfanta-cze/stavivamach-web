document.getElementById('rok').textContent = new Date().getFullYear();

// Mapa až po kliknutí – do té doby se nic neposílá Googlu
const mapBtn = document.getElementById('map-load');
if (mapBtn) mapBtn.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.className = 'map';
  f.title = 'Mapa – Staviva MACH, Václava Řezáče 76, Miřetice';
  f.src = 'https://maps.google.com/maps?q=V%C3%A1clava%20%C5%98ez%C3%A1%C4%8De%2076%2C%20431%2051%20Kl%C3%A1%C5%A1terec%20nad%20Oh%C5%99%C3%AD&z=15&output=embed';
  f.loading = 'lazy';
  document.getElementById('map').replaceWith(f);
});

// Hledání v sortimentu
const cats = [...document.querySelectorAll('#cats .cat:not(.cat--cta)')];
const none = document.getElementById('nic');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const input = document.getElementById('hledat');
if (input) input.addEventListener('input', () => {
  const q = norm(input.value.trim());
  let shown = 0;
  cats.forEach(c => {
    const ok = !q || norm(c.textContent).includes(q);
    c.hidden = !ok;
    if (ok) shown++;
    c.querySelectorAll('li, .brands span').forEach(el => el.classList.toggle('hit', !!q && norm(el.textContent).includes(q)));
  });
  none.hidden = shown > 0;
});

// Pás se značkami (dvakrát kvůli plynulé smyčce)
const track = document.getElementById('marquee');
if (track) {
  const names = [...new Set([...document.querySelectorAll('.brands span')].map(s => s.textContent))].filter(n => n !== 'Podle poptávky');
  const html = names.map(n => `<span>${n}</span>`).join('');
  track.innerHTML = html + html;
}
