/*
 * Lógica genérica de las actividades. Reutilizable en cualquier unidad.
 * NO contiene texto de ninguna unidad: todo se lee de window.UD_DATOS
 * (archivo js/datos-*.js, cargado antes que este).
 *
 * Tipos de actividad que entiende:
 *   "relacionar"  Elementos (imagen o texto) con un desplegable de respuestas.
 *                 Botón de comprobar, reintentos y botón de solución tras N fallos.
 *                 Opción compararAlFallar: al fallar, muestra el contenido del
 *                 elemento que se ha elegido (útil para emparejar textos).
 *   "lectura"     Textos para leer; se trabajan en el aula, sin corrección.
 *   "aula"        Solo enunciado; se trabaja en el aula.
 */
(function () {
  "use strict";

  var D = window.UD_DATOS;
  var aviso = document.getElementById("ud-aviso-datos");

  function mostrarAviso() {
    if (aviso) { aviso.hidden = false; }
  }

  if (!D || typeof D !== "object") {
    mostrarAviso();
    return;
  }

  var T = D.interfaz || {};
  var contador = 0;

  /* ---------- utilidades ---------- */

  function nuevoId(prefijo) {
    contador += 1;
    return "ud-" + prefijo + "-" + contador;
  }

  function el(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) { nodo.className = clase; }
    if (texto !== undefined && texto !== null) { nodo.textContent = texto; }
    return nodo;
  }

  function fmt(plantilla, valores) {
    return String(plantilla || "").replace(/\{(\w+)\}/g, function (todo, clave) {
      return valores && valores[clave] !== undefined ? valores[clave] : todo;
    });
  }

  function barajar(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copia[i]; copia[i] = copia[j]; copia[j] = t;
    }
    return copia;
  }

  function rellenar(selector, texto) {
    var nodo = document.querySelector('[data-ud="' + selector + '"]');
    if (nodo && texto) { nodo.textContent = texto; }
    return nodo;
  }

  /* Párrafo: cadena, o lista de segmentos {texto} / {texto, destacado} / {enlace, texto?}. */
  function parrafo(contenido, clase) {
    var p = el("p", clase);
    var segmentos = typeof contenido === "string" ? [{ texto: contenido }] : contenido;
    for (var i = 0; i < segmentos.length; i++) {
      var s = segmentos[i];
      if (s.enlace) {
        var a = el("a", "ud-enlace", s.texto || s.enlace);
        a.href = s.enlace;
        p.appendChild(a);
      } else if (s.destacado) {
        p.appendChild(el("strong", "ud-destacado", s.texto));
      } else {
        p.appendChild(document.createTextNode(s.texto));
      }
    }
    return p;
  }

  /* Bloques de enunciado: {texto} | {lista: [...]} */
  function enunciado(bloques) {
    var caja = el("div", "ud-tarjeta__enunciado");
    for (var i = 0; i < (bloques || []).length; i++) {
      var b = bloques[i];
      if (b.lista) {
        var ul = el("ul", "ud-lista");
        for (var k = 0; k < b.lista.length; k++) { ul.appendChild(el("li", null, b.lista[k])); }
        caja.appendChild(ul);
      } else {
        caja.appendChild(parrafo(b.texto !== undefined ? b.texto : b, "ud-parrafo"));
      }
    }
    return caja;
  }

  function insignia(texto) {
    return el("span", "ud-insignia", texto);
  }

  /* ---------- cabecera, índice y pie ---------- */

  function pintarCabecera() {
    var u = D.unidad || {};
    rellenar("meta", (u.meta || []).join(" · "));
    rellenar("titulo", u.titulo);
    rellenar("pie", D.pie);
    if (D.sesion && u.titulo) {
      document.title = D.sesion.titulo + " · " + u.titulo;
    }
  }

  function pintarSesiones() {
    var nav = document.querySelector('[data-ud="sesiones"]');
    var s = D.sesiones;
    if (!nav || !s) { return; }
    var titulo = el("h2", "ud-sesiones__titulo", s.tituloIndice);
    titulo.id = "ud-sesiones-titulo";
    nav.appendChild(titulo);
    var ol = el("ol", "ud-sesiones__lista");
    for (var n = 1; n <= s.total; n++) {
      var li = el("li", "ud-sesiones__item");
      var nombre = s.etiqueta + " " + n;
      if (n === s.actual) {
        var a = el("a", "ud-sesiones__enlace", nombre);
        a.href = "#ud-sesion";
        a.setAttribute("aria-current", "page");
        li.appendChild(a);
      } else {
        var span = el("span", "ud-sesiones__pendiente", nombre);
        span.appendChild(el("span", "ud-oculto", " (" + s.pendiente + ")"));
        li.appendChild(span);
      }
      ol.appendChild(li);
    }
    nav.appendChild(ol);
  }

  function pintarSesion() {
    var h = document.querySelector('[data-ud="sesion"]');
    if (!h || !D.sesion) { return; }
    h.id = "ud-sesion";
    h.tabIndex = -1;
    h.appendChild(el("span", "ud-sesion__etiqueta", D.sesion.etiqueta));
    h.appendChild(document.createTextNode(" "));
    h.appendChild(el("span", "ud-sesion__nombre", D.sesion.titulo));
  }

  /* ---------- tarjeta común ---------- */

  function tarjeta(act) {
    var sec = el("section", "ud-tarjeta ud-tarjeta--" + act.tipo);
    var idTitulo = nuevoId("titulo");
    sec.setAttribute("aria-labelledby", idTitulo);

    var cab = el("div", "ud-tarjeta__cabecera");
    var h = el("h3", "ud-tarjeta__etiqueta");
    h.id = idTitulo;
    h.appendChild(el("span", "ud-tarjeta__numero", String(act.numero)));
    var partes = [act.tipoEtiqueta];
    if (act.subtitulo) { partes.push(act.subtitulo); }
    h.appendChild(el("span", "ud-tarjeta__tipo", partes.join(" · ")));
    cab.appendChild(h);
    if (act.etiquetaAula) { cab.appendChild(insignia(act.etiquetaAula)); }
    sec.appendChild(cab);

    sec.appendChild(enunciado(act.enunciado));
    return sec;
  }

  function bloqueDespues(d) {
    var caja = el("div", "ud-recuadro");
    var cab = el("div", "ud-recuadro__cabecera");
    cab.appendChild(el("h4", "ud-recuadro__titulo", d.titulo));
    if (d.etiqueta) { cab.appendChild(insignia(d.etiqueta)); }
    caja.appendChild(cab);
    if (d.lista) {
      var ul = el("ul", "ud-lista");
      for (var i = 0; i < d.lista.length; i++) { ul.appendChild(el("li", null, d.lista[i])); }
      caja.appendChild(ul);
    }
    return caja;
  }

  /* ---------- tipo «relacionar» ---------- */

  function actividadRelacionar(act) {
    var sec = tarjeta(act);
    var maxFallos = act.intentosParaSolucion || 2;
    var elementos = act.elementos || [];
    var opciones = act.opciones || elementos.map(function (e) { return e.respuesta; });
    var orden = act.barajar ? barajar(elementos) : elementos.slice();
    var conImagen = elementos.some(function (e) { return e.imagen; });
    var porRespuesta = {};
    elementos.forEach(function (e) { porRespuesta[e.respuesta] = e; });

    var rejilla = el("div", conImagen ? "ud-rejilla ud-rejilla--imagenes" : "ud-rejilla ud-rejilla--textos");
    var piezas = [];

    orden.forEach(function (dato, indice) {
      var n = indice + 1;
      var pieza = {
        dato: dato, fallos: 0, estado: "pendiente",
        nodo: el("div", "ud-pieza")
      };
      var etiquetaTexto = fmt(dato.imagen ? T.altFoto : T.etiquetaTexto, { n: n });

      // Contenido: imagen o texto.
      var media;
      if (dato.imagen) {
        media = el("div", "ud-pieza__media");
        var img = el("img", "ud-pieza__foto");
        img.alt = etiquetaTexto;
        img.onerror = function () {
          var hueco = el("div", "ud-pieza__pendiente", T.fotoPendiente);
          hueco.setAttribute("role", "img");
          hueco.setAttribute("aria-label", etiquetaTexto + ". " + T.fotoPendiente);
          if (img.parentNode) { img.parentNode.replaceChild(hueco, img); }
          pieza.img = null;
        };
        img.src = dato.imagen;
        media.appendChild(img);
        pieza.img = img;
      } else {
        media = el("blockquote", "ud-pieza__texto");
        (dato.parrafos || [dato.texto]).forEach(function (p) { media.appendChild(parrafo(p, "ud-parrafo")); });
      }
      pieza.nodo.appendChild(media);

      // Desplegable.
      var idSelect = nuevoId("eleccion");
      var idFeedback = nuevoId("feedback");
      var etiqueta = el("label", "ud-pieza__etiqueta", etiquetaTexto);
      etiqueta.htmlFor = idSelect;
      var select = el("select", "ud-select");
      select.id = idSelect;
      select.setAttribute("aria-describedby", idFeedback);
      select.appendChild(new Option(conImagen ? T.elige : T.eligeTexto, ""));
      opciones.forEach(function (o) { select.appendChild(new Option(o, o)); });
      pieza.select = select;

      var fb = el("p", "ud-pieza__feedback");
      fb.id = idFeedback;
      fb.tabIndex = -1;
      pieza.feedback = fb;

      var botonSol = el("button", "ud-boton ud-boton--secundario", T.verSolucion);
      botonSol.type = "button";
      botonSol.hidden = true;
      pieza.botonSolucion = botonSol;

      var comparar = el("div", "ud-pieza__comparar");
      comparar.hidden = true;
      pieza.comparar = comparar;

      var control = el("div", "ud-pieza__control");
      control.appendChild(etiqueta);
      control.appendChild(select);
      control.appendChild(fb);
      control.appendChild(botonSol);
      control.appendChild(comparar);
      pieza.nodo.appendChild(control);

      select.addEventListener("change", function () {
        if (pieza.estado === "pendiente") {
          pieza.nodo.classList.remove("ud-error");
          fb.textContent = "";
          comparar.hidden = true;
        }
      });

      botonSol.addEventListener("click", function () {
        resolver(pieza, "solucion");
        fb.focus();
        anunciar();
      });

      piezas.push(pieza);
      rejilla.appendChild(pieza.nodo);
    });

    sec.appendChild(rejilla);

    var acciones = el("div", "ud-acciones");
    var botonComprobar = el("button", "ud-boton", T.comprobar);
    botonComprobar.type = "button";
    acciones.appendChild(botonComprobar);
    sec.appendChild(acciones);

    var vivo = el("p", "ud-tarjeta__feedback");
    vivo.setAttribute("role", "status");
    vivo.setAttribute("aria-live", "polite");
    sec.appendChild(vivo);

    function marcar(pieza, icono, texto) {
      pieza.feedback.textContent = "";
      pieza.feedback.appendChild(el("span", "ud-icono", icono));
      pieza.feedback.appendChild(document.createTextNode(" " + texto));
    }

    function resolver(pieza, estado) {
      var nombre = pieza.dato.respuesta;
      pieza.estado = estado;
      pieza.select.value = nombre;
      pieza.select.disabled = true;
      pieza.botonSolucion.hidden = true;
      pieza.comparar.hidden = true;
      pieza.nodo.classList.remove("ud-error");
      pieza.nodo.classList.add(estado === "ok" ? "ud-ok" : "ud-solucion");
      marcar(pieza, estado === "ok" ? T.iconoAcierto : T.iconoSolucion,
        fmt(estado === "ok" ? T.correcto : T.solucion, { nombre: nombre }));
      if (pieza.img) { pieza.img.alt = fmt(T.altFotoResuelta, { nombre: nombre }); }
    }

    function anunciar() {
      var hechas = piezas.filter(function (p) { return p.estado !== "pendiente"; }).length;
      var aciertos = piezas.filter(function (p) { return p.estado === "ok"; }).length;
      var plantilla = hechas === piezas.length ? T.completado : T.resumen;
      vivo.textContent = fmt(plantilla, { aciertos: hechas === piezas.length ? aciertos : hechas, total: piezas.length });
      if (hechas === piezas.length) { botonComprobar.disabled = true; }
    }

    botonComprobar.addEventListener("click", function () {
      piezas.forEach(function (pieza) {
        if (pieza.estado !== "pendiente") { return; }
        var valor = pieza.select.value;
        if (!valor) {
          pieza.nodo.classList.remove("ud-error");
          pieza.feedback.textContent = T.sinRespuesta;
          return;
        }
        if (valor === pieza.dato.respuesta) {
          resolver(pieza, "ok");
          return;
        }
        pieza.fallos += 1;
        pieza.nodo.classList.add("ud-error");
        marcar(pieza, T.iconoError, fmt(T.noEs, { nombre: valor }));
        if (act.compararAlFallar && porRespuesta[valor]) {
          var elegido = porRespuesta[valor];
          pieza.comparar.textContent = "";
          pieza.comparar.appendChild(el("p", "ud-pieza__comparar-titulo", fmt(T.textoElegido, { nombre: valor })));
          var cita = el("blockquote", "ud-pieza__texto");
          (elegido.parrafos || [elegido.texto]).forEach(function (p) { cita.appendChild(parrafo(p, "ud-parrafo")); });
          pieza.comparar.appendChild(cita);
          pieza.comparar.hidden = false;
        }
        if (pieza.fallos >= maxFallos) { pieza.botonSolucion.hidden = false; }
      });
      anunciar();
    });

    if (act.despues) { sec.appendChild(bloqueDespues(act.despues)); }
    return sec;
  }

  /* ---------- tipo «lectura» ---------- */

  function actividadLectura(act) {
    var sec = tarjeta(act);
    (act.textos || []).forEach(function (t) {
      var art = el("article", "ud-lectura");
      if (t.titulo) { art.appendChild(el("h4", "ud-lectura__titulo", t.titulo)); }
      (t.parrafos || []).forEach(function (p) { art.appendChild(parrafo(p, "ud-parrafo")); });
      if (t.cita && t.cita.length) {
        var bq = el("blockquote", "ud-cita");
        t.cita.forEach(function (p) { bq.appendChild(parrafo(p, "ud-parrafo")); });
        art.appendChild(bq);
      }
      sec.appendChild(art);
    });
    if (act.despues) { sec.appendChild(bloqueDespues(act.despues)); }
    return sec;
  }

  /* ---------- tipo «aula» ---------- */

  function actividadAula(act) {
    return tarjeta(act);
  }

  var tipos = { relacionar: actividadRelacionar, lectura: actividadLectura, aula: actividadAula };

  /* ---------- arranque ---------- */

  function iniciar() {
    pintarCabecera();
    pintarSesiones();
    pintarSesion();
    var contenedor = document.querySelector('[data-ud="actividades"]');
    if (!contenedor) { return; }
    (D.actividades || []).forEach(function (act) {
      var pintar = tipos[act.tipo];
      if (!pintar) { mostrarAviso(); return; }
      try {
        contenedor.appendChild(pintar(act));
      } catch (e) {
        mostrarAviso();
      }
    });
  }

  iniciar();
})();
