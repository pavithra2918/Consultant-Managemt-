const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for in-memory file uploads (no disk storage needed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ============================================================================
// HACKATHON IN-MEMORY DATABASE (Phase 3 Backend Persistence Engine)
// ============================================================================
const db = {
  consultants: {
    "1": {
      attendance: {},
      enrolledModules: [],        
      appliedJobs: []            
    }
  }
};

// Phase 5: Dynamic Admin Master Consultant Directory
const MASTER_CONSULTANTS = [
  { id: "1", name: "Aditya Sharma", department: "Java", skills: ["Java", "Spring Boot", "Microservices", "React", "PostgreSQL"], resumeStatus: "Pending" },
  { id: "2", name: "Priya Patel", department: "React", skills: ["React", "Redux", "TypeScript", "TailwindCSS", "Jest"], resumeStatus: "Updated" },
  { id: "3", name: "Rahul Verma", department: "Cloud", skills: ["AWS", "Docker", "Kubernetes", "Linux", "Terraform"], resumeStatus: "Pending" },
  { id: "4", name: "Sneha Gupta", department: "Java", skills: ["Java", "Hibernate", "REST API", "MongoDB"], resumeStatus: "Updated" },
  { id: "5", name: "Amit Kumar", department: "Data", skills: ["Python", "Machine Learning", "TensorFlow", "Pandas"], resumeStatus: "Pending" }
];

// Phase 4: Dynamic Matching Engines Datastores
const JOB_DATABASE = [
  { id: 101, title: 'Senior Backend Developer', client: 'Acme Corp', location: 'Remote', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'AWS'] },
  { id: 102, title: 'Full Stack Architect', client: 'Stark Industries', location: 'New York, NY', requiredSkills: ['React', 'Node.js', 'GraphQL', 'System Design'] },
  { id: 103, title: 'Data Scientist', client: 'Wayne Enterprises', location: 'Remote', requiredSkills: ['Python', 'TensorFlow', 'Machine Learning', 'SQL'] },
  { id: 104, title: 'Cloud Infrastructure Dev', client: 'Cyberdyne', location: 'Austin, TX', requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'] },
  { id: 105, title: 'React Frontend Engineer', client: 'Oscorp', location: 'Remote', requiredSkills: ['React', 'Redux', 'TypeScript', 'CSS3'] }
];

const COURSE_DATABASE = {
  'Node.js': { id: 'c-node', title: 'Node.js Masterclass REST APIs' },
  'Express': { id: 'c-express', title: 'Express.js Fundamentals' },
  'MongoDB': { id: 'c-mongo', title: 'NoSQL Database Modeling with MongoDB' },
  'AWS': { id: 'c-aws', title: 'AWS Cloud Practitioner Bootcamp' },
  'React': { id: 'c-react', title: 'Advanced React Patterns' },
  'GraphQL': { id: 'c-graphql', title: 'GraphQL Apollo Client Integration' },
  'System Design': { id: 'c-sys', title: 'System Design Interview Prep' },
  'Docker': { id: 'c-docker', title: 'Docker Containerization 101' },
  'Kubernetes': { id: 'c-k8s', title: 'Kubernetes Orchestration' },
  'Terraform': { id: 'c-terraform', title: 'Infrastructure as Code with Terraform' },
  'TypeScript': { id: 'c-ts', title: 'TypeScript for Frontend Devs' }
};

// Auto-seed the default attendance calendar for Consultant ID 1
Array.from({length: 31}, (_, i) => i + 1).forEach(day => {
  if (day > 25) db.consultants["1"].attendance[day] = 'future';
  else if ([6, 7, 13, 14, 20, 21].includes(day)) db.consultants["1"].attendance[day] = 'weekend';
  else if (day === 10) db.consultants["1"].attendance[day] = 'absent';
  else if (day === 18) db.consultants["1"].attendance[day] = 'leave';
  else db.consultants["1"].attendance[day] = 'present';
});

// Comprehensive list of IT skills for keyword matching
const SKILL_ONTOLOGY = [
  'Java', 'Python', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Ruby', 'Go', 'PHP', 'Swift', 'Rust',
  'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'NoSQL', 'Redis', 'Cassandra', 'Elasticsearch',
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD',
  'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Data Science', 'Spark', 'Hadoop', 'Kafka',
  'HTML5', 'CSS3', 'SASS', 'Tailwind', 'GraphQL', 'REST API', 'Microservices', 'System Design'
];

/**
 * Parses raw text to find known IT skills
 */
function extractSkills(text) {
  const extracted = new Set();
  const normalizedText = text.toLowerCase();
  
  // Helper to safely escape RegEx control characters (e.g. for C++)
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  SKILL_ONTOLOGY.forEach(skill => {
    // Word boundary regex to ensure "Java" doesn't match "JavaScript"
    const escapedSkill = escapeRegExp(skill.toLowerCase());
    // Note: \b doesn't work perfectly before/after special chars like '+', but for string matching this basic hackathon heuristic is sufficient.
    const regex = new RegExp(`(^|\\s|[^a-z0-9_])${escapedSkill}(?=\\s|$|[^a-z0-9_])`, 'i');
    if (regex.test(normalizedText)) {
      extracted.add(skill);
    }
  });

  return Array.from(extracted);
}

/**
 * Heuristic fallback parser to estimate years of experience
 * Based on date ranges (e.g. 2018 - 2022) or explicit strings.
 */
function estimateExperience(text) {
  const currentYear = new Date().getFullYear(); // 2026 context
  let estimatedYears = 0;

  // 1. Look for explicit mentions: "5+ years of experience" or "7 years experience"
  const expRegex = /(\d+)\+?\s*years?\s*of\s*(?:professional\s*)?experience/i;
  const expMatch = text.match(expRegex);
  if (expMatch && expMatch[1]) {
    return parseInt(expMatch[1], 10);
  }

  // 2. Look for date ranges (e.g., "2015-2020", "2018 - Present")
  const yearMatches = text.match(/\b(199\d|20[0-2]\d)\b/g);
  if (yearMatches && yearMatches.length > 0) {
    const years = yearMatches.map(Number);
    const minYear = Math.min(...years);
    const maxYear = /present|current|now/i.test(text) ? currentYear : Math.max(...years);
    
    // Sanity check (realistic bounds for experience)
    if (minYear >= 1970 && maxYear <= currentYear) {
      estimatedYears = Math.max(0, maxYear - minYear);
    }
  }

  // Fallback default if we couldn't confidently parse
  return estimatedYears > 0 ? estimatedYears : 2; 
}

// ---------------------------------------------------------
// POST /api/resume/analyze
// Accepts multipart/form-data with a file field 'resume'
// ---------------------------------------------------------
app.post('/api/resume/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });
    }

    let rawText = '';

    // Try to process as PDF first
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      try {
        const data = await pdfParse(req.file.buffer);
        rawText = data.text;
      } catch (pdfErr) {
        console.warn('PDF Parsing failed (likely a simulated file). Falling back to raw text extraction...');
        rawText = req.file.buffer.toString('utf-8');
      }
    } else {
      // If it's pure text or a document we can convert to string (hackathon fallback)
      rawText = req.file.buffer.toString('utf-8');
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from document.' });
    }

    // Process logic
    const matchedSkills = extractSkills(rawText);
    const experienceYears = estimateExperience(rawText);

    res.json({
      success: true,
      fileName: req.file.originalname,
      extractedTextSample: rawText.substring(0, 100).replace(/\n/g, ' ') + '...', // For debugging
      skills: matchedSkills,
      experienceYears: experienceYears
    });

  } catch (error) {
    console.error('Resume Parsing Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error parsing resume.' });
  }
});

