/* ============================================================
   EscandApp - Lógica de la app
   Índice:
     1. Datos de ejemplo (ficticios)
     2. Guardar y cargar (localStorage)
     3. Utilidades (euros, números, plurales)
     4. Unidades y formato de compra (conversiones)
     5. Cálculo de escandallos (neto, bruto y merma)
     6. Cambiar de vista (menú)
     7. Pintar: Inicio
     8. Pintar: Escandallos
     9. Formulario de plato (crear y editar)
    10. Pintar: Stock
    11. Formulario de ingrediente (crear y editar)
    12. Pintar: Consumo y Ajustes
    13. Acciones: entrada, recuento y consumos
    14. Acciones: ajustes
    15. Arranque
   ============================================================ */

/* ---------- 1. Datos de ejemplo (ficticios) ----------
   Productos y precios inventados solo para probar la app.
   - unidad: en qué se mide en las recetas y en el stock (kg, L o unidad).
   - merma: % que se pierde al limpiar/preparar (0 = no se pierde nada).
   - minimo: por debajo de esta cantidad salta la alerta de stock.
   - formato: cómo se compra. Ej.: vino en botella de 0,75 L a 3,50 €.
     El precio por unidad se calcula: precio del formato / cantidad del formato. */
const DATOS_EJEMPLO = {
  ajustes: { umbralFoodCost: 35 }, // referencia de demostración, configurable en Ajustes
  ingredientes: [
    { id: "pollo", ejemplo: true,   nombre: "Pechuga de pollo", unidad: "kg", merma: 10, stock: 4.2,  minimo: 2,
      formato: { nombre: "kg", cantidad: 1, precio: 6.50 } },
    { id: "patatas", ejemplo: true, nombre: "Patatas", unidad: "kg", merma: 15, stock: 12, minimo: 5,
      formato: { nombre: "kg", cantidad: 1, precio: 1.20 } },
    { id: "aceite", ejemplo: true,  nombre: "Aceite de oliva", unidad: "L", merma: 0, stock: 3.5, minimo: 2,
      formato: { nombre: "botella de 1 L", cantidad: 1, precio: 7.80 } },
    { id: "huevos", ejemplo: true,  nombre: "Huevos", unidad: "unidad", merma: 0, stock: 30, minimo: 12,
      formato: { nombre: "docena", cantidad: 12, precio: 2.64 } },
    { id: "pan", ejemplo: true,     nombre: "Pan de barra", unidad: "unidad", merma: 5, stock: 6, minimo: 8,
      formato: { nombre: "barra", cantidad: 1, precio: 0.60 } },
    { id: "vino", ejemplo: true,    nombre: "Vino tinto", unidad: "L", merma: 0, stock: 6.75, minimo: 4.5,
      formato: { nombre: "botella de 75 cl", cantidad: 0.75, precio: 3.50 } },
    { id: "ternera", ejemplo: true, nombre: "Ternera (carrilleras)", unidad: "kg", merma: 8, stock: 1.5, minimo: 2,
      formato: { nombre: "kg", cantidad: 1, precio: 11.90 } },
    { id: "nata", ejemplo: true,    nombre: "Nata para cocinar", unidad: "L", merma: 0, stock: 2, minimo: 1,
      formato: { nombre: "brik de 1 L", cantidad: 1, precio: 3.10 } }
  ],
  platos: [
    {
      id: "carrilleras", ejemplo: true, nombre: "Carrilleras al vino tinto", tipo: "Plato",
      precioVenta: 14.50,
      ingredientes: [
        { ingredienteId: "ternera", cantidad: 0.35 },
        { ingredienteId: "vino",    cantidad: 0.075 },
        { ingredienteId: "patatas", cantidad: 0.20 },
        { ingredienteId: "aceite",  cantidad: 0.02 }
      ]
    },
    {
      id: "pollo-asado", ejemplo: true, nombre: "Pollo asado con patatas", tipo: "Plato",
      precioVenta: 11.00,
      ingredientes: [
        { ingredienteId: "pollo",   cantidad: 0.30 },
        { ingredienteId: "patatas", cantidad: 0.25 },
        { ingredienteId: "aceite",  cantidad: 0.03 }
      ]
    },
    {
      id: "tortilla", ejemplo: true, nombre: "Pincho de tortilla", tipo: "Pincho",
      precioVenta: 2.20,
      ingredientes: [
        { ingredienteId: "huevos",  cantidad: 1.5 },
        { ingredienteId: "patatas", cantidad: 0.08 },
        { ingredienteId: "aceite",  cantidad: 0.01 },
        { ingredienteId: "pan",     cantidad: 0.25 }
      ]
    },
    {
      id: "flan", ejemplo: true, nombre: "Flan casero", tipo: "Postre",
      precioVenta: 3.50,
      ingredientes: [
        { ingredienteId: "huevos", cantidad: 1 },
        { ingredienteId: "nata",   cantidad: 0.10 }
      ]
    },
    {
      id: "copa-vino", ejemplo: true, nombre: "Copa de vino tinto", tipo: "Bebida",
      precioVenta: 2.80,
      ingredientes: [
        { ingredienteId: "vino", cantidad: 0.15 }
      ]
    }
  ],
  movimientos: [] // aquí se guardan las entradas, recuentos y consumos que registres
};

/* ---------- 2. Guardar y cargar (localStorage) ----------
   Los datos viven en el navegador, igual que en PresuApp. */
const CLAVE_DATOS = "escandapp-datos-v2";

