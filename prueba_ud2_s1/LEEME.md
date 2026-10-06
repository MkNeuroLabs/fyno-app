# Prueba técnica · Unidad didáctica, Sesión 1

Página estática (HTML + CSS + JavaScript) con la Sesión 1 de la unidad
«La emancipación: las mujeres asturianas en la conquista de la ciudadanía y el
socialismo». Funciona abriendo `index.html` con doble clic o desde cualquier
servidor web. No usa librerías, CDN, cookies ni `localStorage`, y no hace
peticiones externas (el único enlace externo es el de la Wikipedia que
figura en la propia unidad, y solo se abre si se pulsa).

## Qué hace cada archivo

| Archivo | Qué contiene | ¿Cambia de una UD a otra? |
|---|---|---|
| `index.html` | Solo estructura: cabecera, menú, huecos para el contenido y pie. Sin `<style>` ni `<script>` en línea. | No |
| `css/ud.css` | Todos los estilos. Todo cuelga de `.ud-pagina` y usa el prefijo `ud-`. | No |
| `js/ud-menu.js` | Menú: plegado en móvil (< 768 px), submenú «Unidades», Escape, clic fuera. Marca la unidad actual leyendo el archivo de datos. | No |
| `js/ud-actividades.js` | Lógica genérica de las actividades. No contiene ningún texto de la unidad. | No |
| `js/datos-ud2-s1.js` | **Todos** los textos de la sesión, respuestas correctas y rutas de imagen, en `window.UD_DATOS`. | **Sí** |
| `img/rosa-zapico.png` | Ilustración original de Alfonso Zapico. No se usa en la página; se guarda intacta. | No |
| `img/rosa-zapico-web.png` | Copia para la web: 285 × 700 px, fondo transparente conservado. | No |
| `img/galeria/` | Fotos de la galería. Ver `img/galeria/LEEME.txt`. | Sí |

Los scripts son clásicos con `defer` y se cargan en este orden:
`datos-ud2-s1.js` → `ud-menu.js` → `ud-actividades.js`.

Si falta el archivo de datos, aparece un aviso rojo arriba y la página no se
rompe. Si falta una foto, se ve un recuadro gris «Foto pendiente».

## Cómo subirlo al servidor

1. Sube la carpeta `prueba_ud2_s1/` completa, respetando las subcarpetas
   (`css/`, `js/`, `img/`, `img/galeria/`). Por FTP/SFTP o con el
   administrador de archivos del hosting.
2. Abre `https://tu-dominio/…/prueba_ud2_s1/index.html`.
3. No hace falta configurar nada en el servidor (no hay PHP ni base de datos).

Para probar en local con servidor: dentro de la carpeta, ejecuta
`python3 -m http.server 8000` y abre `http://localhost:8000/`.

## Cómo hacer otra sesión u otra unidad

Solo se toca el archivo de datos:

1. Copia `js/datos-ud2-s1.js` con otro nombre (por ejemplo `js/datos-ud3-s1.js`).
2. Cambia dentro los textos: `unidad` (número, línea de datos, título),
   `sesiones`, `sesion`, `actividades` y `pie`. Copia los enunciados
   literalmente.
3. En el `index.html` de la nueva página cambia **solo** la línea
   `<script src="js/datos-ud2-s1.js" defer></script>` por el nuevo nombre.
4. Pon las fotos en `img/galeria/` con los nombres que indiques en `imagen`.

El número de `unidad.numero` decide qué «Unidad N» del menú queda marcada como
página actual.

### Tipos de actividad disponibles en `actividades`

- `"relacionar"`: elementos (con `imagen` o con `texto`/`parrafos`) y un
  desplegable con las respuestas. Comprobar → acierto, «No es X» y reintento;
  «Ver solución» tras `intentosParaSolucion` fallos (por defecto 2).
  `barajar: true` desordena los elementos. `compararAlFallar: true` muestra,
  al fallar, el texto del elemento elegido para comparar (pensado para
  emparejar textos con su título, por ejemplo artículos de una ley).
- `"lectura"`: textos para leer y comentar en el aula, sin corrección.
- `"aula"`: solo el enunciado, con la etiqueta «En el aula».

Los textos de botones y mensajes (`interfaz`) también están en el archivo de
datos, así que `ud-actividades.js` no contiene ninguno.

## Para WordPress / Elementor

Todo el CSS depende de la clase `.ud-pagina`. En esta prueba la lleva el
`<body>`; en WordPress se pone en el contenedor que envuelva la unidad.
