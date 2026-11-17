// src/data/archive.js — roles, awards and records (SUCC·ESHUN).
// Transcribed from the "Experience & Leadership" timeline on the previous
// eshun.net (itself taken from LinkedIn). Month precision is kept where it
// existed; `end: null` means ongoing. Street-level locations and the middle
// school's name were left out on purpose.

export const organisations = [
  { id: 'tsa', name: 'Technology Student Association', short: 'TSA', since: '2021' },
  { id: 'nstem', name: 'National STEM Honor Society', short: 'NSTEM', since: '2023' },
  { id: 'hosa', name: 'HOSA — Future Health Professionals', short: 'HOSA', since: '2025' },
  { id: 'school', name: 'Southeast High School', short: 'Southeast HS', since: '2024' },
  { id: 'tesh', name: 'Tesh Technology', short: 'Tesh', since: '2026' },
  { id: 'swe', name: 'Society of Women Engineers', short: 'SWE', since: '2026' },
  { id: 'chamber', name: 'Greater Sarasota Chamber of Commerce', short: 'Chamber', since: '2026' },
  { id: 'gwc', name: 'Girls Who Code', short: 'GWC', since: '2026' },
  { id: 'racing', name: 'STEM Racing (F1 in Schools)', short: 'STEM Racing', since: '2024' },
  { id: 'piano', name: 'Joyce Piano Company', short: 'Piano', since: '2014' },
  { id: 'manatee', name: 'Junior Leadership Manatee', short: 'Junior Leadership Manatee', since: '2026' },
];

