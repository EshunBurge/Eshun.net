// src/data/about.js — the About Me page. Text from the previous About page, lightly edited.

export const about = {
  standfirst:
    'IB student, Florida TSA State Secretary, and the person who designs, codes, researches and photographs everything on this site.',
  paragraphs: [
    'I’m from Florida, and I love to spend my time competing in STEM competitions, building websites and traveling the world.',
    'As an International Baccalaureate Diploma Programme student, I’m interested in computer science, engineering and technology. Through middle and high school my experience has centered on STEM, through leadership, competition and research, with the Technology Student Association, HOSA–Future Health Professionals, the National STEM Honor Society and varsity swimming.',
    'I served as the 2025–26 Florida TSA State Reporter and was elected to serve as the 2026–27 Florida TSA State Secretary. Through TSA I’ve competed at the district, state and national levels, earning awards in website design, software development, public speaking and graphic design.',
    'Alongside leadership and competition, I take part in my school’s Research Program, conducting independent STEM research and competing in science and engineering fairs. My research has advanced to the State Science and Engineering Fair and received state-level recognition. Outside of research, I stay involved in STEM outreach and mentorship for younger students entering technical and competitive programs.',
    'In August 2026 I founded Tesh Technology, a digital software firm. We build beyond customer expectations, with websites, apps, AI automation and other software products, designing thoughtful digital experiences that move people forward.',
  ],
  currently: [
    { label: 'Office', value: 'Florida TSA State Secretary, 2026–27' },
    { label: 'Founder', value: 'Tesh Technology' },
    { label: 'Student', value: 'IB Diploma Programme' },
    { label: 'Cohort', value: 'Youth Leadership Sarasota, Class of 2027' },
    { label: 'Community', value: 'SWENext Influencer, Society of Women Engineers' },
  ],
};

// From the summary on Eshun's CV.
export const aspiration =
  'As an aspiring engineer, I’m passionate about technology and STEM. I hope to one day build technology that makes a meaningful impact on the world.';

// From her résumé and CV.
export const education = {
  school: 'Southeast High School',
  programme: 'International Baccalaureate (IB) Diploma Programme',
  years: '2024–present',
  grade: 'Currently in 11th grade',
  gpa: [{ value: '4.00', label: 'Unweighted GPA' }, { value: '4.62', label: 'Weighted GPA' }],
  courses: [
    { group: 'IB courses', items: ['Design Technology', 'Chemistry', 'History of the Americas', 'English A: Language & Literature', 'Spanish', 'Theory of Knowledge'] },
    { group: 'AP courses', items: ['Calculus AB', 'Physics 1', 'Computer Science A', 'Computer Science Principles', 'Precalculus', 'English Literature', 'World History'] },
    { group: 'Research courses', items: ['Research Science and Engineering III', 'Experimental Science Research'] },
  ],
};

// "Main area of interest" on her CV.
export const researchInterest = {
  title: 'The integration of machine learning in healthcare',
  areas: ['Machine learning for big data analysis', 'Machine learning in disease prediction', 'Mitigating bias in machine learning'],
  why: [
    'I want to pursue this field because I am fascinated by how machine learning can strengthen healthcare systems. My interest stems from the growing use of machine learning in healthcare and the ethical risks that arise when predictive models are deployed without careful evaluation of fairness.',
    'Pediatric type 2 diabetes is a particularly compelling context: early detection can significantly improve long-term outcomes, yet access to care and data completeness vary widely across populations. I am driven by the concern that algorithmic tools, if left unexamined, could systematically under-identify disease in children who are already underserved.',
  ],
};

// Tesh Technology, in the words of its own website (teshtechnology.com).
export const venture = {
  name: 'Tesh Technology',
  motto: 'Build Beyond.',
  role: 'Founder & Owner, since August 2026',
  text: 'A digital software firm I founded in August 2026. It designs and builds websites, custom software and AI automation, and the person who scopes each project is the person who writes the code.',
  services: [
    { title: 'Websites', text: 'Marketing sites, web apps and e-commerce.' },
    { title: 'Custom software', text: 'Minimum viable products, internal tools and integrations.' },
    { title: 'AI automation', text: 'Agents, workflows and document processing.' },
  ],
  href: 'https://teshtechnology.com/',
};
