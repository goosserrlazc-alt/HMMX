
(function () {
  "use strict";

  var TRIPADVISOR_URL = "https://www.tripadvisor.com.mx/Attraction_Review-g150800-d27996630-Reviews-Hiking_Mountain_Mexico-Mexico_City_Central_Mexico_and_Gulf_Coast.html";
  var GOOGLE_URL = "https://g.page/r/CSFTl_RKK3G_EBI/review";
  var SOURCES = { TripAdvisor: TRIPADVISOR_URL, Google: GOOGLE_URL };

  var REVIEWS = [
    { autor: "Miguel Castro Reyes", texto: "Muy agradable y una excelente experiencia, además una muy buena atención de los guías, bastante confortable la experiencia, creo regresaré con este grupo. Felicitaciones", rating: 5, fuente: "Google" },
    { autor: "Adrian Valdez", texto: "Gus y Lilo son excelentes guías, no solo son muy profesionales sino también muy amenos y amigables, siempre cuidando del grupo, compartiendo historias y haciendo nuestro hike memorable. Espero hacer muchos más con ellos en el futuro.", rating: 5, fuente: "Google" },
    { autor: "Abhijit P. · traducido del inglés", texto: "Tuve un hike excepcional al Cofre de Perote con Goos y Lily, gente increíble; realmente aprecié la experiencia. ¡Los recomiendo al 100%, sin duda!", rating: 5, fuente: "Google" },
    { autor: "Karla Cruz", texto: "Es una maravillosa experiencia, he tenido la oportunidad de salir dos veces con Hiking Mountain y ambas veces han sido excelentes, fotos muy bellas y además excelente medio de transporte, además de que te proporcionan el equipo de seguridad adecuado para cada ocasión.", rating: 5, fuente: "Google" },
    { autor: "Maria Fernanda Diaz Sansores", texto: "Guías con amplia experiencia y conocimiento de cada montaña en la que ofrecen recorrido. ¡Es una gran familia!", rating: 5, fuente: "Google" },
    { autor: "Pato Segura", texto: "Excelentes guías!!! Con sus conocimientos y forma de liderar el grupo hicieron que la dificultad de la ruta fuera muy llevadera.", rating: 5, fuente: "Google" },
    { autor: "Raziel Gabriela Moreno", texto: "Excelente servicio, muy amables y comprometidos, lo recomiendo mil!", rating: 5, fuente: "Google" },
    { autor: "Jeffrey M.", texto: "Hice una caminata con Hiking Mountain México en la zona del volcán fuera de la Ciudad de México. ¡Fue espectacular! Éramos siete, y Gus nos mantuvo todos juntos y en el camino mientras era un excelente compañero de senderismo. Definitivamente haría otra caminata con Hiking Mountain México y estoy planeando ir con ellos en mi próxima visita a la Ciudad de México.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Sharon M.", texto: "Me gustó mucho la atención por parte de Gustavo. Desde que me brindó la info, la salida y el regreso. Una experiencia muy bella: la vista, la caminata, las fotos, la comida después.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Constance V.", texto: "Increíble experiencia. Los guías son super atentos, excelentes personas y con la mejor actitud. Fui sola pero me sentí acompañada durante toda la experiencia. Fue mi primer hike con ellos y sin duda volveré a las montañas con Lilo y Gus. Los recomiendo.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Giselle M.", texto: "Excelente team en hiking mountain, voy iniciando en este tipo de actividades y me he sentido siempre 100% guiada y cuidada, son expertos en lo que hacen, muy pacientes y de verdad te ayudan a lograr las rutas siempre priorizando tu seguridad y salud. Sin duda los recomiendo 100%.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Nan P.", texto: "Excelentes guías Lilo y Gus. Lugar hermoso para recorrer si inicias en el senderismo. Las vistas son espectaculares todo el camino.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Rodrigo R.", texto: "Un gusto dejarme guiar y acompañar por Lilo y Gus en el camino de la montaña, siempre muy atentos y dispuestos a compartir sus conocimientos. La experiencia en grupo también fue muy gratificante, todas personas amables y colaborativas. Experiencia ampliamente recomendada :)", rating: 5, fuente: "TripAdvisor" },
    { autor: "Paulina C.", texto: "He hecho varios hikes con ellos y siempre regreso. Lilo y Gus son increíbles, te acompañan y guían en todo momento. Súper recomendado.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Ernesto P.", texto: "Una experiencia inolvidable. Desde que comenzamos a subir el Ajusco, con el camino iluminado por la luna, hasta que llegamos a la cima a ver el amanecer, toda la experiencia fue mágica. No hubiera sido igual sin los amables y capaces guías de Hiking Mountain que siempre están al pie del cañón.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Grecia Marlem P.", texto: "Ya he ido varias veces con esta agencia y para empezar súper buena onda y súper agradables los dos guías. Pero lo que los hace excelentes es lo preparados que van: con botiquín, aguas y equipo extra, además lo comprensivos y amables que son con todos los niveles de “hikers”. Te acompañan en todo momento, así vayas lento se van esperando; te hacen sentir tan cómodo que vuelves con ellos 100%.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Violeta T.", texto: "Los guías son de las mejores personas que puedes encontrar en la vida. Tienen siempre buena vibra y hacen cada experiencia increíble, incluso si vas sola. Si quieres iniciar en la montaña, Gus y Lilo son las personas indicadas.", rating: 5, fuente: "TripAdvisor" },
    { autor: "mrubiosan", texto: "¡Super profesionales! Muy bien organizado. Perfecto para principiantes, nos llevaron de la mano y nos hicieron sentir seguros todo el tiempo. Pura buena onda. Fuimos a las cuevas del Xitle. ¡Es un lugar mágico!", rating: 5, fuente: "TripAdvisor" },
    { autor: "Laura M.", texto: "Me encantó la experiencia, el grupo increíble, el ritmo y la vibra del grupo genial, los guías Lilo y Gus personas increíbles. Lo recomiendo.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Karen T.", texto: "Gus y Lilo son excelentes guías, siempre animándote a seguir y llegar a la cima, son súper pacientes y están al pendiente de ti en todo momento. Las rutas son increíbles y garantía de que siempre la vas a pasar bien.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Ivan T.", texto: "Es una experiencia increíble la que brindan Lilo y Gus! Super atentos, amables y con la mejor actitud siempre! Súper recomendables los tours!", rating: 5, fuente: "TripAdvisor" },
    { autor: "Edgar O.", texto: "Un excelente trekking y el acompañamiento de Lilo y de Gus, de primera. Una ruta interesante con algunos puntos difíciles. Sin duda hay que subir con cuidado y con equipo como casco y bastones. Estos fueron provistos por Hiking Mountain México.", rating: 5, fuente: "TripAdvisor" },
    { autor: "Fernanda M.", texto: "Tener como guías a Gus y Lilo es una de las mejores experiencias que puede haber en el senderismo. Son muy profesionales y atentos, ten por seguro que se van a preocupar por ti en cada momento. 1000000% recomendados!", rating: 5, fuente: "TripAdvisor" },
    { autor: "David V.", texto: "Una experiencia única, con un gran equipo, con unos súper guías con una súper vibra. Siempre orientándonos en todo desde antes del viaje hasta el regreso. Súper recomendable.", rating: 5, fuente: "TripAdvisor" },
  ];

  var track = document.getElementById("review-track");
  var dotsWrap = document.getElementById("review-dots");
  if (!track || !dotsWrap) return;

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function starsHtml(n) {
    n = n || 5;
    var out = "";
    for (var k = 0; k < 5; k++) { out += "<span>" + (k < n ? "\u2605" : "\u2606") + "</span>"; }
    return '<div class="review-stars" aria-label="' + n + ' de 5 estrellas">' + out + "</div>";
  }

  track.innerHTML = REVIEWS.map(function (r, i) {
    var fuente = r.fuente || "TripAdvisor";
    var url = SOURCES[fuente] || TRIPADVISOR_URL;
    return (
      '<div class="review-card' + (i === 0 ? " active" : "") + '" data-index="' + i + '">' +
        starsHtml(r.rating || 5) +
        '<p class="review-quote">“' + escapeHtml(r.texto) + '”</p>' +
        '<p class="review-author">' + escapeHtml(r.autor) + "</p>" +
        '<a class="review-source" href="' + url + '" target="_blank" rel="noopener">⭐ vía ' + escapeHtml(fuente) + '</a>' +
      "</div>"
    );
  }).join("");

  dotsWrap.innerHTML = REVIEWS.map(function (_, i) {
    return '<button class="review-dot' + (i === 0 ? " active" : "") + '" data-index="' + i + '" aria-label="Ver reseña ' + (i + 1) + '"></button>';
  }).join("");

  var cards = track.querySelectorAll(".review-card");
  var dots = dotsWrap.querySelectorAll(".review-dot");
  var current = 0;
  var timer = null;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(index) {
    current = (index + REVIEWS.length) % REVIEWS.length;
    cards.forEach(function (c, i) { c.classList.toggle("active", i === current); });
    dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function startAuto() {
    if (prefersReduced) return;
    stopAuto();
    timer = setInterval(next, 6000);
  }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

  document.getElementById("review-next").addEventListener("click", function () { next(); startAuto(); });
  document.getElementById("review-prev").addEventListener("click", function () { prev(); startAuto(); });
  dots.forEach(function (d) {
    d.addEventListener("click", function () { show(parseInt(d.dataset.index, 10)); startAuto(); });
  });

  var section = document.getElementById("resenas");
  section.addEventListener("mouseenter", stopAuto);
  section.addEventListener("mouseleave", startAuto);

  show(0);
  startAuto();
})();