function cargarDatos() {
  const guardado = localStorage.getItem(CLAVE_DATOS);
  if (guardado) {
    try { return JSON.parse(guardado); } catch (e) { /* si está corrupto, vuelve al ejemplo */ }
  }
  // Primera vez: copia de los datos de ejemplo
  return JSON.parse(JSON.stringify(DATOS_EJEMPLO));
}

function guardarDatos() {
  localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
}

/* ---------- 3. Utilidades (euros, números, plurales) ---------- */
function euros(n) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function numero(n) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}
// "1 unidad" pero "6 unidades"; kg y L no cambian
function conUnidad(n, unidad) {
  if (unidad === "unidad") return numero(n) + (n === 1 ? " unidad" : " unidades");
  return numero(n) + " " + unidad;
}
// Escapa texto antes de meterlo en innerHTML: los nombres pueden venir del usuario o de una copia importada
function esc(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buscarIngrediente(id) {
  return datos.ingredientes.find(function (ing) { return ing.id === id; });
}
function ahoraTexto() {
  return new Date().toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
// Lee un número de un campo; devuelve null si está vacío o no vale
function leerNumero(idCampo) {
  const valor = parseFloat(document.getElementById(idCampo).value);
  return isNaN(valor) ? null : valor;
}
function mostrarMensaje(idCaja, texto, esError) {
  const caja = document.getElementById(idCaja);
  caja.textContent = texto;
  caja.classList.toggle("mensaje--error", !!esError);
  caja.hidden = false;
}

/* ---------- 4. Unidades y formato de compra (conversiones) ---------- */
// Precio por unidad base (kg, L o unidad), calculado desde el formato de compra
function precioPorUnidad(ing) {
  return ing.formato.precio / ing.formato.cantidad;
}
// Stock expresado también en formatos de compra cuando no coinciden (ej.: 6,75 L = 9 botellas)
function stockConFormato(ing) {
  let texto = conUnidad(ing.stock, ing.unidad);
  if (ing.formato.cantidad !== 1) {
    texto += " (" + numero(ing.stock / ing.formato.cantidad) + " × " + ing.formato.nombre + ")";
  }
  return texto;
}

/* ---------- 5. Cálculo de escandallos (neto, bruto y merma) ----------
   - Cantidad NETA: lo que llega al plato (lo que pone la receta).
   - Cantidad BRUTA: lo que sale del almacén. La merma es el % que se
     pierde DEL PESO BRUTO (al limpiar, pelar, deshuesar...), así que:
     bruta = neta / (1 - merma/100). No se multiplica por 1 + merma:
     con 0,92 kg netos y 8 % de merma salen 1,00 kg brutos
     (1,00 - 8 % de 1,00 = 0,92), no 0,9936.
   El coste se calcula siempre con la cantidad BRUTA, y el consumo
   de stock descuenta también la BRUTA: las dos cuentas cuadran. */
function cantidadBruta(cantidadNeta, ing) {
  return cantidadNeta / (1 - ing.merma / 100);
}

function calcularEscandallo(plato) {
  const desglose = plato.ingredientes.map(function (linea) {
    const ing = buscarIngrediente(linea.ingredienteId);
    if (!ing) { // no debería pasar (las copias se validan), pero que no rompa la app
      return { nombre: "(ingrediente no encontrado)", cantidadNeta: linea.cantidad, cantidadBruta: linea.cantidad, merma: 0, unidad: "", coste: 0 };
    }
    const bruta = cantidadBruta(linea.cantidad, ing);
    return {
      nombre: ing.nombre,
      cantidadNeta: linea.cantidad,
      cantidadBruta: bruta,
      merma: ing.merma,
      unidad: ing.unidad,
      coste: bruta * precioPorUnidad(ing)
    };
  });
  const costeTotal = desglose.reduce(function (suma, l) { return suma + l.coste; }, 0);
  // Margen BRUTO: precio de venta menos coste de ingredientes.
  // No es el beneficio: no cuenta IVA, personal, luz, alquiler...
  const margenBruto = plato.precioVenta - costeTotal;
  const foodCost = plato.precioVenta > 0 ? (costeTotal / plato.precioVenta) * 100 : 0;
  return { desglose: desglose, costeTotal: costeTotal, margenBruto: margenBruto, foodCost: foodCost };
}

/* ---------- 6. Cambiar de vista (menú) ---------- */
function cambiarVista(vista) {
  document.querySelectorAll(".vista").forEach(function (s) {
    s.classList.toggle("vista--activa", s.id === "vista-" + vista);
  });
  document.querySelectorAll(".menu__boton").forEach(function (b) {
    b.classList.toggle("menu__boton--activo", b.dataset.vista === vista);
  });
}

document.querySelectorAll(".menu__boton").forEach(function (boton) {
  boton.addEventListener("click", function () { cambiarVista(boton.dataset.vista); });
});

/* ---------- 7. Pintar: Inicio ---------- */
function pintarInicio() {
  const bajos = datos.ingredientes.filter(function (ing) { return ing.stock < ing.minimo; });
  const valorStock = datos.ingredientes.reduce(function (suma, ing) {
    return suma + ing.stock * precioPorUnidad(ing);
  }, 0);
  const costeMedio = datos.platos.length
    ? datos.platos.reduce(function (s, p) { return s + calcularEscandallo(p).costeTotal; }, 0) / datos.platos.length
    : 0;

  document.getElementById("tarjetas-resumen").innerHTML =
    tarjeta(datos.platos.length, "escandallos creados", "") +
    tarjeta(euros(costeMedio), "coste medio por ración", "") +
    tarjeta(euros(valorStock), "valor del stock", "tarjeta__numero--verde") +
    tarjeta(bajos.length, "alertas de stock bajo", bajos.length ? "tarjeta__numero--rojo" : "tarjeta__numero--verde");

  document.getElementById("lista-alertas").innerHTML = bajos.length
    ? bajos.map(function (ing) {
        return '<div class="alerta"><span>' + esc(ing.nombre) + '</span>' +
               '<span class="alerta__cantidad">quedan ' + conUnidad(ing.stock, ing.unidad) +
               " (mínimo " + numero(ing.minimo) + ")</span></div>";
      }).join("")
    : '<p class="sin-alertas">Todo el stock está por encima del mínimo.</p>';

  const ultimos = datos.movimientos.slice(-5).reverse();
  document.getElementById("lista-movimientos").innerHTML = ultimos.length
    ? ultimos.map(function (m) {
        return '<div class="movimiento">' + esc(m.texto) +
               ' <span class="movimiento__fecha">(' + m.fecha + ")</span></div>";
      }).join("")
    : '<p class="sin-alertas">Aún no hay movimientos registrados.</p>';
}

function tarjeta(num, texto, claseExtra) {
  return '<div class="tarjeta"><div class="tarjeta__numero ' + claseExtra + '">' + num +
         '</div><div class="tarjeta__texto">' + texto + "</div></div>";
}

/* ---------- 8. Pintar: Escandallos ---------- */
function pintarEscandallos(idAbierto) {
  const umbral = datos.ajustes.umbralFoodCost;
  if (!datos.platos.length) {
    document.getElementById("lista-escandallos").innerHTML =
      '<p class="vista__ayuda">Aún no hay escandallos. Crea el primero con «+ Nuevo plato o bebida».</p>';
    return;
  }
  document.getElementById("lista-escandallos").innerHTML = datos.platos.map(function (plato) {
    const cal = calcularEscandallo(plato);
    const abierto = plato.id === idAbierto;
    const claseFoodCost = cal.foodCost > umbral ? "plato__foodcost--alto" : "";
    const hayMerma = cal.desglose.some(function (l) { return l.merma > 0; });
    const filas = cal.desglose.map(function (l) {
      const notaMerma = l.merma > 0
        ? ' <span class="desglose__merma">(+' + numero(l.merma) + " % merma: salen " + conUnidad(l.cantidadBruta, l.unidad) + ")</span>"
        : "";
      return "<tr><td>" + esc(l.nombre) + "</td><td>" + conUnidad(l.cantidadNeta, l.unidad) + notaMerma +
             "</td><td>" + euros(l.coste) + "</td></tr>";
    }).join("");
    return (
      '<article class="plato' + (abierto ? " plato--abierto" : "") + '" data-plato="' + esc(plato.id) + '">' +
        '<button class="plato__cabecera" type="button">' +
          '<span><span class="plato__nombre">' + esc(plato.nombre) + '</span>' +
          '<span class="plato__tipo">' + esc(plato.tipo) + "</span></span>" +
          '<span class="plato__cifras"><span class="plato__pvp">' + euros(plato.precioVenta) + "</span><br>" +
          '<span class="plato__margen">margen bruto ' + euros(cal.margenBruto) + "</span></span>" +
        "</button>" +
        '<div class="plato__detalle">' +
          '<table class="desglose"><tr><th>Ingrediente</th><th>Por ración</th><th>Coste</th></tr>' +
          filas + "</table>" +
          (hayMerma ? '<p class="plato__nota-merma">Los costes ya incluyen la merma.</p>' : "") +
          '<div class="plato__resumen-linea"><span>Coste por ración</span><strong>' + euros(cal.costeTotal) + "</strong></div>" +
          '<div class="plato__resumen-linea"><span>Precio de venta (sin IVA)</span><strong>' + euros(plato.precioVenta) + "</strong></div>" +
          '<div class="plato__resumen-linea"><span>Food cost</span><strong class="' + claseFoodCost + '">' +
            numero(cal.foodCost) + " %</strong></div>" +
          '<div class="plato__resumen-linea"><span>Margen bruto por ración</span><strong>' + euros(cal.margenBruto) + "</strong></div>" +
          '<p class="plato__nota-margen">Margen bruto = precio menos ingredientes, todo sin IVA. No es el beneficio: no cuenta personal, luz, alquiler ni otros costes.</p>' +
          '<div class="plato__acciones"><button class="boton-editar" data-editar-plato="' + esc(plato.id) + '" type="button">Editar</button></div>' +
        "</div>" +
      "</article>"
    );
  }).join("");

  // Abrir/cerrar el detalle al pulsar un plato
  document.querySelectorAll(".plato__cabecera").forEach(function (boton) {
    boton.addEventListener("click", function () {
      boton.closest(".plato").classList.toggle("plato--abierto");
    });
  });
  // Botones de editar plato
  document.querySelectorAll("[data-editar-plato]").forEach(function (boton) {
    boton.addEventListener("click", function () { abrirFormularioPlato(boton.dataset.editarPlato); });
  });
}

/* ---------- 9. Formulario de plato (crear y editar) ---------- */
let platoEditando = null; // id del plato que se edita, o null si es nuevo

function opcionesIngredientes(valorSeleccionado) {
  return datos.ingredientes.map(function (ing) {
    const sel = ing.id === valorSeleccionado ? " selected" : "";
    return '<option value="' + esc(ing.id) + '"' + sel + ">" + esc(ing.nombre) + " (" + esc(ing.unidad) + ")</option>";
  }).join("");
}

function anadirLineaReceta(linea) {
  const div = document.createElement("div");
  div.className = "linea-receta";
  div.innerHTML =
    '<select class="formulario__campo linea-ingrediente">' + opcionesIngredientes(linea && linea.ingredienteId) + "</select>" +
    '<input class="formulario__campo linea-cantidad" type="number" min="0" step="0.001" placeholder="Cantidad"' +
    (linea ? ' value="' + linea.cantidad + '"' : "") + ">" +
    '<button class="linea-receta__quitar" type="button" title="Quitar">✕</button>';
  div.querySelector(".linea-receta__quitar").addEventListener("click", function () { div.remove(); actualizarVistaPreviaPlato(); });
  div.querySelector("select").addEventListener("change", actualizarVistaPreviaPlato);
  div.querySelector("input").addEventListener("input", actualizarVistaPreviaPlato);
  document.getElementById("plato-lineas").appendChild(div);
}

// Vista previa del coste mientras se rellena el formulario
function actualizarVistaPreviaPlato() {
  const precio = leerNumero("plato-precio");
  const lineas = leerLineasReceta();
  const caja = document.getElementById("plato-vista-previa");
  if (!lineas.length || !precio) { caja.textContent = ""; return; }
  const platoProvisional = { precioVenta: precio, ingredientes: lineas };
  const cal = calcularEscandallo(platoProvisional);
  caja.textContent = "Coste por ración: " + euros(cal.costeTotal) +
    " · Food cost: " + numero(cal.foodCost) + " % · Margen bruto: " + euros(cal.margenBruto);
}

function leerLineasReceta() {
  const lineas = [];
  document.querySelectorAll("#plato-lineas .linea-receta").forEach(function (div) {
    const id = div.querySelector(".linea-ingrediente").value;
    const cantidad = parseFloat(div.querySelector(".linea-cantidad").value);
    if (id && !isNaN(cantidad) && cantidad > 0) {
      lineas.push({ ingredienteId: id, cantidad: cantidad });
    }
  });
  return lineas;
}

function abrirFormularioPlato(idPlato) {
  platoEditando = idPlato || null;
  const plato = platoEditando ? datos.platos.find(function (p) { return p.id === platoEditando; }) : null;
  document.getElementById("panel-plato-titulo").textContent = plato ? "Editar: " + plato.nombre : "Nuevo plato o bebida";
  document.getElementById("plato-nombre").value = plato ? plato.nombre : "";
  document.getElementById("plato-tipo").value = plato ? plato.tipo : "Plato";
  document.getElementById("plato-precio").value = plato ? plato.precioVenta : "";
  document.getElementById("plato-lineas").innerHTML = "";
  document.getElementById("plato-mensaje").hidden = true;
  (plato ? plato.ingredientes : [null]).forEach(anadirLineaReceta);
  actualizarVistaPreviaPlato();
  document.getElementById("panel-plato").hidden = false;
  document.getElementById("panel-plato").scrollIntoView({ behavior: "smooth" });
}

function cerrarFormularioPlato() {
  document.getElementById("panel-plato").hidden = true;
  platoEditando = null;
}

function guardarPlato() {
  const nombre = document.getElementById("plato-nombre").value.trim();
  const tipo = document.getElementById("plato-tipo").value;
  const precio = leerNumero("plato-precio");
  const lineas = leerLineasReceta();
  if (!nombre) return mostrarMensaje("plato-mensaje", "Ponle un nombre al plato.", true);
  if (!precio || precio <= 0) return mostrarMensaje("plato-mensaje", "El precio de venta tiene que ser mayor que 0.", true);
  if (!lineas.length) return mostrarMensaje("plato-mensaje", "Añade al menos un ingrediente con cantidad mayor que 0.", true);

  if (platoEditando) {
    const plato = datos.platos.find(function (p) { return p.id === platoEditando; });
    plato.nombre = nombre; plato.tipo = tipo; plato.precioVenta = precio; plato.ingredientes = lineas;
    apuntarMovimiento("Editado el escandallo de " + nombre);
  } else {
    const id = "plato-" + Date.now();
    datos.platos.push({ id: id, ejemplo: false, nombre: nombre, tipo: tipo, precioVenta: precio, ingredientes: lineas });
    apuntarMovimiento("Nuevo escandallo: " + nombre);
  }
  guardarDatos();
  cerrarFormularioPlato();
  pintarTodo();
}

/* ---------- 10. Pintar: Stock ---------- */
function pintarStock() {
  if (!datos.ingredientes.length) {
    document.getElementById("tabla-stock").innerHTML =
      '<p class="vista__ayuda">No hay ingredientes. Añade el primero con «+ Nuevo ingrediente».</p>';
    ["entrada-ingrediente", "recuento-ingrediente", "consumo-ingrediente"].forEach(function (id) {
      document.getElementById(id).innerHTML = "";
    });
    return;
  }
  const filas = datos.ingredientes.map(function (ing) {
    const bajo = ing.stock < ing.minimo;
    return "<tr><td>" + esc(ing.nombre) + '<br><span class="tabla-stock__formato">' +
           esc(ing.formato.nombre) + " a " + euros(ing.formato.precio) + "</span></td>" +
           "<td>" + stockConFormato(ing) + "</td>" +
           "<td>" + numero(ing.minimo) + "</td>" +
           '<td><span class="estado ' + (bajo ? "estado--bajo" : "estado--ok") + '">' +
           (bajo ? "BAJO" : "OK") + '</span><br>' +
           '<button class="boton-editar" data-editar-ing="' + esc(ing.id) + '" type="button">Editar</button> ' +
           '<button class="boton-editar" data-quitar-ing="' + esc(ing.id) + '" type="button">Quitar</button></td></tr>';
  }).join("");

  document.getElementById("tabla-stock").innerHTML =
    '<table class="tabla-stock"><tr><th>Ingrediente</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>' +
    filas + "</table>";

  document.querySelectorAll("[data-editar-ing]").forEach(function (boton) {
    boton.addEventListener("click", function () { abrirFormularioIngrediente(boton.dataset.editarIng); });
  });
  document.querySelectorAll("[data-quitar-ing]").forEach(function (boton) {
    boton.addEventListener("click", function () { quitarIngrediente(boton.dataset.quitarIng); });
  });

  // Rellenar los desplegables de ingredientes (entrada, recuento y consumo directo)
  const opciones = datos.ingredientes.map(function (ing) {
    return '<option value="' + esc(ing.id) + '">' + esc(ing.nombre) + " (" + esc(ing.unidad) + ")</option>";
  }).join("");
  ["entrada-ingrediente", "recuento-ingrediente", "consumo-ingrediente"].forEach(function (id) {
    const desplegable = document.getElementById(id);
    const valorPrevio = desplegable.value;
    desplegable.innerHTML = opciones;
    if (valorPrevio && buscarIngrediente(valorPrevio)) desplegable.value = valorPrevio;
  });
  actualizarAyudasCampos();
}

// Pone la unidad/formato correcto en cada campo de cantidad
function actualizarAyudasCampos() {
  const ingEntrada = buscarIngrediente(document.getElementById("entrada-ingrediente").value);
  const ingRecuento = buscarIngrediente(document.getElementById("recuento-ingrediente").value);
  const ingConsumo = buscarIngrediente(document.getElementById("consumo-ingrediente").value);
  if (ingEntrada) {
    // Si el formato es la propia unidad (kg, L...), el campo pide cantidad; si no, número de formatos
    const esUnidad = ingEntrada.formato.cantidad === 1 && ingEntrada.formato.nombre === ingEntrada.unidad;
    document.getElementById("entrada-cantidad").placeholder = esUnidad
      ? "Cantidad (" + ingEntrada.unidad + ")"
      : "Nº de " + ingEntrada.formato.nombre + " (" + numero(ingEntrada.formato.cantidad) + " " + ingEntrada.unidad + " c/u)";
  }
  if (ingRecuento) document.getElementById("recuento-cantidad").placeholder = "Cantidad real (" + ingRecuento.unidad + ")";
  if (ingConsumo) document.getElementById("consumo-cantidad").placeholder = "Cantidad (" + ingConsumo.unidad + ")";
}

/* ---------- 10b. Quitar un ingrediente ----------
   No se puede quitar si algún plato lo usa: se dice cuáles y no se toca nada.
   Si no lo usa nadie, se pide confirmación y se borra solo el ingrediente;
   el historial de movimientos se conserva. */
function platosQueUsan(idIngrediente) {
  return datos.platos.filter(function (plato) {
    return plato.ingredientes.some(function (linea) { return linea.ingredienteId === idIngrediente; });
  });
}

function quitarIngrediente(id) {
  const ing = buscarIngrediente(id);
  if (!ing) return;
  const usadoEn = platosQueUsan(id);
  if (usadoEn.length) {
    return mostrarMensaje("stock-mensaje", "No se puede quitar " + ing.nombre + ": lo usan " +
      usadoEn.map(function (p) { return p.nombre; }).join(", ") +
      ". Quítalo primero de esos platos (Editar en Escandallos).", true);
  }
  if (!confirm("¿Quitar " + ing.nombre + "? Se borrará el ingrediente y su stock. El historial de movimientos se conserva.")) return;
  datos.ingredientes = datos.ingredientes.filter(function (i) { return i.id !== id; });
  apuntarMovimiento("Quitado el ingrediente " + ing.nombre);
  guardarDatos();
  cerrarFormularioIngrediente();
  pintarTodo();
  mostrarMensaje("stock-mensaje", ing.nombre + " quitado de la lista.");
}

/* ---------- 11. Formulario de ingrediente (crear y editar) ---------- */
let ingredienteEditando = null;

function abrirFormularioIngrediente(idIng) {
  ingredienteEditando = idIng || null;
  const ing = ingredienteEditando ? buscarIngrediente(ingredienteEditando) : null;
  document.getElementById("panel-ingrediente-titulo").textContent = ing ? "Editar: " + ing.nombre : "Nuevo ingrediente";
  document.getElementById("ing-nombre").value = ing ? ing.nombre : "";
  document.getElementById("ing-unidad").value = ing ? ing.unidad : "kg";
  document.getElementById("ing-merma").value = ing ? ing.merma : 0;
  document.getElementById("ing-formato-nombre").value = ing ? ing.formato.nombre : "";
  document.getElementById("ing-formato-cantidad").value = ing ? ing.formato.cantidad : "";
  document.getElementById("ing-formato-precio").value = ing ? ing.formato.precio : "";
  document.getElementById("ing-minimo").value = ing ? ing.minimo : 0;
  // El stock solo se pide al crear; luego se ajusta con entradas y recuentos
  document.getElementById("ing-stock-inicial-campo").style.display = ing ? "none" : "";
  document.getElementById("ing-stock-inicial").value = 0;
  document.getElementById("ing-mensaje").hidden = true;
  document.getElementById("panel-ingrediente").hidden = false;
  document.getElementById("panel-ingrediente").scrollIntoView({ behavior: "smooth" });
}

function cerrarFormularioIngrediente() {
  document.getElementById("panel-ingrediente").hidden = true;
  ingredienteEditando = null;
}

function guardarIngrediente() {
  const nombre = document.getElementById("ing-nombre").value.trim();
  const unidad = document.getElementById("ing-unidad").value;
  const merma = leerNumero("ing-merma");
  const formatoNombre = document.getElementById("ing-formato-nombre").value.trim();
  const formatoCantidad = leerNumero("ing-formato-cantidad");
  const formatoPrecio = leerNumero("ing-formato-precio");
  const minimo = leerNumero("ing-minimo");
  if (!nombre) return mostrarMensaje("ing-mensaje", "Ponle un nombre al ingrediente.", true);
  if (merma === null || merma < 0 || merma >= 100) return mostrarMensaje("ing-mensaje", "La merma tiene que ser un % entre 0 y 99.", true);
  if (!formatoNombre) return mostrarMensaje("ing-mensaje", "Indica cómo se compra (ej.: botella de 75 cl, kg, docena).", true);
  if (!formatoCantidad || formatoCantidad <= 0) return mostrarMensaje("ing-mensaje", "La cantidad por formato tiene que ser mayor que 0 (en " + unidad + ").", true);
  if (formatoPrecio === null || formatoPrecio < 0) return mostrarMensaje("ing-mensaje", "El precio del formato no puede ser negativo.", true);
  if (minimo === null || minimo < 0) return mostrarMensaje("ing-mensaje", "El stock mínimo no puede ser negativo.", true);

  if (ingredienteEditando) {
    const ing = buscarIngrediente(ingredienteEditando);
    ing.nombre = nombre; ing.unidad = unidad; ing.merma = merma; ing.minimo = minimo;
    ing.formato = { nombre: formatoNombre, cantidad: formatoCantidad, precio: formatoPrecio };
    apuntarMovimiento("Editado el ingrediente " + nombre);
  } else {
    const stockInicial = leerNumero("ing-stock-inicial") || 0;
    if (stockInicial < 0) return mostrarMensaje("ing-mensaje", "El stock inicial no puede ser negativo.", true);
    datos.ingredientes.push({
      id: "ing-" + Date.now(), ejemplo: false, nombre: nombre, unidad: unidad, merma: merma,
      stock: stockInicial, minimo: minimo,
      formato: { nombre: formatoNombre, cantidad: formatoCantidad, precio: formatoPrecio }
    });
    apuntarMovimiento("Nuevo ingrediente: " + nombre);
  }
  guardarDatos();
  cerrarFormularioIngrediente();
  pintarTodo();
}

/* ---------- 12. Pintar: Consumo y Ajustes ---------- */
function pintarConsumo() {
  const desplegable = document.getElementById("consumo-plato");
  const valorPrevio = desplegable.value;
  desplegable.innerHTML = datos.platos.map(function (plato) {
    return '<option value="' + esc(plato.id) + '">' + esc(plato.nombre) + "</option>";
  }).join("");
  if (valorPrevio && datos.platos.some(function (p) { return p.id === valorPrevio; })) desplegable.value = valorPrevio;
}

function pintarAjustes() {
  document.getElementById("ajuste-umbral").value = datos.ajustes.umbralFoodCost;
}

function pintarAvisoEjemplo() {
  /* Tres estados según la marca "ejemplo" de cada elemento:
     - true:  es un dato de ejemplo de fábrica.
     - false: lo creó el usuario en la app.
     - sin marca: procedencia desconocida (copia de seguridad antigua);
       no se declara ni de ejemplo ni propio: se avisa con cautela. */
  const aviso = document.querySelector(".aviso-ejemplo");
  const elementos = datos.ingredientes.concat(datos.platos);
  const ejemplos = elementos.filter(function (x) { return x.ejemplo === true; }).length;
  const desconocidos = elementos.filter(function (x) { return x.ejemplo !== true && x.ejemplo !== false; }).length;
  const propios = elementos.length - ejemplos - desconocidos;
  if (ejemplos > 0) {
    aviso.style.display = "";
    aviso.textContent = (propios + desconocidos > 0 || datos.movimientos.length > 0)
      ? "Puede seguir habiendo datos de ejemplo (ficticios) mezclados con los tuyos: revísalos en Stock y Escandallos."
      : "Datos de ejemplo (ficticios): productos y precios inventados para probar la app.";
  } else if (desconocidos > 0) {
    aviso.style.display = "";
    aviso.textContent = "Hay datos de procedencia desconocida (vienen de una copia de seguridad antigua): pueden ser de ejemplo. Revísalos en Stock y Escandallos.";
  } else {
    aviso.style.display = "none";
  }
}

function pintarTodo(idAbierto) {
  pintarAvisoEjemplo();
  pintarInicio();
  pintarEscandallos(idAbierto || null);
  pintarStock();
  pintarConsumo();
  pintarAjustes();
}

/* ---------- 13. Acciones: entrada, recuento y consumos ---------- */
function apuntarMovimiento(texto) {
  datos.movimientos.push({ fecha: ahoraTexto(), texto: texto });
}

// Entrada de compra: se apunta en formatos (botellas, docenas, kg...)
// y se suma al stock ya convertido a la unidad base.
function registrarEntrada() {
  const ing = buscarIngrediente(document.getElementById("entrada-ingrediente").value);
  if (!ing) return mostrarMensaje("stock-mensaje", "Primero añade un ingrediente con «+ Nuevo ingrediente».", true);
  const formatos = leerNumero("entrada-cantidad");
  if (!formatos || formatos <= 0) {
    return mostrarMensaje("stock-mensaje", "La entrada tiene que ser un número mayor que 0.", true);
  }
  const suma = formatos * ing.formato.cantidad;
  ing.stock += suma;
  apuntarMovimiento("Entrada: " + numero(formatos) + " × " + ing.formato.nombre + " de " + ing.nombre +
    " (+" + conUnidad(suma, ing.unidad) + ")");
  document.getElementById("entrada-cantidad").value = "";
  guardarDatos();
  pintarTodo();
  mostrarMensaje("stock-mensaje", "Sumadas " + conUnidad(suma, ing.unidad) + " a " + ing.nombre + ".");
}

function registrarRecuento() {
  const ing = buscarIngrediente(document.getElementById("recuento-ingrediente").value);
  if (!ing) return mostrarMensaje("stock-mensaje", "Primero añade un ingrediente con «+ Nuevo ingrediente».", true);
  const real = leerNumero("recuento-cantidad");
  if (real === null || real < 0) {
    return mostrarMensaje("stock-mensaje", "El recuento tiene que ser un número igual o mayor que 0.", true);
  }
  apuntarMovimiento("Recuento: " + ing.nombre + " pasa de " + conUnidad(ing.stock, ing.unidad) +
    " a " + conUnidad(real, ing.unidad));
  ing.stock = real;
  document.getElementById("recuento-cantidad").value = "";
  guardarDatos();
  pintarTodo();
  mostrarMensaje("stock-mensaje", ing.nombre + " ajustado a " + conUnidad(real, ing.unidad) + ".");
}

function registrarConsumoPlato() {
  const plato = datos.platos.find(function (p) { return p.id === document.getElementById("consumo-plato").value; });
  if (!plato) return mostrarMensaje("consumo-mensaje", "No hay platos creados todavía.", true);
  const raciones = parseInt(document.getElementById("consumo-raciones").value, 10);
  if (!raciones || raciones <= 0) {
    return mostrarMensaje("consumo-mensaje", "Las raciones tienen que ser un número entero mayor que 0.", true);
  }
  // Comprobar que hay stock suficiente de todo ANTES de descontar (cantidad bruta, merma incluida)
  const faltantes = [];
  plato.ingredientes.forEach(function (linea) {
    const ing = buscarIngrediente(linea.ingredienteId);
    const necesario = cantidadBruta(linea.cantidad, ing) * raciones;
    if (ing.stock < necesario - 0.0001) {
      faltantes.push(ing.nombre + ": faltan " + conUnidad(necesario - ing.stock, ing.unidad));
    }
  });
  if (faltantes.length) {
    return mostrarMensaje("consumo-mensaje", "No hay stock suficiente. " + faltantes.join(". ") + ".", true);
  }
  plato.ingredientes.forEach(function (linea) {
    const ing = buscarIngrediente(linea.ingredienteId);
    ing.stock -= cantidadBruta(linea.cantidad, ing) * raciones;
  });
  apuntarMovimiento("Consumo: " + raciones + " × " + plato.nombre);
  guardarDatos();
  pintarTodo();
  mostrarMensaje("consumo-mensaje", "Descontados los ingredientes de " + raciones + " ración(es) de " + plato.nombre + ".");
}

function registrarConsumoIngrediente() {
  const ing = buscarIngrediente(document.getElementById("consumo-ingrediente").value);
  if (!ing) return mostrarMensaje("consumo-mensaje", "Primero añade un ingrediente en la pantalla Stock.", true);
  const cantidad = leerNumero("consumo-cantidad");
  if (!cantidad || cantidad <= 0) {
    return mostrarMensaje("consumo-mensaje", "La cantidad tiene que ser mayor que 0.", true);
  }
  if (ing.stock < cantidad - 0.0001) {
    return mostrarMensaje("consumo-mensaje", "No hay suficiente " + ing.nombre + ": quedan " +
      conUnidad(ing.stock, ing.unidad) + ".", true);
  }
  ing.stock -= cantidad;
  apuntarMovimiento("Consumo directo: -" + conUnidad(cantidad, ing.unidad) + " de " + ing.nombre);
  document.getElementById("consumo-cantidad").value = "";
  guardarDatos();
  pintarTodo();
  mostrarMensaje("consumo-mensaje", "Descontados " + conUnidad(cantidad, ing.unidad) + " de " + ing.nombre + ".");
}

/* ---------- 14. Acciones: ajustes ---------- */
function guardarAjustes() {
  const umbral = leerNumero("ajuste-umbral");
  if (!umbral || umbral <= 0 || umbral >= 100) {
    return mostrarMensaje("ajustes-mensaje", "El food cost de referencia tiene que estar entre 1 y 99.", true);
  }
  datos.ajustes.umbralFoodCost = umbral;
  guardarDatos();
  pintarTodo();
  mostrarMensaje("ajustes-mensaje", "Referencia guardada: se marcarán los platos por encima del " + numero(umbral) + " %.");
}

function restablecerDatos() {
  if (!confirm("¿Seguro? Se borrarán tus datos actuales y volverán los de ejemplo.")) return;
  datos = JSON.parse(JSON.stringify(DATOS_EJEMPLO));
  guardarDatos();
  pintarTodo();
  mostrarMensaje("ajustes-mensaje", "Datos restablecidos a los de ejemplo.");
}

// Exporta todos los datos a un archivo JSON descargable
function exportarDatos() {
  const archivo = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(archivo);
  enlace.download = "escandapp-copia-seguridad.json";
  enlace.click();
  URL.revokeObjectURL(enlace.href);
  mostrarMensaje("ajustes-mensaje", "Copia de seguridad descargada.");
}

// Comprueba que un objeto importado tiene la estructura esperada; si no, se rechaza
function validarDatosImportados(d) {
  if (!d || typeof d !== "object") return false;
  if (!d.ajustes || typeof d.ajustes.umbralFoodCost !== "number") return false;
  // la marca ejemplo es opcional en cada ingrediente/plato (las copias antiguas no la tienen)
  if (!Array.isArray(d.ingredientes) || !Array.isArray(d.platos) || !Array.isArray(d.movimientos)) return false;
  const unidades = ["kg", "L", "unidad"];
  const ids = {};
  for (const ing of d.ingredientes) {
    if (!ing.id || !ing.nombre || unidades.indexOf(ing.unidad) === -1) return false;
    if (typeof ing.merma !== "number" || ing.merma < 0 || ing.merma >= 100) return false;
    if (typeof ing.stock !== "number" || ing.stock < 0) return false;
    if (typeof ing.minimo !== "number" || ing.minimo < 0) return false;
    if (!ing.formato || !ing.formato.nombre) return false;
    if (typeof ing.formato.cantidad !== "number" || ing.formato.cantidad <= 0) return false;
    if (typeof ing.formato.precio !== "number" || ing.formato.precio < 0) return false;
    ids[ing.id] = true;
  }
  for (const plato of d.platos) {
    if (!plato.id || !plato.nombre || !plato.tipo) return false;
    if (typeof plato.precioVenta !== "number" || plato.precioVenta <= 0) return false;
    if (!Array.isArray(plato.ingredientes) || !plato.ingredientes.length) return false;
    for (const linea of plato.ingredientes) {
      if (!ids[linea.ingredienteId]) return false; // la receta usa un ingrediente que no existe
      if (typeof linea.cantidad !== "number" || linea.cantidad <= 0) return false;
    }
  }
  return true;
}

function importarDatos(evento) {
  const archivo = evento.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = function () {
    let datosNuevos = null;
    try { datosNuevos = JSON.parse(lector.result); } catch (e) { /* JSON roto */ }
    if (!validarDatosImportados(datosNuevos)) {
      evento.target.value = "";
      return mostrarMensaje("ajustes-mensaje", "Ese archivo no es una copia de seguridad válida de EscandApp. No se ha cambiado nada.", true);
    }
    if (!confirm("¿Importar esta copia? Se sustituirán todos los datos actuales.")) {
      evento.target.value = "";
      return;
    }
    datos = datosNuevos;
    guardarDatos();
    pintarTodo();
    mostrarMensaje("ajustes-mensaje", "Copia de seguridad importada correctamente.");
    evento.target.value = "";
  };
  lector.readAsText(archivo);
}

/* ---------- 15. Arranque ---------- */
let datos = cargarDatos();

// Botones de formularios y acciones
document.getElementById("boton-nuevo-plato").addEventListener("click", function () { abrirFormularioPlato(null); });
document.getElementById("plato-anadir-linea").addEventListener("click", function () { anadirLineaReceta(null); });
document.getElementById("plato-guardar").addEventListener("click", guardarPlato);
document.getElementById("plato-cancelar").addEventListener("click", cerrarFormularioPlato);
document.getElementById("plato-precio").addEventListener("input", actualizarVistaPreviaPlato);
document.getElementById("boton-nuevo-ingrediente").addEventListener("click", function () { abrirFormularioIngrediente(null); });
document.getElementById("ing-guardar").addEventListener("click", guardarIngrediente);
document.getElementById("ing-cancelar").addEventListener("click", cerrarFormularioIngrediente);
document.getElementById("entrada-boton").addEventListener("click", registrarEntrada);
document.getElementById("recuento-boton").addEventListener("click", registrarRecuento);
document.getElementById("consumo-plato-boton").addEventListener("click", registrarConsumoPlato);
document.getElementById("consumo-ingrediente-boton").addEventListener("click", registrarConsumoIngrediente);
document.getElementById("ajuste-guardar").addEventListener("click", guardarAjustes);
document.getElementById("ajuste-restablecer").addEventListener("click", restablecerDatos);
document.getElementById("ajuste-exportar").addEventListener("click", exportarDatos);
document.getElementById("ajuste-importar").addEventListener("click", function () {
  document.getElementById("importar-archivo").click();
});
document.getElementById("importar-archivo").addEventListener("change", importarDatos);
// Cambiar el ingrediente de un desplegable actualiza las ayudas (unidad/formato)
["entrada-ingrediente", "recuento-ingrediente", "consumo-ingrediente"].forEach(function (id) {
  document.getElementById(id).addEventListener("change", actualizarAyudasCampos);
});

// ?vista= y ?plato= en la URL: permiten abrir una vista concreta (útil para pruebas y capturas)
const parametros = new URLSearchParams(location.search);
pintarTodo(parametros.get("plato"));
if (parametros.get("vista")) cambiarVista(parametros.get("vista"));
// ?panel=plato o ?panel=ingrediente: abre el formulario vacío (útil para capturas)
if (parametros.get("panel") === "plato") abrirFormularioPlato(null);
if (parametros.get("panel") === "ingrediente") abrirFormularioIngrediente(null);
