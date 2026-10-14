document.getElementById('rok').textContent = new Date().getFullYear();

// Mapa až po kliknutí – do té doby se nic neposílá Googlu
const mapBtn = document.getElementById('map-load');
if (mapBtn) mapBtn.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.className = 'map';
  f.title = 'Mapa – Staviva MACH, Václava Řezáče 76, Miřetice';
  f.src = 'https://maps.google.com/maps?q=50.3849069,13.1947854&z=16&hl=cs&output=embed';
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

// Otevřeno teď? (čas v ČR)
const hours = {1:[7,16],2:[7,16],3:[7,16],4:[7,16],5:[7,16],6:[8,10]};
const cz = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
const day = cz.getDay(), t = cz.getHours() + cz.getMinutes() / 60, h = hours[day];
const open = !!h && t >= h[0] && t < h[1];
document.querySelectorAll('[data-now]').forEach(el => {
  el.hidden = false;
  el.classList.toggle('is-open', open);
  el.textContent = open ? 'Teď otevřeno' : 'Teď zavřeno';
});
document.querySelectorAll('.hours tr').forEach(tr => tr.classList.toggle('is-today', tr.dataset.d.split(' ').includes(String(day))));

// Jeřáb: věž sahá od hlavičky až k patičce
const crane = document.querySelector('.crane'), foot = document.querySelector('.foot');
if (crane && foot) {
  const fit = () => { crane.style.height = Math.max(0, foot.offsetTop - crane.offsetTop) + 'px'; };
  fit();
  new ResizeObserver(fit).observe(document.body);
}
