import type { LongformDoc } from "../../types";

const doc: LongformDoc = {
  title: "Política de privacidad",
  description: "Qué datos recoge ToneProfile, para qué, durante cuánto tiempo y cuáles son tus derechos.",
  eyebrow: "Legal",
  lede: "ToneProfile está diseñado para recoger lo mínimo: un fragmento corto que se borra en menos de un día, la canción que elegiste y tus valoraciones. Sin publicidad y sin venta de datos.",
  updated: "2026-09-30",
  draft: true,
  sections: [
    {
      id: "scope",
      title: "Quiénes somos y qué cubre",
      blocks: [
        {
          kind: "p",
          text: "ToneProfile es un proyecto independiente en desarrollo. Esta política cubre este sitio web y la aplicación web de ToneProfile. El nombre de la entidad responsable de tus datos y una dirección de contacto se publicarán aquí antes de que abra la alfa privada.",
        },
      ],
    },
    {
      id: "demo",
      title: "La demo actual",
      blocks: [
        {
          kind: "p",
          text: "La demo pública funciona con un backend simulado dentro de tu navegador. Los archivos que eliges y los tonos que creas no se envían a ningún servidor de ToneProfile: se quedan en el almacenamiento local de tu navegador y puedes borrarlos cuando quieras eliminando los datos de este sitio.",
        },
      ],
    },
    {
      id: "data",
      title: "Qué recogemos cuando el servicio esté activo",
      blocks: [
        {
          kind: "list",
          items: [
            "Datos de la cuenta: tu correo electrónico, cuando haya cuentas.",
            "Los fragmentos de audio que subas, solo para analizarlos (ver [tu audio](#audio)).",
            "Lo que pides: la canción que elegiste, los ajustes de tu guitarra y tu dispositivo.",
            "Resultados y valoraciones: perfiles de tono, presets y las valoraciones o comentarios que envíes.",
            "Datos técnicos: dirección IP, navegador y registros de errores, para mantener el servicio seguro y en funcionamiento.",
          ],
        },
      ],
    },
    {
      id: "audio",
      title: "Tu audio",
      blocks: [
        {
          kind: "p",
          text: "El audio original se borra en menos de 24 horas desde el análisis. Solo guardamos mediciones derivadas, como el espectro, el tipo de ganancia y los efectos detectados, que no permiten reconstruir la grabación. Tu audio nunca se publica, no se comparte con otros usuarios ni se usa para entrenar modelos sin tu consentimiento explícito. Más detalles en la [política de audio y derechos](/legal/audio).",
        },
      ],
    },
    {
      id: "purposes",
      title: "Para qué lo usamos",
      blocks: [
        {
          kind: "list",
          items: [
            "Para hacer el análisis y entregarte tu perfil de tono y tu preset.",
            "Para mejorar la precisión, a partir de valoraciones y mediciones agregadas.",
            "Para mantener el servicio seguro y evitar abusos.",
          ],
        },
        { kind: "p", text: "No mostramos publicidad y no vendemos ni alquilamos datos personales." },
      ],
    },
    {
      id: "processors",
      title: "Quién los trata por nosotros",
      blocks: [
        {
          kind: "p",
          text: "Algunos proveedores tratan datos siguiendo nuestras instrucciones: alojamiento, almacenamiento de archivos y los modelos de lenguaje de IA que leen fuentes y redactan explicaciones. Los modelos de lenguaje reciben información de la canción y textos de investigación, no tu audio. La lista de proveedores, y dónde tratan los datos, se publicará antes del lanzamiento y estará cubierta por contratos de encargo de tratamiento.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies y almacenamiento local",
      blocks: [
        {
          kind: "p",
          text: "Usamos una cookie funcional, NEXT_LOCALE, para recordar tu idioma. No hay cookies de publicidad ni de seguimiento. La demo también usa el almacenamiento local de tu navegador para conservar tus tonos entre visitas.",
        },
      ],
    },
    {
      id: "retention",
      title: "Cuánto tiempo los guardamos",
      blocks: [
        {
          kind: "list",
          items: [
            "Audio original: hasta 24 horas.",
            "Mediciones, perfiles de tono, presets y valoraciones: mientras exista tu cuenta o hasta que los borres.",
            "Registros técnicos: durante un periodo limitado que se indicará aquí antes del lanzamiento.",
          ],
        },
      ],
    },
    {
      id: "rights",
      title: "Tus derechos",
      blocks: [
        {
          kind: "p",
          text: "Puedes pedir acceder a tus datos, corregirlos, exportarlos o borrarlos, y oponerte a su tratamiento o limitarlo. Según dónde vivas, por ejemplo en la Unión Europea, también puedes reclamar ante tu autoridad de protección de datos. Antes del lanzamiento explicaremos cómo ejercer estos derechos, con una dirección de contacto.",
        },
      ],
    },
    {
      id: "changes",
      title: "Cambios en esta política",
      blocks: [
        {
          kind: "p",
          text: "Cuando esta política cambie, actualizaremos la fecha de arriba. Si el cambio es importante, te avisaremos en el producto antes de que se aplique.",
        },
      ],
    },
  ],
};

export default doc;
