// reveal on scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  els.forEach(function (e) { io.observe(e); });
})();

// date buttons preselect the form
(function () {
  var sel = document.querySelector('#reg-form select[name=fecha]');
  document.querySelectorAll('[data-fecha]').forEach(function (a) {
    a.addEventListener('click', function () { if (sel) sel.value = a.getAttribute('data-fecha'); });
  });
})();

// registration form -> WhatsApp
(function () {
  var form = document.getElementById('reg-form');
  var err = document.getElementById('form-err');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var nombre = f.nombre.value.trim();
    if (!nombre || !f.fecha.value || !f.exp.value) { err.hidden = false; return; }
    err.hidden = true;
    var lines = [
      'Hola! Quiero guardar mi lugar para Guatemala 2027 (Acatenango y Fuego).',
      'Nombre: ' + nombre,
      'Salida: ' + f.fecha.value,
      'Experiencia: ' + f.exp.value
    ];
    if (f.ext.checked) lines.push('Me interesa la extensión a Atitlán.');
    if (f.vuelos.checked) lines.push('Quiero ayuda con los vuelos.');
    window.open('https://wa.me/525516995143?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
