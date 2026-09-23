export const profile = {
  first: "Khémiri",
  last: "Nour Elwoujoud",
  tags: ["Full Stack Developer", "Passionnée par l’IA et le Machine Learning"],
  typed: "Des systèmes intelligents, sûrs et scalables",
  location: "Mahdia, Tunisie",
  email: "Khemirinour334@gmail.com",
  phone: "+216 22 880 524",
  github: "https://github.com/khemirinour",
  linkedin: "https://www.linkedin.com/in/nour-elwoujoud-khemiri-0463a3209/",
  site: "https://khemirinourportfolio.vercel.app/",
  kaggle: "https://www.kaggle.com/khmirinourelwoujoud",
  intro:
    "Passionnée par l'Intelligence Artificielle, le Machine Learning et le DevSecOps, avec des compétences en développement logiciel, systèmes & réseaux. Rigoureuse, autonome et orientée résolution de problèmes.",
};

export const stats = [
  { value: "3", label: "PFE LIVRÉS" },
  { value: "7+", label: "DOMAINES" },
  { value: "4", label: "LANGUES" },
  { value: "∞", label: "CURIOSITÉ" },
];

export const skills: { key: string; items: string[] }[] = [
  {
    key: "developpement",
    items: [
      "Python",
      "Django",
      "Flask",
      "React js",
      "JavaScript",
      "Java",
      "C",
      "PHP",
      ".NET Core",
      "Angular",
      "Bootstrap",
    ],
  },{
  key: "ia_machine_learning",
  category: "Machine Learning / Deep Learning",
  items: [
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Keras",
    "CNN (Convolutional Neural Networks)",
    "ANN (Artificial Neural Networks)",
    "RNN (Recurrent Neural Networks)",
    "LSTM",
    "Transfer Learning",
  ],
},
{
  key: "llm_rag",
  category: "LLM et RAG",
  items: [
    "LLM",
        "RAG (Retrieval-Augmented Generation)",

    "Hugging Face",
    "LangChain",
    "ChromaDB",
    "Ollama",
    "Mistral AI",
    "Sentence Transformers",
    "FAISS",
    "LlamaIndex",
    "Embeddings",
    "Prompt Engineering",
  ],
},
  {
    key: "devops_devsecops",
    items: [
      "Docker",
      "Docker Compose",
      "Kubernetes",
      "Git",
      "GitLab",
      "Jenkins",
      "SonarQube",
      "Grafana",
      "Prometheus",
      "Burp Suite",
      "ngrok",
    ],
  },
  {
    key: "cybersecurite",
    items: ["Pentesting", "Audits", "SOC", "OWASP", "Wireshark", "Nmap", "Nikto"],
  },
  {
    key: "bases_de_donnees",
    items: ["MySQL", "PL/SQL", "PostgreSQL", "SQLite", "Oracle", "EasyPHP"],
  },
  {
    key: "big_data",
    items: ["Hadoop", "Zookeeper", "Kafka", "HBase", "Spark", "Elasticsearch"],
  },
  {
    key: "systemes_exploitation",
    items: ["Windows", "Kali Linux", "Parrot OS", "Ubuntu", "Instant Contiki"],
  },
  {
key: "outils",
items: [
"Visual Studio Code",
"Android Studio",
"IntelliJ",
"Anaconda Navigator (Jupyter, PyCharm, Spyder)",
"Eclipse (JDI, JDK)",
"Code::Blocks",
"StarUML",
"Packet Tracer",
"Node-RED",
"VMware",
"VirtualBox",
"Sandboxie",
"Wireshark",
"LaTeX ( Overleaf )",
"Canva",
"Antigravity"
],
},


  {
    key: "reseaux_systemes",
    items: [
      "Administration réseaux",
      "Routage & switching",
      "HCIA",
      "Réseaux mobiles",
    ],
  },
];


