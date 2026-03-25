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

app.listen(port, () => {
  console.log(`Hexaware Resume Parsing Agent Backend running on port ${port}`);
});
