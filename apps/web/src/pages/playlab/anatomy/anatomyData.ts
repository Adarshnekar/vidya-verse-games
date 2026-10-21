export type OrganId =
  | 'heart'
  | 'brain'
  | 'lungs'
  | 'liver'
  | 'kidneys'
  | 'eyeball'
  | 'intestine'
  | 'pancreas'
  | 'skin';

export interface HotspotItem {
  id: string;
  name: string;
  nameHi: string;
  ta: string; // Latin Terminologia Anatomica
  detail: string;
  detailHi: string;
  position: [number, number, number];
  color: string;
}

export interface OrganItem {
  id: OrganId;
  name: string;
  nameHi: string;
  system: string;
  systemHi: string;
  scientificName: string;
  poetic: string;
  model: string;
  icon: string;
  accent: string;
  illustrated: boolean;
  description: string;
  descriptionHi: string;
  size: string;
  weight: string;
  location: string;
  functionDesc: string;
  dailyFact: string;
  medical: string;
  bloodSupply: string;
  funFact: string;
  tissue: string;
  comparison: string;
  conditions: string[];
  ncertNotes: string[];
  hotspots: HotspotItem[];
}

export const ANATOMY_ORGANS: OrganItem[] = [
  // -------------------------------------------------------------
  // 1. HEART (Cor)
  // -------------------------------------------------------------
  {
    id: 'heart',
    name: 'Heart',
    nameHi: 'हृदय',
    system: 'Cardiovascular System',
    systemHi: 'परिसंचरण तंत्र',
    scientificName: 'Cor',
    poetic: 'The Tireless Vital Pump',
    model: '/models/heart.glb',
    icon: '♥',
    accent: '#ee7c6a',
    illustrated: true,
    description:
      'A powerful 4-chambered muscular organ that contracts rhythmically to pump oxygenated blood to body tissues and deoxygenated blood to the lungs.',
    descriptionHi:
      'एक चार-कक्षीय पेशीय अंग जो लयबद्ध रूप से धड़कता है और शरीर के सभी ऊतकों तक ऑक्सीजन युक्त रक्त पहुंचाता है।',
    size: 'About the size of a clenched fist (~12 cm × 9 cm)',
    weight: '250–350 grams',
    location: 'Thoracic mediastinum, behind the sternum, apex tilted to the left',
    functionDesc:
      'Dual-circuit circulation: Pulmonary loop (to lungs for gas exchange) and Systemic loop (to all organ systems).',
    dailyFact: 'Beats ~100,000 times per day, pumping over 7,200 liters of blood through vascular circuits.',
    medical: 'Sinoatrial (SA) node acts as natural cardiac pacemaker generating 60–100 electrical impulses/min.',
    bloodSupply: 'Left and right coronary arteries branching from the base of the ascending aorta.',
    funFact: 'Generates its own electrical impulses; even outside the body, it can continue beating if oxygen is supplied.',
    tissue: 'Cardiac muscle tissue (Myocardium with intercalated discs)',
    comparison: 'Heart vs. Brain (Cardiovascular & Nervous Coordination)',
    conditions: [
      'Coronary Artery Disease (Atherosclerosis)',
      'Arrhythmia & Atrial Fibrillation',
      'Myocardial Infarction (Heart Attack)',
      'Valvular Heart Disease (Mitral Stenosis)',
      'Heart Failure & Cardiomyopathy',
      'Congenital Septal Defects (VSD/ASD)',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Double circulation prevents mixing of oxygenated and deoxygenated blood, essential for warm-blooded mammals.',
      'Valves (Tricuspid & Bicuspid/Mitral) ensure unidirectional blood flow under ventricular pressure.',
      'Normal human resting blood pressure is 120/80 mm Hg (Systolic/Diastolic).',
    ],
    hotspots: [
      {
        id: 'aorta',
        name: 'Ascending Aorta & Arch',
        nameHi: 'महाधमनी',
        ta: 'Aorta ascendens et Arcus aortae',
        detail: 'The largest systemic artery, delivering high-pressure oxygenated blood from left ventricle to the entire body.',
        detailHi: 'शरीर की सबसे बड़ी धमनी जो बाएं निलय से पूरे शरीर में ऑक्सीजन युक्त रक्त पहुंचाती है।',
        position: [-0.35, 1.65, 0.55],
        color: '#ee7c6a',
      },
      {
        id: 'left-atrium',
        name: 'Left Atrium',
        nameHi: 'बायां आलिंद',
        ta: 'Atrium sinistrum',
        detail: 'Thin-walled chamber receiving freshly oxygenated blood from the four pulmonary veins.',
        detailHi: 'चार फुफ्फुसीय शिराओं से ऑक्सीजन युक्त रक्त प्राप्त करने वाला हृदय का कक्ष।',
        position: [0.82, 0.65, 0.5],
        color: '#f2a33b',
      },
      {
        id: 'right-atrium',
        name: 'Right Atrium',
        nameHi: 'दायां आलिंद',
        ta: 'Atrium dextrum',
        detail: 'Receives deoxygenated venous return from superior & inferior vena cava and coronary sinus.',
        detailHi: 'पूरे शरीर से ऑक्सीजन रहित रक्त प्राप्त करने वाला दायां कक्ष।',
        position: [-0.9, 0.35, 0.55],
        color: '#6393d8',
      },
      {
        id: 'left-ventricle',
        name: 'Left Ventricle',
        nameHi: 'बायां निलय',
        ta: 'Ventriculus sinister',
        detail: 'Thickest muscular chamber; generates systemic pressure (~120 mmHg) to pump blood through the aorta.',
        detailHi: 'सबसे मोटी पेशीय दीवार वाला कक्ष जो शरीर में रक्त पंप करता है।',
        position: [0.7, -0.75, 0.65],
        color: '#f2a33b',
      },
      {
        id: 'right-ventricle',
        name: 'Right Ventricle',
        nameHi: 'दायां निलय',
        ta: 'Ventriculus dexter',
        detail: 'Pumps venous blood into the pulmonary artery toward the pulmonary capillary bed.',
        detailHi: 'ऑक्सीजन रहित रक्त को फेफड़ों की ओर पंप करने वाला दायां कक्ष।',
        position: [-0.65, -0.68, 0.66],
        color: '#ee7c6a',
      },
      {
        id: 'mitral',
        name: 'Mitral / Bicuspid Valve',
        nameHi: 'द्विकपर्दी कपाट (मिट्रल वाल्व)',
        ta: 'Valva atrioventricularis sinistra',
        detail: 'Two-flap atrioventricular valve preventing regurgitation into left atrium during ventricular systole.',
        detailHi: 'बाएं आलिंद और बाएं निलय के बीच रक्त के उल्टे प्रवाह को रोकने वाला कपाट।',
        position: [0.18, -1.35, 0.48],
        color: '#d89bc4',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'superior-vena-cava',
        name: 'Superior Vena Cava',
        nameHi: 'ऊर्ध्व महाशिरा',
        ta: 'Vena cava superior',
        detail: 'Large systemic vein returning deoxygenated blood from the head, neck, arms, and chest into right atrium.',
        detailHi: 'सिर, गर्दन और हाथों से अशुद्ध रक्त को दाएं आलिंद में लाने वाली बड़ी शिरा।',
        position: [-0.85, 1.45, 0.25],
        color: '#6393d8',
      },
      {
        id: 'pulmonary-artery',
        name: 'Pulmonary Trunk & Artery',
        nameHi: 'फुफ्फुस धमनी',
        ta: 'Truncus pulmonalis',
        detail: 'Only artery in adults carrying deoxygenated blood, bifurcating into left and right branches to the lungs.',
        detailHi: 'एकमात्र धमनी जो फेफड़ों में शुद्धिकरण हेतु अशुद्ध रक्त ले जाती है।',
        position: [0.1, 1.3, 0.7],
        color: '#6393d8',
      },
      {
        id: 'apex',
        name: 'Apex of Heart',
        nameHi: 'हृदयाग्र (हृदय का शीर्ष)',
        ta: 'Apex cordis',
        detail: 'Inferior conical tip formed by the inferolateral left ventricle, oriented toward the 5th intercostal space.',
        detailHi: 'बाएं निलय द्वारा निर्मित निचला नुकीला सिरा जो छाती के बाईं ओर स्थित होता है।',
        position: [0.45, -1.6, 0.35],
        color: '#ee7c6a',
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. BRAIN (Encephalon)
  // -------------------------------------------------------------
  {
    id: 'brain',
    name: 'Brain',
    nameHi: 'मस्तिष्क',
    system: 'Central Nervous System',
    systemHi: 'केंद्रीय तंत्रिका तंत्र',
    scientificName: 'Encephalon',
    poetic: 'The Universe Within',
    model: '/models/brain.glb',
    icon: '◉',
    accent: '#c58696',
    illustrated: true,
    description:
      'The body’s master control and integration center, comprising ~86 billion neurons communicating through synaptic electro-chemical networks.',
    descriptionHi:
      'शरीर का नियंत्रण कक्ष, जिसमें लगभग 86 अरब तंत्रिका कोशिकाएं (न्यूरॉन्स) सोचने, समझने और शरीर संचालन का कार्य करती हैं।',
    size: 'Roughly two clenched fists (~15 cm length)',
    weight: '1.3–1.4 kg (3 lbs)',
    location: 'Enclosed securely within the bony cranium, bathed in cerebrospinal fluid (CSF)',
    functionDesc: 'Consciousness, motor control, sensory processing, memory, emotion, language, and autonomic regulation.',
    dailyFact: 'Consumes 20% of the body’s total glucose and oxygen despite accounting for only 2% of total body weight.',
    medical: 'Protected by the blood-brain barrier (BBB) and three meningeal layers: Dura, Arachnoid, and Pia mater.',
    bloodSupply: 'Internal carotid and vertebral arteries, anastomosing at the Circle of Willis.',
    funFact: 'Has no nociceptors (pain receptors) of its own; neurosurgeons can perform brain surgery while patients are awake.',
    tissue: 'Grey matter (neuronal cell bodies) and White matter (myelinated axon tracts)',
    comparison: 'Brain vs. Eye (Optic Pathway & Visual Cortex)',
    conditions: [
      'Ischemic & Hemorrhagic Stroke',
      'Alzheimer’s & Parkinson’s Disease',
      'Epilepsy & Seizure Disorders',
      'Traumatic Brain Injury (Concussion)',
      'Meningitis & Encephalitis',
      'Multiple Sclerosis (Demyelination)',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 7: Forebrain (Cerebrum) is the main thinking part; Midbrain controls reflex movements of neck and head.',
      'Hindbrain consists of Cerebellum (precision and posture), Pons (respiration relay), and Medulla (involuntary heartbeat and digestion).',
      'Synaptic transmission utilizes neurotransmitters like Acetylcholine and Dopamine.',
    ],
    hotspots: [
      {
        id: 'frontal',
        name: 'Frontal Lobe',
        nameHi: 'अग्र ललाट पालि',
        ta: 'Lobus frontalis',
        detail: 'Executive headquarters: abstract reasoning, planning, decision making, personality, and motor cortex.',
        detailHi: 'निर्णय लेने, तर्क करने, व्यक्तित्व और ऐच्छिक गतिविधियों का केंद्र।',
        position: [-0.7, 0.65, 0.8],
        color: '#ee7c6a',
      },
      {
        id: 'parietal',
        name: 'Parietal Lobe',
        nameHi: 'पार्श्विक पालि',
        ta: 'Lobus parietalis',
        detail: 'Primary somatosensory cortex: processes tactile touch, temperature, pressure, pain, and spatial orientation.',
        detailHi: 'स्पर्श, तापमान, दबाव और स्थानिक समझ को संसाधित करता है।',
        position: [0.15, 1.1, 0.65],
        color: '#f2a33b',
      },
      {
        id: 'temporal',
        name: 'Temporal Lobe',
        nameHi: 'शंख पालि',
        ta: 'Lobus temporalis',
        detail: 'Auditory processing cortex, language comprehension (Wernicke area), and long-term memory encoding (Hippocampus).',
        detailHi: 'ध्वनि सुनने, भाषा समझने और स्मृति (याददाश्त) का प्रमुख केंद्र।',
        position: [0.75, -0.1, 0.82],
        color: '#6393d8',
      },
      {
        id: 'cerebellum',
        name: 'Cerebellum ("Little Brain")',
        nameHi: 'अनुमस्तिष्क (छोटा दिमाग)',
        ta: 'Cerebellum',
        detail: 'Calibrates motor timing, smooth coordination, equilibrium, vestibular balance, and muscle tone.',
        detailHi: 'शारीरिक संतुलन, मांसपेशियों के तालमेल और गति की सूक्ष्मता को नियंत्रित करता है।',
        position: [0.72, -0.9, 0.55],
        color: '#d89bc4',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'occipital',
        name: 'Occipital Lobe',
        nameHi: 'पश्चकपाल पालि',
        ta: 'Lobus occipitalis',
        detail: 'Houses the primary visual cortex (Brodmann area 17), decoding colour, shape, motion, and visual recognition.',
        detailHi: 'आंखों द्वारा देखे गए दृश्य, रंग और गति को पहचानने वाला दृष्टि केंद्र।',
        position: [0.85, 0.35, 0.35],
        color: '#a855f7',
      },
      {
        id: 'brainstem',
        name: 'Brainstem (Pons & Medulla)',
        nameHi: 'मस्तिष्क स्तंभ',
        ta: 'Truncus encephali (Pons et Medulla)',
        detail: 'Critical vegetative nexus regulating respiratory breathing rhythm, vasomotor tone, swallowing, and cardiac rate.',
        detailHi: 'सांस लेने, दिल की धड़कन और निगलने जैसी अनैच्छिक क्रियाओं को नियंत्रित करता है।',
        position: [0.1, -1.2, 0.45],
        color: '#10b981',
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. LUNGS (Pulmones)
  // -------------------------------------------------------------
  {
    id: 'lungs',
    name: 'Lungs',
    nameHi: 'फेफड़े (फुफ्फुस)',
    system: 'Respiratory System',
    systemHi: 'श्वसन तंत्र',
    scientificName: 'Pulmones',
    poetic: 'The Breath of Life',
    model: '/models/lungs.glb',
    icon: '◍',
    accent: '#dd8f8b',
    illustrated: true,
    description:
      'Paired sponge-like organs enclosed in the pleural cavities, exchanging atmospheric oxygen for metabolic carbon dioxide across ~480 million micro-alveolar sacs.',
    descriptionHi:
      'छाती में स्थित दो स्पंज जैसे अंग, जो सांस द्वारा ली गई हवा से ऑक्सीजन सोखते हैं और कार्बन डाइऑक्साइड को बाहर निकालते हैं।',
    size: 'Each lung is ~25 cm high',
    weight: 'Combined weight ~1.0–1.2 kg',
    location: 'Thoracic cavity, flanks the pericardium on either side, resting upon the convex diaphragm',
    functionDesc: 'External respiration: pulmonary ventilation, alveolar-capillary gas diffusion, and blood pH homeostasis.',
    dailyFact: 'Breathes in ~11,000 liters of atmospheric air daily across an alveolar surface area equal to a tennis court (~70 m²).',
    medical: 'Surfactant secreted by Type II alveolar pneumocytes reduces surface tension, preventing alveolar collapse during expiration.',
    bloodSupply: 'Pulmonary arteries (functional unoxygenated) and Bronchial arteries (nutritive systemic oxygenated).',
    funFact: 'The right lung is larger and divided into three lobes; the left lung has only two lobes to leave space for the heart.',
    tissue: 'Pseudostratified ciliated columnar epithelium and simple squamous alveolar endothelium',
    comparison: 'Lungs vs. Heart (Cardiopulmonary Nexus)',
    conditions: [
      'Bronchial Asthma & Allergies',
      'Chronic Obstructive Pulmonary Disease (COPD)',
      'Bacterial & Viral Pneumonia',
      'Pulmonary Embolism (Arterial Clot)',
      'Tuberculosis (Mycobacterium infection)',
      'Pulmonary Fibrosis & Emphysema',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Inhalation occurs when the diaphragm contracts downward and ribs lift outward, increasing chest cavity volume.',
      'Alveoli possess extremely thin walls surrounded by extensive capillary networks for rapid gas diffusion.',
      'Hemoglobin in red blood cells carries 98.5% of oxygen because water/plasma has low oxygen solubility.',
    ],
    hotspots: [
      {
        id: 'trachea',
        name: 'Trachea (Windpipe)',
        nameHi: 'श्वासनली (ट्रैकिया)',
        ta: 'Trachea',
        detail: 'Cartilaginous airway reinforced by 16–20 C-shaped hyaline cartilage rings to keep the airway patent during pressure changes.',
        detailHi: 'उपास्थि के छल्लों से बनी हवा की मुख्य नली जो हवा को फेफड़ों तक ले जाती है।',
        position: [0, 1.6, 0.2],
        color: '#6393d8',
      },
      {
        id: 'right-lung',
        name: 'Right Lung (3 Lobes)',
        nameHi: 'दायां फेफड़ा',
        ta: 'Pulmo dexter',
        detail: 'Divided by horizontal and oblique fissures into Superior, Middle, and Inferior lobes; heavier and wider than the left lung.',
        detailHi: 'तीन भागों (पालियों) में बंटा दायां फेफड़ा, जो बाएं से थोड़ा बड़ा होता है।',
        position: [-1.2, 0.1, 0.7],
        color: '#ee7c6a',
      },
      {
        id: 'left-lung',
        name: 'Left Lung (2 Lobes & Cardiac Notch)',
        nameHi: 'बायां फेफड़ा',
        ta: 'Pulmo sinister',
        detail: 'Has Superior and Inferior lobes separated by an oblique fissure; features a distinct indentation for the heart.',
        detailHi: 'दो भागों में बंटा बायां फेफड़ा, जिसमें हृदय के लिए विशेष स्थान (कार्डियक नॉच) होता है।',
        position: [1.2, 0.1, 0.7],
        color: '#f2a33b',
      },
      {
        id: 'bronchus',
        name: 'Main Carina & Bronchi',
        nameHi: 'मुख्य श्वसनी (ब्रोंकस)',
        ta: 'Bronchus principalis',
        detail: 'Primary airway bifurcations conducting inspired air into secondary lobar bronchi, tertiary segmental bronchi, and bronchioles.',
        detailHi: 'श्वासनली की शाखाएं जो हवा को दोनों फेफड़ों के भीतरी हिस्सों तक पहुंचाती हैं।',
        position: [-0.03, 0.3, 0.35],
        color: '#d89bc4',
      },
      {
        id: 'base',
        name: 'Diaphragmatic Base',
        nameHi: 'फेफड़े का निचला आधार',
        ta: 'Basis pulmonis',
        detail: 'Concave inferior lung surface molded over the convex muscular dome of the diaphragm.',
        detailHi: 'फेफड़े की निचली अवतल सतह जो डायाफ्राम पेशी पर टिकी होती है।',
        position: [-1.14, -1.2, 1],
        color: '#7fa88a',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'cardiac-notch',
        name: 'Cardiac Notch',
        nameHi: 'कार्डियक नॉच (हृदय अवकाश)',
        ta: 'Incisura cardiaca pulmonis sinistri',
        detail: 'Deep indentation along anterior margin of the superior lobe of the left lung accommodating the apex of the pericardium.',
        detailHi: 'बाएं फेफड़े में बना वह विशेष मोड़ जहां हृदय का नुकीला सिरा समाहित होता है।',
        position: [0.75, -0.4, 0.85],
        color: '#ec4899',
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. LIVER (Hepar)
  // -------------------------------------------------------------
  {
    id: 'liver',
    name: 'Liver',
    nameHi: 'यकृत (लीवर)',
    system: 'Digestive & Metabolic System',
    systemHi: 'पाचन एवं चयापचय तंत्र',
    scientificName: 'Hepar',
    poetic: 'The Master Alchemist',
    model: '/models/liver.glb',
    icon: '≈',
    accent: '#b86858',
    illustrated: true,
    description:
      'The largest visceral organ and biochemical factory in the human body, executing over 500 vital metabolic, detoxifying, and secretory tasks.',
    descriptionHi:
      'शरीर का सबसे बड़ा आंतरिक अंग और रासायनिक कारखाना, जो भोजन पचाने, पित्त रस बनाने और हानिकारक तत्वों को विषमुक्त करने का कार्य करता है।',
    size: 'Spans ~20–22 cm transversely',
    weight: '1.4–1.6 kg',
    location: 'Right upper quadrant (hypochondriac and epigastric regions), sheltered under ribs 7–11',
    functionDesc: 'Bile synthesis, glycogen storage, protein synthesis (albumin, clotting factors), lipid metabolism, and ammonia detoxification.',
    dailyFact: 'Filters ~1.5 liters of blood every single minute, processing all nutrients absorbed from the gastrointestinal tract.',
    medical: 'Has remarkable regenerative capacity; up to 70% of hepatic tissue can be surgically excised and will regrow within weeks.',
    bloodSupply: 'Dual blood inflow: Hepatic Portal Vein (75% nutrient-rich) and Proper Hepatic Artery (25% oxygenated).',
    funFact: 'Ancient Greek myth of Prometheus having his liver eaten daily by an eagle reflects an early intuition of liver regeneration.',
    tissue: 'Hexagonal hepatic lobules with central veins and radiating hepatocyte cords',
    comparison: 'Liver vs. Intestine (Enterohepatic Nutrient Axis)',
    conditions: [
      'Non-Alcoholic Fatty Liver Disease (NAFLD)',
      'Viral Hepatitis (A, B, C, E)',
      'Hepatic Cirrhosis (Fibrosis)',
      'Gallstones & Cholelithiasis',
      'Hepatocellular Carcinoma',
      'Jaundice (Hyperbilirubinemia)',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Secretes bile juice, which does not contain enzymes but emulsifies large fat globules into tiny droplets for lipase.',
      'Bile provides an alkaline medium in the small intestine to activate pancreatic enzymes.',
      'Stores excess glucose as glycogen and converts toxic ammonia to urea for kidney excretion.',
    ],
    hotspots: [
      {
        id: 'right-lobe',
        name: 'Right Lobe of Liver',
        nameHi: 'दायां यकृत खंड',
        ta: 'Lobus hepatis dexter',
        detail: 'Dominant anatomical lobe comprising ~80% of liver volume, divided into anterior and posterior segments.',
        detailHi: 'यकृत का सबसे बड़ा खंड, जो अधिकांश चयापचय कार्य संभालता है।',
        position: [-0.75, 0.35, 0.75],
        color: '#ee7c6a',
      },
      {
        id: 'left-lobe',
        name: 'Left Lobe of Liver',
        nameHi: 'बायां यकृत खंड',
        ta: 'Lobus hepatis sinister',
        detail: 'Flattened, triangular lobe crossing the midline into the left epigastrium, anterior to the stomach.',
        detailHi: 'यकृत का बायां भाग जो पेट (आमाशय) के ठीक ऊपर स्थित होता है।',
        position: [0.85, 0.25, 0.75],
        color: '#f2a33b',
      },
      {
        id: 'portal',
        name: 'Hepatic Portal Vein & Porta Hepatis',
        nameHi: 'यकृत प्रवेशिका शिरा',
        ta: 'Vena portae hepatis',
        detail: 'Gateway bringing venous effluent from digestive stomach, spleen, and intestines directly to liver sinusoids.',
        detailHi: 'आंतों से अवशोषित पोषक तत्वों से भरपूर रक्त को यकृत में लाने वाली मुख्य शिरा।',
        position: [0.1, -0.3, 0.82],
        color: '#6393d8',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'gallbladder',
        name: 'Gallbladder & Cystic Duct',
        nameHi: 'पित्ताशय',
        ta: 'Vesica biliaris',
        detail: 'Muscular reservoir resting in the visceral fossa, storing and concentrating bile up to 10-fold until CCK hormonal trigger.',
        detailHi: 'यकृत के नीचे स्थित थैली जो पित्त रस को जमा और गाढ़ा करती है।',
        position: [-0.35, -0.65, 0.7],
        color: '#10b981',
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. KIDNEYS (Renes)
  // -------------------------------------------------------------
  {
    id: 'kidneys',
    name: 'Kidneys',
    nameHi: 'वृक्क (गुर्दे)',
    system: 'Urinary & Excretory System',
    systemHi: 'उत्सर्जन तंत्र',
    scientificName: 'Renes',
    poetic: 'The Master Liquid Filters',
    model: '/models/kidneys.glb',
    icon: '∞',
    accent: '#c96963',
    illustrated: true,
    description:
      'Paired bean-shaped retroperitoneal organs that purify the bloodstream by ultrafiltration, reclaiming water and salts while excreting nitrogenous urea.',
    descriptionHi:
      'शरीर के दोनों ओर रीढ़ के पास स्थित सेम के बीज के आकार के दो अंग, जो रक्त को छानकर मूत्र बनाते हैं और शरीर में जल-लवण संतुलन बनाए रखते हैं।',
    size: 'Each kidney is ~11 cm long, 6 cm wide, 3 cm thick',
    weight: '130–160 grams each',
    location: 'Retroperitoneal on posterior abdominal wall between T12 and L3 vertebrae; right sits slightly lower due to liver',
    functionDesc: 'Osmoregulation, blood filtration, erythropoietin secretion (stimulates RBC production), renin blood pressure control, and Vitamin D activation.',
    dailyFact: 'Filters ~180 liters of blood plasma daily, reabsorbing over 99% of filtrate and releasing only 1.5–2 liters of urine.',
    medical: 'Each kidney contains ~1.2 million microscopic filtering units called Nephrons.',
    bloodSupply: 'Renal arteries arising directly from the abdominal aorta; receive 22% of total cardiac output.',
    funFact: 'You can lead a completely normal, healthy life with just one functioning kidney, which will hypertrophy to compensate.',
    tissue: 'Renal cortex (glomeruli & convoluted tubules) and Renal medulla (pyramids and Henle loops)',
    comparison: 'Kidneys vs. Liver (Biochemical Detox & Elimination)',
    conditions: [
      'Chronic Kidney Disease (CKD)',
      'Renal Calculi (Kidney Stones)',
      'Glomerulonephritis',
      'Urinary Tract Infections (Pyelonephritis)',
      'Polycystic Kidney Disease (PKD)',
      'Diabetic Nephropathy & Uremia',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Basic filtration unit is the Nephron, containing a cup-shaped Bowman capsule enclosing a capillary glomerulus.',
      'Initial filtrate contains glucose, amino acids, salts, and major water, which are selectively reabsorbed as urine flows down the tubule.',
      'Urine travels through ureters into the urinary bladder, where it is stored until urethral micturition.',
    ],
    hotspots: [
      {
        id: 'cortex',
        name: 'Renal Cortex',
        nameHi: 'वृक्क वल्कुट (कोर्टेक्स)',
        ta: 'Cortex renalis',
        detail: 'Outer granular zone containing glomeruli, Bowman capsules, proximal & distal convoluted tubules where initial ultrafiltration occurs.',
        detailHi: 'गुर्दे की बाहरी परत जहां लाखों नेफ्रॉन द्वारा रक्त छानने की प्रक्रिया शुरू होती है।',
        position: [-0.9, 0.55, 0.7],
        color: '#ee7c6a',
      },
      {
        id: 'medulla',
        name: 'Renal Medulla & Pyramids',
        nameHi: 'वृक्क मज्जा (मेडुला)',
        ta: 'Medulla renalis',
        detail: 'Inner striated zone containing 8–18 conical pyramids with loops of Henle that establish osmotic countercurrent concentration.',
        detailHi: 'गुर्दे का भीतरी भाग जहां मूत्र को सांद्र (गाढ़ा) बनाया जाता है।',
        position: [0.85, 0.2, 0.7],
        color: '#f2a33b',
      },
      {
        id: 'ureter',
        name: 'Ureter',
        nameHi: 'मूत्रवाहिनी',
        ta: 'Ureter',
        detail: 'Smooth muscle muscular duct utilizing rhythmic peristaltic contractions to propel urine downward into urinary bladder.',
        detailHi: 'गुर्दे से मूत्र को मूत्राशय तक पहुंचाने वाली पेशीय नली।',
        position: [0.4, -1.1, 0.5],
        color: '#6393d8',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'renal-pelvis',
        name: 'Renal Pelvis & Calyces',
        nameHi: 'वृक्क श्रोणि (पेल्विस)',
        ta: 'Pelvis renalis',
        detail: 'Funnel-shaped upper dilated terminal of the ureter gathering urine flowing from major and minor calyces.',
        detailHi: 'गुर्दे के केंद्र में स्थित कीप के आकार का क्षेत्र जहां मूत्र एकत्र होकर मूत्रवाहिनी में जाता है।',
        position: [0.1, 0.05, 0.65],
        color: '#10b981',
      },
    ],
  },

  // -------------------------------------------------------------
  // 6. EYE (Oculus)
  // -------------------------------------------------------------
  {
    id: 'eyeball',
    name: 'Eye',
    nameHi: 'नेत्र (आंख)',
    system: 'Special Sensory System',
    systemHi: 'संवेदी तंत्र',
    scientificName: 'Oculus',
    poetic: 'A Window Made of Light',
    model: '/models/eyeball.glb',
    icon: '⊙',
    accent: '#7294b9',
    illustrated: true,
    description:
      'A spherical optical instrument that focuses electromagnetic photons through refractive corneo-lenticular media onto photoreceptive retinal neuroepithelium.',
    descriptionHi:
      'एक गोलाकार संवेदी अंग जो प्रकाश किरणों को केंद्रित करके रेटिना पर चित्र बनाता है और मस्तिष्क को दृश्य संकेत भेजता है।',
    size: 'Anteroposterior diameter ~24 mm',
    weight: '7.5 grams',
    location: 'Enclosed in protective fat cushioning inside the bony facial orbit of the skull',
    functionDesc: 'Visual photoreception, binocular stereopsis, depth perception, pupillary light reflex, and circadian phase setting.',
    dailyFact: 'Executes over 100,000 saccadic micro-movements each day and focuses on thousands of objects effortlessly.',
    medical: 'Cornea is avascular; it obtains oxygen directly by diffusion from the atmospheric air and aqueous humor.',
    bloodSupply: 'Ophthalmic artery (from internal carotid) and Central Retinal Artery.',
    funFact: 'The human eye can distinguish approximately 10 million distinct shades of colour through combinations of 3 cone pigments (RGB).',
    tissue: 'Corneal stroma, Crystalline lens proteins, and 10-layer retinal neurosensory architecture',
    comparison: 'Eye vs. Brain (Sensory Transduction to Cortical Vision)',
    conditions: [
      'Myopia (Near-sightedness) & Hyperopia',
      'Cataract (Lens Clouding)',
      'Glaucoma (Optic Neuropathy / Intraocular Pressure)',
      'Age-related Macular Degeneration (AMD)',
      'Retinal Detachment',
      'Astigmatism & Presbyopia',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 11: The eye lens forms an inverted, real image of the object on the retina.',
      'Ciliary muscles modify the curvature of the eye lens to focus near or distant objects (Power of Accommodation).',
      'Rods detect low light intensity (scotopic); Cones detect bright light and colour nuances (photopic).',
    ],
    hotspots: [
      {
        id: 'cornea',
        name: 'Cornea',
        nameHi: 'स्वच्छमंडल (कॉर्निया)',
        ta: 'Cornea',
        detail: 'Transparent convex anterior ocular dome providing roughly two-thirds (~43 diopters) of the eye’s total refractive power.',
        detailHi: 'आंख की सबसे आगे की पारदर्शी खिड़की जो प्रकाश को अंदर आने और मुड़ने में मदद करती है।',
        position: [-0.94, 0.05, 1.47],
        color: '#6393d8',
      },
      {
        id: 'iris',
        name: 'Iris & Pupil',
        nameHi: 'परितारिका एवं पुतली (आयरिस)',
        ta: 'Iris et Pupilla',
        detail: 'Pigmented muscular diaphragm with sphincter and dilator pupillae muscles modulating pupil diameter to regulate light entry.',
        detailHi: 'आंख का रंगीन हिस्सा जो पुतली के आकार को नियंत्रित करके भीतर जाने वाले प्रकाश की मात्रा तय करता है।',
        position: [-1.22, -0.53, 1.15],
        color: '#f2a33b',
      },
      {
        id: 'optic',
        name: 'Optic Nerve (Cranial Nerve II)',
        nameHi: 'दृष्टि तंत्रिका (ऑप्टिक नर्व)',
        ta: 'Nervus opticus',
        detail: 'Bundle of ~1.2 million retinal ganglion cell axons exiting posterior pole of eyeball transmitting visual action potentials to brain.',
        detailHi: 'रेटिना से दृश्य संकेतों को मस्तिष्क के दृष्टि केंद्र तक ले जाने वाली मुख्य तंत्रिका।',
        position: [1.61, -0.18, 0.54],
        color: '#d89bc4',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'sclera',
        name: 'Sclera (White of Eye)',
        nameHi: 'श्वेतपटल (स्क्लेरा)',
        ta: 'Sclera',
        detail: 'Dense, opaque fibrous collagenous protective envelope maintaining spherical intraocular pressurization and muscle anchors.',
        detailHi: 'आंख का बाहरी सफेद और मजबूत सुरक्षात्मक आवरण।',
        position: [0.1, 0.85, 0.85],
        color: '#ffffff',
      },
      {
        id: 'retina',
        name: 'Retina & Macula',
        nameHi: 'दृष्टिपटल (रेटिना)',
        ta: 'Retina',
        detail: 'Delicate sensory inner lining containing rods and cones that convert photon light energy into neurochemical signals.',
        detailHi: 'आंख का भीतरी पर्दा जिस पर वस्तु का वास्तविक और उल्टा प्रतिबिंब बनता है।',
        position: [1.1, 0.45, 0.75],
        color: '#ef4444',
      },
    ],
  },

  // -------------------------------------------------------------
  // 7. INTESTINE (Intestinum)
  // -------------------------------------------------------------
  {
    id: 'intestine',
    name: 'Intestines',
    nameHi: 'आंतें (क्षुद्रांत्र एवं बृहदांत्र)',
    system: 'Gastrointestinal System',
    systemHi: 'पाचन तंत्र',
    scientificName: 'Intestinum',
    poetic: 'The Inner Garden of Absorption',
    model: '/models/intestine.glb',
    icon: '§',
    accent: '#d78b77',
    illustrated: true,
    description:
      'The extensive convoluted digestive tract where chemical enzymolysis completes and microvilli absorb nutrients, electrolytes, and water into the mesenteric blood.',
    descriptionHi:
      'भोजन के पाचन और पोषक तत्वों के अवशोषण की मुख्य नली, जो लगभग 6 से 7 मीटर लंबी और अत्यधिक मुड़ी हुई होती है।',
    size: 'Small intestine ~6 meters; Large intestine ~1.5 meters',
    weight: 'Varies with digestive contents (~2 kg dry tissue)',
    location: 'Fills umbilical, hypogastric, and both lumbar abdominal quadrants',
    functionDesc: 'Nutrient absorption (glucose, amino acids, lipids), water reclamation, and microbiome synthesis of Vitamins K and B12.',
    dailyFact: 'Hosts over 38 trillion commensal microorganisms (gut microbiome) outnumbering our own human body cells.',
    medical: 'Intestinal mucosa possesses the fastest cellular turnover in the human body, regenerating its entire lining every 3–5 days.',
    bloodSupply: 'Superior and inferior mesenteric arteries, drained by the hepatic portal system.',
    funFact: 'Often called the "Second Brain" (Enteric Nervous System), containing 500 million neurons and producing 90% of the body’s serotonin.',
    tissue: 'Simple columnar epithelium with brush-border microvilli and Goblet mucus cells',
    comparison: 'Intestine vs. Liver (Mesenteric Absorption to Hepatic Processing)',
    conditions: [
      'Celiac Disease & Gluten Enteropathy',
      'Inflammatory Bowel Disease (Crohn’s & Ulcerative Colitis)',
      'Irritable Bowel Syndrome (IBS)',
      'Acute Appendicitis',
      'Colorectal Polyps & Diverticulitis',
      'Intestinal Mechanical Obstruction',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Small intestine is the site of complete digestion of carbohydrates, proteins, and fats.',
      'Receives pancreatic juice containing Trypsin (proteins), Amylase (starch), and Lipase (emulsified fats).',
      'Finger-like projections called Villi increase the surface area enormously and are richly supplied with blood vessels and lymph lacteals.',
    ],
    hotspots: [
      {
        id: 'duodenum',
        name: 'Duodenum (C-Loop)',
        nameHi: 'ग्रहणी (ड्यूओडेनम)',
        ta: 'Duodenum',
        detail: 'First 25 cm of small intestine receiving acidic gastric chyme, pancreatic digestive enzymes, and alkaline hepatic bile.',
        detailHi: 'छोटी आंत का पहला सी-आकार का हिस्सा जहां यकृत से पित्त और अग्न्याशय से पाचक रस मिलते हैं।',
        position: [0.6, 0.8, 0.75],
        color: '#f2a33b',
      },
      {
        id: 'jejunum',
        name: 'Jejunum & Ileum',
        nameHi: 'अग्रक्षुद्रांत्र एवं क्षुद्रांत्र (जेजुनम)',
        ta: 'Jejunum et Ileum',
        detail: 'Primary absorptive tract (~5.5 m) densely carpeted with circular plicae and villi absorbing digested nutrients into capillaries.',
        detailHi: 'पचे हुए भोजन से पोषक तत्वों को रक्त में सोखने वाला सबसे लंबा हिस्सा।',
        position: [-0.45, 0.1, 0.82],
        color: '#ee7c6a',
      },
      {
        id: 'colon',
        name: 'Large Intestine (Colon)',
        nameHi: 'बड़ी आंत (कोलन)',
        ta: 'Colon',
        detail: 'Reabsorbs water and mineral electrolytes from indigestible residue, compacting and forming solid fecal matter.',
        detailHi: 'अपशिष्ट से पानी और लवण सोखकर मल तैयार करने वाला अंतिम भाग।',
        position: [0.75, -0.55, 0.72],
        color: '#6393d8',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'appendix',
        name: 'Vermiform Appendix',
        nameHi: 'अपेंडिक्स (कृमिरूप परिशेषिका)',
        ta: 'Appendix vermiformis',
        detail: 'Blind tubular lymphoid diverticulum arising from posteromedial cecum, acting as a reservoir for symbiotic gut flora.',
        detailHi: 'बड़ी आंत के मुहाने पर स्थित छोटी उंगली जैसी रचना, जो आंत के मित्र जीवाणुओं का सुरक्षित भंडार है।',
        position: [-0.85, -0.95, 0.75],
        color: '#10b981',
      },
    ],
  },

  // -------------------------------------------------------------
  // 8. PANCREAS (Pancreas)
  // -------------------------------------------------------------
  {
    id: 'pancreas',
    name: 'Pancreas',
    nameHi: 'अग्न्याशय (पैंक्रियास)',
    system: 'Endocrine & Exocrine System',
    systemHi: 'अंतःस्रावी एवं बाह्यस्रावी तंत्र',
    scientificName: 'Pancreas',
    poetic: 'The Dual Glandular Regulator',
    model: '/models/pancreas.glb',
    icon: '◈',
    accent: '#c69a5e',
    illustrated: true,
    description:
      'A dual-action retroperitoneal glandular organ: exocrine acini produce digestive enzymes, while endocrine Islets of Langerhans secrete insulin and glucagon.',
    descriptionHi:
      'एक मिश्रित ग्रंथि जो भोजन पचाने के लिए पाचक रस और रक्त शर्करा (ग्लूकोज) नियंत्रित करने के लिए इंसुलिन हार्मोन बनाती है।',
    size: 'Length ~15 cm, thickness ~2–3 cm',
    weight: '70–100 grams',
    location: 'Behind the stomach, stretched transversely across posterior abdominal wall from duodenal curve to spleen',
    functionDesc: 'Secretes pancreatic juice (Trypsin, Chymotrypsin, Lipase, Amylase) and releases insulin/glucagon to stabilize blood glucose.',
    dailyFact: 'Produces ~1.5 liters of enzyme-rich alkaline pancreatic juice every single day.',
    medical: 'Destruction of pancreatic beta-cells causes Type 1 Diabetes Mellitus requiring exogenous insulin therapy.',
    bloodSupply: 'Splenic artery, superior and inferior pancreaticoduodenal arteries.',
    funFact: 'Only 1–2% of pancreatic tissue is endocrine (the islets); the remaining 98% is dedicated entirely to digestive enzymology.',
    tissue: 'Serous acinar cells (exocrine) and Islets of Langerhans (endocrine alpha & beta cells)',
    comparison: 'Pancreas vs. Liver (Hormonal Glycemic Feedback Loop)',
    conditions: [
      'Acute & Chronic Pancreatitis',
      'Type 1 & Type 2 Diabetes Mellitus',
      'Pancreatic Adenocarcinoma',
      'Exocrine Pancreatic Insufficiency (EPI)',
      'Pancreatic Cysts & Pseudocysts',
      'Insulinoma (Neuroendocrine tumor)',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Pancreatic enzymes include Trypsin for digesting proteins and Lipase for breaking down emulsified fats.',
      'NCERT Class 10 Ch 7: Insulin hormone regulates blood sugar levels; deficient secretion leads to Diabetes.',
    ],
    hotspots: [
      {
        id: 'head',
        name: 'Pancreatic Head',
        nameHi: 'अग्न्याशय का शीर्ष (हेड)',
        ta: 'Caput pancreatis',
        detail: 'Broadest, right-most segment nestled tightly within the C-shaped concavity of the duodenum.',
        detailHi: 'अग्न्याशय का चौड़ा सिरा जो छोटी आंत की ग्रहणी में समाया होता है।',
        position: [-1.32, -0.36, 0.55],
        color: '#ee7c6a',
      },
      {
        id: 'body',
        name: 'Pancreatic Body',
        nameHi: 'अग्न्याशय का मध्य भाग (बॉडी)',
        ta: 'Corpus pancreatis',
        detail: 'Central prismatic section crossing leftward over the abdominal aorta, superior mesenteric vessels, and left renal vein.',
        detailHi: 'अग्न्याशय का मध्य भाग जो रीढ़ के सामने से होकर गुजरता है।',
        position: [0.05, 0.25, 0.45],
        color: '#f2a33b',
      },
      {
        id: 'tail',
        name: 'Pancreatic Tail',
        nameHi: 'अग्न्याशय की पूंछ (टेल)',
        ta: 'Cauda pancreatis',
        detail: 'Narrow tapered left extremity contacting the visceral hilum of the spleen; highest density of endocrine islets.',
        detailHi: 'अग्न्याशय का नुकीला बायां सिरा जो प्लीहा (तिल्ली) तक पहुंचता है।',
        position: [1.55, 0.3, 0.35],
        color: '#6393d8',
      },
      {
        id: 'duct',
        name: 'Main Pancreatic Duct (Wirsung)',
        nameHi: 'मुख्य अग्न्याशयी वाहिनी',
        ta: 'Ductus pancreaticus',
        detail: 'Traverses the gland from tail to head, uniting with common bile duct at the hepatopancreatic ampulla of Vater.',
        detailHi: 'पाचक रसों को अग्न्याशय से छोटी आंत तक ले जाने वाली मुख्य नली।',
        position: [-0.61, 0.39, 0.5],
        color: '#d89bc4',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'islets',
        name: 'Islets of Langerhans',
        nameHi: 'लैंगरहैंस की द्वीपिकाएं',
        ta: 'Insulae pancreaticae',
        detail: 'Microscopic endocrine clusters of Alpha (glucagon) and Beta (insulin) cells regulating systemic glucose homeostasis.',
        detailHi: 'इंसुलिन और ग्लूकागन हार्मोन बनाने वाली सूक्ष्म अंतःस्रावी कोशिकाएं।',
        position: [0.85, 0.32, 0.42],
        color: '#10b981',
      },
    ],
  },

  // -------------------------------------------------------------
  // 9. SKIN (Integumentum)
  // -------------------------------------------------------------
  {
    id: 'skin',
    name: 'Skin',
    nameHi: 'त्वचा (चर्म)',
    system: 'Integumentary System',
    systemHi: 'अध्यावरणी तंत्र',
    scientificName: 'Integumentum commune',
    poetic: 'The Living Protective Boundary',
    model: '/models/skin.glb',
    icon: '▦',
    accent: '#c99277',
    illustrated: true,
    description:
      'The body’s largest and heaviest organ, forming an elastic waterproof cutaneous barrier that protects against pathogens, UV radiation, and mechanical shearing.',
    descriptionHi:
      'शरीर का सबसे बड़ा सुरक्षात्मक आवरण जो रोगाणुओं को रोकता है, शरीर का तापमान संतुलित रखता है और स्पर्श का अनुभव कराता है।',
    size: 'Surface area of ~1.8–2.0 m² spread flat',
    weight: '3.5–5.0 kg (roughly 16% of total body mass)',
    location: 'External surface enveloping the entire anatomical body',
    functionDesc: 'Cutaneous sensation (touch, vibration, pain, thermal), thermoregulation (sweating & vasodilation), synthesis of Vitamin D3, and barrier defense.',
    dailyFact: 'Sheds approximately 30,000–40,000 dead keratinized skin cells every single minute (~500 million cells daily).',
    medical: 'Composed of three distinct anatomical layers: Epidermis (avascular epithelium), Dermis (collagenous connective tissue), and Hypodermis (subcutaneous fat).',
    bloodSupply: 'Subpapillary and subcutaneous vascular plexuses regulating peripheral thermoregulatory blood shunting.',
    funFact: 'Fingerprints (epidermal friction ridges) form during the 10th week of fetal development and remain unchanged throughout life.',
    tissue: 'Stratified squamous keratinized epithelium (epidermis) and dense irregular connective tissue (dermis)',
    comparison: 'Skin vs. Intestine (External vs. Internal Barrier Epithelia)',
    conditions: [
      'Atopic Dermatitis & Eczema',
      'Psoriasis (Keratinocyte hyperproliferation)',
      'Malignant Melanoma & Basal Cell Carcinoma',
      'Acne Vulgaris & Sebaceous blockage',
      'Severe Thermal Burns (1st, 2nd, 3rd degree)',
      'Vitiligo & Melanin pigmentary disorders',
    ],
    ncertNotes: [
      'NCERT Class 10 Ch 6: Skin excretes sweat containing water, NaCl, and small quantities of urea to cool the body and eliminate trace waste.',
      'Melanocyte cells in the basal epidermis produce melanin to shield cellular DNA against ultraviolet (UV) photodamage.',
    ],
    hotspots: [
      {
        id: 'epidermis',
        name: 'Epidermis',
        nameHi: 'उपत्वचा (एपिडर्मिस)',
        ta: 'Epidermis',
        detail: 'Outer avascular protective shield consisting of 5 distinct strata (Corneum, Lucidum, Granulosum, Spinosum, Basale).',
        detailHi: 'त्वचा की सबसे बाहरी परत जो रोगाणुओं से बचाती है और जलरोधी होती है।',
        position: [-0.05, 0.88, 1.4],
        color: '#ee7c6a',
      },
      {
        id: 'dermis',
        name: 'Dermis',
        nameHi: 'अंतस्त्वचा (डर्मिस)',
        ta: 'Dermis',
        detail: 'Tough elastic vascular core packed with collagen fibers, elastin, sensory receptors, hair roots, and capillary loops.',
        detailHi: 'त्वचा की मजबूत मध्य परत जिसमें रक्त नलिकाएं, तंत्रिकाएं और पसीने की ग्रंथियां होती हैं।',
        position: [0.29, 0.05, 1.4],
        color: '#f2a33b',
      },
      {
        id: 'hypodermis',
        name: 'Hypodermis (Subcutaneous Layer)',
        nameHi: 'अधस्त्वचा (सबक्युटेनियस परत)',
        ta: 'Tela subcutanea',
        detail: 'Deepest adipose and loose areolar layer anchoring the dermis to underlying fascia and skeletal muscles while providing thermal insulation.',
        detailHi: 'चर्बी वाली निचली परत जो शरीर को गर्म रखती है और झटकों से बचाती है।',
        position: [-0.39, -1.15, 1.4],
        color: '#6393d8',
      },
      {
        id: 'follicle',
        name: 'Hair Follicle & Shaft',
        nameHi: 'रोम कूप (बालों की जड़)',
        ta: 'Folliculus pili',
        detail: 'Tubular epidermal down-growth in the dermis generating keratinized hair filaments; attached to arrector pili muscles.',
        detailHi: 'त्वचा का वह भाग जहां से बाल निकलते हैं और बढ़ते हैं।',
        position: [0.89, -0.44, 1.4],
        color: '#d89bc4',
      },
      // FULLY NAMED MISSING STRUCTURES
      {
        id: 'sweat-gland',
        name: 'Sweat Gland (Sudoriferous)',
        nameHi: 'स्वेद ग्रंथि (पसीने की ग्रंथि)',
        ta: 'Glandula sudorifera',
        detail: 'Coiled tubular gland deep in the dermis secreting hypotonic watery sweat onto epidermal pores for evaporative thermal cooling.',
        detailHi: 'पसीना बनाकर शरीर का तापमान नियंत्रित रखने वाली ग्रंथि।',
        position: [0.65, -0.75, 1.4],
        color: '#10b981',
      },
      {
        id: 'sebaceous-gland',
        name: 'Sebaceous Gland',
        nameHi: 'सीबम ग्रंथि (तैल ग्रंथि)',
        ta: 'Glandula sebacea',
        detail: 'Multilobed lipid gland opening into hair follicles, secreting oily sebum to moisturize and acidify the cutaneous surface.',
        detailHi: 'प्राकृतिक तेल (सीबम) बनाने वाली ग्रंथि जो त्वचा और बालों को कोमल बनाए रखती है।',
        position: [0.55, -0.15, 1.4],
        color: '#f59e0b',
      },
    ],
  },
];
