# HMMX — reestructuración del sitio (2026-09-30)

Este es un refresco de código y estructura del sitio actual, no un rediseño visual desde cero. La marca (verde/naranja, Bebas Neue + DM Sans), todo el contenido real, todas las fotos, y toda la lógica que ya funcionaba (cotizador, calculadora de combustible, feed de hikes desde Google Sheets, clima por hike, reseñas, WhatsApp, formularios) se mantuvo intacta.

## Qué cambió y por qué

1. **CSS y JS movidos a archivos externos** (`assets/css/`, `assets/js/`) en vez de vivir pegados dentro de cada HTML. Antes cada página cargaba un bloque `<style>` gigante y varios `<script>` inline; ahora hay un solo lugar para editar cada cosa, y el navegador puede cachear esos archivos entre páginas.
2. **Las 3 imágenes que estaban incrustadas como base64** (el escudo del logo en el hero, la insignia de la sección "Nosotros", y el logo del nav) se extrajeron a archivos `.jpg`/`.png` reales en `images/`. Esto sacó casi 300 KB de texto base64 del HTML de `index.html` (pasó de 389 KB a 82 KB), lo que ayuda a que la página cargue y se pinte más rápido. De paso encontramos que ya existía un logo de mejor calidad (`images/logo-hmmx.png`, 512×512) sin usar en la carpeta de imágenes, así que el sitio ahora usa ese en vez de una copia de baja resolución (150×200) que estaba incrustada.
3. **Se quitaron los `onmouseover`/`onmouseout` y los `style=""` repetidos** (las 7 tarjetas de Recursos, el botón "Ver más para empresas", el ícono de herramientas en el footer, etc.) y se reemplazaron por clases CSS con estados `:hover`. Como consecuencia, el script que "limpiaba" esos `onmouseover` en celulares (para que no se quedara pegado el efecto hover al tocar) ya no hace falta y se eliminó.
4. **Se redujeron los "eyebrows"** (las etiquetas chiquitas en mayúsculas arriba de cada título de sección, ej. "Información útil", "Quiénes somos"). El sitio tenía uno en casi cada sección; ahora solo quedan en las 2-3 secciones donde de verdad aportan contexto (Hikes, Corporativo/Empresas, Reseñas en el sitio principal; Hero, Clientes y Misión en la página de empresas). Los títulos solos ya comunican de qué trata cada sección.
5. **Se corrigieron dos bugs de HTML preexistentes**: la sección de Recursos tenía dos `<div>` sin cerrar, y el calendario tenía un `</div>` de más suelto. Los navegadores los ignoraban silenciosamente, pero no era HTML válido.
6. **Se agregaron metadatos SEO a `index.html`** (meta description, canonical, Open Graph, favicon) que ya existían en `empresas.html` pero le faltaban a la portada. Antes `index.html` no tenía ninguno de estos.
7. **El parallax del hero de `empresas.html`** usaba un listener de scroll sin optimizar (se recalculaba en cada pixel de scroll). Se le agregó `requestAnimationFrame` para que sea más suave y no le pegue tanto al rendimiento en celulares.
8. Los 2 botones del hero y los 4 botones de filtro de dificultad usaban `onclick="..."` con JavaScript metido en el HTML. Los del hero ahora son links normales (`<a href="#hikes">`, ya que el sitio tiene `scroll-behavior: smooth` activado, así que ni siquiera hace falta JavaScript). Los filtros usan `data-diff="..."` con un solo listener centralizado.

## Qué NO se tocó (a propósito)

- **`interno/cotizador-hmmx_6.html` y `interno/combustible-hmmx_2.html` quedaron exactamente igual, byte por byte.** Ambos tienen un logo incrustado como base64 (`LOGO_SRC` en el cotizador, `#logoSrc` en la calculadora de combustible) que probablemente se usa para generar PDFs o capturas con el logo incluido. Si lo hubiera cambiado a un archivo externo, esa función se pudo haber roto por restricciones de CORS al exportar. Como son herramientas internas (no páginas de marketing), preferí no arriesgar su lógica de cálculo por una limpieza cosmética. Si en algún momento quieren que las actualice, avísenme y lo hacemos con cuidado, probando la exportación antes y después.
- **`interno/herramientas.html`** sí se actualizó (CSS/JS a archivos externos, logo local en vez de una URL externa a GitHub), porque es solo una página de menú sin lógica de cálculo, cero riesgo.
- El feed de hikes sigue leyendo del mismo Google Sheet publicado, el clima sigue viniendo de Open-Meteo, las reseñas y el botón "caza-descuento" (el emoji que aparece y desaparece) funcionan exactamente igual que antes.
- No se tocó ningún número de WhatsApp, link de Google Form/Drive, ni la URL del CSV de hikes.
- No se agregó modo oscuro (no se pidió, y hubiera sido un cambio grande fuera de alcance).

## Estructura

```
redesign/
  index.html
  empresas.html
  interno/
    herramientas.html       (actualizado)
    cotizador-hmmx_6.html   (sin cambios, ver nota arriba)
    combustible-hmmx_2.html (sin cambios, ver nota arriba)
  images/                   (todas las fotos originales + logo-hmmx.png, emblema-hmmx.jpg, favicons)
  assets/
    css/
      styles.css            (index.html)
      empresas.css          (empresas.html)
      herramientas.css      (interno/herramientas.html)
    js/
      topo-canvas.js        (fondo animado, compartido por las 3 páginas de arriba)
      gallery-carousel.js   (compartido por index.html y empresas.html)
      hikes-data.js         (feed de Google Sheets + calendario, index.html)
      weather-widget.js     (clima por hike, index.html)
      reviews-carousel.js   (index.html)
      discount-hunter.js    (botón caza-descuento, index.html)
      empresas-interactions.js (scroll reveal, marquee de logos, tarjetas flip, parallax; empresas.html)
  CNAME
```

## Antes de publicar

Esta carpeta es una copia de trabajo, no reemplazó nada en el sitio en vivo. Antes de subirla:
1. Revisen visualmente `index.html` y `empresas.html` en un navegador.
2. Confirmen que el cotizador y la calculadora de combustible sigan exportando bien (no deberían haber cambiado, pero vale la pena probar una vez).
3. El original de respaldo sigue intacto en `../original-backup/`.
