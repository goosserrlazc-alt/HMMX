  // ── Datos de hikes desde Google Sheets (publicado como CSV) ──
  var HIKES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQs5pveqt5JgcYJ4ZcYwqSP2DJ2HdSrYkRVv8CXTk-5nESi77n1ty21HBngNEQ27p399deN7aOWnuU1/pub?output=csv";
  var WHATSAPP_NUMBER = "525516995143";
  var IMG_BASE = "images/";
  var WA_SVG = '<svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var MESES_CAP = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var DIAS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  var DIAS_ABR = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  var TIER_COLOR = { principiante: "#4ade80", intermedio: "#fbbf24", avanzado: "#f87171" };

  function parseCSV(str) {
    var rows = [], row = [], field = "", inQuotes = false;
    for (var i = 0; i < str.length; i++) {
      var c = str[i], next = str[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else { field += c; }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { row.push(field); field = ""; }
        else if (c === '\r') { /* skip */ }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
        else { field += c; }
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    var headers = rows.shift().map(function (h) { return h.trim(); });
    return rows
      .filter(function (r) { return r.length > 1 || (r[0] && r[0].trim() !== ""); })
      .map(function (r) {
        var obj = {};
        headers.forEach(function (h, idx) { obj[h] = (r[idx] !== undefined ? r[idx] : "").trim(); });
        return obj;
      });
  }

  function parseFecha(fecha) { return new Date(fecha + "T00:00:00"); }
  function monthKey(fecha) { var d = parseFecha(fecha); return MESES[d.getMonth()] + "-" + d.getFullYear(); }
  function monthLabel(fecha) { var d = parseFecha(fecha); return MESES_CAP[d.getMonth()] + " " + d.getFullYear(); }
  function formatFecha(fecha) { var d = parseFecha(fecha); return DIAS[d.getDay()] + " " + d.getDate() + " de " + MESES_CAP[d.getMonth()]; }
  function formatFechaCorta(fecha) { var d = parseFecha(fecha); return DIAS_ABR[d.getDay()] + " " + d.getDate(); }
  function formatFechaWa(fecha) { var d = parseFecha(fecha); return d.getDate() + " " + MESES_CAP[d.getMonth()]; }

  function diffTier(texto) {
    var t = (texto || "").toLowerCase();
    if (t.indexOf("avanzado") !== -1) return "avanzado";
    if (t.indexOf("intermedio") !== -1) return "intermedio";
    return "principiante";
  }

  function escapeHtml(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

  function formatMonto(m) {
    var n = Number(m);
    return isNaN(n) ? escapeHtml(m) : n.toLocaleString("es-MX");
  }

  function buildStat(label, value) {
    return '<div class="stat"><span class="stat-label">' + label + '</span><span class="stat-value">' + escapeHtml(value) + '</span></div>';
  }

  function buildPriceRow(label, monto) {
    return '<div class="price-row"><span class="price-label">' + escapeHtml(label) + '</span><span class="price-amount">$' + formatMonto(monto) + ' pp</span></div>';
  }

  function buildCard(h) {
    var tier = diffTier(h.dificultad);
    var imgUrl = h.imagen && h.imagen.indexOf("http") === 0 ? h.imagen : IMG_BASE + h.imagen;
    var statsHtml = "";
    if (h.distancia_km) statsHtml += buildStat("Distancia", h.distancia_km + " KM");
    if (h.duracion_hrs) statsHtml += buildStat("Duración", h.duracion_hrs + " HRS");
    if (h.altitud_msnm) statsHtml += buildStat("Altitud", formatMonto(h.altitud_msnm) + " msnm");

    var pricesHtml = "";
    if (h.precio1_label) pricesHtml += buildPriceRow(h.precio1_label, h.precio1_monto);
    if (h.precio2_label) pricesHtml += buildPriceRow(h.precio2_label, h.precio2_monto);

    var waMsg = encodeURIComponent("Hola! Quiero info sobre " + h.nombre + " (" + formatFechaWa(h.fecha) + ")");
    var pdfBtn = h.pdf_info ? '<a href="' + escapeAttr(h.pdf_info) + '" target="_blank" class="btn-info">📄 Info PDF</a>' : "";

    return (
      '<div class="hike-card" data-diff="' + tier + '" data-date="' + h.fecha + '">' +
        '<img class="hike-card-img" src="' + escapeAttr(imgUrl) + '" alt="' + escapeAttr(h.nombre) + '" style="width:100%;height:220px;object-fit:cover;">' +
        '<div class="hike-card-top">' +
          '<span class="hike-month">' + monthLabel(h.fecha) + '</span>' +
          '<span class="difficulty-badge diff-' + tier + '">' + escapeHtml(h.dificultad) + '</span>' +
        '</div>' +
        '<div class="hike-card-body">' +
          '<p class="hike-date">' + formatFecha(h.fecha) + '</p>' +
          '<h3 class="hike-name">' + escapeHtml(h.nombre) + '</h3>' +
          '<div class="hike-stats">' + statsHtml + '</div>' +
          (window.HMMXClima ? window.HMMXClima.slot(h) : "") +
          '<div class="hike-prices">' + pricesHtml + '</div>' +
          '<div class="hike-actions">' +
            '<a href="https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMsg + '" target="_blank" class="btn-wa">' + WA_SVG + 'WhatsApp</a>' +
            pdfBtn +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function groupByMonth(hikes) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var future = hikes.filter(function (h) {
      return h.fecha && parseFecha(h.fecha) >= today;
    });
    future.sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });

    var groups = {}, order = [];
    future.forEach(function (h) {
      var key = monthKey(h.fecha);
      if (!groups[key]) { groups[key] = { label: monthLabel(h.fecha), items: [] }; order.push(key); }
      groups[key].items.push(h);
    });
    return { groups: groups, order: order };
  }

  // ── Render de tarjetas + tabs de mes ──
  function renderHikes(hikes) {
    var grid = document.getElementById("hikes-grid");
    var tabsTop = document.getElementById("month-tabs-top");
    var tabsBottom = document.getElementById("month-tabs-bottom");
    if (!grid) return;

    var g = groupByMonth(hikes);
    if (!g.order.length) {
      grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:40px">Pronto anunciaremos nuevos hikes. ¡Síguenos para no perderte la fecha!</p>';
      if (tabsTop) tabsTop.innerHTML = "";
      if (tabsBottom) tabsBottom.innerHTML = "";
      return;
    }

    var tabsHtml = g.order.map(function (key, i) {
      return '<button class="month-tab' + (i === 0 ? ' active' : '') + '" data-month="' + key + '" onclick="showMonth(\'' + key + '\', this)">' + g.groups[key].label + '</button>';
    }).join("");
    if (tabsTop) tabsTop.innerHTML = tabsHtml;
    if (tabsBottom) tabsBottom.innerHTML = tabsHtml;

    grid.innerHTML = g.order.map(function (key, i) {
      var items = g.groups[key].items.map(buildCard).join("");
      return '<div class="hike-month-group' + (i === 0 ? ' active' : '') + '" data-month="' + key + '">' + items + '</div>';
    }).join("");
  }

  // ── Render del calendario compacto ──
  function renderCalendar(hikes) {
    var calGrid = document.getElementById("cal-grid");
    if (!calGrid) return;

    var g = groupByMonth(hikes);
    if (!g.order.length) { calGrid.innerHTML = ""; return; }

    calGrid.innerHTML = g.order.map(function (key) {
      var group = g.groups[key];
      var itemsHtml = group.items.map(function (h) {
        var tier = diffTier(h.dificultad);
        var color = TIER_COLOR[tier];
        return (
          '<div class="cal-item" data-date="' + h.fecha + '">' +
            '<span class="cal-dot dot-' + tier + '"></span>' +
            '<span class="cal-item-date">' + formatFechaCorta(h.fecha) + '</span>' +
            '<span class="cal-item-name">' + escapeHtml(h.nombre) + '</span>' +
            '<span style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:' + color + ';margin-left:auto;flex-shrink:0;white-space:nowrap">' + escapeHtml(h.dificultad) + '</span>' +
          '</div>'
        );
      }).join("");
      return '<div class="cal-month"><div class="cal-month-header">' + group.label + '</div><div class="cal-items">' + itemsHtml + '</div></div>';
    }).join("");
  }

  // ── Month Tab Filter ──
  function showMonth(month, btn) {
    document.querySelectorAll('.month-tab').forEach(function (b) { b.classList.toggle('active', b.dataset.month === month); });
    document.querySelectorAll('.hike-month-group').forEach(function (g) { g.classList.toggle('active', g.dataset.month === month); });
    var activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter) {
      var diff = activeFilter.textContent.trim().toLowerCase();
      if (diff !== 'todos') applyDiffFilter(diff);
    }
  }

  // ── Difficulty Filter ──
  function filterDiff(diff, btn) {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    applyDiffFilter(diff);
  }

  function applyDiffFilter(diff) {
    var activeGroup = document.querySelector('.hike-month-group.active');
    if (!activeGroup) return;
    activeGroup.querySelectorAll('.hike-card').forEach(function (card) {
      card.style.display = (diff === 'all' || diff === 'todos' || card.dataset.diff === diff) ? '' : 'none';
    });
  }

  // ── Carga de datos desde Google Sheets ──
  function loadHikesData() {
    fetch(HIKES_CSV_URL)
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.text(); })
      .then(function (text) {
        var hikes = parseCSV(text);
        renderHikes(hikes);
        renderCalendar(hikes);
        if (window.HMMXClima) window.HMMXClima.escanear();
      })
      .catch(function (err) {
        console.error('No se pudieron cargar los hikes desde Google Sheets', err);
        var grid = document.getElementById('hikes-grid');
        if (grid) grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:40px">No pudimos cargar los próximos hikes en este momento. Intenta recargar la página en unos minutos.</p>';
      });
  }
  document.addEventListener('DOMContentLoaded', loadHikesData);

  // ── Wire up difficulty filter buttons (data-diff attributes, no inline handlers) ──
  document.addEventListener('DOMContentLoaded', function () {
    var filtersWrap = document.querySelector('.filters');
    if (!filtersWrap) return;
    filtersWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterDiff(btn.dataset.diff, btn);
    });
  });

