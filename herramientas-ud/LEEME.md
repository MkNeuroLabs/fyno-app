# Herramientas para generar los datos de una UD

No se suben al servidor. Sirven para regenerar `ud-interactivas/js/datos-ud1.js`
y `ud-interactivas/img/ud1/creditos.json` a partir del .docx, de modo que los
textos sean literales.

1. Descomprimir el .docx en una carpeta (`unzip ud.docx -d x`).
2. `python3 estructura.py x estructura.json > estructura.txt`
3. `python3 construir_datos.py estructura.json fichas_todas.json ../ud-interactivas/js/datos-ud1.js ../ud-interactivas/img/ud1/creditos.json`
   (añadir `mapa` como quinto argumento cuando exista `img/ud1/mapa-asturias-central.png`).

`fichas_todas.json`: fichas de licencia descargadas de Wikimedia Commons el 17/10/2026.
