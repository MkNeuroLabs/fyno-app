"""Genera js/datos-ud1.js e img/ud1/creditos.json.

Todos los textos de la UD se copian del .docx (estructura.json, extraída del
XML del documento): ningún texto de la unidad se teclea a mano aquí, salvo las
etiquetas de la interfaz y los datos de crédito de las imágenes.
"""
import json, re, sys

EST, FICHAS, SALIDA_JS, SALIDA_CRED = sys.argv[1:5]
P = json.load(open(EST, encoding="utf8"))
F = json.load(open(FICHAS, encoding="utf8"))


def T(k):
    """Texto literal del párrafo k (sin espacios finales)."""
    return "".join(s[1] for s in P[k]["segs"] if s[0] != "IMG").rstrip()


def L(a, b):
    return [T(k) for k in range(a, b + 1) if T(k)]


URL = re.compile(r"https?://[^\s]+")


def seg(k, texto=None):
    """Párrafo con las URL convertidas en enlaces (el texto no cambia)."""
    t = texto if texto is not None else T(k)
    partes, i = [], 0
    for m in URL.finditer(t):
        u = m.group(0)
        if "valledelhenares" in u:   # dirección truncada en el original: sin enlace
            continue
        if m.start() > i:
            partes.append({"texto": t[i:m.start()]})
        partes.append({"enlace": u, "texto": u})
        i = m.end()
    if i < len(t):
        partes.append({"texto": t[i:]})
    return partes if any("enlace" in p for p in partes) else t


def sin_punto(s):
    return s[:-1] if s.endswith(".") else s


def ordinal(n):
    return f"{n}.º"


def dividir(texto, marcador):
    i = texto.rindex(marcador)
    a, b = texto[:i], texto[i:]
    assert a + b == texto
    return a, b


# ---------------------------------------------------------------- imágenes
def ficha(k):
    return F[k]


IM = {}


def imagen(clave, archivo, ficha_k, alt, titulo, autor, fecha, sesion, pie=None, licencia=None, estado="libre"):
    f = F[ficha_k] if ficha_k else {}
    IM[clave] = {
        "src": "../img/ud1/" + archivo, "alt": alt, "titulo": titulo, "autor": autor, "fecha": fecha,
        "licencia": licencia or f.get("licencia", ""), "fuente": f.get("pagina", ""),
        "sesion": sesion, "estado": estado,
        "estadoTexto": {"libre": "Libre", "por confirmar": "Por confirmar", "pendiente": "Pendiente"}[estado],
    }
    if pie:
        IM[clave]["pie"] = pie


def pendiente(clave, descripcion, sesion, motivo):
    IM[clave] = {"estado": "pendiente", "descripcion": descripcion, "titulo": descripcion, "sesion": sesion,
                 "estadoTexto": "Pendiente", "motivo": motivo}


imagen("versalles", "versalles.jpg", "versalles", "Grabado coloreado: una multitud de mujeres armadas con picas arrastra un cañón camino de Versalles.",
       "À Versailles, à Versailles. 5 octobre 1789", "Autor desconocido", "1789", "Ampliación · Escape room",
       pie=T(362))
imagen("club", "club.jpg", "club", "Gouache: un grupo de mujeres reunidas alrededor de una mesa escucha a una oradora de pie.",
       "Club patriotique de femmes", "Jean-Baptiste Lesueur", "1789-1795", "Ampliación · Escape room", pie=T(364))
imagen("declaracion", "declaracion.jpg", "declaracion", "Cuadro con el texto de la Declaración de 1789 en dos tablas, coronado por dos figuras alegóricas.",
       "Déclaration des droits de l'homme et du citoyen", "Jean-Jacques-François Le Barbier", "1789", "Ampliación · Escape room", pie=T(366))
imagen("desfile", "desfile.jpg", "desfile", "Fotografía: sufragistas vestidas de blanco desfilan por una calle de Nueva York; delante, una niña en un cochecito.",
       "Youngest parader in New York City suffragist parade", "American Press Association", "1912", "Ampliación · Escape room")
imagen("sufragistas_coche", "sufragistas-coche.jpg", "sufragistas_coche", "Fotografía: cuatro mujeres sentadas en un automóvil descubierto.",
       "Susan Fitzgerald, Emma Bugby, Maggie Murphy, and Mrs. H.S. Blatch", "Bain News Service", "1913", "Ampliación · Escape room")
pendiente("vineta_seneca", "Viñeta del encuentro en la iglesia wesleyana de Seneca Falls", "Ampliación · Escape room",
          "El documento no indica fuente y no se ha encontrado una versión con licencia acreditable.")
