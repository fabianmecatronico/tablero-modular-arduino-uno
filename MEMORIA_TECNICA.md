# Memoria técnica y pedagógica

## 1. Arquitectura del sistema

La solución es una PWA estática sin paso de compilación. Esta elección reduce dependencias durante la sustentación y permite abrir el prototipo directamente o mediante el servidor local incluido.

- **Capa de interfaz:** `index.html`, `styles.css` y `app.js` generan navegación, catálogo, fichas, constructor, bitácora y modo docente.
- **Capa de datos:** `data/modules.json` y `data/modules.js` contienen los 46 componentes. `data/content.js` contiene conceptos, glosario, seguridad y configuraciones pedagógicas.
- **Capa local:** `localStorage` conserva bitácoras, proyectos, fichas, rúbricas y observaciones. Todas pueden exportarse como JSON.
- **Capa offline:** `manifest.webmanifest` y `sw.js` almacenan el shell, los datos, las rutas y las imágenes locales.
- **Capa de distribución:** `server.py` e `iniciar.bat` ofrecen una ejecución local de un paso; las rutas permanentes se generan en `modulos/<id>/`.

La interfaz se construye desde datos reutilizables. No existen 46 fichas mantenidas manualmente.

## 2. Mapa del sitio

- Inicio
- Primeros pasos
- Arduino y conceptos eléctricos
- Módulos
  - Controlador
  - Protoboard / conexión
  - Entradas analógicas
  - Entradas digitales
  - Entradas híbridas AO/DO
  - Actuadores
  - Visualización
  - Comunicación
  - I2C, serial y PWM
- Construye tu proyecto
- Proyectos y retos
- Modo estudiante / bitácora
- Modo docente
- Pensamiento computacional
- Solución de problemas
- Seguridad
- Glosario
- Descargas
- Referencias y créditos
- Acerca del proyecto

Cada módulo tiene una ruta `modulos/<id>/` y una ruta dinámica equivalente `index.html#/modulos/<id>`.

## 3. Estructura de carpetas

```text
plataforma-tablero-arduino/
├── index.html
├── app.js
├── styles.css
├── manifest.webmanifest
├── sw.js
├── offline.html
├── server.py
├── iniciar.bat
├── README.md
├── MEMORIA_TECNICA.md
├── assets/
│   ├── icons/
│   └── images/                 # 47 imágenes locales y su manifest
├── data/
│   ├── modules.json
│   ├── modules.js
│   ├── content.js
│   └── classification.csv
├── downloads/
│   └── GUIA PARA LA WEB.docx
└── modulos/
    └── <id>/index.html         # rutas permanentes generadas
```

## 4. Modelo de datos

Cada módulo admite como mínimo: `id`, `name`, `model`, `category`, `signalType`, `difficulty`, `voltage`, `description`, `purpose`, `learningObjectives`, `imageUrl`, `originalImageUrl`, `sourceUrl`, `sourceTitle`, `sourceAuthor`, `sourceLicense`, `licenseStatus`, `accessDate`, `pins`, `arduinoConnections`, `libraries`, `baseCode`, `codeStatus`, `expectedResult`, `calibration`, `quickTest`, `troubleshooting`, `challenges`, `reflectionQuestions`, `computationalThinking`, `video`, `safety`, `relatedModules`, `i2cAddress`, `inconsistencies` y `annexTrace`.

Separaciones críticas:

- `imageUrl` muestra la copia local.
- `originalImageUrl` conserva la URL de Google suministrada.
- `sourceUrl` conserva la página original citada en el anexo.
- autor y licencia permanecen pendientes cuando el anexo no los identifica.
- `codeStatus` distingue `por_validar`, `revisado` y el futuro estado `probado`.

## 5. Clasificación de todos los módulos encontrados

