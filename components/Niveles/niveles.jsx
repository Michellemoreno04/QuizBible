export const niveles = (experiencia) => {

  const animation = require("../../assets/lottieFiles/angel-nivel.json");
    // Niveles y insignias
    const insignias = {
      1: {
        name: "Iniciador",
        animation: animation,
        description: "¡Has encendido la llama del conocimiento! Esta insignia celebra tu decisión de comenzar el camino del aprendizaje bíblico. ¡Cada gran jornada comienza con un primer paso!"
      },
      2: {
        name: "Aprendiz",
        animation: animation,
        description: "¡Ya estás cosechando los frutos de la constancia! Has completado tus primeras lecciones y demostrado hambre de sabiduría. Sigue alimentando tu espíritu con la Palabra."
      },
      3: {
        name: "Estudiante Fiel",
        animation: animation,
        description: "Tu dedicación brilla como la luz en el monte. Esta insignia reconoce tu compromiso diario de crecer en fe y conocimiento. ¡Has hecho de las Escrituras parte de tu vida!"
      },
      4: {
        name: "Seguidor Devoto",
        animation: animation,
        description: "Dominas las Escrituras con sabiduría y discernimiento. Esta distinción honra tu capacidad para analizar y aplicar enseñanzas bíblicas en tu caminar con Cristo."
      },
      5: {
        name: "Experto Bíblico",
        animation: animation,
        description:  '“Defensor” tiene una connotación de protección y constancia sin el tono de confrontación que implica “guerrero”. '
      },
      6: {
        name: "Mentor Espiritual",
        animation: animation,
        description: "¡Has alcanzado la cumbre del conocimiento bíblico! Tu vida refleja el fruto del Espíritu y tu sabiduría edifica a la iglesia. Eres legado viviente de la Palabra de Dios."
      },
      7: {
        name: "Guerrero de la Fe",
        animation: animation,
        description: "¡Has vestido la armadura de Dios! (Efesios 6:11) Esta insignia honra tu perseverancia ante desafíos bíblicos complejos. Tu fe se fortalece en cada batalla espiritual ganada."
      },
      8: {
        name: "Sabio Iluminado",
            animation: animation,
        description: "Has descubierto 100+ promesas bíblicas. ¡Nunca caminarás sin dirección! (Salmo 119:105) Cada versículo es un mapa hacia el corazón de Dios."
      },
      9: {
        name: "Defensor de la Fe",
        animation: animation,
        description: "¡Compartiste conocimiento con 10+ hermanos! Eres voz que proclama las buenas nuevas (Romanos 10:15). Tu testimonio digital siembra semillas de fe."
      },
      10: {
        name: "Intérprete de Parábolas",
        animation: animation,
        description: "Dominas el arte de descifrar las enseñanzas de Jesús. ¡Has encontrado perlas escondidas en sus historias! (Mateo 13:45-46)"
      },
      11: {
        name: "Guardián de los Proverbios",
        animation: animation,
        description: '“Custodio” sugiere responsabilidad en la preservación de la sabiduría ancestral.'
      },
      12: {
        name: "Embajador del Reino",
        animation: animation,
        description: "¡Vives como ciudadano del cielo en la tierra! (Filipenses 3:20) Tu dominio bíblico impacta vidas y transforma realidades."
      },
      
    13: {
      name: "Embajador Celestial",
      animation: animation,
      description: " Resalta la conexión entre el reino espiritual y la misión en la tierra."
    },
    14: {
      name: "Teólogo Erudito",
      animation: animation,
      description: "Erudito” enfatiza el estudio profundo y la sabiduría adquirida."
    },
    15: {
      name: "Custodio del Canon",
      animation: animation,
      description: "“Canon” es el término técnico que se refiere al conjunto de libros sagrados."
    },
    16: {
      name: "Heraldo Apostólico",
      animation: animation,
      description: "Interpretas las epístolas con precisión histórica. ¡Predicas la sana doctrina como Pablo a Timoteo! (2 Timoteo 4:2) Tu estudio trasciende lo académico."
    },
    17: {
      name: "Visionario Profético",
      animation: animation,
      description: "Entiendes los tiempos a través de las Escrituras. ¡Disciernes señales como hijo de Issacar! (1 Crónicas 12:32) Tu mirada escudriña el horizonte eterno."
    },
    18: {
      name: "Arquitecto de Sion",
      animation: animation,
      description: "Construyes conocimiento sobre el fundamento de los apóstoles. (Efesios 2:20) ¡Tu sabiduría edifica templos vivos para Dios!"
    },
    19: {
      name: "Erudito del Reino",
      animation: animation,
      description: "“Erudito” refuerza el alto nivel de conocimiento y discernimiento."
    },
    20: {
      name: "Embajador Eterno",
      animation: animation,
      description: "Vives y enseñas con perspectiva celestial. (Colosenses 3:2) ¡Tu caminar muestra la ciudadanía del cielo en cada paso!"
    },
    21: {
      name: "Peregrino Pentecostal",
      animation: animation,
      description: "Dominas los Hechos de los Apóstoles y vives con fuego apostólico. (Hechos 2:3-4) ¡Tu pasión por la iglesia primitiva enciende comunidades!"
    },
    22: {
      name: "Intérprete de Lenguas",
      animation: animation,
      description: "Comprendes los dones espirituales en su contexto genuino. (1 Corintios 14:10) Tu discernimiento protege la unidad del Cuerpo de Cristo."
    },
    23: {
      name: "Decodificador de parábolas",
      animation: animation,
      description: "Dominas las parábolas ocultas de Jesús. (Juan 19:23) ¡Descifras significados que transforman vidas como el hilo escarlata de Rahab!"
    },
    24: {
      name: "Pastor Guiador",
      animation: animation,
      description: "Guias a otros con el corazón del Buen Pastor. (Juan 10:11) Tu conocimiento alimenta ovejas y restaura rediles."
    },
    25: {
      name: "Ministro de Adoración",
      animation: animation,
      description: "Vives la adoración como ministerio permanente. (1 Crónicas 16:4) ¡Tu estudio revela el poder transformador de la alabanza genuina!"
    },
    26: {
      name: "Místico Apocalíptico",
      animation: animation,
      description: "Descifras símbolos del último libro con sabiduría. (Apocalipsis 5:5) ¡Tu mente explora el trono celestial sin perder pie en la tierra!"
    },
    27: {
      name: "Pescador de Almas",
      animation: animation,
      description: "Pescas almas con las redes del conocimiento. (Marcos 1:17) ¡Cada verdad aprendida se convierte en anzuelo de salvación!"
    },
    28: {
      name: "Sabio Constructor",
      animation: animation,
      description: "Edificas sobre la Roca con materiales eternos. (1 Corintios 3:10) ¡Tu estudio evita madera, heno y hojarasca doctrinal!"
    },
    29: {
      name: "Teofórico Portador",
      animation: animation,
      description: "Llevas la Presencia como el Arca del Pacto. (2 Samuel 6:9) ¡Tu vida es santuario móvil de revelación divina!"
    },
   
  
    };
  
    const experienciaPorNivel = 400;
    let nivel = Math.floor(experiencia / experienciaPorNivel) + 1;
    const maxNivel = Object.keys(insignias).length;
    
    nivel = nivel > maxNivel ? maxNivel : nivel;
  
    return {
      nivel,
      insignia: insignias[nivel]?.name || 'Insignia 1',
      animation: insignias[nivel]?.animation || "../../assets/lottieFiles/award.json",
      description: insignias[nivel]?.description || 'Continúa ganando experiencia para obtener tu primera insignia'
    };
  };