IM["vineta_seneca"]["pie"] = T(386)
imagen("capilla", "capilla.jpg", "capilla", "Fotografía: edificio de ladrillo de la capilla wesleyana de Seneca Falls, con un cartel histórico delante.",
       "Wesleyan Methodist Church, Seneca Falls", "Kenneth C. Zirkel", "2013", "Ampliación · Escape room", pie=seg(388))
imagen("tristan", "tristan-laure.jpg", "tristan_laure", "Retrato litográfico de Flora Tristán con el cabello recogido.",
       "Flora Tristan", "Jules Laure", "1847", "S1 · S3 · Escape room")
imagen("luxemburg", "luxemburg.jpg", "luxemburg", "Retrato fotográfico de Rosa Luxemburgo con blusa blanca.",
       "Rosa Luxemburg", "Autor desconocido", "c. 1910-1919", "S3 · Escape room")
imagen("zetkin", "zetkin.jpg", "zetkin", "Retrato fotográfico de Clara Zetkin, de edad avanzada y cabello blanco.",
       "Clara Zetkin", "Autor desconocido", "1923", "S1 · S3 · Escape room")
imagen("kollontai", "kollontai.jpg", "kollontai", "Retrato fotográfico de Aleksandra Kollontái.",
       "Alexandra Kollontai", "George Grantham Bain Collection (Library of Congress)", "Sin fecha", "S3 · Escape room")
imagen("gouges", "gouges.jpg", "gouges", "Retrato al pastel de Olympe de Gouges con peluca empolvada y pañuelo blanco.",
       "Olympe de Gouges", "Alexander Kucharsky", "Finales del siglo XVIII", "S1 · Museo (Sala 1)")
imagen("wollstonecraft", "wollstonecraft.jpg", "wollstonecraft", "Retrato al óleo de Mary Wollstonecraft con vestido blanco.",
       "Mary Wollstonecraft", "John Opie", "c. 1797", "S1 · Museo (Sala 2)")
imagen("arenal", "arenal.jpg", "arenal", "Retrato fotográfico de Concepción Arenal vestida de oscuro.",
       "Concepción Arenal", "Autor desconocido", "Antes de 1893", "S1 · S3 · S4")
imagen("deroin", "deroin.jpg", "deroin", "Grabado: Jeanne Deroin alzada en hombros por un grupo de mujeres.",
       "Jeanne Deroin", "Autor desconocido", "Siglo XIX", "S3")
pendiente("amar", "Josefa de Amar y Borbón", "S3 · S4", "No se ha encontrado ninguna imagen con licencia libre.")
imagen("posada", "posada.jpg", "posada", "Retrato fotográfico de Adolfo Posada con gafas y barba.",
       "Adolfo Posada", "Revista Plus Ultra (Argentina)", "1922", "S3")
imagen("feijoo", "feijoo.jpg", "feijoo", "Grabado: Benito Jerónimo Feijoo escribiendo en su escritorio, con hábito.",
       "Benito Jerónimo Feijoo", "Juan Bernabé Palomino", "1733", "S4")
imagen("gonzalez_polo", "gonzalez-polo.jpg", "gonzalez_polo", "Retrato fotográfico de Virginia González.",
       "Virginia González (Vida Socialista, 1911)", "Autor desconocido", "Antes de 1911", "S5 · Recursos")
imagen("acuna", "acuna.jpg", "acuna", "Retrato fotográfico ovalado de Rosario de Acuña con mantilla.",
       "Rosario de Acuña y Villanueva", "Autor desconocido", "c. 1875", "S5 · Recursos")
pendiente("olay", "Teresa Olay", "S5", "No se ha encontrado ninguna imagen con licencia libre.")
pendiente("rogelia", "Rogelia González Vega", "S5", "No se ha encontrado ninguna imagen con licencia libre.")
imagen("cambrils", "cambrils.jpg", "cambrils", "Fotografía de María Cambrils sentada, con un ejemplar de un periódico en la mano.",
       "María Cambrils Sendra", "Autor desconocido", "Sin fecha", "Museo (Sala 6) · Escape room")
imagen("seneca", "seneca.jpg", "seneca", "Documento impreso: lista de honor de la convención de los derechos de la mujer de Seneca Falls.",
       "Declaration of Sentiments · Roll of Honor (Seneca Falls, 1848)", "Library of Congress", "1848", "S2")
imagen("internacional", "internacional.jpg", "internacional", "Grabado: asamblea en una sala con galerías y un orador en la tribuna.",
       "First congress of the International Workingmen's Association", "Autor desconocido", "Sin fecha", "S2")