| # | ID | Componente | Categorías | Señal | Estado del código |
|---:|---|---|---|---|---|
| 1 | `arduino-uno` | Arduino UNO | CONTROLADOR | Analógico, digital, PWM, I2C y serial | por_validar |
| 2 | `protoboard` | Protoboard | PROTOBOARD / CONEXIÓN | Conexión | por_validar |
| 3 | `joystick` | Joystick | ENTRADA ANALÓGICA; ENTRADA DIGITAL | Analógico (ejemplo: A0) | por_validar |
| 4 | `rele-1-canal` | Módulo relé de 1 canal 5 V | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 5 | `oled-128x64` | Display OLED 128×64 I2C | VISUALIZACIÓN; I2C | I2C | por_validar |
| 6 | `hc-sr04` | Sensor ultrasónico HC-SR04 | ENTRADA DIGITAL | Digital por pulsos | por_validar |
| 7 | `ttp223b` | Sensor táctil capacitivo TTP223B | ENTRADA DIGITAL | Digital | revisado |
| 8 | `sg90` | Servomotor SG90 | ACTUADOR; SALIDA PWM | Control por pulsos | revisado |
| 9 | `max7219-8x8` | Matriz LED 8×8 MAX7219 | VISUALIZACIÓN; SALIDA DIGITAL | Digital síncrono | revisado |
| 10 | `dht11` | Sensor de temperatura y humedad DHT11 | ENTRADA DIGITAL | Digital | revisado |
| 11 | `yl-69` | Sensor de humedad de suelo YL-69 | ENTRADA HÍBRIDA AO/DO; ENTRADA ANALÓGICA; ENTRADA DIGITAL | Analógico y digital | por_validar |
| 12 | `lcd-16x2-i2c` | LCD 16×2 I2C | VISUALIZACIÓN; I2C | I2C | por_validar |
| 13 | `ky-005` | Emisor infrarrojo KY-005 | COMUNICACIÓN; SALIDA DIGITAL | Infrarrojo digital | por_validar |
| 14 | `hc-06` | Módulo Bluetooth HC-06 | COMUNICACIÓN; UART / SERIAL | Serial UART | revisado |
| 15 | `tcrt5000` | Sensor infrarrojo TCRT5000 serie MH | ENTRADA HÍBRIDA AO/DO; ENTRADA ANALÓGICA; ENTRADA DIGITAL | Analógico y digital | revisado |
| 16 | `ky-037` | Sensor de sonido KY-037 | ENTRADA HÍBRIDA AO/DO; ENTRADA ANALÓGICA; ENTRADA DIGITAL | Analógico y digital | revisado |
| 17 | `ky-038` | Sensor de sonido KY-038 | ENTRADA HÍBRIDA AO/DO; ENTRADA ANALÓGICA; ENTRADA DIGITAL | Analógico y digital | revisado |
| 18 | `ky-032` | Sensor de evitación de obstáculos KY-032 | ENTRADA DIGITAL | Digital infrarrojo | por_validar |
| 19 | `ky-026` | Sensor de llama KY-026 | ENTRADA HÍBRIDA AO/DO; ENTRADA DIGITAL | Digital usado; AO pendiente | revisado |
| 20 | `ky-016` | LED RGB KY-016 | ACTUADOR; SALIDA DIGITAL; SALIDA PWM | Digital / PWM | por_validar |
| 21 | `ky-024` | Sensor Hall lineal KY-024 | ENTRADA HÍBRIDA AO/DO; ENTRADA ANALÓGICA | Analógico usado; DO pendiente | revisado |
| 22 | `ky-036` | Sensor táctil KY-036 | ENTRADA HÍBRIDA AO/DO; ENTRADA DIGITAL | Digital usado; AO pendiente | por_validar |
| 23 | `ky-028` | Sensor de temperatura KY-028 | ENTRADA HÍBRIDA AO/DO; ENTRADA DIGITAL | Digital usado; AO disponible | revisado |
| 24 | `ky-012` | Zumbador activo KY-012 | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 25 | `ky-006` | Zumbador pasivo KY-006 | ACTUADOR; SALIDA PWM | Frecuencia / PWM | revisado |
| 26 | `ky-009` | LED RGB SMD KY-009 | ACTUADOR; SALIDA DIGITAL; SALIDA PWM | Digital / PWM | por_validar |
| 27 | `ky-011` | LED bicolor KY-011 | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 28 | `ky-029` | LED mini bicolor KY-029 | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 29 | `ky-025` | Interruptor magnético KY-025 | ENTRADA HÍBRIDA AO/DO; ENTRADA DIGITAL | Digital usado; AO pendiente | revisado |
| 30 | `ky-021` | Miniinterruptor magnético KY-021 | ENTRADA DIGITAL | Digital | revisado |
| 31 | `ky-039` | Sensor de ritmo cardíaco KY-039 | ENTRADA ANALÓGICA | Analógico | por_validar |
| 32 | `ky-034` | LED de cambio de color KY-034 | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 33 | `ky-008` | Emisor láser KY-008 | ACTUADOR; SALIDA DIGITAL | Digital | revisado |
| 34 | `ky-004` | Botón KY-004 | ENTRADA DIGITAL | Digital | revisado |
| 35 | `ky-031` | Sensor de impacto KY-031 | ENTRADA DIGITAL | Digital | revisado |
| 36 | `ky-040` | Encoder rotativo KY-040 | ENTRADA DIGITAL | Digital | revisado |
| 37 | `ky-027` | Módulo de sensor de luz KY-027 | ENTRADA DIGITAL; ACTUADOR | Digital indicado; versión por validar | por_validar |
| 38 | `ky-017` | Interruptor de inclinación KY-017 | ENTRADA DIGITAL | Digital | revisado |
| 39 | `ky-020` | Interruptor de bola KY-020 | ENTRADA DIGITAL | Digital | revisado |
| 40 | `ky-018` | Fotoresistencia KY-018 | ENTRADA ANALÓGICA | Analógico | revisado |
| 41 | `ky-035` | Sensor Hall analógico KY-035 | ENTRADA ANALÓGICA | Analógico | revisado |
| 42 | `ky-003` | Sensor Hall digital KY-003 | ENTRADA DIGITAL | Digital | revisado |
| 43 | `ky-001` | Sensor de temperatura KY-001 | ENTRADA DIGITAL | Digital OneWire | revisado |
| 44 | `ky-013` | Sensor de temperatura analógico KY-013 | ENTRADA ANALÓGICA | Analógico | revisado |
| 45 | `ky-022` | Receptor infrarrojo KY-022 | ENTRADA DIGITAL; COMUNICACIÓN | Infrarrojo digital | por_validar |
| 46 | `ky-010` | Fotointerruptor KY-010 | ENTRADA DIGITAL | Digital infrarrojo | revisado |