// ============================================================================
// PHASE 3: EXPANDED BACKEND AGENT ARCHITECTURE ENDPOINTS
// ============================================================================

// 1. Fetch Master State
app.get('/api/consultant/:id/state', (req, res) => {
  const c = db.consultants[req.params.id];
  if (!c) return res.status(404).json({ success: false, message: 'Consultant not found in DB.' });
  res.json({ success: true, state: c });
});

// 2. Attendance Calendar Sync Agent
app.post('/api/attendance/update', (req, res) => {
  const { consultantId, day, status } = req.body;
  if (!db.consultants[consultantId]) return res.json({ success: false });
  // Synchronize clicked status with persistent map
  db.consultants[consultantId].attendance[day] = status;
  res.json({ success: true, updatedAttendance: db.consultants[consultantId].attendance });
});

// 3. Training Enrollment Agent
app.post('/api/training/enroll', (req, res) => {
  const { consultantId, targetModule } = req.body;
  if (!db.consultants[consultantId]) return res.json({ success: false });
  // Ensure no duplicate registration
  if (!db.consultants[consultantId].enrolledModules.includes(targetModule)) {
    db.consultants[consultantId].enrolledModules.push(targetModule);
  }
  res.json({ success: true, enrolledModules: db.consultants[consultantId].enrolledModules });
});

// 4. Opportunity Matching Agent Application Request
app.post('/api/opportunities/apply', (req, res) => {
  const { consultantId, jobId } = req.body;
  if (!db.consultants[consultantId]) return res.json({ success: false });
  // Ensure idempotency for job application
  if (!db.consultants[consultantId].appliedJobs.includes(jobId)) {
    db.consultants[consultantId].appliedJobs.push(jobId);
  }
  res.json({ success: true, appliedJobs: db.consultants[consultantId].appliedJobs });
});