imagen("stuttgart", "stuttgart.jpg", "stuttgart", "Fotografía de grupo de delegados ante la fachada de un edificio.",
       "Delegates to the 1907 International Socialist Congress in Stuttgart", "Autor desconocido", "1907", "S2 · Recursos")
imagen("copenhague", "copenhague.jpg", "copenhague", "Fotografía de grupo de congresistas en una escalinata; en el centro, Aleksandra Kollontái y Clara Zetkin.",
       "VIII Congresso della II Internazionale Socialista, Copenaghen 1910", "Autor desconocido", "1910", "S2 · Recursos")
imagen("wspu", "wspu.jpg", "wspu", "Fotografía: varias mujeres sentadas alrededor de una mesa revisan papeles.",
       "Meeting of Women's Social and Political Union (WSPU) leaders", "LSE Library", "c. 1906-1907", "Recursos")
pendiente("grupos_femeninos", "Grupos femeninos socialistas", "Recursos", "No se ha encontrado ninguna imagen con licencia libre.")
imagen("casa_pueblo", "casa-pueblo.jpg", "casa_pueblo", "Fotografía de una calle con la fachada de la Casa del Pueblo de Madrid.",
       "La Casa del Pueblo, de Madrid (Nuevo Mundo)", "Antonio Portela", "1908", "Recursos")
imagen("operarias", "operarias-de-la-fabrica-1882.jpg", None, "Fotografía de grupo: decenas de operarias posan sentadas y de pie ante la fachada de una fábrica.",
       "«Operarias de la fábrica»", "J. David", "1882", "Recursos", licencia="Derechos por confirmar", estado="por confirmar",
       pie="9. “Operarias de la fábrica“. J. David, 1882 (MUSEO DE BELLAS ARTES DE ASTURIAS).")
IM["operarias"]["fuente"] = ""
IM["operarias"]["procedencia"] = "Operarias de la fábrica.pdf (carpeta Unidad_1)"
imagen("cubierta_cambrils", "cubierta-feminismo-socialista-clara-campoamor.jpg", None,
       "Cubierta del libro «Feminismo socialista» de María Cambrils: título en blanco sobre granate y retrato de la autora sobre una franja rosa.",
       "Cubierta de «Feminismo socialista» (Publicaciones Clara Campoamor)", "", "", "Recursos",
       licencia="Derechos por confirmar", estado="por confirmar")
IM["cubierta_cambrils"]["procedencia"] = "Feminismo Socialista 1.pdf (carpeta Unidad_1)"
pendiente("cubierta_pablo_iglesias", "Cubierta de «Feminismo socialista» (Editorial Pablo Iglesias)", "Recursos",
          "El archivo «Feminismo socialista.pdf» no se ha recibido.")

MAPA_OK = len(sys.argv) > 5 and sys.argv[5] == "mapa"
if MAPA_OK:
    IM["mapa"] = {"src": "../img/ud1/mapa-asturias-central.png",
                  "alt": "Mapa mudo de la zona central de Asturias, con límites de concejos y la costa al norte, sin nombres.",
                  "titulo": "Asturias location map (recorte de la zona central)",
                  "autor": "Miguillen; obra derivada: Xfigpower", "fecha": "2010",
                  "licencia": F["mapa"]["licencia"], "fuente": F["mapa"]["pagina"], "sesion": "S6 · Escape room (Prueba 4)",
                  "estado": "libre", "estadoTexto": "Libre"}
else:
    pendiente("mapa", "Mapa base de Asturias", "S6 · Escape room (Prueba 4)", "No se pudo descargar la versión ampliada.")

# Posiciones de los puntos: coordenadas de Wikidata, proyectadas sobre el mapa
# (equirrectangular; límites N 44.141, S 42.498, O -7.286, E -4.375) y
# referidas al recorte lon -5.98…-5.45, lat 43.62…43.15.
COORD = {"Gijón": ("Q80349557", 43.54503, -5.66210), "Mieres": ("Q23995118", 43.24877, -5.77287),
         "Sama": ("Q3775049", 43.29277, -5.68002), "Vegadotos": ("Q125747438", 43.26557, -5.72921),
         "Sotrondio": ("Q6132683", 43.28330, -5.60000), "Turón": ("Q5198306", 43.20927, -5.75711),
         "Oviedo": ("Q21414421", 43.36342, -5.84230)}
N, S, O, E = 44.141, 42.498, -7.286, -4.375
CX0, CX1 = (-5.98 - O) / (E - O), (-5.45 - O) / (E - O)
CY0, CY1 = (N - 43.62) / (N - S), (N - 43.15) / (N - S)