La misma tabla está disponible como `data/classification.csv`.

## 6. Inconsistencias encontradas en el contenido original

- El DOCX no contiene imágenes incrustadas: presenta 47 enlaces externos de Google para recursos visuales. Se descargaron copias locales para el prototipo.
- El documento no indica autores ni licencias de las imágenes; todos esos campos permanecen `POR VERIFICAR`.
- Ningún ejemplo incluye evidencia de prueba física; no se usa el estado `probado`.
- La protoboard se identifica como imagen hecha con IA, pero no aporta una página fuente ni licencia.
- **Joystick:** El ejemplo no prueba el joystick de forma aislada: requiere un driver y un motor paso a paso.
- **Joystick:** analogRead() en Arduino UNO entrega 0–1023, pero el mapeo del anexo usa 0–255.
- **Display OLED 128×64 I2C:** El encabezado menciona SSD1315, mientras la fuente y el código usan SSD1306.
- **Sensor ultrasónico HC-SR04:** El formato del anexo une comentarios y declaraciones; la declaración de trig queda dentro de un comentario y el código no compila tal como está.
- **Sensor de evitación de obstáculos KY-032:** El propio anexo indica que la función de EN depende de la versión y requiere confirmación física.
- **LED RGB KY-016:** El anexo asume cátodo común; se debe confirmar físicamente porque la lógica cambia si el módulo es distinto.
- **Sensor táctil KY-036:** El documento lo llama sensor táctil, pero la URL fuente lo denomina detector de metal; confirmar el hardware real.
- **LED RGB SMD KY-009:** El código utiliza lógica activa en LOW, pero el texto identifica el común como “-”; confirmar si el módulo es ánodo o cátodo común.
- **Módulo de sensor de luz KY-027:** El anexo expresa incertidumbre sobre la versión y el elemento sensor del KY-027; verificar el módulo físico antes de usar la ficha.