// [year, month] — month 1–12
export const roles = [
  {
    org: 'tesh', title: 'Founder & Owner', start: [2026, 8], end: null, kind: 'venture',
    text: 'Founded Tesh Technology, a digital software firm that builds websites, apps, AI automation and other software products — designing thoughtful digital experiences that move people forward.',
    href: 'https://teshtechnology.com/',
  },
  {
    org: 'swe', title: 'SWENext Influencer', start: [2026, 8], end: null, kind: 'community',
    text: 'Selected as one of approximately 50 students for the Society of Women Engineers’ one-year SWENext leadership program. Creating STEM and leadership content for SWE’s platforms, recruiting new SWENext members and connecting with mentors in SWE’s professional network.',
  },
  {
    org: 'school', title: 'Research Program — Student Advisory Council', start: [2026, 8], end: null, kind: 'research',
    text: 'Selected for the student leadership team supporting the growth of the Southeast High School Research Program: strengthening research culture, supporting events and symposiums, outreach and recruitment, and mentoring fellow researchers.',
  },
  {
    // From Eshun's 2026 résumé (the month is not given; August keeps it in order).
    org: 'manatee', title: 'Junior Leadership Manatee, Class Member 2026–27', start: [2026, 8], yearOnly: true, end: null, kind: 'leadership',
    text: 'Selected as one of 20 Manatee County juniors for a civic leadership program: monthly program days on government, health and human needs, and business, with site visits and conversations with community leaders.',
  },
  {
    org: 'chamber', title: 'Youth Leadership Sarasota, Class of 2027', start: [2026, 7], end: null, kind: 'leadership',
    text: 'A competitive, highly selective nine-month program of the Greater Sarasota Chamber of Commerce, exploring the diversity and complexity of the community through monthly experiential sessions.',
  },
  {
    org: 'gwc', title: 'Summer Pathways 2026', start: [2026, 6], end: null, kind: 'learning',
    text: 'The selective Girls Who Code Summer Pathways program: core computer-science and programming concepts, including data science and artificial intelligence, building purposeful projects with peers in a global network.',
  },
  {
    org: 'tsa', title: 'Chapter Vice President, 2026–27', start: [2026, 5], end: null, kind: 'leadership',
    text: 'One of six officers of the Southeast High School chapter, working alongside the advisors and officer team to guide meetings.',
  },
  {
    org: 'nstem', title: 'Chapter Vice President, 2026–27', start: [2026, 5], end: null, kind: 'leadership',
    text: 'One of six chapter officers. Created a mentorship program that guides elementary and middle-school students through their science-fair projects.',
  },
  {
    // From the 2026 résumé, which lists the role without dates.
    org: 'nstem', title: 'National Student Advisory Council Board Member', start: null, end: null, kind: 'leadership',
    text: 'A member of the National STEM Honor Society’s National Student Advisory Council board.',
  },
  {
    org: 'tsa', title: 'Florida TSA State Secretary, 2026–27', start: [2026, 3], end: null, kind: 'leadership', highlight: true,
    text: 'One of six state officers representing over 30,000 middle- and high-school members — implementing initiatives, organizing conferences and keeping chapters connected across the state.',
  },
  {
    org: 'nstem', title: 'Tutoring Committee — Founder & Coordinator', start: [2026, 1], end: null, kind: 'community',
    text: 'Founded the chapter’s Tutoring Committee: visiting local elementary and middle schools to advise students on how to start and carry out a science-fair project.',
  },
  {
    org: 'hosa', title: 'Chapter Founder & Co-President', start: [2025, 8], end: null, kind: 'leadership', highlight: true,
    text: 'Advocated for the school to start a HOSA chapter, then built it from the ground up with fellow officers: expanded outreach, grew it to more than 15 members and prepared to compete at the regional, state and national levels.',
  },
  {
    org: 'school', title: 'Student Researcher — Research Program', start: [2025, 8], end: null, kind: 'research',
    text: 'Independent STEM research: developing original research questions, designing experiments and presenting findings at regional, state and national competitions, working alongside STEM professionals.',
  },
  {
    org: 'school', title: 'Varsity Swim Team Captain', start: [2025, 8], end: null, kind: 'athletics',
    text: 'Led the team through practices and competitions, and grew the team by more than five members.',
    notes: ['2025–26 Distinguished Captain Award', '2026 Regional Qualifier'],
  },
  {
    org: 'nstem', title: 'Conrad Challenge Competitor', start: [2025, 8], end: null, kind: 'research',
    text: 'Designed and developed our Conrad Challenge entry — a solar-powered diabetes care kit for underserved communities.',
    notes: ['Conrad Challenge Innovator Award'],
  },
  {
    org: 'tsa', title: 'Florida TSA State Reporter, 2025–26', start: [2025, 6], end: [2026, 6], kind: 'leadership', highlight: true,
    text: 'One of six state officers representing over 30,000 middle- and high-school members — implementing initiatives, organizing conferences and keeping chapters connected.',
    notes: ['Florida: “State with the Most Growth” award, 2026 National TSA Conference'],
  },
  {
    org: 'tsa', title: 'Chapter Treasurer, 2025–26', start: [2025, 6], end: [2026, 6], kind: 'leadership',
    text: 'One of six officers of the Southeast High School chapter, working alongside the advisors and officer team.',
    notes: ['Chapter placed in the top ten overall, 2026 Florida State Conference', '2nd-place chapter, Flight Plan — 2025 Florida Leadership Conference'],
  },
  {
    org: 'nstem', title: 'Chapter Webmaster, 2025–26', start: [2025, 5], end: [2026, 6], kind: 'leadership',
    text: 'Reached new members by building the chapter a website and a social-media presence, and kept the site current every week.',
    href: '/southeast-nstem/',
  },
  {
    org: 'racing', title: 'Executive Graphic Designer', start: [2024, 8], end: [2025, 5], kind: 'design',
    text: 'Designed team logos, social media posts, brochures, pamphlets and presentations for the school’s Formula 1 in Schools (now STEM Racing) team, which won the 2024–25 Florida State Championship and placed in the top 10 in the Eastern Region at the national level.',
  },
  {
    org: 'school', title: 'Varsity Swim Team', start: [2024, 8], end: null, kind: 'athletics',
    text: 'Practices, meets and team events — and, from 2025, the captaincy.',
    notes: ['2024–25 Season MVP Award'],
  },
  {
    org: 'nstem', title: 'Science Fair Competitor', start: [2023, 8], end: null, kind: 'research',
    text: 'Three seasons of science and engineering fairs, from the school floor to the state fair.',
    href: '/science-projects/',
  },
  {
    org: 'tsa', title: 'Middle-school Chapter Secretary, 2023–24', start: [2023, 6], end: [2024, 7], kind: 'leadership',
    text: 'One of six chapter officers. Helped take the chapter from 14th to 6th overall in the state.',
  },
  {
    org: 'tsa', title: 'TSA Member & National Competitor', start: [2021, 8], end: null, kind: 'competition',
    text: 'Four-time national competitor: six events at the 2023, 2024 and 2026 National Conferences and five in 2025. National TSA Officer Candidate at the 2026 National Conference.',
  },
  {
    org: 'piano', title: 'Pianist', start: [2014, 8], end: null, kind: 'music',
    text: 'Twelve years at the piano, practicing more than eight hours a week with regular lessons, and playing recitals and competitions for large audiences across a wide range of styles.',
  },
];

// National conference trips (for the timeline's markers)
export const nationals = [
  { year: 2023, city: 'Louisville, KY', events: 6 },
  { year: 2024, city: 'Orlando, FL', events: 6 },
  { year: 2025, city: 'Nashville, TN', events: 5 },
  { year: 2026, city: 'Washington, DC', events: 6, note: 'National Officer Candidate' },
];