def punto(nombre):
    _, lat, lon = COORD[nombre]
    x, y = (lon - O) / (E - O), (N - lat) / (N - S)
    return {"x": round((x - CX0) / (CX1 - CX0) * 100, 2), "y": round((y - CY0) / (CY1 - CY0) * 100, 2)}


NOTA_MAPA = ("Posición de cada punto: coordenadas de Wikidata (" +
             ", ".join(f"{n} {q}" for n, (q, _, _) in COORD.items()) + ").")

# ---------------------------------------------------------------- interfaz
INTERFAZ = {
    "elige": "Elige un nombre", "eligeTexto": "Elige", "comprobar": "Comprobar", "verSolucion": "Ver solución",
    "correcto": "Correcto · {nombre}", "noEs": "No es {nombre} · prueba otra vez", "solucion": "Solución · {nombre}",
    "sinRespuesta": "Elige una opción antes de comprobar.", "resumen": "{aciertos} de {total} resueltas.",
    "completado": "Actividad completada: {aciertos} de {total} acertadas a la primera o tras reintentar.",
    "fotoPendiente": "Foto pendiente", "altFoto": "¿Quién es? · foto {n}", "altFotoResuelta": "Retrato de {nombre}",
    "etiquetaTexto": "Texto {n}", "textoElegido": "Referencia del fragmento de {nombre}:", "enElAula": "En el aula",
    "iconoAcierto": "✓", "iconoError": "✕", "iconoSolucion": "→", "fuente": "Fuente", "otraPestana": "(se abre en otra pestaña)",
    "alCompletarTitulo": "Texto de la unidad", "audioPendiente": "Audio pendiente", "escuchar": "Escuchar",
    "anterior": "Anterior", "siguiente": "Siguiente", "paginaDe": "{datos} · Página {n} de {total}",
    "altPagina": "{titulo}, {datos}, página {n} escaneada", "abrirPagina": "Abrir la página a tamaño completo",
    "irAPagina": "Ir a la página {n}",
}
POS = {"opciones": None}

# ---------------------------------------------------------------- bloques
B = []

B.append({"tipo": "portada", "id": "presentacion", "imagen": "versalles", "etiqueta": "Unidad 1",
          "titulo": [T(0).split(":")[0] + ":", T(0).split(":", 1)[1].strip()],
          "datos": [{"clave": T(1), "valor": T(2)}, {"clave": T(3), "valor": T(4)}, {"clave": T(6), "valor": T(7) + " · " + T(8)}]})
assert B[-1]["titulo"][0] + " " + B[-1]["titulo"][1] == T(0)

B.append({"tipo": "cifras", "etiquetaAccesible": "Datos de la unidad", "items": [
    {"valor": "8", "etiqueta": "Sesiones"},
    {"valor": "1789–1931", "etiqueta": "Cronología", "nota": "Arco de la cronología final de la unidad"},
    {"valor": "8", "etiqueta": "Objetivos didácticos"},
    {"valor": "1", "etiqueta": "Producto final: " + T(7)}]})

B.append({"tipo": "objetivos", "id": "objetivos", "titulo": ["Objetivos", "didácticos"], "intro": T(21), "items": L(22, 29)})
assert T(20) == "Objetivos didácticos"

SES = [(32, 33), (59, 60), (78, 79), (99, 100), (124, 125), (141, 142), (170, 171), (192, 193)]
B.append({"tipo": "rejillaSesiones", "id": "secuencia", "titulo": ["Secuencia de", "aprendizaje"],
          "items": [{"num": f"0{i+1}", "titulo": T(t), "ancla": f"s{i+1}"} for i, (_, t) in enumerate(SES)]})
assert T(31) == "Secuencia de aprendizaje"


def tit(k):
    return T(k)


def sesion(n, actividades):
    e, t = SES[n - 1]
    return {"tipo": "sesion", "id": f"s{n}", "etiqueta": T(e), "titulo": T(t), "actividades": actividades,
            "subir": "↑ Secuencia de aprendizaje"}


def lst(a, b, **kw):
    d = {"lista": [seg(k) for k in range(a, b + 1) if T(k)]}
    d.update(kw)
    return d


# S1
galeria_s1 = [("gouges", 37), ("wollstonecraft", 38), ("tristan", 39), ("arenal", 40), ("zetkin", 41)]
B.append(sesion(1, [
    {"etiqueta": T(34) + " · " + T(35), "contenido": [T(36), lst(37, 41)],
     "interactiva": {"modo": "imagenes", "barajar": True, "intentosParaSolucion": 2,
                     "elementos": [{"imagen": im, "respuesta": sin_punto(T(k))} for im, k in galeria_s1]},
     "despues": [{"titulo": T(42)}, lst(43, 45)], "aula": False},
    {"etiqueta": T(47), "aula": True, "contenido": [
        T(48),
        {"lista": [seg(49), T(50)]},
        T(51),
        {"cita": [T(52), T(53), T(54)]}]},
    {"etiqueta": T(56), "aula": True, "oscura": True, "lema": T(57)},
]))

