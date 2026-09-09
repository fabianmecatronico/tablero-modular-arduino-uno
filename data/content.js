window.PLATFORM_CONTENT = {
  project: {
    name: "Tablero Modular Arduino",
    subtitle: "Explora, conecta, programa, prueba y explica",
    description: "Una plataforma educativa para aprender con el tablero modular, construir proyectos y documentar cómo se resuelven los problemas.",
    heroImage: "assets/images/tablero-principal.png",
    heroImageOriginal: "https://lh3.googleusercontent.com/d/1ApMxm6sMQEISLXC8mzj173TN9C0AH-4f",
    imageLicenseStatus: "POR VERIFICAR"
  },
  methodology: [
    {step: 1, name: "Explora", text: "Reconoce el módulo, su propósito y sus riesgos."},
    {step: 2, name: "Conecta", text: "Justifica cada cable antes de energizar."},
    {step: 3, name: "Programa", text: "Lee el código y predice qué hará."},
    {step: 4, name: "Prueba", text: "Compara el resultado con un criterio observable."},
    {step: 5, name: "Analiza", text: "Registra datos, errores y decisiones."},
    {step: 6, name: "Mejora", text: "Cambia una variable y vuelve a comprobar."},
    {step: 7, name: "Crea", text: "Integra módulos para resolver una situación nueva."}
  ],
  concepts: [
    {term: "Arduino", simple: "Es una plataforma para construir sistemas que leen entradas y controlan salidas.", detail: "En este tablero se usa Arduino UNO. El programa se carga en su microcontrolador y se repite mientras la placa está encendida."},
    {term: "Microcontrolador", simple: "Es el pequeño computador que ejecuta el programa de la placa.", detail: "Lee señales en los pines, procesa instrucciones y escribe salidas. No es un computador de propósito general: trabaja con recursos y tiempos definidos."},
    {term: "GND", simple: "Es la tierra o referencia común del circuito.", detail: "Los módulos deben compartir GND con Arduino para que sus tensiones y señales tengan la misma referencia."},
    {term: "5V", simple: "Es una línea de alimentación de cinco voltios.", detail: "No significa que cualquier pin tolere 5 V. Antes de conectar, verifica el voltaje del módulo y el nivel lógico de sus señales."},
    {term: "3.3V", simple: "Es una línea de alimentación de menor tensión.", detail: "Algunos módulos trabajan o se comunican a 3.3 V. El HC-06 del anexo requiere atención especial en su entrada RXD."},
    {term: "VCC", simple: "Es el pin por el que un módulo recibe alimentación positiva.", detail: "VCC describe una función, no garantiza un voltaje específico. La ficha de cada módulo debe indicar si corresponde a 5 V, 3.3 V o queda por validar."},
    {term: "Señal", simple: "Es la información eléctrica que entra o sale de un módulo.", detail: "Puede representarse como un valor variable, un estado HIGH/LOW, pulsos o un protocolo de comunicación."},
    {term: "INPUT", simple: "Configura un pin para leer una señal.", detail: "INPUT escucha el estado externo. INPUT_PULLUP añade una resistencia interna y suele hacer que un pulsador activo se lea como LOW."},
    {term: "OUTPUT", simple: "Configura un pin para controlar una salida.", detail: "Un pin OUTPUT escribe HIGH o LOW. No debe alimentar cargas que excedan la capacidad de la placa."},
    {term: "HIGH", simple: "Es el estado lógico alto.", detail: "No siempre significa “activado”: algunos módulos trabajan con lógica activa en LOW. La prueba debe comprobar el comportamiento real."},
    {term: "LOW", simple: "Es el estado lógico bajo.", detail: "En un Arduino UNO suele estar cerca de GND. Con INPUT_PULLUP, un botón conectado a GND se detecta normalmente como LOW."},
    {term: "Entrada analógica", simple: "Permite leer un valor que puede cambiar gradualmente.", detail: "analogRead() en Arduino UNO produce normalmente un número entre 0 y 1023. La lectura debe interpretarse o calibrarse según el sensor."},
    {term: "Entrada digital", simple: "Permite leer uno de dos estados: HIGH o LOW.", detail: "Un comparador o interruptor puede convertir un fenómeno físico en un estado digital. El umbral puede depender de un potenciómetro."},
    {term: "PWM", simple: "Es una forma de simular niveles de salida cambiando muy rápido entre HIGH y LOW.", detail: "En Arduino UNO se usa analogWrite() en pines PWM. Sirve para brillo, velocidad o señales de control, pero no es una salida analógica continua."},
    {term: "A0–A5", simple: "Son las entradas analógicas del Arduino UNO.", detail: "A4 y A5 también corresponden a SDA y SCL para I2C. Compartir esas funciones debe planearse."},
    {term: "D0–D13", simple: "Son los pines digitales del Arduino UNO.", detail: "D0 y D1 se usan para RX/TX serial. Algunos pines tienen PWM o interrupciones; no son intercambiables en todos los montajes."},
    {term: "SDA", simple: "Es la línea de datos del bus I2C.", detail: "En Arduino UNO corresponde a A4/SDA. Varios dispositivos pueden compartirla si sus direcciones I2C no entran en conflicto."},
    {term: "SCL", simple: "Es la línea de reloj del bus I2C.", detail: "En Arduino UNO corresponde a A5/SCL y sincroniza la transferencia de datos."},
    {term: "RX", simple: "Es el pin por el que un dispositivo recibe datos seriales.", detail: "Se conecta al TX del otro dispositivo, respetando niveles lógicos. En SoftwareSerial los pines pueden definirse en el programa."},
    {term: "TX", simple: "Es el pin por el que un dispositivo transmite datos seriales.", detail: "Se conecta al RX del otro dispositivo. En el HC-06 del anexo se recomienda un divisor de tensión hacia RXD."},
    {term: "I2C", simple: "Es un bus de comunicación que usa SDA y SCL.", detail: "Permite conectar varios dispositivos a los mismos dos pines. Cada dispositivo necesita una dirección; dos direcciones iguales pueden causar conflicto."},
    {term: "Comunicación serial", simple: "Envía información como una secuencia de bits.", detail: "El Monitor Serie y módulos como HC-06 usan comunicación serial. La velocidad en baudios debe coincidir en ambos extremos."},
    {term: "Protoboard", simple: "Permite conectar componentes sin soldar.", detail: "Sus orificios están unidos en grupos internos. Los rieles de alimentación pueden estar interrumpidos; se debe comprobar continuidad antes de asumirla."},
    {term: "Resistencia", simple: "Limita corriente o ayuda a fijar niveles eléctricos.", detail: "Su valor se mide en ohmios. En el anexo se recomienda, por ejemplo, una resistencia en serie con el emisor IR KY-005 y un divisor para RXD del HC-06."},
    {term: "Polaridad", simple: "Indica qué terminal debe ir al positivo y cuál a tierra.", detail: "Invertir alimentación puede dañar un módulo. Desconecta la energía antes de corregir cualquier cable."},
    {term: "Tierra común", simple: "Significa que todos los dispositivos comparten GND.", detail: "Sin una referencia común, una señal puede quedar flotante o ser interpretada de forma incorrecta."}
  ],
  glossary: {
    GND: "Tierra o referencia eléctrica común del circuito.",
    VCC: "Pin de alimentación positiva; el voltaje debe verificarse en cada módulo.",
    PWM: "Modulación por ancho de pulso para controlar una salida mediante ciclos rápidos HIGH/LOW.",
    ADC: "Convertidor analógico-digital que transforma una tensión en un número legible por el programa.",
    HIGH: "Estado lógico alto; no siempre equivale a módulo activado.",
    LOW: "Estado lógico bajo, normalmente cercano a GND.",
    INPUT: "Modo de un pin configurado para leer una señal.",
    OUTPUT: "Modo de un pin configurado para escribir una señal.",
    I2C: "Bus de comunicación compartido que utiliza SDA y SCL.",
    SDA: "Línea de datos de I2C; A4 en Arduino UNO.",
    SCL: "Línea de reloj de I2C; A5 en Arduino UNO.",
    RX: "Entrada de recepción de datos seriales.",
    TX: "Salida de transmisión de datos seriales.",
    AO: "Salida analógica de un módulo.",
    DO: "Salida digital de un módulo.",
    UART: "Forma de comunicación serial asíncrona mediante RX y TX.",
    "localStorage": "Almacenamiento del navegador usado en el prototipo para guardar avances solo en este dispositivo."
  },
  ctDimensions: [
    {id: "decomposition", name: "Descomposición", description: "Divide el problema en entradas, procesamiento, salidas y pruebas."},
    {id: "patterns", name: "Reconocimiento de patrones", description: "Compara intentos y reutiliza relaciones observadas."},
    {id: "abstraction", name: "Abstracción", description: "Selecciona la información relevante para el problema."},
    {id: "algorithms", name: "Pensamiento algorítmico", description: "Ordena instrucciones y decisiones en una secuencia."},
    {id: "debugging", name: "Depuración", description: "Identifica causas, cambia una variable y comprueba resultados."},
    {id: "evaluation", name: "Evaluación y mejora", description: "Compara el resultado con criterios y propone ajustes."}
  ],
  rubricScale: [
    {value: 1, label: "Inicial"},
    {value: 2, label: "En desarrollo"},
    {value: 3, label: "Logrado"},
    {value: 4, label: "Avanzado"}
  ],
  safetyTopics: [
    {level: "RIESGO BAJO", title: "5 V y baja tensión", text: "Trabajar con la alimentación desconectada al cambiar cables. Verificar polaridad y evitar cortocircuitos."},
    {level: "REQUIERE SUPERVISIÓN DOCENTE", title: "Corriente alterna y relés", text: "La parte de corriente alterna no es una práctica autónoma. Mantener separación física y usar procedimientos aprobados por el docente."},
    {level: "REQUIERE SUPERVISIÓN DOCENTE", title: "Láser", text: "No dirigir el haz a ojos, personas, animales o superficies reflectantes."},
    {level: "PRECAUCIÓN", title: "Motores y servos", text: "Evitar bloqueos mecánicos, partes móviles sueltas y fuentes inadecuadas."},
    {level: "REQUIERE SUPERVISIÓN DOCENTE", title: "Interruptor de mercurio", text: "Evitar impactos y roturas. Retirar el módulo si presenta daño."},
    {level: "PRECAUCIÓN", title: "Fuentes externas", text: "Nunca unir fuentes sin revisar tensión, polaridad, corriente y tierra común."},
    {level: "PRECAUCIÓN", title: "Elementos calientes", text: "Detener la práctica si un componente se calienta de forma inesperada y desconectar la energía."}
  ],
  projects: [
    {
      id: "alerta-distancia",
      title: "Alerta de proximidad accesible",
      problem: "¿Cómo avisar que un objeto se acerca sin depender de una sola forma de señal?",
      objective: "Construir una respuesta que combine medición y una salida observable.",
      restrictions: ["Probar cada módulo por separado.", "No usar la solución completa antes de registrar el primer plan.", "Documentar al menos dos intentos."],
      suggestedModules: ["hc-sr04", "oled-128x64", "ky-012"],
      hints: ["Define primero qué valor contará como cerca.", "Separa la lectura de la decisión.", "Prueba una sola salida antes de añadir la segunda."],
      solution: "[SOLUCIÓN DE REFERENCIA PENDIENTE DE VALIDACIÓN TÉCNICA Y DOCENTE]"
    },
    {
      id: "cuidado-planta",
      title: "Decisión de riego basada en evidencia",
      problem: "¿Cómo distinguir una lectura aislada de una condición que realmente requiere atención?",
      objective: "Calibrar una entrada, registrar datos y comunicar una decisión.",
      restrictions: ["No activar cargas de corriente alterna.", "Calibrar antes de definir el umbral.", "Explicar por qué se eligió el criterio."],
      suggestedModules: ["yl-69", "lcd-16x2-i2c", "ky-016"],
      hints: ["Registra valores en al menos dos condiciones.", "Define el criterio con palabras antes del if.", "Usa un color como apoyo, no como única información."],
      solution: "[SOLUCIÓN DE REFERENCIA PENDIENTE DE VALIDACIÓN TÉCNICA Y DOCENTE]"
    }
  ],
  defaultTeacherActivity: {
    title: "Explorar, conectar y explicar un módulo",
    duration: "60 minutos",
    priorKnowledge: "GND, 5V, entrada, salida, HIGH y LOW.",
    before: ["¿Qué fenómeno o acción recibe el sistema?", "¿Qué riesgo debemos revisar antes de conectar?"],
    during: ["¿Qué evidencia confirma que el cableado es correcto?", "¿Qué variable cambiarás y por qué?"],
    after: ["¿Qué error apareció?", "¿Cómo comprobaste la causa?", "¿Qué mejorarías en un segundo intento?"],
    commonErrors: ["No compartir GND.", "Confundir AO con DO.", "Cambiar varios elementos al mismo tiempo.", "Dar por válido un código sin observar el resultado."],
    observables: ["Divide el problema.", "Predice antes de probar.", "Registra intentos.", "Justifica cambios."]
  }
};
