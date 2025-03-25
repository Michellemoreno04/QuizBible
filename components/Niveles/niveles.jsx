export const niveles = (experiencia) => {

    // Niveles y insignias
    const insignias = {
      1: {
        name: "Principiante",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Has encendido la llama del conocimiento! Esta insignia celebra tu decisión de comenzar el camino del aprendizaje bíblico. ¡Cada gran jornada comienza con un primer paso!"
      },
      2: {
        name: "Aprendiz",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Ya estás cosechando los frutos de la constancia! Has completado tus primeras lecciones y demostrado hambre de sabiduría. Sigue alimentando tu espíritu con la Palabra."
      },
      3: {
        name: "Estudiante Fiel",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "Tu dedicación brilla como la luz en el monte. Esta insignia reconoce tu compromiso diario de crecer en fe y conocimiento. ¡Has hecho de las Escrituras parte de tu vida!"
      },
      4: {
        name: "Profesional",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "Dominas las Escrituras con sabiduría y discernimiento. Esta distinción honra tu capacidad para analizar y aplicar enseñanzas bíblicas en tu caminar con Cristo."
      },
      5: {
        name: "Maestro",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Tu conocimiento resuena como los profetas! Guías a otros con ejemplo y comprendes los misterios de la fe. Eres faro de inspiración para la comunidad."
      },
      6: {
        name: "Maestro de Maestros",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Has alcanzado la cumbre del conocimiento bíblico! Tu vida refleja el fruto del Espíritu y tu sabiduría edifica a la iglesia. Eres legado viviente de la Palabra de Dios."
      },
      7: {
        name: "Guerrero de la Fe",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Has vestido la armadura de Dios! (Efesios 6:11) Esta insignia honra tu perseverancia ante desafíos bíblicos complejos. Tu fe se fortalece en cada batalla espiritual ganada."
      },
      8: {
        name: "Explorador de Promesas",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "Has descubierto 100+ promesas bíblicas. ¡Nunca caminarás sin dirección! (Salmo 119:105) Cada versículo es un mapa hacia el corazón de Dios."
      },
      9: {
        name: "Heraldo del Evangelio",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Compartiste conocimiento con 10+ hermanos! Eres voz que proclama las buenas nuevas (Romanos 10:15). Tu testimonio digital siembra semillas de fe."
      },
      10: {
        name: "Intérprete de Parábolas",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "Dominas el arte de descifrar las enseñanzas de Jesús. ¡Has encontrado perlas escondidas en sus historias! (Mateo 13:45-46)"
      },
      11: {
        name: "Guardián de los Proverbios",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "Aplicas la sabiduría de Salomón en decisiones diarias. ¡Tu discernimiento edifica comunidades! (Proverbios 3:5-6)"
      },
      12: {
        name: "Embajador del Reino",
        animation: require("../../assets/lottieFiles/award.json"),
        description: "¡Vives como ciudadano del cielo en la tierra! (Filipenses 3:20) Tu dominio bíblico impacta vidas y transforma realidades."
      },
      
    13: {
      name: "Teólogo Consagrado",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Dominas las doctrinas fundamentales de la fe. ¡Tu entendimiento edifica a la iglesia! (Hebreos 5:14) Cada estudio profundiza tu comunión con Cristo."
    },
    14: {
      name: "Puente de Gracia",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Conectas el Antiguo y Nuevo Testamento con maestría. ¡Ves a Cristo en toda la Escritura! (Lucas 24:27) Tu visión panorámica inspira a nuevos creyentes."
    },
    15: {
      name: "Guardian de los Rollos",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Has explorado todos los libros canónicos. ¡Eres mayordomo fiel del canon sagrado! (Apocalipsis 22:18-19) Tu conocimiento abarca desde Génesis hasta Apocalipsis."
    },
    16: {
      name: "Heraldo Apostólico",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Interpretas las epístolas con precisión histórica. ¡Predicas la sana doctrina como Pablo a Timoteo! (2 Timoteo 4:2) Tu estudio trasciende lo académico."
    },
    17: {
      name: "Descifrador de Profecías",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Entiendes los tiempos a través de las Escrituras. ¡Disciernes señales como hijo de Issacar! (1 Crónicas 12:32) Tu mirada escudriña el horizonte eterno."
    },
    18: {
      name: "Arquitecto de Sion",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Construyes conocimiento sobre el fundamento de los apóstoles. (Efesios 2:20) ¡Tu sabiduría edifica templos vivos para Dios!"
    },
    19: {
      name: "Perito del Reino",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Atesoras verdades antiguas y nuevas como escriba del Reino. (Mateo 13:52) ¡Tu corazón es biblioteca viviente del Espíritu!"
    },
    20: {
      name: "Embajador Eterno",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Vives y enseñas con perspectiva celestial. (Colosenses 3:2) ¡Tu caminar muestra la ciudadanía del cielo en cada paso!"
    },
    21: {
      name: "Peregrino de Pentecostés",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Dominas los Hechos de los Apóstoles y vives con fuego apostólico. (Hechos 2:3-4) ¡Tu pasión por la iglesia primitiva enciende comunidades!"
    },
    22: {
      name: "Intérprete de Lenguas",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Comprendes los dones espirituales en su contexto genuino. (1 Corintios 14:10) Tu discernimiento protege la unidad del Cuerpo de Cristo."
    },
    23: {
      name: "Tejedor de Túnica Inconclusa",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Dominas las parábolas ocultas de Jesús. (Juan 19:23) ¡Descifras significados que transforman vidas como el hilo escarlata de Rahab!"
    },
    24: {
      name: "Pastor de Almas",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Guias a otros con el corazón del Buen Pastor. (Juan 10:11) Tu conocimiento alimenta ovejas y restaura rediles."
    },
    25: {
      name: "Levita Contemporáneo",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Vives la adoración como ministerio permanente. (1 Crónicas 16:4) ¡Tu estudio revela el poder transformador de la alabanza genuina!"
    },
    26: {
      name: "Místico del Apocalipsis",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Descifras símbolos del último libro con sabiduría. (Apocalipsis 5:5) ¡Tu mente explora el trono celestial sin perder pie en la tierra!"
    },
    27: {
      name: "Evangelista de los Perdidos",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Pescas almas con las redes del conocimiento. (Marcos 1:17) ¡Cada verdad aprendida se convierte en anzuelo de salvación!"
    },
    28: {
      name: "Sabio Constructor",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Edificas sobre la Roca con materiales eternos. (1 Corintios 3:10) ¡Tu estudio evita madera, heno y hojarasca doctrinal!"
    },
    29: {
      name: "Teofórico Portador",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Llevas la Presencia como el Arca del Pacto. (2 Samuel 6:9) ¡Tu vida es santuario móvil de revelación divina!"
    },
    30: {
      name: "Eunuco Etíope",
      animation: require("../../assets/lottieFiles/award.json"),
      description: "Entiendes lo que lees y guías a otros a hacerlo. (Hechos 8:30-31) ¡Eres carroza real que transporta tesoros de entendimiento!"
    }
  
    };
  
    const experienciaPorNivel = 200;
    let nivel = Math.floor(experiencia / experienciaPorNivel) + 1;
    const maxNivel = Object.keys(insignias).length;
    
    nivel = nivel > maxNivel ? maxNivel : nivel;
  
    return {
      nivel,
      insignia: insignias[nivel]?.name || '...',
      animation: insignias[nivel]?.animation || '/animations/default.json',
      description: insignias[nivel]?.description || '...'
    };
  };