export const experiences = [
  {
    company: "Leaders Solutions",
    place: "Sfax, Tunisie",
    role: "Développeuse IA & Cybersécurité — PFE Master",
    period: "Février – Juin 2025",
    summary:
      "Développement d'un pipeline automatique pour la détection d'attaques adversariales sur des modèles de classification d'images.",
    bullets: [
      "Implémentation d'attaques (FGSM, PGD, BIM, etc.) et de défenses pour renforcer la robustesse des modèles de classification d'images.",
      "Pipeline d'évaluation automatisé de la robustesse adversariale.",
    ],
    stack: ["Python", "PyTorch", "TensorFlow", "Docker"],
    // TODO: remplace par le vrai lien du dépôt si le projet est public
    repo: "https://github.com/khemirinour/Detection-Attaques-Adversariales-pour-les-Mod-les-de-Classification-d-Images",
  },
  {
    company: "Clinisys",
    place: "Sfax, Tunisie",
    role: "Développeuse Full Stack — PFE Master",
    period: "Février – Juin 2024",
    summary:
      "Développement d'une application de planification des emplois du temps avec intégration CI/CD.",
    bullets: [
      "Application web .NET / Bootstrap / MySQL automatisant la gestion des emplois du temps, réduisant les erreurs manuelles de 60 %.",
      "Pipeline CI/CD complet (Docker Compose, GitLab, Prometheus, Grafana, SonarQube), réduisant le temps de déploiement de 40 %.",
    ],
    stack: [".NET Core", "MySQL", "CI/CD", "Bootstrap"],
    repo: " https://github.com/khemirinour/Planification-du-Temps-pour-Clinique",
  },
  {
    company: "Datasphera",
    place: ", Tunisie",
    role: "Développeuse Python — PFE Licence",
    period: "Février – Juin 2022",
    summary: "Développement d'un système multi-locataire de labellisation des textes.",
    bullets: [
      "Système de classification multi-locataire avec Flask (précision : 99 %).",
      "APIs automatisées et déployées via Docker sur AWS (disponibilité : 96,9 %).",
      "Optimisation des bases multi-locataires avec PostgreSQL et Spring Boot.",
    ],
    stack: ["Flask", "PostgreSQL", "Spring Boot", "Docker", "AWS"],
    repo: "",
  },
];
export const projects = [
  {
    role: "Développeuse Full Stack — Projet Marketplace",
    summary:
      "Développement d'une plateforme marketplace moderne basée sur une architecture Nx Monorepo et des microservices NestJS.",
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "NestJS",
      "Nx Monorepo",
      "Tailwind CSS",
      "Docker",
      "Swagger",
    ],
    repo: "https://github.com/khemirinour/Youfizz",
  },
  {
    role: "Développeuse IA & Cybersécurité — PFE Master",
    summary:
      "Développement d'un pipeline automatique pour la détection d'attaques adversariales sur des modèles de classification d'images.",
    bullets: [
      "Implémentation d'attaques (FGSM, PGD, BIM, etc.) et de défenses pour renforcer la robustesse des modèles de classification d'images.",
      "Pipeline d'évaluation automatisé de la robustesse adversariale.",
    ],
    stack: ["Python", "Flask", "TensorFlow", "Docker", "ngrok"],
    // TODO: remplace par le vrai lien du dépôt si le projet est public
    repo: "https://github.com/khemirinour/Detection-Attaques-Adversariales-pour-les-Mod-les-de-Classification-d-Images",
  },
  {
    role: "Développeuse Full Stack — PFE Master",
    summary:
      "Développement d'une application de planification des emplois du temps avec intégration CI/CD.",
    bullets: [
      "Application web .NET / Bootstrap / MySQL automatisant la gestion des emplois du temps, réduisant les erreurs manuelles de 60 %.",
      "Pipeline CI/CD complet (Docker Compose, GitLab, Prometheus, Grafana, SonarQube), réduisant le temps de déploiement de 40 %.",
    ],
    stack: [".NET Core", "MySQL", "GitLab CI", "Grafana"],
    repo: " https://github.com/khemirinour/Planification-du-Temps-pour-Clinique",
  },
  {
    role: "Développeuse Python — PFE Licence",
    summary: "Développement d'un système multi-locataire de labellisation des textes.",
    bullets: [
      "Système de classification multi-locataire avec Flask (précision : 99 %).",
      "APIs automatisées et déployées via Docker sur AWS (disponibilité : 96,9 %).",
      "Optimisation des bases multi-locataires avec PostgreSQL et Spring Boot.",
    ],
    stack: ["Flask", "PostgreSQL", "Spring Boot", "AWS"],
    repo: "",
  },
];
export const education = [
  {
    degree: "Master professionnel co-construit en Cybersécurité et Industrie Intelligente",
    school: "Faculté des Sciences de Sfax",
    period: "2024 – 2025",
  },
  {
    degree: "Mastère professionnel en Systèmes, Réseaux et Cloud Computing",
    school: "Faculté des Sciences de Sfax",
    period: "2023 – 2024",
  },
  {
    degree: "Licence en Science Informatique (Génie Logiciel et Système d'Information)",
    school: "Faculté des Sciences de Sfax",
    period: "2021 – 2022",
  },
];

export const languages = [
  { name: "Arabe", level: "Natif", pct: 100 },
  { name: "Français", level: "Courant", pct: 90 },
  { name: "Anglais", level: "Professionnel", pct: 80 },
  { name: "Italien", level: "Notions", pct: 45 },
];

export const clubs = [
  "Membre active du Club Ingenious Of Technology — FSS",
  "Membre active du Club Google Developer Student Clubs — FSS",
  "Membre active du Club Robotique — FSS",
];