# S2: línea del tiempo
s2_items = [64, 65, 66, 67]
B.append(sesion(2, [
    {"etiqueta": T(61), "contenido": [T(62), T(63)],
     "interactiva": {"modo": "lista", "barajar": True, "etiquetaElemento": "Posición",
                     "textoElige": "Elige la posición", "opciones": [ordinal(i + 1) for i in range(4)],
                     "mensajes": {"correcto": "Posición correcta · {nombre}", "noEs": "No es la posición {nombre} · prueba otra vez",
                                  "solucion": "Posición · {nombre}"},
                     "elementos": [{"texto": re.sub(r" \(\d{4}\)\.$", "", T(k)), "respuesta": ordinal(i + 1),
                                    "revelar": [T(k)]} for i, k in enumerate(s2_items)],
                     "alCompletar": [T(63), lst(64, 67), {"galeria": ["seneca", "internacional", "stuttgart", "copenhague"],
                                                          "clase": "ud-galeria--apaisada"}]}},
    {"etiqueta": T(69), "aula": True, "contenido": [T(70), lst(71, 74), {"titulo": T(75)}, T(76)]},
]))
for k in s2_items:
    assert re.search(r" \(\d{4}\)\.$", T(k)), T(k)

# S3
B.append(sesion(3, [
    {"etiqueta": T(80), "aula": True, "contenido": [T(81), lst(82, 89),
                                                    {"galeria": ["tristan", "deroin", "kollontai", "zetkin", "luxemburg", "arenal", "amar", "posada"]},
                                                    {"titulo": T(91)}, T(92), lst(93, 97)]},
]))

# S4: actividad documental
frag = [(106, " (Concepción Arenal:", 103), (107, " (Fuente: \"Discurso", 104), (110, " (Fuente: Benito", 105)]
elem4 = []
for k, marca, kn in frag:
    texto, ref = dividir(T(k), marca)
    elem4.append({"texto": texto, "respuesta": T(kn), "revelar": [ref.strip()], "comparar": [ref.strip()]})
B.append(sesion(4, [
    {"etiqueta": T(101), "contenido": [T(102), lst(103, 105), {"galeria": ["arenal", "amar", "feijoo"]}],
     "interactiva": {"modo": "textos", "barajar": True, "compararAlFallar": True, "etiquetaElemento": "Fragmento {n}",
                     "textoElige": "Elige la autoría", "elementos": elem4,
                     "mensajes": {"correcto": "Correcto · {nombre}", "noEs": "No es {nombre} · prueba otra vez",
                                  "textoElegido": "Has elegido {nombre}. Referencia literal de su fragmento:"}}},
    {"etiqueta": T(112), "aula": True, "contenido": [T(113)], "lema": T(114), "despues": [T(115), lst(116, 119)]},
    {"etiqueta": T(121), "aula": True, "oscura": True, "lema": T(122)},
]))

# S5
B.append(sesion(5, [
    {"etiqueta": T(126), "aula": True, "contenido": [T(127), lst(128, 133),
                                                     {"galeria": ["gonzalez_polo", "acuna", "olay", "rogelia"]}]},
    {"etiqueta": T(135), "aula": True, "contenido": [T(136), T(137)], "lema": T(138),
     "despues": [{"titulo": T(139)}, {"ancla": "prensa", "texto": "Ver El Socialista en el visor de prensa ↓"},
                 {"nota": "Pendiente de validar qué titulares de los dos números se destacan aquí."}]},
]))

# S6
mapa7 = ["Gijón", "Mieres", "Sama", "Vegadotos", "Sotrondio", "Turón", "Oviedo"]
assert [sin_punto(T(k)) for k in range(145, 152)] == mapa7
act_mapa = {"etiqueta": T(143), "contenido": [T(144), lst(145, 151)]}
if MAPA_OK:
    act_mapa["interactiva"] = {"modo": "mapa", "mapa": "mapa", "barajar": False, "etiquetaElemento": "Punto {n}",
                               "textoElige": "Elige una localidad", "notaMapa": NOTA_MAPA,
                               "elementos": [{"punto": punto(n), "respuesta": n} for n in mapa7],
                               "mensajes": {"correcto": "Correcto · {nombre}", "noEs": "No es {nombre} · prueba otra vez"}}
else:
    act_mapa["aula"] = True
    act_mapa["estado"] = "Mapa pendiente"
