// src/constants/defaultTags.ts - 100 KNOWLEDGE-BASED TAGS

import { Tag } from "@type/tag.types";

export const DEFAULT_TAG_CLUSTERS = {
  // Natural Sciences
  PHYSICS: "physics",
  CHEMISTRY: "chemistry",
  BIOLOGY: "biology",
  ASTRONOMY: "astronomy",
  EARTH_SCIENCE: "earth_science",

  // Life Sciences
  MEDICINE: "medicine",
  ANATOMY: "anatomy",
  GENETICS: "genetics",
  ECOLOGY: "ecology",

  // Applied Sciences
  ENGINEERING: "engineering",
  COMPUTER_SCIENCE: "computer_science",
  TECHNOLOGY: "technology",
  AGRICULTURE: "agriculture",

  // Mathematics
  MATHEMATICS: "mathematics",
  STATISTICS: "statistics",

  // Social Sciences
  PSYCHOLOGY: "psychology",
  SOCIOLOGY: "sociology",
  ECONOMICS: "economics",
  POLITICAL_SCIENCE: "political_science",
  ANTHROPOLOGY: "anthropology",

  // Humanities
  HISTORY: "history",
  PHILOSOPHY: "philosophy",
  LITERATURE: "literature",
  LINGUISTICS: "linguistics",

  // Arts
  VISUAL_ARTS: "visual_arts",
  MUSIC: "music",
  ARCHITECTURE: "architecture",

  // General Knowledge
  GEOGRAPHY: "geography",
  CULTURE: "culture",
  WORLD_EVENTS: "world_events",
} as const;

export const DEFAULT_TAGS_LIST: Omit<
  Tag,
  "id" | "usageCount" | "lastUsed" | "createdAt"
