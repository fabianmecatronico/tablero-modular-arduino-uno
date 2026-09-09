# Tablero Modular Arduino

Plataforma web educativa, responsive e instalable para explorar los componentes del tablero, aprender desde cero, construir proyectos y registrar evidencias del proceso de solución.

## Inicio rápido en Windows

1. Descomprime la carpeta del proyecto si la recibiste como ZIP.
2. Haz doble clic en `iniciar.bat`.
3. La plataforma se abrirá en `http://127.0.0.1:8080/`.
4. Mantén abierta la ventana del servidor durante la presentación.

Si Windows no encuentra Python 3, puedes abrir `index.html` directamente. El catálogo y las herramientas principales funcionarán, pero la instalación como PWA y el caché sin conexión necesitan un servidor local.

## Inicio manual

Desde esta carpeta:

```powershell
python server.py
```

Después abre `http://127.0.0.1:8080/`.

## Qué incluye

- 46 fichas de componentes generadas desde un único modelo de datos.
- 47 imágenes del anexo almacenadas localmente.
- buscador y filtros por nombre, pin, señal, categoría, protocolo y dificultad;
- constructor de proyectos con detección de conflictos y plantilla Arduino;
- bitácora local del estudiante;
- modo docente, ficha imprimible y rúbrica configurable;
- modo investigación para exportar evidencias sin afirmar validez del instrumento;
- conceptos fundamentales, glosario, seguridad y solución de problemas;
- modo claro/oscuro, navegación por teclado y estilos A4 de impresión;
- manifest y service worker para uso sin conexión.

## Instalar y usar sin conexión

1. Inicia la plataforma mediante `iniciar.bat`.
2. Ábrela una vez con conexión local y espera el indicador “Disponible sin conexión”.
3. Usa la opción “Instalar aplicación” del navegador si aparece.
4. Las páginas, los datos y las imágenes quedan en caché. Los videos externos no se consideran disponibles sin conexión.

## Datos y contenido

- `data/modules.json`: modelo legible e intercambiable de los 46 componentes.
- `data/modules.js`: la misma información preparada para abrir el prototipo sin compilación.
- `data/content.js`: conceptos, glosario, seguridad, rúbrica inicial y proyectos.
- `data/classification.csv`: inventario y clasificación exportables.
- `assets/images/manifest.json`: correspondencia entre cada copia local y la URL visual original.

Los campos `[PENDIENTE]`, `[POR VALIDAR]` y `POR VERIFICAR` son deliberados. No deben sustituirse sin evidencia técnica o documental.

## Añadir un video

En el objeto del módulo dentro de `data/modules.json`/`data/modules.js`, cambia:

```json
"video": {
  "status": "pendiente",
  "src": ""
}
```

por `status: "disponible"` y añade una URL o una ruta a un MP4 local. Completa también transcripción, subtítulos, duración y fecha. No elimines la sección de video de la plantilla.

## Añadir o actualizar un módulo

Mantén la información separada del diseño. Agrega el registro al modelo de datos con la misma estructura y crea una imagen local autorizada. Si se publica en un servidor distinto, conserva una regla de redirección hacia `index.html` o usa las rutas generadas en `modulos/<id>/`.

## Privacidad y respaldo

La bitácora, los proyectos, las fichas y la rúbrica usan `localStorage`. No se envían a internet. Usa identificadores como `EST-001`, evita datos personales innecesarios y exporta JSON para conservar una copia.

## Estado técnico

“Revisado” significa inspección del ejemplo, no prueba física. Ningún código se etiqueta como “probado” porque el anexo no aporta evidencia de una prueba con el tablero real.