B.append(sesion(6, [
    act_mapa,
    {"etiqueta": T(153), "aula": True, "contenido": [T(154), {"titulo": T(155)}, T(156)], "despues": [{"destacado": T(157)}]},
    {"etiqueta": T(159), "aula": True, "contenido": [T(160), T(161)], "lema": T(162),
     "despues": [{"cita": [T(k)]} for k in range(163, 169)]},
]))

# S7
salas7 = [{"num": T(k), "titulo": T(k + 1)} for k in range(172, 184, 2)]
B.append(sesion(7, [{"etiqueta": T(171), "aula": True, "contenido": [], "despues": [T(184), lst(185, 190)]}]))
B[-1]["actividades"][0]["salas"] = salas7

# S8
B.append(sesion(8, [
    {"etiqueta": T(194), "aula": True, "contenido": [T(195)]},
    {"etiqueta": T(197), "aula": True, "oscura": True, "lema": T(198), "despues": [T(199), lst(200, 203)]},
]))

# Producto final · Museo Virtual
salas_int = []
for a, b, fig in [(438, 442, "gouges"), (445, 449, "wollstonecraft"), (454, 459, None), (461, 466, None), (468, 472, None), (474, 479, None)]:
    cont = [lst(a + 2, b)]
    if fig:
        cont.append({"figura": fig})
    if fig == "wollstonecraft":
        cont.append(seg(451))
    salas_int.append({"num": T(a), "titulo": T(a + 1), "contenido": cont})
B.append({"tipo": "bandaMuseo", "id": "museo", "etiqueta": T(6), "titulo": ["Museo", "Virtual"], "subtitulo": T(8),
          "contenido": [T(9), T(10), lst(11, 18)],
          "despues": [{"titulo": T(436), "contenido": [T(437)], "salas": salas_int,
                       "despues": [{"titulo": T(481), "contenido": [T(482), {"lista": L(483, 487), "clase": "ud-lista--sin"}]}]}]})

# Escuchar
B.append({"tipo": "podcast", "id": "escuchar", "etiqueta": "Escuchar", "titulo": ["Las", "pioneras"],
          "contenido": [T(257) + " · " + T(258), T(259), {"nota": "Los audios se incorporarán cuando el alumnado los elabore."}],
          "episodios": [{"nombre": T(k)} for k in range(260, 265)]})

# Evaluación
def instrumento(k_tit, peso, nombre, a, b, intro=None):
    crit = []
    if intro:
        crit.append(T(intro))
    crit.append(lst(a, b))
    return {"peso": peso, "nombre": nombre, "titulo": T(k_tit), "criterios": crit}


B.append({"tipo": "evaluacion", "id": "evaluacion", "titulo": ["Eval", "uación", "junto"], "intro": T(229), "items": [
    instrumento(230, "40%", "Rúbrica del Museo Virtual", 231, 235),
    instrumento(237, "25%", "Dossier de actividades", 239, 243, intro=238),
    instrumento(245, "20%", "Exposición oral", 246, 249),
    instrumento(251, "15%", "Autoevaluación y coevaluación", 252, 254)]})
assert T(228) == "Evaluación"

# Ampliación + integración (escape room interactivo)
sentencias = re.split(r"(?<=[.?])\s+(?=[A-ZÁÉÍÓÚÑ¿])", dividir(T(427), " (El Socialista")[0])
ref_cambrils = dividir(T(427), " (El Socialista")[1].strip()
assert " ".join(sentencias) + " " + ref_cambrils == T(427), sentencias
anios = ["1789", "1848", "1864", "1907", "1910", "1924", "1931"]
assert T(433) == " → ".join(anios)