Las fichas muestran estas advertencias cerca del código o de la calibración, sin ocultarlas ni corregir silenciosamente conexiones críticas.

## 7. Decisiones UX

- Diseño mobile first, académico y no infantilizado, con tarjetas, jerarquía clara y espacios amplios.
- Inicio orientado a tareas: estudiante, docente, módulos, constructor, primeros pasos y descargas.
- Buscador global en tiempo real y filtros independientes.
- Fichas uniformes con navegación predecible, tabla de pines, conexión, código, prueba, problemas, retos y reflexión.
- Modo claro/oscuro, foco visible, objetivos táctiles grandes, HTML semántico y mensajes que no dependen solo del color.
- Los términos técnicos se pueden pulsar para abrir el glosario inmediato.
- Impresión A4 oculta navegación e interacciones y conserva fuentes, diagramas, tablas, código y advertencias.
- El constructor explica conflictos y sugiere alternativas, pero nunca cambia pines automáticamente.

## 8. Estrategia pedagógica

La progresión implementada es: **Explora → Conecta → Programa → Prueba → Analiza → Mejora → Crea**.

Cada ficha combina:

- explicación inicial y objetivo de aprendizaje;
- justificación de cada conexión;
- predicción y resultado esperado;
- prueba mínima antes de integrar módulos;
- depuración con problema, causa, comprobación y solución;
- retos en niveles reproducir, modificar y crear;
- preguntas de reflexión como evidencia del proceso;
- dimensiones configurables de pensamiento computacional.

La bitácora registra hipótesis, plan, código inicial, problema, intentos, cambio, resultado y explicación. La rúbrica docente es editable y se presenta explícitamente como configuración inicial, no como instrumento validado.

## 9. Estrategia de funcionamiento offline

- Las 47 imágenes enlazadas en el anexo se almacenan localmente.
- El service worker precarga interfaz, datos, rutas e imágenes.
- La navegación utiliza caché y una página de reserva.
- El indicador informa “Disponible sin conexión” cuando el service worker controla la página.
- Los videos externos no se declaran offline. La estructura admite MP4 local y campos futuros de transcripción, subtítulos, duración y fecha.
- Los registros se conservan localmente y se exportan como JSON para respaldo.

## 10. Código, instalación y ejecución

El proyecto completo está en esta carpeta. No requiere `npm install` ni un proceso de compilación.

1. Ejecuta `iniciar.bat` en Windows.
2. Alternativamente, ejecuta `python server.py`.
3. Abre `http://127.0.0.1:8080/`.
4. Recorre una ficha, selecciona módulos en el constructor y guarda una entrada de bitácora.
5. Para probar offline, abre una vez la plataforma, espera el indicador y luego desactiva la conexión.

Consulta `README.md` para mantenimiento, videos, datos y privacidad.

## Criterio de alcance

El prototipo permite identificar, conectar, programar, probar, modificar y explicar el uso de los módulos con el nivel de información disponible. Los campos no respaldados por el anexo se mantienen pendientes. La validación eléctrica final, las pruebas de hardware, la autorización de las imágenes y la validación del instrumento de investigación siguen siendo actividades posteriores y explícitas.
