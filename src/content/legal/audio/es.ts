import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Política de audio y derechos",
  description: "Qué audio puedes subir a ToneProfile, qué hacemos con él y cómo pueden contactarnos los titulares de derechos.",
  eyebrow: "Legal",
  lede: "ToneProfile nunca descarga canciones. Tú subes un fragmento corto que tengas derecho a usar; nosotros lo medimos, lo borramos y guardamos solo los números.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "allowed",
      title: "Qué puedes subir",
      blocks: [
        {
          kind: "list",
          items: [
            "Grabaciones hechas por ti, por ejemplo de cómo tocas.",
            "Grabaciones de tu propiedad o que tengas licencia o permiso para usar.",
            "Material que la ley de tu país te permita analizar.",
          ],
        },
        {
          kind: "p",
          text: "Los archivos pueden durar de 5 segundos a 10 minutos y pesar hasta 20 MB. Solo se analiza el pasaje que eliges, de 5 a 90 segundos.",
        },
      ],
    },
    {
      id: "not-allowed",
      title: "Qué no debes subir",
      blocks: [
        {
          kind: "list",
          items: [
            "Archivos obtenidos de forma ilícita, por ejemplo extraídos de servicios de streaming.",
            "Grabaciones de personas que no aceptaron ser grabadas.",
            "Cualquier cosa que no tengas derecho a usar.",
          ],
        },
      ],
    },
    {
      id: "processing",
      title: "Qué hacemos con tu fragmento",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Separamos la guitarra del resto de la mezcla.",
            "La medimos: espectro, tipo de ganancia, delay, modulación y reverb.",
            "Borramos el audio original en menos de 24 horas.",
            "Guardamos solo las mediciones, que no permiten reconstruir la grabación.",
          ],
        },
        {
          kind: "p",
          text: "Tu audio nunca se redistribuye, no se publica ni se usa para entrenar modelos sin tu consentimiento explícito. Consulta también la [política de privacidad](/legal/privacy).",
        },
      ],
    },
    {
      id: "links",
      title: "Por qué no hay enlaces de YouTube o Spotify",
      blocks: [
        {
          kind: "p",
          text: "Extraer audio de servicios de streaming incumple sus condiciones y crea una copia de una grabación protegida. Elegir una canción solo identifica la grabación que se investiga; el audio siempre lo aportas tú.",
        },
      ],
    },
    {
      id: "research",
      title: "Investigación de la canción",
      blocks: [
        {
          kind: "p",
          text: "Para investigar el equipo, ToneProfile lee fuentes públicas como entrevistas, artículos y recorridos por el equipo de los músicos. Los resultados muestran citas breves con un enlace a la fuente original, y se eliminan las afirmaciones cuya cita no se puede verificar. Cómo se califican las afirmaciones se explica en la [metodología](/methodology#evidence).",
        },
      ],
    },
    {
      id: "report",
      title: "Informar de un problema",
      blocks: [
        {
          kind: "p",
          text: "Si eres titular de derechos y crees que algo en ToneProfile los infringe, podrás pedirnos que lo revisemos y lo retiremos. Antes de que abra la alfa privada publicaremos aquí una dirección de contacto específica.",
        },
      ],
    },
  ],
};

export default doc;