escape = [
    {"etiqueta": T(359), "aula": True, "contenido": [T(360), {"figura": "versalles"}, {"figura": "club"}, {"figura": "declaracion"}]},
    {"id": "prueba-1", "etiqueta": T(368) + " · " + T(369), "aula": True, "estado": "Contenido pendiente",
     "contenido": [T(370), lst(371, 372), {"galeria": ["desfile", "sufragistas_coche"], "clase": "ud-galeria--apaisada"}]},
    {"id": "prueba-2", "etiqueta": T(379) + " · " + T(380), "aula": True, "estado": "Contenido pendiente",
     "contenido": [T(382), lst(383, 384), {"figura": "vineta_seneca"}, {"figura": "capilla"}, T(389),
                   {"titulo": T(390)}, seg(391), T(392), seg(393)]},
    {"id": "prueba-3", "etiqueta": T(396) + " · " + T(397), "contenido": [T(398), lst(399, 402)],
     "interactiva": {"modo": "imagenes", "barajar": True,
                     "elementos": [{"imagen": im, "respuesta": sin_punto(T(k))} for im, k in
                                   [("tristan", 399), ("luxemburg", 400), ("zetkin", 401), ("kollontai", 402)]],
                     "alCompletar": [{"lista": [seg(404), seg(406), seg(409), seg(412)]}]}},
    {"id": "prueba-4", "etiqueta": T(415) + " · " + T(416), "contenido": [T(417), lst(418, 422), T(423)]},
    {"id": "prueba-5", "etiqueta": T(424) + " · " + T(425), "contenido": [T(426), ref_cambrils],
     "interactiva": {"modo": "lista", "barajar": True, "etiquetaElemento": "Posición", "textoElige": "Elige la posición",
                     "opciones": [ordinal(i + 1) for i in range(len(sentencias))],
                     "mensajes": {"correcto": "Posición correcta · {nombre}", "noEs": "No es la posición {nombre} · prueba otra vez",
                                  "solucion": "Posición · {nombre}"},
                     "elementos": [{"texto": s, "respuesta": ordinal(i + 1)} for i, s in enumerate(sentencias)],
                     "alCompletar": [{"cita": [T(427)]}]},
     "despues": [{"cita": [T(428)]}, {"cita": [T(429)]}]},
    {"id": "prueba-final", "etiqueta": T(431), "contenido": [T(432)],
     "interactiva": {"modo": "lista", "barajar": True, "etiquetaElemento": "Posición", "textoElige": "Elige la posición",
                     "opciones": [ordinal(i + 1) for i in range(7)],
                     "mensajes": {"correcto": "Posición correcta · {nombre}", "noEs": "No es la posición {nombre} · prueba otra vez",
                                  "solucion": "Posición · {nombre}"},
                     "elementos": [{"texto": a, "respuesta": ordinal(i + 1)} for i, a in enumerate(anios)],
                     "alCompletar": [T(433), T(434), {"destacado": "[clave]"}]}},
]
if MAPA_OK:
    m5 = [sin_punto(T(k)) for k in range(418, 423)]
    escape[4]["interactiva"] = {"modo": "mapa", "mapa": "mapa", "barajar": False, "etiquetaElemento": "Punto {n}",
                                "textoElige": "Elige una localidad", "notaMapa": NOTA_MAPA,
                                "elementos": [{"punto": punto(n), "respuesta": n} for n in m5]}
else:
    escape[4]["aula"] = True
    escape[4]["estado"] = "Mapa pendiente"

B.append({"tipo": "ampliacion", "id": "ampliacion", "titulo": ["Actividades de", "ampliación"], "items": [
    {"icono": "podcast", "titulo": T(257), "lema": T(258), "contenido": [T(259), lst(260, 264)]},
    {"icono": "comic", "titulo": T(266), "lema": T(267), "contenido": [T(268), T(269), lst(270, 273)]},
    {"icono": "escape", "titulo": T(276), "lema": T(277),
     "contenido": [T(278), lst(279, 284), T(285), {"lista": [seg(k) for k in range(286, 290)], "clase": "ud-lista--sin"}]},
    {"icono": "galeria", "titulo": T(291), "lema": T(292), "contenido": [T(293), lst(294, 301)]}],
    "despues": [{"titulo": T(304), "despues": [
        {"titulo": T(305), "lema": T(306), "actividades": [
            {"etiqueta": T(305), "aula": True, "contenido": [{"titulo": T(307)}, T(308), {"titulo": T(309)}, T(310),
                                                            {"titulo": T(311)}, lst(312, 319), {"titulo": T(321)}, lst(322, 325),
                                                            {"titulo": T(326)}, T(327)]}]},
        {"titulo": T(329), "lema": T(330), "actividades": [
            {"etiqueta": T(329), "aula": True, "contenido": [
                {"titulo": T(331)}, T(332), {"titulo": T(333)}, T(334), {"titulo": T(335)},
                {"plegable": T(336), "items": [T(337), lst(338, 341)]},
                {"plegable": T(342), "items": [T(343), lst(344, 347)]},
                {"plegable": T(348), "items": [T(349), lst(350, 353)]},
                {"titulo": T(354)}, T(355)]}]},
        {"id": "escape-room", "titulo": T(357), "lema": T(358), "actividades": escape}]}]})

