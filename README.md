# Staviva MACH – web

Nový jednostránkový web pro stavebniny Staviva MACH s.r.o. v Miřeticích u Klášterce nad Ohří (náhrada za stavivamach.cz, který je od roku 2006 „ve výstavbě“).

Provozovatel: Staviva MACH s.r.o., IČ 25041177, DIČ CZ25041177 (plátce DPH), Václava Řezáče 76, Miřetice u Klášterce nad Ohří, 431 51 Klášterec nad Ohří. KS Ústí nad Labem, oddíl C, vložka 14338. Firma vznikla 7. 9. 1998 (ARES).
Kontakt (ze starého webu a katalogu ceskestavby.cz): 474 372 020 (pevná linka a fax), 737 216 636, 604 428 248, stavmach@seznam.cz.

## Stránky

- `index.html`: úvod se „skladovým štítkem“, sortiment s hledáním, pás značek, jak nakoupit, o nás, kontakt s mapou po kliknutí
- `ochrana-osobnich-udaju.html`, `reklamace.html`, `404.html`

Mapa: snímek z Google Map v `img/mapa.jpg` (s „Mapová data © Google“), skutečná mapa se načte až po kliknutí. Google profil: https://maps.google.com/?cid=17132082932732762030
Sortiment je převzatý ze starého webu (sekce Sortiment) a doplněný o stavební ocel podle popisu na Firmy.cz, roztříděný do 10 skupin. Značky jsou jen textem, loga výrobců na webu nejsou (vyžadovala by svolení).
Logo je zatím pracovní (žlutý čtverec s cihlami a nápis MACH). Písmo Archivo (variabilní) je uložené na webu. GoatCounter kód `stavivamach`.

## Otevřené body (potvrdit s klientem)

- [ ] Otevírací doba převzatá z Google profilu (Po–Pá 7–16, So 8–10, Ne zavřeno). Ověřit, že platí
- [ ] Recenze: 5 citací z Google profilu (4,7 ★, 36 recenzí, stav k 14. 10. 2026), jména zkrácená. Při změně počtu recenzí upravit číslo v `index.html` (i v JSON-LD)
- [ ] „Rodinná firma“ vychází z recenzí, potvrdit
- [ ] Platí všechny tři telefony a e-mail stavmach@seznam.cz?
- [ ] Je sortiment aktuální (značky jako Dehtochema, Prima Fenestra, Ethafoam, Styrofoam)?
- [ ] Doprava na stavbu: nabízejí ji? Web zatím uvádí jen vyzvednutí v Miřeticích a pomoc s naložením
- [ ] Objednávají zboží mimo sklad? Web to slibuje v dlaždici „Nenašli jste?“
- [ ] Texty „O nás“, logo, fotky skladu a prodejny
- [ ] Poptávkový formulář (Web3Forms na e-mail klienta)?
- [ ] Doména stavivamach.cz: přesměrovat na GitHub Pages (teď ji drží „Walk – Webová Řešení“)
- [ ] GoatCounter: Patrik založí web s kódem `stavivamach`
