import type { LongformDoc } from "../types";

const doc: LongformDoc = {
  title: "Cómo funciona ToneProfile",
  description: "Qué mide ToneProfile, cómo califica la evidencia, dónde usa IA y qué no puede hacer.",
  eyebrow: "Metodología",
  lede: "ToneProfile convierte una canción en un preset para tu dispositivo. Esta página explica cada paso, qué significa cada número y dónde están los límites, para que puedas juzgar un resultado en vez de creértelo.",
  updated: "2026-09-30",
  draft: false,
  sections: [
    {
      id: "overview",
      title: "En pocas palabras",
      blocks: [
        {
          kind: "p",
          text: "Eliges una canción y, si quieres, subes un fragmento corto que tengas derecho a usar. ToneProfile investiga el equipo documentado para esa grabación, mide el fragmento, describe el tono sin depender de ningún dispositivo y luego calcula los ajustes para el tuyo. Cada afirmación lleva un nivel de evidencia y cada ajuste se puede rastrear hasta el motivo por el que se eligió.",
        },
        {
          kind: "p",
          text: "No se copia nada de la canción: ToneProfile reconstruye un tono a partir de evidencia. ¿Quieres ver resultados completos antes? Mira los [ejemplos](/examples).",
        },
      ],
    },
    {
      id: "pipeline",
      title: "De una canción a un preset",
      blocks: [
        { kind: "p", text: "Un resultado se construye en cuatro capas. Cada capa tiene una sola función y todas se pueden revisar en la página del resultado." },
        {
          kind: "list",
          ordered: true,
          items: [
            "Referencia: la grabación exacta que elegiste y, opcionalmente, el pasaje de tu fragmento (de 5 a 90 segundos).",
            "Evidencia: lo que se sabe del tono, es decir, las afirmaciones sobre el equipo encontradas en fuentes y las mediciones de tu fragmento, cada una con su procedencia.",
            "Perfil de tono: lo que intentamos conseguir, sin depender de ningún dispositivo. Es la cadena de señal expresada en funciones (drive, ampli, gabinete, delay…), arquetipos de sonido y objetivos perceptivos como saturación, brillo o ambiente.",
            "Patch del dispositivo: cómo lo consigue tu dispositivo, con modelos y valores concretos para cada módulo, comprobados contra su catálogo.",
          ],
        },
        {
          kind: "p",
          text: "La pantalla de análisis muestra los pasos reales a medida que ocurren: canción, audio, investigación, perfil de tono, traducción, validación y preset. No hay porcentajes de progreso: un paso solo avanza cuando el trabajo que tiene detrás ha terminado.",
        },
      ],
    },
    {
      id: "measurements",
      title: "Qué medimos en tu fragmento",
      blocks: [
        { kind: "p", text: "El fragmento es opcional, pero es la evidencia más sólida que podemos tener. En él medimos:" },
        {
          kind: "list",
          items: [
            "Aislamiento de la guitarra: separamos la guitarra de la mezcla e indicamos cuánto predominaba en el pasaje.",
            "Huella del tono: el espectro promedio a largo plazo en bandas de tercio de octava (de 80 Hz a 12,5 kHz), agrupado en cuerpo, calidez, medios, mordida y aire.",
            "Tipo de ganancia: limpio, al borde de la saturación, crunch, alta ganancia o fuzz, con su probabilidad.",
            "Ambiente: tiempo y subdivisión del delay, tipo y velocidad de la modulación, y cuánta reverb hay.",
          ],
        },
        {
          kind: "p",
          text: "Los pasajes cortos, muy cargados o muy comprimidos dan mediciones más débiles, y el resultado lo indica. Sin fragmento no se mide nada: los objetivos que se habrían medido se marcan como inferidos y su confianza baja.",
        },
      ],
    },
    {
      id: "evidence",
      title: "Niveles de evidencia",
      blocks: [
        { kind: "p", text: "Cada afirmación sobre el equipo y cada bloque del perfil de tono llevan uno de estos cinco niveles:" },
        { kind: "evidenceLevels" },
        {
          kind: "p",
          text: "Los niveles se asignan con reglas (el tipo de fuente, si se refiere a esta grabación en concreto y si las fuentes coinciden), no según lo seguro que suene un modelo de IA. Las citas se comprueban en su fuente y se eliminan las afirmaciones cuya cita no aparece. Cuando no hay nada fiable, la respuesta es «desconocido».",
        },
      ],
    },
    {
      id: "confidence",
      title: "Qué significan los números de confianza",
      blocks: [
        {
          kind: "p",
          text: "La confianza aparece por afirmación, por bloque, por objetivo perceptivo y en total. Expresa cuánto respalda la evidencia ese elemento, no la probabilidad de que el preset suene idéntico al disco.",
        },
        {
          kind: "list",
          items: [
            "Los objetivos medidos en un fragmento limpio puntúan más alto; los que salen solo de la investigación o de la inferencia, menos.",
            "La confianza total resume todo el perfil. Un resultado degradado, por ejemplo cuando la investigación no encontró fuentes, muestra un aviso y un número más bajo.",
            "A medida que probemos presets en equipos reales, calibraremos estos números según lo cerca que queden los resultados.",
          ],
        },
      ],
    },
    {
      id: "ai",
      title: "Dónde se usa IA y dónde no",
      blocks: [
        {
          kind: "list",
          items: [
            "Un modelo de lenguaje lee fuentes sobre la grabación y extrae afirmaciones sobre el equipo con sus citas.",
            "Redacta el perfil de tono independiente del dispositivo, pero solo con un vocabulario controlado de funciones y arquetipos y dentro de un esquema fijo: no puede inventar categorías de equipo nuevas.",
            "Escribe el resumen y la explicación en lenguaje llano, en tu idioma.",
          ],
        },
        {
          kind: "p",
          text: "Un modelo de lenguaje nunca fija una perilla. Los modelos del dispositivo y los valores de los parámetros salen de un traductor determinista que resuelve el perfil de tono contra el catálogo del dispositivo, así que el mismo perfil siempre produce el mismo patch.",
        },
      ],
    },
    {
      id: "device",
      title: "Traducción al Valeton GP-180",
      blocks: [
        {
          kind: "p",
          text: "Cada modelo del GP-180 de nuestro catálogo está etiquetado con los arquetipos que puede representar. El traductor elige modelos para cada función de la cadena y calcula sus ajustes para cumplir los objetivos perceptivos y, cuando existen, los medidos. Las funciones que el dispositivo no puede alojar aparecen en el perfil de tono marcadas como no traducidas.",
        },
        { kind: "p", text: "Antes de entregarse, cada preset pasa una validación:" },
        {
          kind: "list",
          items: [
            "Todos los modelos existen en el dispositivo y su firmware.",
            "Todos los valores están dentro de su rango.",
            "El orden de la cadena es uno que el dispositivo acepta.",
            "Los ajustes internos del motor son coherentes.",
            "El nivel de salida es seguro.",
          ],
        },
        {
          kind: "p",
          text: "Los presets se entregan como un archivo que importas con Valeton Suite, junto con una hoja de ajustes imprimible con cada valor. La hoja siempre funciona, incluso cuando no se puede ofrecer el archivo.",
        },
      ],
    },
    {
      id: "limits",
      title: "Lo que ToneProfile no puede hacer",
      blocks: [
        {
          kind: "list",
          items: [
            "Tus manos, tu guitarra y tu ampli forman parte del tono. Compensamos las pastillas y la afinación, pero una Stratocaster no se convertirá en una Les Paul.",
            "Los discos están producidos: las guitarras dobladas, la elección de micrófonos, la mezcla y el máster influyen en lo que oyes. Buscamos el tono base de la guitarra, no la mezcla final.",
            "El equipo desconocido sigue siendo desconocido. Cuando hay poca evidencia recibes una confianza más baja y un aviso claro, nunca una suposición presentada como segura.",
          ],
        },
      ],
    },
    {
      id: "faq",
      title: "Preguntas frecuentes",
      blocks: [
        {
          kind: "defs",
          items: [
            {
              term: "¿Qué dispositivos son compatibles?",
              description: "El Valeton GP-180. El perfil de tono no depende del dispositivo, así que se podrán añadir más procesadores sin repetir el análisis.",
            },
            {
              term: "¿Qué archivos de audio puedo subir?",
              description: "WAV, FLAC, MP3, M4A u OGG, de hasta 20 MB y de entre 5 segundos y 10 minutos. Tú eliges un pasaje de 5 a 90 segundos para analizar.",
            },
            {
              term: "¿Por qué no puedo pegar un enlace de YouTube o Spotify?",
              description: "Descargar audio de esos servicios incumple sus condiciones y copia grabaciones protegidas. ToneProfile nunca descarga canciones: tú subes un fragmento corto que tengas derecho a usar.",
            },
            {
              term: "¿Qué pasa con mi audio?",
              description: "Se analiza, el audio original se borra en menos de 24 horas y solo se guardan mediciones que no permiten reconstruirlo. Más detalles en la [política de audio y derechos](/legal/audio).",
            },
            {
              term: "¿Por qué la demo no me deja descargar el archivo del preset?",
              description: "La demo funciona con un backend simulado. Los archivos de preset los genera el backend real cuando su formato se haya verificado en el equipo. La hoja de ajustes sí funciona en la demo.",
            },
            {
              term: "¿Puedo ver un resultado completo antes de probar?",
              description: "Sí: los [ejemplos](/examples) muestran resultados terminados, incluido uno en el que la investigación no encontró nada.",
            },
          ],
        },
      ],
    },
  ],
};

export default doc;
