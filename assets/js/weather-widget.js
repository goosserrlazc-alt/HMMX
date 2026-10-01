
/* ══════════════════════════════════════════════════════════════════
   CLIMA HMMX — clima automático por hike
   ------------------------------------------------------------------
   Fuente: Open-Meteo (gratis, sin API key, sin límite práctico).
     · Hikes dentro de los próximos 16 días  -> PRONÓSTICO real.
     · Hikes más lejanos                     -> PROMEDIO HISTÓRICO
                                                (últimos 5 años, ±5 días).
   El monitoreo es constante: se revisa al cargar, cada 30 minutos
   mientras la pestaña está abierta y al volver a la pestaña. En cuanto
   un hike entra a la ventana de 16 días, el recuadro cambia solo de
   "Promedio histórico" a "Pronóstico".

   Uso:
     HMMXClima.slot(hike)  -> HTML del recuadro (se inserta en la tarjeta)
     HMMXClima.escanear()  -> llena todos los recuadros del DOM
     HMMXClima.refrescar() -> fuerza recarga ignorando caché
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CFG = {
    URL_PRONOSTICO: "https://api.open-meteo.com/v1/forecast",
    URL_HISTORICO:  "https://archive-api.open-meteo.com/v1/archive",
    TZ: "America/Mexico_City",
    HORA_REUNION: "07:00",          // hora de la cita (7:30 AM -> se muestra la hora 07:00)
    DIAS_PRONOSTICO: 16,            // máximo que entrega Open-Meteo
    ANIOS_HISTORICO: 5,
    VENTANA_DIAS: 5,                // ±5 días alrededor de la fecha, para el promedio
    TTL_PRONOSTICO: 25 * 60 * 1000,             // 25 min (menor que el ciclo de refresco)
    TTL_HISTORICO: 30 * 24 * 60 * 60 * 1000,    // 30 días
    REFRESCO_MS: 30 * 60 * 1000,                // revisar cada 30 min
    CONCURRENCIA: 5,
    REINTENTOS: 3
  };

  /* ── Catálogo de ubicaciones ──────────────────────────────────────
     Coordenadas tomadas de los puntos de reunión oficiales de HMMX
     (links de Google Maps) y, cuando el punto de reunión queda lejos
     del cerro, del cerro mismo (OpenStreetMap).
     El orden importa: lo más específico va primero.
     Para agregar un destino nuevo, copia un bloque y pon sus alias. */
  var LUGARES = [
    { id:"nevado_cima",      etiqueta:"Nevado de Toluca · Pico del Fraile", lat:19.1019, lon:-99.7676,
      alias:["pico del fraile","nevado de toluca cima","nevado cima"] },
    { id:"nevado_lagunas",   etiqueta:"Nevado de Toluca · Lagunas",         lat:19.1079, lon:-99.7555,
      alias:["lagunas nevado","lagunas del nevado","nevado de toluca","nevado"] },

    { id:"izta_cima",        etiqueta:"Iztaccíhuatl · Cima",               lat:19.1702, lon:-98.6376,
      alias:["iztaccihuatl cima","izta cima","cima iztaccihuatl"] },
    { id:"izta_dos_aguas",   etiqueta:"Dos Aguas, Iztaccíhuatl",           lat:19.2105, lon:-98.7364,
      alias:["dos aguas"] },
    { id:"izta_refugio",     etiqueta:"Iztaccíhuatl · Paso de Cortés",     lat:19.0863, lon:-98.6468,
      alias:["refugio de los 100","los 100","rodilla","cruz de rosas","paso de cortes",
             "iztaccihuatl senderos","izta senderos","senderos","iztaccihuatl","izta"] },
    { id:"nexpayantla",      etiqueta:"Nexpayantla, Popocatépetl",         lat:19.0691, lon:-98.6986,
      alias:["nexpayantla"] },
    { id:"popo_faldas",      etiqueta:"Faldas del Popocatépetl",           lat:19.0691, lon:-98.6986,
      alias:["faldas del popocatepetl","recoleccion de hongos","hongos","popocatepetl","popo"] },

    { id:"malinche",         etiqueta:"La Malinche · Cima",                lat:19.2311, lon:-97.9997,
      alias:["malinche","malintzi","matlalcueyatl"] },
    { id:"cofre_perote",     etiqueta:"Cofre de Perote",                   lat:19.4942, lon:-97.1478,
      alias:["cofre de perote","cofre","perote"] },
    { id:"sierra_negra",     etiqueta:"Sierra Negra",                      lat:18.9862, lon:-97.3151,
      alias:["sierra negra"] },

    { id:"monte_tlaloc",     etiqueta:"Monte Tláloc",                      lat:19.3597, lon:-98.6759,
      alias:["monte tlaloc","tlaloc"] },
    { id:"telapon",          etiqueta:"Monte Telapón",                     lat:19.3709, lon:-98.7198,
      alias:["telapon"] },
    { id:"tehutli",          etiqueta:"Tehutli, Milpa Alta",               lat:19.2185, lon:-99.0473,
      alias:["tehutli"] },
    { id:"xitle",            etiqueta:"Volcán Xitle",                      lat:19.2454, lon:-99.2254,
      alias:["xitle","tubos de lava","cuevas de xitle"] },
    { id:"chichinautzin",    etiqueta:"Volcán Chichinautzin",              lat:19.0894, lon:-99.1356,
      alias:["chichinautzin"] },
    { id:"volcanes_enanos",  etiqueta:"Volcanes Enanos, El Capulín",       lat:19.0800, lon:-99.2050,
      alias:["volcanes enanos","cuexcomates","volcancitos"] },
    { id:"suchiooc",         etiqueta:"Suchiooc, Tepoztlán",               lat:19.0164, lon:-99.0914,
      alias:["suchiooc","tepozteco","tepoztlan"] },

    { id:"pico_aguila",      etiqueta:"Pico del Águila, Ajusco",           lat:19.2117, lon:-99.2686,
      alias:["pico del aguila","pico aguila","ajusco"] },
    { id:"desierto_leones",  etiqueta:"Desierto de los Leones",            lat:19.3131, lon:-99.3106,
      alias:["desierto de los leones","desierto"] },
    { id:"presa_iturbide",   etiqueta:"Presa Iturbide, Jilotzingo",         lat:19.5324, lon:-99.4604,
      alias:["presa iturbide","iturbide"] },
    { id:"piedras_lunares",  etiqueta:"Piedras Lunares, Jilotzingo",        lat:19.5300, lon:-99.4500,
      alias:["piedras lunares","rocas lunares","rocas xinte","xinte"] },

    { id:"dunas_rojas",      etiqueta:"Dunas Rojas de Pacula",             lat:20.9873, lon:-99.3637,
      alias:["dunas rojas","pacula"] },
    { id:"presa_zimapan",    etiqueta:"Presa Zimapán",                     lat:20.6635, lon:-99.5013,
      alias:["presa zimapan","zimapan"] },

    { id:"auditorio",        etiqueta:"Auditorio Nacional, CDMX",          lat:19.4260, lon:-99.1955,
      alias:["auditorio nacional","auditorio"] },
    { id:"polanco",          etiqueta:"Polanco, CDMX",                     lat:19.4299, lon:-99.2045,
      alias:["7 eleven polanco","7eleven polanco","seven eleven polanco","polanco"] }
  ];

  /* ── Códigos de clima WMO ───────────────────────────────────────── */
  var WMO = {
    0:["☀️","Despejado"], 1:["🌤️","Mayormente despejado"], 2:["⛅","Parcialmente nublado"],
    3:["☁️","Nublado"], 45:["🌫️","Niebla"], 48:["🌫️","Niebla con escarcha"],
    51:["🌦️","Llovizna ligera"], 53:["🌦️","Llovizna"], 55:["🌦️","Llovizna intensa"],
    56:["🌧️","Llovizna helada"], 57:["🌧️","Llovizna helada intensa"],
    61:["🌦️","Lluvia ligera"], 63:["🌧️","Lluvia"], 65:["🌧️","Lluvia fuerte"],
    66:["🌧️","Lluvia helada"], 67:["🌧️","Lluvia helada fuerte"],
    71:["🌨️","Nevada ligera"], 73:["🌨️","Nevada"], 75:["❄️","Nevada fuerte"],
    77:["🌨️","Granizo fino"], 80:["🌦️","Chubascos ligeros"], 81:["🌧️","Chubascos"],
    82:["⛈️","Chubascos fuertes"], 85:["🌨️","Chubascos de nieve"], 86:["❄️","Chubascos de nieve fuertes"],
    95:["⛈️","Tormenta eléctrica"], 96:["⛈️","Tormenta con granizo"], 99:["⛈️","Tormenta fuerte con granizo"]
  };
  function wmo(c) { return WMO[c] || ["🌡️","Sin dato"]; }

  /* ── Utilidades ─────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function norm(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }
  function num(v) { var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; }
  function r1(n) { return n == null ? null : Math.round(n); }
  function fechaISO(d) {
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }
  function parseFechaLocal(f) {
    var p = String(f).split("-");
    return new Date(+p[0], (+p[1]) - 1, +p[2]);
  }
  function diasDesdeHoy(fecha) {
    var hoy = new Date(); hoy.setHours(0,0,0,0);
    var d = parseFechaLocal(fecha); d.setHours(0,0,0,0);
    return Math.round((d - hoy) / 86400000);
  }
  function horaCorta() {
    var d = new Date();
    return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  }

  /* ── Caché en localStorage (tolerante a fallos) ─────────────────── */
  function cacheGet(k) {
    try {
      var raw = localStorage.getItem(k);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.exp || Date.now() > o.exp) { localStorage.removeItem(k); return null; }
      return o.v;
    } catch (e) { return null; }
  }
  function cacheSet(k, v, ttl) {
    try { localStorage.setItem(k, JSON.stringify({ exp: Date.now() + ttl, v: v })); } catch (e) { /* cuota llena */ }
  }
  function cacheClearPrefix(p) {
    try {
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && k.indexOf(p) === 0) localStorage.removeItem(k);
      }
    } catch (e) { /* nada */ }
  }

  /* ── Resolver la ubicación de un hike ───────────────────────────── */
  function buscarEnCatalogo(texto) {
    var t = norm(texto);
    if (!t) return null;
    for (var i = 0; i < LUGARES.length; i++) {
      var L = LUGARES[i];
      for (var j = 0; j < L.alias.length; j++) {
        if (t.indexOf(norm(L.alias[j])) !== -1) return L;
      }
    }
    return null;
  }

  function resolverUbicacion(h) {
    // 1) Coordenadas explícitas en el Google Sheet (columnas opcionales)
    var lat = num(h.clima_lat != null ? h.clima_lat : h.lat);
    var lon = num(h.clima_lon != null ? h.clima_lon : h.lon);
    if (lat != null && lon != null) {
      return { lat: lat, lon: lon, etiqueta: h.clima_lugar || h.ubicacion || h.lugar || h.nombre || "" };
    }
    // 2) Columna de ubicación / lugar / punto de reunión
    var campos = [h.clima_lugar, h.ubicacion, h.lugar, h.punto_reunion, h.montana, h.destino];
    for (var i = 0; i < campos.length; i++) {
      var m = buscarEnCatalogo(campos[i]);
      if (m) return m;
    }
    // 3) Nombre del hike
    return buscarEnCatalogo(h.nombre);
  }

  /* ── Cola con concurrencia limitada ─────────────────────────────── */
  var cola = [], activos = 0;
  function encolar(fn) {
    return new Promise(function (res, rej) {
      cola.push({ fn: fn, res: res, rej: rej });
      bombear();
    });
  }
  function bombear() {
    while (activos < CFG.CONCURRENCIA && cola.length) {
      var t = cola.shift();
      activos++;
      t.fn().then(t.res, t.rej).then(function () { activos--; bombear(); });
    }
  }
  function pedirJSON(url, intento) {
    intento = intento || 0;
    return encolar(function () {
      return fetch(url).then(function (r) {
        if (r.status === 429 || r.status === 503) {
          var e = new Error("HTTP " + r.status + " (límite de la API)");
          e.reintentar = true;
          throw e;
        }
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }).catch(function (e) {
      if (e && e.reintentar && intento < CFG.REINTENTOS) {
        var espera = 1500 * Math.pow(2, intento) + Math.random() * 800;
        return new Promise(function (res) { setTimeout(res, espera); })
          .then(function () { return pedirJSON(url, intento + 1); });
      }
      throw e;
    });
  }

  /* ── Pronóstico (≤ 16 días) ─────────────────────────────────────── */
  var enVuelo = {};
  function obtenerPronostico(lat, lon, forzar) {
    var key = "hmmxClima:fc:" + lat.toFixed(3) + "," + lon.toFixed(3);
    if (!forzar) {
      var c = cacheGet(key);
      if (c) return Promise.resolve(c);
    }
    if (enVuelo[key]) return enVuelo[key];
    var url = CFG.URL_PRONOSTICO
      + "?latitude=" + lat + "&longitude=" + lon
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,"
      + "precipitation_sum,wind_speed_10m_max,sunrise"
      + "&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code"
      + "&timezone=" + encodeURIComponent(CFG.TZ)
      + "&forecast_days=" + CFG.DIAS_PRONOSTICO
      + "&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm";
    enVuelo[key] = pedirJSON(url).then(function (j) {
      cacheSet(key, j, CFG.TTL_PRONOSTICO);
      delete enVuelo[key];
      return j;
    }, function (e) { delete enVuelo[key]; throw e; });
    return enVuelo[key];
  }

  function leerPronostico(j, fecha) {
    if (!j || !j.daily || !j.daily.time) return null;
    var i = j.daily.time.indexOf(fecha);
    if (i === -1) return null;
    var d = j.daily, out = {
      tipo: "pronostico",
      codigo: d.weather_code[i],
      tmax: r1(d.temperature_2m_max[i]),
      tmin: r1(d.temperature_2m_min[i]),
      lluviaProb: r1(d.precipitation_probability_max ? d.precipitation_probability_max[i] : null),
      lluviaMm: d.precipitation_sum ? d.precipitation_sum[i] : null,
      viento: r1(d.wind_speed_10m_max ? d.wind_speed_10m_max[i] : null),
      amanecer: d.sunrise ? String(d.sunrise[i]).slice(11,16) : null,
      elevacion: j.elevation != null ? Math.round(j.elevation) : null,
      tempCita: null, sensacionCita: null
    };
    if (j.hourly && j.hourly.time) {
      var hi = j.hourly.time.indexOf(fecha + "T" + CFG.HORA_REUNION);
      if (hi !== -1) {
        out.tempCita = r1(j.hourly.temperature_2m[hi]);
        out.sensacionCita = r1(j.hourly.apparent_temperature ? j.hourly.apparent_temperature[hi] : null);
      }
    }
    return out;
  }

  /* ── Promedio histórico (> 16 días) ─────────────────────────────── */
  function obtenerHistorico(lat, lon, fecha, forzar) {
    var d = parseFechaLocal(fecha);
    var mmdd = String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
    var key = "hmmxClima:hist:" + lat.toFixed(3) + "," + lon.toFixed(3) + ":" + mmdd;
    if (!forzar) {
      var c = cacheGet(key);
      if (c) return Promise.resolve(c);
    }
    if (enVuelo[key]) return enVuelo[key];

    // Se pide SOLO la ventana de ±N días de cada año, no los años completos.
    // Un rango continuo de 5 años son ~1,825 días por consulta y Open-Meteo
    // cobra por volumen: en ráfaga eso devuelve 429. Así son ~11 días por año.
    var anioFin = d.getFullYear() - 1;
    var anioIni = anioFin - (CFG.ANIOS_HISTORICO - 1);
    var limite = new Date(); limite.setDate(limite.getDate() - 6);   // el archivo va ~5 días atrasado

    var urls = [];
    for (var y = anioIni; y <= anioFin; y++) {
      var ini = new Date(y, d.getMonth(), d.getDate() - CFG.VENTANA_DIAS);
      var fin = new Date(y, d.getMonth(), d.getDate() + CFG.VENTANA_DIAS);
      if (ini > limite) continue;
      if (fin > limite) fin = limite;
      urls.push(CFG.URL_HISTORICO
        + "?latitude=" + lat + "&longitude=" + lon
        + "&start_date=" + fechaISO(ini) + "&end_date=" + fechaISO(fin)
        + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
        + "&timezone=" + encodeURIComponent(CFG.TZ)
        + "&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm");
    }
    if (!urls.length) return Promise.resolve(null);

    enVuelo[key] = Promise.all(urls.map(function (u) { return pedirJSON(u); })).then(function (partes) {
      var res = promediar(unir(partes), d);
      if (res) cacheSet(key, res, CFG.TTL_HISTORICO);
      delete enVuelo[key];
      return res;
    }, function (e) { delete enVuelo[key]; throw e; });
    return enVuelo[key];
  }

  // Junta las respuestas de cada año en una sola estructura tipo Open-Meteo.
  function unir(partes) {
    var campos = ["time","temperature_2m_max","temperature_2m_min","precipitation_sum","wind_speed_10m_max"];
    var out = { elevation: null, daily: {} };
    campos.forEach(function (c) { out.daily[c] = []; });
    partes.forEach(function (j) {
      if (!j || !j.daily) return;
      if (out.elevation == null && j.elevation != null) out.elevation = j.elevation;
      campos.forEach(function (c) {
        var a = j.daily[c] || [];
        for (var i = 0; i < a.length; i++) out.daily[c].push(a[i]);
      });
    });
    return out.daily.time.length ? out : null;
  }

  function promediar(j, fechaObj) {
    if (!j || !j.daily || !j.daily.time) return null;
    var t = j.daily.time, ventana = CFG.VENTANA_DIAS * 86400000;
    var sMax = 0, nMax = 0, sMin = 0, nMin = 0, sVi = 0, nVi = 0, dLluvia = 0, nDias = 0, anios = {};

    for (var i = 0; i < t.length; i++) {
      var r = parseFechaLocal(t[i]);
      var objetivo = new Date(r.getFullYear(), fechaObj.getMonth(), fechaObj.getDate());
      if (Math.abs(r - objetivo) > ventana) continue;
      anios[r.getFullYear()] = 1;
      nDias++;
      var vMax = j.daily.temperature_2m_max[i], vMin = j.daily.temperature_2m_min[i];
      var vPre = j.daily.precipitation_sum[i], vVie = j.daily.wind_speed_10m_max[i];
      if (vMax != null) { sMax += vMax; nMax++; }
      if (vMin != null) { sMin += vMin; nMin++; }
      if (vVie != null) { sVi += vVie; nVi++; }
      if (vPre != null && vPre >= 1) dLluvia++;
    }
    if (!nMax || !nMin) return null;
    return {
      tipo: "historico",
      codigo: null,
      tmax: r1(sMax / nMax),
      tmin: r1(sMin / nMin),
      lluviaProb: nDias ? Math.round(dLluvia * 100 / nDias) : null,
      viento: nVi ? r1(sVi / nVi) : null,
      elevacion: j.elevation != null ? Math.round(j.elevation) : null,
      anios: Object.keys(anios).length,
      muestras: nDias
    };
  }

  /* ── Pintado del recuadro ───────────────────────────────────────── */
  function bloque(label, valor) {
    return '<div class="hw-dato"><span class="hw-dato-label">' + esc(label) +
           '</span><span class="hw-dato-valor">' + esc(valor) + '</span></div>';
  }

  function avisos(c) {
    var a = [], pron = c.tipo === "pronostico";
    if (c.tmin != null && c.tmin <= 0) a.push(pron ? "Posibles heladas: capas térmicas y guantes." : "En estas fechas suele haber heladas: capas térmicas y guantes.");
    else if (c.tmin != null && c.tmin <= 4) a.push(pron ? "Va a estar frío al arranque: lleva capas." : "Suele amanecer frío: lleva capas.");
    if (c.lluviaProb != null && c.lluviaProb >= 50) a.push(pron ? "Alta probabilidad de lluvia: impermeable y funda para mochila." : "En estas fechas casi siempre llueve: impermeable y funda para mochila.");
    if (c.viento != null && c.viento >= 40) a.push("Viento fuerte en la cima: rompevientos indispensable.");
    if (c.tmax != null && c.tmax >= 26) a.push("Va a pegar el sol: hidrátate y usa bloqueador.");
    return a.slice(0, 2).join(" ");
  }

  var CHEVRON = '<svg class="hw-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    + 'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<polyline points="6 9 12 15 18 9"></polyline></svg>';

  var contador = 0;

  function pintar(el, c, etiqueta) {
    if (!c) { fallo(el); return; }
    var esPron = c.tipo === "pronostico";
    var ic = esPron ? wmo(c.codigo) : ["📊", "Promedio de años anteriores"];

    var datos = "";
    if (esPron && c.tempCita != null) {
      datos += bloque("7:00 AM", c.tempCita + "°" + (c.sensacionCita != null ? " (ST " + c.sensacionCita + "°)" : ""));
    }
    if (c.lluviaProb != null) datos += bloque(esPron ? "Lluvia" : "Días c/ lluvia", c.lluviaProb + "%");
    if (c.viento != null)     datos += bloque("Viento", c.viento + " km/h");
    if (esPron && c.amanecer)  datos += bloque("Amanecer", c.amanecer);

    var aviso = avisos(c);
    var pie = [];
    if (etiqueta) pie.push(etiqueta);
    if (c.elevacion != null) pie.push(c.elevacion.toLocaleString("es-MX") + " msnm");
    pie.push(esPron ? "actualizado " + horaCorta() : "promedio " + (c.anios || CFG.ANIOS_HISTORICO) + " años");

    // Se conserva si el usuario ya lo había abierto (esto se repinta cada 30 min).
    var abierta = el.dataset.climaAbierta === "1";
    var id = el.dataset.climaId || (el.dataset.climaId = "hw-det-" + (++contador));

    el.classList.remove("hw-oculto");
    el.classList.toggle("hw-abierta", abierta);
    el.innerHTML =
      '<button type="button" class="hw-toggle" aria-expanded="' + (abierta ? "true" : "false") +
        '" aria-controls="' + id + '">' +
        '<span class="hw-head">' +
          '<span class="hw-title">Clima</span>' +
          '<span class="hw-head-der">' +
            '<span class="hw-tag ' + (esPron ? "hw-tag-pronostico" : "hw-tag-historico") + '">' +
              (esPron ? "Pronóstico" : "Promedio histórico") +
            '</span>' + CHEVRON +
          '</span>' +
        '</span>' +
        '<span class="hw-main">' +
          '<span class="hw-icono">' + ic[0] + '</span>' +
          '<span class="hw-main-texto">' +
            '<span class="hw-temps">' + (c.tmin != null ? '<span class="hw-min">' + c.tmin + '°</span> / ' : "") +
              (c.tmax != null ? c.tmax + "°" : "—") + '</span>' +
            '<span class="hw-desc">' + esc(ic[1]) + '</span>' +
          '</span>' +
          (aviso ? '<span class="hw-alerta" title="' + esc(aviso) + '">⚠️</span>' : "") +
        '</span>' +
      '</button>' +
      '<div class="hw-detalle" id="' + id + '"' + (abierta ? "" : " hidden") + '>' +
        (datos ? '<div class="hw-grid">' + datos + '</div>' : "") +
        (aviso ? '<div class="hw-aviso">' + esc(aviso) + '</div>' : "") +
        '<div class="hw-pie">' + esc(pie.join(" · ")) + '</div>' +
      '</div>';
  }

  /* Abrir / cerrar. Se usa delegación porque el contenido se repinta en cada
     ciclo de monitoreo y los listeners directos se perderían. */
  function alternar(caja) {
    var abierta = caja.dataset.climaAbierta !== "1";
    caja.dataset.climaAbierta = abierta ? "1" : "0";
    caja.classList.toggle("hw-abierta", abierta);
    var boton = caja.querySelector(".hw-toggle");
    var detalle = caja.querySelector(".hw-detalle");
    if (boton) boton.setAttribute("aria-expanded", abierta ? "true" : "false");
    if (detalle) { if (abierta) detalle.removeAttribute("hidden"); else detalle.setAttribute("hidden", ""); }
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var boton = t.closest(".hw-toggle");
    if (!boton) return;
    var caja = boton.closest(".hike-weather");
    if (caja) alternar(caja);
  });

  function cargando(el) {
    el.classList.remove("hw-oculto");
    el.innerHTML =
      '<div class="hw-head"><span class="hw-title">Clima</span>' +
      '<span class="hw-tag hw-tag-cargando">Consultando…</span></div>' +
      '<div class="hw-skeleton"></div>';
  }

  function fallo(el) {
    // Sin dato: no dejamos un hueco raro en la tarjeta, solo un aviso discreto.
    el.classList.remove("hw-oculto");
    el.classList.remove("hw-abierta");
    el.innerHTML =
      '<div class="hw-head"><span class="hw-title">Clima</span>' +
      '<span class="hw-tag hw-tag-error">Sin dato</span></div>' +
      '<div class="hw-pie">No pudimos consultar el clima ahora. Se vuelve a intentar solo en unos minutos.</div>';
  }

  /* ── API pública ────────────────────────────────────────────────── */
  function slot(h) {
    if (!h || !h.fecha) return "";
    var u = resolverUbicacion(h);
    if (!u) return "";   // destino sin coordenadas: la tarjeta queda igual que antes
    return '<div class="hike-weather hw-oculto"' +
           ' data-clima-lat="' + u.lat + '"' +
           ' data-clima-lon="' + u.lon + '"' +
           ' data-clima-fecha="' + esc(h.fecha) + '"' +
           ' data-clima-lugar="' + esc(u.etiqueta || "") + '"></div>';
  }

  function llenar(el, forzar) {
    var lat = num(el.getAttribute("data-clima-lat"));
    var lon = num(el.getAttribute("data-clima-lon"));
    var fecha = el.getAttribute("data-clima-fecha");
    var etiqueta = el.getAttribute("data-clima-lugar");
    if (lat == null || lon == null || !fecha) return;

    var dias = diasDesdeHoy(fecha);
    if (dias < 0) { el.classList.add("hw-oculto"); return; }   // hike ya pasó

    if (!el.dataset.climaListo) cargando(el);

    var p = (dias <= CFG.DIAS_PRONOSTICO - 1)
      ? obtenerPronostico(lat, lon, forzar).then(function (j) { return leerPronostico(j, fecha); })
      : obtenerHistorico(lat, lon, fecha, forzar);

    p.then(function (c) {
      if (!c) throw new Error("sin datos para " + fecha);
      el.dataset.climaListo = "1";
      pintar(el, c, etiqueta);
    }).catch(function (err) {
      console.warn("[clima] " + fecha + " " + lat + "," + lon + ":", err && err.message);
      if (!el.dataset.climaListo) fallo(el);
    });
  }

  /* La página muestra un mes a la vez y oculta los demás. Solo se consulta el
     clima del mes visible: son ~8 tarjetas en vez de 23, y el resto se consulta
     cuando el usuario abre esa pestaña de mes. Sin esto, la ráfaga inicial
     tumbaba la API con 429. */
  var registrados = [];

  function visible(el) {
    var g = el.closest ? el.closest(".hike-month-group") : null;
    return !g || g.classList.contains("active");
  }

  function escanear() {
    var nodos = document.querySelectorAll("[data-clima-fecha]");
    for (var i = 0; i < nodos.length; i++) {
      var el = nodos[i];
      if (!el.dataset.climaReg) { el.dataset.climaReg = "1"; registrados.push(el); }
      if (!el.dataset.climaListo && visible(el)) llenar(el, false);
    }
  }

  // Vuelve a consultar lo ya pintado (ciclo de monitoreo).
  function refrescarLlenos(forzar) {
    registrados.forEach(function (el) {
      if (el.dataset.climaListo) llenar(el, forzar);
    });
  }

  /* Al cambiar de mes se consulta el mes recién abierto. showMonth es global y
     se llama desde los onclick de las pestañas, así que se envuelve. */
  function engancharCambioDeMes() {
    if (typeof window.showMonth !== "function" || window.showMonth.__clima) return;
    var original = window.showMonth;
    var envuelta = function () {
      var r = original.apply(this, arguments);
      escanear();
      return r;
    };
    envuelta.__clima = true;
    window.showMonth = envuelta;
  }

  function refrescar() {
    cacheClearPrefix("hmmxClima:fc:");   // el histórico no cambia, no hace falta tirarlo
    refrescarLlenos(true);
    escanear();
  }

  /* ── Monitoreo constante ────────────────────────────────────────── */
  var ultimoCiclo = Date.now();
  function ciclo() {
    ultimoCiclo = Date.now();
    escanear();            // tarjetas nuevas (p. ej. al cambiar de mes)
    refrescarLlenos(false); // relee lo ya pintado; la caché decide si sale a la red
  }
  setInterval(ciclo, CFG.REFRESCO_MS);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && Date.now() - ultimoCiclo > CFG.REFRESCO_MS) ciclo();
  });
  window.addEventListener("online", function () { ciclo(); });

  window.HMMXClima = {
    slot: slot,
    escanear: function () { engancharCambioDeMes(); escanear(); },
    refrescar: refrescar,
    lugares: LUGARES,
    config: CFG
  };
})();
