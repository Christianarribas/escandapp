# EscandApp - Guía paso a paso

Cómo está hecha la app, archivo por archivo, para que puedas leer el código y entender cada parte.

## 1. Los tres archivos

- **index.html**: el esqueleto. Solo contiene la estructura (cabecera, menú, las 5 pantallas y los formularios). Casi todo empieza vacío: el JavaScript lo rellena.
- **style.css**: el aspecto. Colores crema y terracota, tarjetas, tablas y formularios. Está ordenado en secciones numeradas con un índice arriba.
- **app.js**: el cerebro. Carga los datos, calcula los escandallos, pinta las pantallas y responde a los botones. También tiene índice numerado arriba.

## 2. Cómo se guardan los datos

Todos los datos (ingredientes, platos, movimientos y ajustes) viven en un único objeto `datos` que se guarda en el **localStorage** del navegador con la clave `escandapp-datos-v2`:

- `cargarDatos()`: al abrir la app, lee el localStorage. Si no hay nada (primera vez), copia los `DATOS_EJEMPLO`.
- `guardarDatos()`: convierte el objeto a texto con `JSON.stringify` y lo guarda. Se llama después de cada cambio.

Ojo: los datos son de ESTE navegador. Si borras los datos del navegador, se pierden. Por eso existe la copia de seguridad (punto 8).

## 3. El modelo de un ingrediente

Cada ingrediente guarda:

- `unidad`: cómo se mide en recetas y stock (`kg`, `L` o `unidad`).
- `merma`: el % que se pierde al prepararlo (pelar, limpiar, deshuesar).
- `stock` y `minimo`: cuánto hay y el nivel de alerta.
- `formato`: cómo se compra: `{ nombre: "botella de 75 cl", cantidad: 0.75, precio: 3.50 }`.

El **precio por unidad** no se escribe a mano: se calcula (`precioPorUnidad`) dividiendo el precio del formato entre su cantidad. Así, una botella de 0,75 L a 3,50 € da 4,67 €/L, y las recetas trabajan en litros.

## 4. Neto, bruto y merma (la parte importante)

- **Cantidad neta**: lo que llega al plato según la receta (0,30 kg de pollo).
- **Cantidad bruta**: lo que sale del almacén. La merma es el % que se pierde DEL PESO BRUTO, así que:

```
bruta = neta / (1 - merma/100)
```

Ejemplo: 0,92 kg netos con 8 % de merma → 1,00 kg brutos (1,00 menos el 8 % de 1,00 = 0,92). No se multiplica por 1,08: eso daría 0,9936 y no cuadraría.

La misma cantidad bruta se usa para las dos cosas: calcular el coste del escandallo y descontar del stock al registrar un consumo. Así las cuentas siempre cuadran.

## 5. El escandallo (calcularEscandallo)

Para cada plato:

1. Para cada línea de la receta, calcula la cantidad bruta y la multiplica por el precio por unidad → coste de ese ingrediente.
2. Suma todo → **coste por ración**.
3. **Food cost** = coste / precio de venta × 100 (se marca en rojo si pasa del umbral de Ajustes).
4. **Margen bruto** = precio de venta − coste.

Todos los precios son **sin IVA**, tanto compras como ventas, para que la resta sea coherente. El margen bruto NO es el beneficio: no cuenta personal, luz, alquiler ni otros costes.

## 6. Pintar las pantallas

Hay una función por pantalla: `pintarInicio`, `pintarEscandallos`, `pintarStock`, `pintarConsumo` y `pintarAjustes`. `pintarTodo()` las llama a todas después de cada cambio, así lo que ves siempre está al día.

Cada una construye el HTML como texto y lo mete con `innerHTML`. Después se conectan los botones con `addEventListener` (por ejemplo, abrir el detalle de un plato o el lápiz de editar).

El menú solo muestra y oculta secciones (`cambiarVista` cambia la clase `vista--activa`).

## 7. Validaciones (lo que NO deja hacer)

Antes de guardar nada se comprueba:

- Cantidades negativas o vacías: bloqueadas con un mensaje rojo.
- Consumo sin stock suficiente: se comprueban TODOS los ingredientes antes de descontar; si falta algo, no se descuenta nada y te dice qué falta.
- Un plato sin nombre, sin precio o sin ingredientes no se guarda.
- La merma tiene que estar entre 0 y 99.

## 8. Copia de seguridad

- **Exportar**: convierte `datos` a JSON y lo descarga como archivo.
- **Importar**: lee el archivo y lo pasa por `validarDatosImportados`, que revisa que tenga la estructura correcta y que las recetas solo usen ingredientes que existen. Si no vale, no toca nada. Si vale, pide confirmación antes de sustituir tus datos.
- **Restablecer**: también pide confirmación antes de borrar.

## 9. El aviso de datos de ejemplo

El cartel "Datos de ejemplo (ficticios)" solo se muestra mientras uses los datos de fábrica (`ejemploEnUso`). En cuanto registras tu primera entrada, consumo, plato o ingrediente, el aviso desaparece solo.

## 10. Ideas para seguir aprendiendo

- Añadir borrado de platos e ingredientes (con cuidado: un ingrediente usado en una receta no debería borrarse).
- Historial de movimientos completo en una pantalla propia.
- PWA para instalarla en el móvil como app.
