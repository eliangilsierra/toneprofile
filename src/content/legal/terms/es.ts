import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Términos de uso",
  description: "Las reglas para usar ToneProfile, sus resultados y sus presets.",
  eyebrow: "Legal",
  lede: "ToneProfile está en desarrollo. Estos términos explican qué puedes esperar de él, qué esperamos de ti y qué pasa con lo que subes.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "status",
      title: "Estado del servicio",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile está en pleno desarrollo. La demo pública simula el análisis con canciones y fuentes ficticias. Las funciones pueden cambiar, pausarse o retirarse, y el servicio se ofrece sin garantía de disponibilidad.",
        },
      ],
    },
    {
      id: "use",
      title: "Uso de ToneProfile",
      blocks: [
        { kind: "p", text: "Puedes usar ToneProfile para tu propia música. Por favor, no:" },
        {
          kind: "list",
          items: [
            "Subas contenido que no tengas derecho a usar ni nada ilícito.",
            "Intentes interrumpir o sobrecargar el servicio, ni acceder a él sin autorización.",
            "Uses medios automatizados para extraer resultados de forma masiva.",
          ],
        },
      ],
    },
    {
      id: "content",
      title: "Tu contenido",
      blocks: [
        {
          kind: "p",
          text: "Conservas todos los derechos sobre lo que subes. Nos das un permiso limitado para tratarlo solo con el fin de prestar el servicio, como se describe en la [política de privacidad](/legal/privacy). Al subir audio confirmas que tienes derecho a usarlo para analizarlo; consulta la [política de audio y derechos](/legal/audio).",
        },
      ],
    },
    {
      id: "results",
      title: "Resultados y presets",
      blocks: [
        {
          kind: "p",
          text: "Los perfiles de tono y los presets son reconstrucciones basadas en evidencia y se ofrecen tal cual. Son un punto de partida para ajustar de oído, no una copia garantizada de una grabación. Cada resultado muestra su nivel de confianza y el porqué.",
        },
        {
          kind: "p",
          text: "Cuando pruebes un preset nuevo, empieza con el volumen bajo en tu ampli, tus altavoces o tus auriculares.",
        },
      ],
    },
    {
      id: "devices",
      title: "Dispositivos y software de terceros",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile no está afiliado a Valeton ni cuenta con su respaldo. Valeton Suite y tu dispositivo se rigen por sus propias condiciones. Haz una copia de tus presets antes de importar otros nuevos; importar archivos es responsabilidad tuya.",
        },
      ],
    },
    {
      id: "ip",
      title: "Código abierto y marcas",
      blocks: [
        {
          kind: "p",
          text: "La aplicación web de ToneProfile es código abierto bajo la licencia Apache-2.0. Los nombres de productos, dispositivos y artistas se usan de forma descriptiva y pertenecen a sus dueños.",
        },
      ],
    },
    {
      id: "liability",
      title: "Responsabilidad",
      blocks: [
        {
          kind: "p",
          text: "En la medida en que la ley lo permita, ToneProfile no responde de pérdidas indirectas derivadas del uso del servicio o de sus resultados. Nada en estos términos limita los derechos irrenunciables que tengas como consumidor.",
        },
      ],
    },
    {
      id: "changes",
      title: "Cambios y finalización",
      blocks: [
        {
          kind: "p",
          text: "Podemos actualizar estos términos; la fecha de arriba indica la última versión y los cambios importantes se anunciarán en el producto. Puedes dejar de usar ToneProfile cuando quieras.",
        },
      ],
    },
  ],
};

export default doc;