# Recursos didácticos
B.append({"tipo": "recursos", "id": "recursos", "titulo": ["Recursos", "didácticos"], "columnas": [
    {"titulo": T(206), "contenido": [lst(207, 212)]},
    {"titulo": T(214), "contenido": [lst(215, 218), {"ancla": "prensa", "texto": "El Socialista en el visor ↓"}]},
    {"titulo": T(220), "contenido": [T(221), {"lista": [seg(k) for k in range(222, 227)]},
                                     {"nota": "El enlace de IES Valle de Henares está incompleto en la unidad: pendiente."}]}],
    "despues": [
        {"contenido": [{"galeria": ["wspu", "stuttgart", "copenhague", "grupos_femeninos", "casa_pueblo", "gonzalez_polo", "acuna"]}]},
        {"id": "prensa", "titulo": ["Prensa", "histórica"], "visor": {
            "etiqueta": "Visor de prensa", "etiquetaNumeros": "Número del periódico", "etiquetaPaginas": "Páginas",
            "nota": "Escaneados de la carpeta de la unidad.",
            "publicaciones": [
                {"titulo": "El Socialista", "corto": "16-3-1900", "datos": "Núm. 732 · Madrid, 16 de marzo de 1900",
                 "paginas": [{"src": f"../docs/ud1/el-socialista-1900-03-16-p{i}.jpg", "mini": f"../docs/ud1/el-socialista-1900-03-16-p{i}-mini.jpg"} for i in range(1, 5)]},
                {"titulo": "El Socialista", "corto": "11-10-1913", "datos": "Núm. 1601 · Madrid, 11 de octubre de 1913",
                 "paginas": [{"src": f"../docs/ud1/el-socialista-1913-10-11-p{i}.jpg", "mini": f"../docs/ud1/el-socialista-1913-10-11-p{i}-mini.jpg"} for i in range(1, 5)]}]}},
        {"titulo": ["Material", "complementario"], "contenido": [
            {"figura": "operarias"},
            {"nota": "Pendiente de confirmar si es la misma fábrica que «Trabajadoras textiles de Gijón» (S5)."},
            {"galeria": ["cubierta_cambrils", "cubierta_pablo_iglesias"]},
            T(429)[T(429).rindex("(María Cambrils"):].strip()]}]})

# Fuentes y créditos
B.append({"tipo": "creditos", "id": "creditos", "titulo": ["Fuentes y", "créditos"], "nota": [T(489), seg(490)],
          "tablaTitulo": "Créditos de las imágenes",
          "columnas": {"etiqueta": "Créditos de las imágenes", "cabeceras": ["Imagen", "Autor · fecha", "Licencia", "Fuente", "Dónde aparece", "Estado"]},
          "despues": [{"nota": "Tipografía Lato (SIL Open Font License) · Ilustración de la rosa: Alfonso Zapico."},
                      {"nota": "Prensa: El Socialista, núm. 732 (16-3-1900) y núm. 1601 (11-10-1913), escaneados de la carpeta de la unidad."}]})

from PIL import Image as _I
import os as _os
_R = _os.path.dirname(_os.path.dirname(_os.path.abspath(SALIDA_JS)))
for _d in IM.values():
    if _d.get("src"):
        _f = _os.path.join(_R, _d["src"].replace("../", ""))
        _d["w"], _d["h"] = _I.open(_f).size
for _b in B:
    for _x in _b.get("despues", []):
        if "visor" in _x:
            for _pub in _x["visor"]["publicaciones"]:
                for _pg in _pub["paginas"]:
                    _pg["w"], _pg["h"] = _I.open(_os.path.join(_R, _pg["src"].replace("../", ""))).size
DATOS = {"unidad": {"numero": 1, "tituloPagina": "Unidad 1 · " + T(0)}, "interfaz": INTERFAZ, "imagenes": IM, "bloques": B}

cab = ("/*\n * Datos de la Unidad 1. Es el ÚNICO archivo que cambia de una unidad a otra.\n"
       " * Generado a partir de «Unidad didáctica cap. 1.docx» (versión del 28/09/2026):\n"
       " * los textos de la unidad se copian literalmente del documento.\n */\n")
open(SALIDA_JS, "w", encoding="utf8").write(cab + "window.UD_DATOS = " + json.dumps(DATOS, ensure_ascii=False, indent=1) + ";\n")

cred = []
for k, d in IM.items():
    cred.append({"id": k, "archivo": d.get("src", "").replace("../img/ud1/", "") or None, "titulo": d.get("titulo"),
                 "autor": d.get("autor"), "fecha": d.get("fecha"), "fuente": d.get("fuente") or d.get("procedencia"),
                 "licencia": d.get("licencia"), "sesion": d.get("sesion"), "estado": d.get("estado"),
                 **({"motivo": d["motivo"]} if "motivo" in d else {})})
json.dump(cred, open(SALIDA_CRED, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("bloques", len(B), "imagenes", len(IM), "mapa", MAPA_OK)
print("Cambrils:", len(sentencias), "frases")