// Highlights (the old "Awards" list). level: National | State | Regional | School
export const awards = [
  { year: 2026, title: 'Sunshine State STEM Scholar Nominee', org: 'Florida', level: 'State' },
  { year: 2026, title: 'Office of Naval Research Science Award', org: 'Regional Science & Engineering Fair', level: 'Regional', href: '/pediatric-diabetes-ml/' },
  { year: 2026, title: 'Recognition Award', org: 'State Science & Engineering Fair of Florida', level: 'State', href: '/pediatric-diabetes-ml/' },
  { year: 2026, title: 'Conrad Challenge Innovator Award', org: 'Conrad Challenge', level: 'National' },
  { year: 2026, title: '1st Place, Sunbeam Tampa Hackathon', org: 'Hack Club — In Another Life', level: 'Hackathon', href: '/in-another-life/' },
  { year: 2026, title: '1st Place, Promotional Design', org: 'Technology Student Association', level: 'State' },
  { year: 2026, title: '1st Place, Promotional Design', org: 'Technology Student Association', level: 'Regional' },
  { year: 2026, title: '2nd Place, Webmaster', org: 'Technology Student Association — Visit Shark Tooth Bay', level: 'State', href: '/visit-shark-tooth-bay/' },
  { year: 2025, title: '1st Place, Tech Bowl', org: 'Technology Student Association', level: 'State' },
  { year: 2025, title: '1st Place, Promotional Design', org: 'Technology Student Association', level: 'Regional' },
  { year: 2025, title: '4th Place, Webmaster', org: 'Technology Student Association — Verdurre', level: 'State', href: '/verdurre/' },
  { year: 2025, title: '4th Place, Software Development', org: 'Technology Student Association — EcoMatch', level: 'State', href: '/ecomatch/' },
  { year: 2023, title: '1st Place, Website Design', org: 'Technology Student Association — Ocean Buddies', level: 'National', href: '/ocean-buddies/' },
  { year: 2023, title: '3rd Place, Inventions & Innovations', org: 'Technology Student Association', level: 'National' },
];

export const tsaRecord = {
  total: 42,
  totalNote: 'top-ten finishes across regional, state and national competition since 2021',
  middle: [
    '1st Place, Website Design — National',
    '3rd Place, Inventions & Innovations — National',
    '1st Place, Website Design — State',
    '2nd Place, Chapter Team — State',
    '3rd Place, Website Design — State',
    '3rd Place, Tech Bowl — State',
    'Five top-ten placements — Regional',
    'Nine top-ten placements — National',
    'Sixteen top-ten placements — State',
    'National qualifier: 2023 Louisville, KY · 2024 Orlando, FL',
  ],
  high: [
    '1st Place, Promotional Design — State, 2026',
    '1st Place, Promotional Design — Regional, 2025 & 2026',
    '1st Place, Tech Bowl — State, 2025',
    '2nd Place, Webmaster — State, 2026',
    '4th Place, Webmaster — State, 2025',
    '4th Place, Software Development — State, 2025',
    'Two top-ten placements — Regional',
    'Ten top-ten placements — State',
    '2025–26 National Officer Candidate',
    'National qualifier: 2025 Nashville, TN · 2026 Washington, DC',
  ],
};

export const scienceFair = [
  { season: '2025–26', school: '1st in Category — qualified for Regionals', regional: '2nd in Category · 1 of 13 students to qualify for State · Office of Naval Research Science Award', state: 'Recognition Award' },
  { season: '2024–25', school: '2nd in Category', regional: '2nd in Category' },
  { season: '2023–24', school: '1st in Category · 1st Overall', regional: '2nd in Category' },
];

export const otherHonours = [
  { group: 'Athletics — Varsity Swim', items: ['2024–25 Season MVP Award', '2025–26 Distinguished Captain Award'] },
  { group: 'Academic', items: ['College Board National Recognition Program', 'AP Scholar Award'] },
  { group: 'Certifications', items: ['Pre-Engineering Certification (REC Foundation)', 'Google AI Professional Certificate', 'Google AI Essentials Certificate'] },
];

// The tools she names on her résumé.
export const tools = [
  { group: 'Programming', items: ['Python', 'JavaScript', 'HTML', 'CSS'] },
  { group: 'Design', items: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe Lightroom'] },
];

export const toolkit = [
  { group: 'Software', items: ['Web development', 'Cross-platform mobile apps', 'Machine learning', 'Browser APIs', 'Accessible interfaces'] },
  { group: 'Design', items: ['Brand identity', 'Event branding', 'Promotional packets', 'Print & flyers', 'Campaign materials'] },
  { group: 'Research', items: ['Study design', 'Algorithmic fairness', 'Data analysis', 'Lab experimentation', 'Fair presentation'] },
  { group: 'Also', items: ['Video production', 'Digital marketing', 'CAD modeling', 'Photography', 'Public speaking'] },
];