>[] = [
  // ========== PHYSICS (10) ==========
  {
    name: "Mekanika Klasik",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Termodinamika",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Elektromagnetisme",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Optika & Cahaya",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Fisika Kuantum",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Relativitas",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Fisika Partikel",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Akustik & Gelombang",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Fisika Material",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },
  {
    name: "Fisika Nuklir",
    cluster: DEFAULT_TAG_CLUSTERS.PHYSICS,
    isDefault: true,
  },

  // ========== CHEMISTRY (8) ==========
  {
    name: "Kimia Organik",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Kimia Anorganik",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Biokimia",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Kimia Fisik",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Tabel Periodik",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Reaksi Kimia",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Asam & Basa",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },
  {
    name: "Polimer & Material",
    cluster: DEFAULT_TAG_CLUSTERS.CHEMISTRY,
    isDefault: true,
  },

  // ========== BIOLOGY (10) ==========
  {
    name: "Biologi Sel",
    cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY,
    isDefault: true,
  },
  { name: "Genetika", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  { name: "Evolusi", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  { name: "Ekologi", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  {
    name: "Mikrobiologi",
    cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY,
    isDefault: true,
  },
  { name: "Botani", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  { name: "Zoologi", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  { name: "Fisiologi", cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY, isDefault: true },
  {
    name: "Biologi Molekuler",
    cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY,
    isDefault: true,
  },
  {
    name: "Bioteknologi",
    cluster: DEFAULT_TAG_CLUSTERS.BIOLOGY,
    isDefault: true,
  },

  // ========== ASTRONOMY (5) ==========
  {
    name: "Tata Surya",
    cluster: DEFAULT_TAG_CLUSTERS.ASTRONOMY,
    isDefault: true,
  },
  {
    name: "Bintang & Galaksi",
    cluster: DEFAULT_TAG_CLUSTERS.ASTRONOMY,
    isDefault: true,
  },
  {
    name: "Kosmologi",
    cluster: DEFAULT_TAG_CLUSTERS.ASTRONOMY,
    isDefault: true,
  },
  {
    name: "Astrofisika",
    cluster: DEFAULT_TAG_CLUSTERS.ASTRONOMY,
    isDefault: true,
  },
  {
    name: "Eksplorasi Luar Angkasa",
    cluster: DEFAULT_TAG_CLUSTERS.ASTRONOMY,
    isDefault: true,
  },

  // ========== EARTH SCIENCE (5) ==========
  {
    name: "Geologi",
    cluster: DEFAULT_TAG_CLUSTERS.EARTH_SCIENCE,
    isDefault: true,
  },
  {
    name: "Meteorologi",
    cluster: DEFAULT_TAG_CLUSTERS.EARTH_SCIENCE,
    isDefault: true,
  },
  {
    name: "Oseanografi",
    cluster: DEFAULT_TAG_CLUSTERS.EARTH_SCIENCE,
    isDefault: true,
  },
  {
    name: "Perubahan Iklim",
    cluster: DEFAULT_TAG_CLUSTERS.EARTH_SCIENCE,
    isDefault: true,
  },
  {
    name: "Gempa & Vulkanologi",
    cluster: DEFAULT_TAG_CLUSTERS.EARTH_SCIENCE,
    isDefault: true,
  },

  // ========== MEDICINE (8) ==========
  {
    name: "Anatomi Manusia",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Fisiologi Tubuh",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Penyakit & Patologi",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Farmakologi",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Imunologi",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Nutrisi & Gizi",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Kesehatan Mental",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },
  {
    name: "Kedokteran Modern",
    cluster: DEFAULT_TAG_CLUSTERS.MEDICINE,
    isDefault: true,
  },

  // ========== ENGINEERING (6) ==========
  {
    name: "Teknik Sipil",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },
  {
    name: "Teknik Mesin",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },
  {
    name: "Teknik Elektro",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },
  {
    name: "Teknik Kimia",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },
  {
    name: "Aerodinamika",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },
  {
    name: "Robotika",
    cluster: DEFAULT_TAG_CLUSTERS.ENGINEERING,
    isDefault: true,
  },

  // ========== COMPUTER SCIENCE (7) ==========
  {
    name: "Algoritma & Data",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Artificial Intelligence",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Machine Learning",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Cybersecurity",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Jaringan Komputer",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Sistem Operasi",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },
  {
    name: "Database",
    cluster: DEFAULT_TAG_CLUSTERS.COMPUTER_SCIENCE,
    isDefault: true,
  },

  // ========== MATHEMATICS (8) ==========
  {
    name: "Aljabar",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Kalkulus",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Geometri",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Teori Bilangan",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Probabilitas",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Statistika",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Matematika Diskrit",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },
  {
    name: "Logika Matematika",
    cluster: DEFAULT_TAG_CLUSTERS.MATHEMATICS,
    isDefault: true,
  },

  // ========== PSYCHOLOGY (6) ==========
  {
    name: "Psikologi Kognitif",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Psikologi Perkembangan",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Psikologi Sosial",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Neurosains",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Memori & Belajar",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },
  {
    name: "Perilaku Manusia",
    cluster: DEFAULT_TAG_CLUSTERS.PSYCHOLOGY,
    isDefault: true,
  },

  // ========== HISTORY (8) ==========
  {
    name: "Sejarah Kuno",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Abad Pertengahan",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  { name: "Renaisans", cluster: DEFAULT_TAG_CLUSTERS.HISTORY, isDefault: true },
  {
    name: "Revolusi Industri",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Perang Dunia",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Sejarah Indonesia",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Peradaban Besar",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },
  {
    name: "Sejarah Modern",
    cluster: DEFAULT_TAG_CLUSTERS.HISTORY,
    isDefault: true,
  },

  // ========== ECONOMICS (5) ==========
  {
    name: "Mikroekonomi",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  {
    name: "Makroekonomi",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  {
    name: "Pasar & Perdagangan",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  {
    name: "Sistem Finansial",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },
  {
    name: "Ekonomi Global",
    cluster: DEFAULT_TAG_CLUSTERS.ECONOMICS,
    isDefault: true,
  },

  // ========== GEOGRAPHY (5) ==========
  {
    name: "Geografi Fisik",
    cluster: DEFAULT_TAG_CLUSTERS.GEOGRAPHY,
    isDefault: true,
  },
  {
    name: "Geografi Manusia",
    cluster: DEFAULT_TAG_CLUSTERS.GEOGRAPHY,
    isDefault: true,
  },
  {
    name: "Negara & Benua",
    cluster: DEFAULT_TAG_CLUSTERS.GEOGRAPHY,
    isDefault: true,
  },
  {
    name: "Iklim & Cuaca",
    cluster: DEFAULT_TAG_CLUSTERS.GEOGRAPHY,
    isDefault: true,
  },
  {
    name: "Urbanisasi",
    cluster: DEFAULT_TAG_CLUSTERS.GEOGRAPHY,
    isDefault: true,
  },

  // ========== LINGUISTICS (4) ==========
  {
    name: "Struktur Bahasa",
    cluster: DEFAULT_TAG_CLUSTERS.LINGUISTICS,
    isDefault: true,
  },
  {
    name: "Bahasa Dunia",
    cluster: DEFAULT_TAG_CLUSTERS.LINGUISTICS,
    isDefault: true,
  },
  {
    name: "Psikolinguistik",
    cluster: DEFAULT_TAG_CLUSTERS.LINGUISTICS,
    isDefault: true,
  },
  {
    name: "Etimologi",
    cluster: DEFAULT_TAG_CLUSTERS.LINGUISTICS,
    isDefault: true,
  },

  // ========== ARTS (5) ==========
  {
    name: "Seni Rupa",
    cluster: DEFAULT_TAG_CLUSTERS.VISUAL_ARTS,
    isDefault: true,
  },
  { name: "Teori Musik", cluster: DEFAULT_TAG_CLUSTERS.MUSIC, isDefault: true },
  {
    name: "Sejarah Seni",
    cluster: DEFAULT_TAG_CLUSTERS.VISUAL_ARTS,
    isDefault: true,
  },
  {
    name: "Arsitektur",
    cluster: DEFAULT_TAG_CLUSTERS.ARCHITECTURE,
    isDefault: true,
  },
  {
    name: "Desain",
    cluster: DEFAULT_TAG_CLUSTERS.VISUAL_ARTS,
    isDefault: true,
  },

  // ========== PHILOSOPHY (4) ==========
  { name: "Logika", cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY, isDefault: true },
  { name: "Etika", cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY, isDefault: true },
  {
    name: "Epistemologi",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },
  {
    name: "Filsafat Ilmu",
    cluster: DEFAULT_TAG_CLUSTERS.PHILOSOPHY,
    isDefault: true,
  },

  // ========== GENERAL KNOWLEDGE (7) ==========
  {
    name: "Penemuan Penting",
    cluster: DEFAULT_TAG_CLUSTERS.WORLD_EVENTS,
    isDefault: true,
  },
  {
    name: "Tokoh Bersejarah",
    cluster: DEFAULT_TAG_CLUSTERS.WORLD_EVENTS,
    isDefault: true,
  },
  {
    name: "Budaya Dunia",
    cluster: DEFAULT_TAG_CLUSTERS.CULTURE,
    isDefault: true,
  },
  { name: "Mitologi", cluster: DEFAULT_TAG_CLUSTERS.CULTURE, isDefault: true },
  { name: "Olahraga", cluster: DEFAULT_TAG_CLUSTERS.CULTURE, isDefault: true },
  { name: "Kuliner", cluster: DEFAULT_TAG_CLUSTERS.CULTURE, isDefault: true },
  {
    name: "Teknologi Modern",
    cluster: DEFAULT_TAG_CLUSTERS.TECHNOLOGY,
    isDefault: true,
  },
];

export const TAG_SELECTION_CONFIG = {
  TOTAL_TAGS_PER_DAY: 5,
  MIN_TAGS: 4,
  MAX_TAGS: 6,

  HISTORY_WEIGHT: 0.4,
  WILDCARD_WEIGHT: 0.3,
  DEEP_DIVE_WEIGHT: 0.2,
  RANDOM_WEIGHT: 0.1,

  HISTORY_LOOKBACK_DAYS: 7,
  AVOID_REPETITION_DAYS: 3,
} as const;

export const getDefaultTagsWithIds = (): Tag[] => {
  const now = Date.now();

  return DEFAULT_TAGS_LIST.map((tag, index) => ({
    id: `tag_${index.toString().padStart(3, "0")}`,
    ...tag,
    usageCount: 0,
    lastUsed: null,
    createdAt: now,
  }));
};