// ============================================================================
// PHASE 4: DYNAMIC AI MATCH ENGINES
// ============================================================================

// 5. Dynamic Opportunities Math Calculator
app.post('/api/opportunities/match', (req, res) => {
  const { consultantId, userSkills } = req.body;
  const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
  
  const consultant = db.consultants[consultantId];
  if (!consultant) return res.status(404).json({ success: false });

  // Calculate Match Ratios
  const scoredJobs = JOB_DATABASE.map(job => {
    const matchedSkills = job.requiredSkills.filter(reqSkill => userSkillsLower.includes(reqSkill.toLowerCase()));
    const missingSkills = job.requiredSkills.filter(reqSkill => !userSkillsLower.includes(reqSkill.toLowerCase()));
    const score = Math.round((matchedSkills.length / job.requiredSkills.length) * 100);
    
    // Check if user already applied
    const status = consultant.appliedJobs.includes(job.id) ? 'Applied' : 'New Match';

    return { ...job, matchScore: score, matchedSkills, missingSkills, status };
  });

  // Sort by highest match score first
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  res.json({ success: true, matches: scoredJobs });
});

// 6. Dynamic Training Recommender
app.post('/api/training/recommend', (req, res) => {
  const { consultantId, targetJobId, userSkills } = req.body;
  const targetJob = JOB_DATABASE.find(j => j.id === targetJobId);
  const consultant = db.consultants[consultantId];
  
  if (!targetJob || !consultant) return res.status(404).json({ success: false });

  const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
  const missingSkills = targetJob.requiredSkills.filter(reqSkill => !userSkillsLower.includes(reqSkill.toLowerCase()));
  
  // Recommend courses based on missing skills using the COURSE_DATABASE mapping
  const recommendedCourses = missingSkills.map(skill => {
    const course = COURSE_DATABASE[skill];
    if (!course) return { id: `generic-${skill}`, title: `Fundamental ${skill} Certification`, skill };
    
    // Check if enrolled
    const enrollmentStatus = consultant.enrolledModules.includes(course.id) ? 'In Progress' : 'Not Started';
    return { ...course, skill, status: enrollmentStatus };
  });

  res.json({ success: true, targetJob: targetJob.title, missingSkills, recommendations: recommendedCourses });
});

// ============================================================================
// PHASE 5: DYNAMIC ADMIN CONSOLE INTEGRATION
// ============================================================================

// 7. Get Aggregated Consultant Data
app.get('/api/admin/consultants', (req, res) => {
  const mergedConsultants = MASTER_CONSULTANTS.map(mc => {
    // Cross-reference with interactive memory database
    const memData = db.consultants[mc.id] || { attendance: {}, enrolledModules: [], appliedJobs: [] };
    
    // Dynamically calculate status based on actual user actions
    let activeStatus = mc.resumeStatus; 
    if (memData.appliedJobs.length > 0) activeStatus = "Active Match";
    else if (memData.enrolledModules.length > 0) activeStatus = "In Training";

    return { ...mc, resumeStatus: activeStatus };
  });

  res.json({ success: true, consultants: mergedConsultants });
});

// 8. Generate Real-Time System Metrics based on Memory DB Load
app.get('/api/admin/metrics', (req, res) => {
  const allStates = Object.values(db.consultants);
  const totalApps = allStates.reduce((acc, c) => acc + c.appliedJobs.length, 0);
  const totalTraining = allStates.reduce((acc, c) => acc + c.enrolledModules.length, 0);
  const activeSessions = Object.keys(db.consultants).length;

  res.json({
    success: true,
    agents: [
      { id: 'resume', name: 'Resume AI', color: '#00D4FF', metrics: { queueLoad: Math.min(100, activeSessions * 10), latency: 24, errorRate: 0.1 } },
      { id: 'training', name: 'Training AI', color: '#00FFB3', metrics: { queueLoad: Math.min(100, totalTraining * 20), latency: 18, errorRate: 0.0 } },
      { id: 'opportunity', name: 'Matching AI', color: '#FFB800', metrics: { queueLoad: Math.min(100, totalApps * 25), latency: 45, errorRate: 1.2 } },
      { id: 'attendance', name: 'Attendance Sync', color: '#FF3366', metrics: { queueLoad: activeSessions > 0 ? 12 : 0, latency: 12, errorRate: 0.0 } }
    ],
    alerts: [
      { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), msg: `Platform established ${activeSessions} active user sessions in memory.` },
      { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), msg: `Training Agent tracking ${totalTraining} ongoing course modules.` },
      { time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), msg: `Opportunity Agent logged ${totalApps} new application interests.` }
    ]
  });
});

app.listen(port, () => {
  console.log(`Hexaware Resume Parsing Agent Backend running on port ${port}`);
});
