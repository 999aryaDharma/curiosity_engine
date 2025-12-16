// src/utils/greetingUtils.ts

/**
 * Generates a personalized greeting based on the current time of day
 * @returns A greeting string like "Good morning, Explorer" with a fun subject
 */
export const getPersonalizedGreeting = (): string => {
  const hour = new Date().getHours();
  let timeGreeting = "";

  if (hour >= 5 && hour < 12) {
    timeGreeting = "Good morning";
  } else if (hour >= 12 && hour < 18) {
    timeGreeting = "Good afternoon";
  } else if (hour >= 18 && hour < 22) {
    timeGreeting = "Good evening";
  } else {
    timeGreeting = "Good night";
  }

  // Mapping of fun subjects for the greeting - High-level humor and offbeat
  const funSubjects = [
    "Professional Overthinker",
    "Digital Philosopher",
    "Conspiracy Theorist-in-Training",
    "Part-Time Existentialist",
    "Amateur Renaissance Person",
    "Certified Overthinker",
    "Notion Enthusiast",
    "Idea Hoarder",
    "Neurodivergent Networker",
    "Professional Rabbit Holer",
    "Caffeine-Fueled Dreamer",
    "Serial Wikipedia Rabbit Holed",
    "Curiosity Industrial Complex",
    "Idea Alchemist Supreme",
    "Professional Distractible",
    "Chronic Procrastifucker",
    "Mind Palace Architect",
    "Idea Composter",
    "Cognitive Overlord",
    "Spark Wrangler",
    "Neural Pathway Dancer",
    "Conceptual Acrobat",
    "Metacognitive Mad Scientist",
    "Intellectual Janitor",
    "Brain Gremlin",
    "Idea Whisperer",

    // Corporate Satire
    "Chief of 'Hah Gimana Maksudnya?'",
    "Senior Executive of Pura-Pura Sibuk",
    "Manager of 'Nanti Gue Kabarin' (Ghosting Div.)",
    "Certified Meeting Survivor (Camera Off)",
    "Professional 'As Per My Last Email' Aggressor",
    "Head of Wacana Department",
    "Deadline Dodger (Jalur Langit)",
    "Corporate Rat with Gucci Dreams",
    "Revision Request Rejector",
    "Reply-All Terrorist",

    // Mental Chaos & Delusional
    "Chief Delusion Officer (CDO)",
    "S3 Overthinking (Cum Laude)",
    "Mental Breakdown Scheduler",
    "God's Funniest Soldier (Lagi Capek)",
    "Living on Iced Coffee & Inshaa Allah",
    "Main Character Syndrome (Low Budget)",
    "Full-time Badut, Part-time Human",
    "Anxiety Connoisseur",
    "Internal Screaming Expert",
    "Dissociation Specialist",

    // Life Skills (Or Lack Thereof)
    "Senior Beban Keluarga",
    "PhD in Doomscrolling",
    "Remaja Jompo Certified",
    "Professional Money Spender (Zero Income)",
    "Life Coach (Please Don't Listen to Me)",
    "Quarter-Life Crisis Consultant",
    "Adulting Intern (Unpaid)",
    "Chaos Coordinator",
    "Nap Enthusiast (Pro League)",
    "Walking Red Flag Detector (But Colorblind)",

    // Social & Introvert
    "President of 'Gak Jadi Ikut Deh'",
    "Social Battery: 1% (Need Charger)",
    "Professional Homebody (Cabang Kasur)",
    "Reply Time: 3-5 Business Days",
    "Master of 'Seen Zone' (No Reply)",
    "Introvert with Extrovert FOMO",
    "Head of 'Pulang Cepet' Committee",
    "Small Talk Hater",

    // Financial & Career
    "CFO of 'Gaji Numpang Lewat'",
    "Senior Impulsive Buyer (Checkout Dulu, Nyesel Nanti)",
    "Career Goal: Rich Housewife/Husband",
    "Professional 'Looking Busy' Consultant",
    "Savings Account? Never Heard of Her",
    "Corporate Ghost (Jiwa Hilang)",
    "Underpaid & Over-caffeinated",

    // Relationships & Personality
    "Walking Red Flag (But Colorblind)",
    "CEO of Menjaga Jodoh Orang",
    "Professional Third Wheeler",
    "Drama Magnet (Unintentional)",
    "Certified Yap-aholic (Tukang Ngomong)",
    "Trust Issues Distributor",
    "Part-Time Villain",

    // Pure Chaos & Absurd
    "Horizontal Life Specialist (Rebahan)",
    "Part-Time NPC",
    "Oxygen Conversion Unit",
    "Glitch in the Matrix",
    "Certified Clown (Fakultas Lawak)",
    "Internet Explorer in Human Form (Loading...)",
    "Error 500: Brain Server Down",
    "Spicy Psychology Subject",
    "Do Not Disturb (Forever)",
    "Professional Procrastinator (I'll Finish This Titl...)",
  ];

  // Function to get a random fun subject
  const getRandomFunSubject = (): string => {
    const randomIndex = Math.floor(Math.random() * funSubjects.length);
    return funSubjects[randomIndex];
  };

  return `${timeGreeting}, ${getRandomFunSubject()}`;
};

/**
 * Splits the greeting into two parts: the time greeting and the fun subject
 * @returns An object with greeting (e.g. "Good morning") and subject (e.g. "Professional Overthinker")
 */
export const getSplitGreeting = (): { greeting: string; subject: string } => {
  const fullGreeting = getPersonalizedGreeting();
  const [timeGreeting, ...subjectParts] = fullGreeting.split(", ");
  return {
    greeting: timeGreeting,
    subject: subjectParts.join(", "),
  };
};

/**
 * Gets just the time-based greeting part (e.g. "Good morning")
 * @returns The time-based greeting string
 */
export const getGreetingOnly = (): string => {
  return getSplitGreeting().greeting;
};

/**
 * Gets just the fun subject part (e.g. "Professional Overthinker")
 * @returns The fun subject string
 */
export const getSubjectOnly = (): string => {
  return getSplitGreeting().subject;
};
