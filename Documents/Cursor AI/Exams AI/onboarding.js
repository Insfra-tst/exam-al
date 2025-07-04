require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
    console.error('⚠️  OPENAI_API_KEY environment variable is not set');
} else {
    console.log('✅ OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
}

// Popular exams for quick detection
const POPULAR_EXAMS = [
    'SAT', 'ACT', 'PSAT/NMSQT', 'JEE Main', 'JEE Advanced', 'NEET', 'CAT', 'GMAT', 'GRE',
    'TOEFL', 'IELTS', 'O/L', 'A/L', 'IB', 'AP', 'GCSE', 'A-Level', 'GED', 'LSAT', 'MCAT'
];

// Validate exam name using OpenAI
const validateExamName = async (examName) => {
    try {
        const prompt = `
        You are an expert in educational exams and assessments worldwide. Given the exam name "${examName}", please analyze it and respond with a JSON object containing:

        {
            "isValid": boolean,
            "suggestedName": string or null,
            "realExamName": string or null,
            "gradeLevels": array of strings or null,
            "streams": array of strings or null,
            "isPopular": boolean,
            "reason": string,
            "examType": string,
            "description": string,
            "needsClarification": boolean,
            "clarificationQuestion": string or null,
            "possibleExams": array of objects or null,
            "country": string or null,
            "officialName": string or null,
            "examBoard": string or null,
            "hasGradeLevels": boolean,
            "hasStreams": boolean,
            "examLevel": string
        }

        CRITICAL RULES:
        1. "isValid" should be true ONLY if this is a recognized, official exam name that exists in the world
        2. "suggestedName" should be the correct spelling/name if the input is close but not exact
        3. "realExamName" should be the official, full name of the exam (e.g., "GCE Advanced Level" for "A/L")
        4. "officialName" should be the complete official name as it appears in official documents
        5. "gradeLevels" should list available grade levels if the exam has multiple grades
        6. "streams" should list available streams/specializations if the exam has them
        7. "isPopular" should be true if this is a widely recognized exam with extensive study materials
        8. "reason" should explain why the exam is valid/invalid
        9. "examType" should be the type of exam (e.g., "College Entrance", "School Level", "Professional", "International")
        10. "description" should be a brief, accurate description of the exam
        11. "needsClarification" should be true if the exam name is ambiguous
        12. "clarificationQuestion" should ask the user to specify which exam they mean
        13. "possibleExams" should be an array of objects with exam details for clarification
        14. "country" should specify the country where this exam is primarily taken
        15. "examBoard" should specify the conducting body or board
        16. "hasGradeLevels" should be true if the exam has different grade levels
        17. "hasStreams" should be true if the exam has different streams/specializations
        18. "examLevel" should specify the level (e.g., "Primary", "Secondary", "Higher Secondary", "University")

        EXAMPLES OF AMBIGUOUS EXAMS THAT NEED CLARIFICATION:
        - "A/L" could be:
          * {"name": "GCE Advanced Level (Sri Lanka)", "country": "Sri Lanka", "description": "Sri Lankan Advanced Level examination", "gradeLevels": ["Grade 12", "Grade 13"], "streams": ["Science", "Arts", "Commerce", "Technology"]}
          * {"name": "GCE Advanced Level (UK)", "country": "UK", "description": "UK Advanced Level examination", "gradeLevels": ["Year 12", "Year 13"], "streams": ["Science", "Arts", "Commerce"]}
          * {"name": "GCE Advanced Level (International)", "country": "International", "description": "International Advanced Level examination", "gradeLevels": ["AS Level", "A2 Level"], "streams": ["Science", "Arts", "Commerce"]}
        
        - "O/L" could be:
          * {"name": "GCE Ordinary Level (Sri Lanka)", "country": "Sri Lanka", "description": "Sri Lankan Ordinary Level examination", "gradeLevels": ["Grade 10", "Grade 11"], "streams": null}
          * {"name": "GCE Ordinary Level (UK)", "country": "UK", "description": "UK Ordinary Level examination", "gradeLevels": ["Year 10", "Year 11"], "streams": null}
          * {"name": "GCE Ordinary Level (International)", "country": "International", "description": "International Ordinary Level examination", "gradeLevels": ["Year 10", "Year 11"], "streams": null}

        EXAMPLES OF VALID EXAMS WITH REAL NAMES:
        - "SAT" → realExamName: "Scholastic Assessment Test", country: "USA", gradeLevels: ["High School"], streams: null
        - "JEE Main" → realExamName: "Joint Entrance Examination Main", country: "India", gradeLevels: ["Grade 12"], streams: null
        - "NEET" → realExamName: "National Eligibility cum Entrance Test", country: "India", gradeLevels: ["Grade 12"], streams: null
        - "IB" → realExamName: "International Baccalaureate", country: "International", gradeLevels: ["Primary Years", "Middle Years", "Diploma"], streams: ["Science", "Arts", "Commerce"]
        - "AP" → realExamName: "Advanced Placement", country: "USA", gradeLevels: ["High School"], streams: null
        - "GCSE" → realExamName: "General Certificate of Secondary Education", country: "UK", gradeLevels: ["Year 10", "Year 11"], streams: null
        - "CAT" → realExamName: "Common Admission Test", country: "India", gradeLevels: ["Graduate"], streams: null
        - "GMAT" → realExamName: "Graduate Management Admission Test", country: "International", gradeLevels: ["Graduate"], streams: null
        - "GRE" → realExamName: "Graduate Record Examinations", country: "International", gradeLevels: ["Graduate"], streams: null
        - "TOEFL" → realExamName: "Test of English as a Foreign Language", country: "International", gradeLevels: ["All Levels"], streams: null
        - "IELTS" → realExamName: "International English Language Testing System", country: "International", gradeLevels: ["All Levels"], streams: null
        - "GED" → realExamName: "General Educational Development", country: "USA", gradeLevels: ["Adult Education"], streams: null
        - "LSAT" → realExamName: "Law School Admission Test", country: "USA", gradeLevels: ["Graduate"], streams: null
        - "MCAT" → realExamName: "Medical College Admission Test", country: "USA", gradeLevels: ["Graduate"], streams: null

        EXAMPLES OF INVALID EXAMS:
        - "XYZ123" (non-existent exam)
        - "Random Test" (not a real exam)
        - "Fake Exam" (made up exam name)

        IMPORTANT: For ambiguous exams like "A/L" or "O/L", set needsClarification to true and provide possibleExams with official names and descriptions.

        Respond only with the JSON object, no additional text or explanations.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 1500
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error validating exam name:', error);
        // Fallback validation
        const normalizedName = examName.trim().toUpperCase();
        const isPopular = POPULAR_EXAMS.some(exam => 
            exam.toUpperCase().includes(normalizedName) || 
            normalizedName.includes(exam.toUpperCase())
        );
        
        return {
            isValid: isPopular,
            suggestedName: isPopular ? examName : null,
            realExamName: isPopular ? examName : null,
            gradeLevels: null,
            streams: null,
            isPopular,
            reason: isPopular ? 'Recognized exam name' : 'Unknown exam name',
            examType: 'Standard Exam',
            description: 'A recognized examination',
            needsClarification: false,
            country: null,
            officialName: null,
            examBoard: null,
            hasGradeLevels: false,
            hasStreams: false,
            examLevel: 'Secondary'
        };
    }
};

// Get subjects for exam and grade using OpenAI
const getSubjectsForExam = async (examName, gradeLevel = null, stream = null) => {
    try {
        const gradeContext = gradeLevel ? ` for ${gradeLevel}` : '';
        const streamContext = stream ? ` in ${stream} stream` : '';
        const prompt = `
        You are an expert in educational exams. For the exam "${examName}"${gradeContext}${streamContext}, please provide a JSON object with the subjects available:

        {
            "mandatorySubjects": ["subject1", "subject2", ...],
            "optionalSubjects": ["subject1", "subject2", ...],
            "optionalCount": number,
            "description": "Brief description of the exam structure",
            "subjectDetails": {
                "subject1": {
                    "name": "Subject Name",
                    "type": "mandatory/optional",
                    "description": "Brief description of what this subject covers",
                    "difficulty": "Easy/Medium/Hard",
                    "examWeight": number (0-100)
                }
            }
        }

        Rules:
        1. "mandatorySubjects" are subjects that all students must take
        2. "optionalSubjects" are subjects students can choose from
        3. "optionalCount" is how many optional subjects students typically choose
        4. Include common subjects like: Mathematics, English, Science, Social Studies, etc.
        5. For specific exams, include relevant subjects (e.g., Physics, Chemistry, Biology for science exams)
        6. "subjectDetails" should provide additional information about each subject
        7. Consider the grade level and stream if specified

        Respond only with the JSON object, no additional text.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 800
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error getting subjects for exam:', error);
        // Fallback subjects based on common exam patterns
        return getFallbackSubjects(examName, gradeLevel);
    }
};

// Fallback subjects for common exams
const getFallbackSubjects = (examName, gradeLevel) => {
    const normalizedName = examName.trim().toUpperCase();
    
    if (normalizedName.includes('SAT') || normalizedName.includes('ACT')) {
        return {
            mandatorySubjects: ['Mathematics', 'English', 'Reading', 'Science'],
            optionalSubjects: ['Essay Writing', 'Advanced Mathematics'],
            optionalCount: 1,
            description: 'Standardized college entrance exam'
        };
    } else if (normalizedName.includes('JEE')) {
        return {
            mandatorySubjects: ['Physics', 'Chemistry', 'Mathematics'],
            optionalSubjects: ['Biology', 'Computer Science'],
            optionalCount: 0,
            description: 'Engineering entrance examination'
        };
    } else if (normalizedName.includes('O/L') || normalizedName.includes('A/L')) {
        return {
            mandatorySubjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
            optionalSubjects: ['Literature', 'History', 'Geography', 'Economics', 'Commerce'],
            optionalCount: 2,
            description: 'Ordinary/Advanced Level examination'
        };
    } else if (normalizedName.includes('NEET')) {
        return {
            mandatorySubjects: ['Physics', 'Chemistry', 'Biology'],
            optionalSubjects: [],
            optionalCount: 0,
            description: 'Medical entrance examination'
        };
    } else {
        // Generic fallback
        return {
            mandatorySubjects: ['Mathematics', 'English', 'Science'],
            optionalSubjects: ['History', 'Geography', 'Literature', 'Economics'],
            optionalCount: 2,
            description: 'Standard examination'
        };
    }
};

// Check if exam is popular and has many patterns
const checkExamPopularity = async (examName) => {
    try {
        const prompt = `
        You are an expert in educational exams. For the exam "${examName}", determine if it's a popular exam with extensive study materials and patterns available.

        Respond with a JSON object:
        {
            "isPopular": boolean,
            "hasManyPatterns": boolean,
            "message": "Custom message for the user"
        }

        Consider factors like:
        - Number of students taking the exam annually
        - Availability of study materials
        - Historical data availability
        - Recognition in multiple countries

        Respond only with the JSON object, no additional text.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 300
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error checking exam popularity:', error);
        // Fallback check
        const normalizedName = examName.trim().toUpperCase();
        const isPopular = POPULAR_EXAMS.some(exam => 
            exam.toUpperCase().includes(normalizedName) || 
            normalizedName.includes(exam.toUpperCase())
        );
        
        return {
            isPopular,
            hasManyPatterns: isPopular,
            message: isPopular 
                ? "We have detected many patterns and hotspots for your exam. Let's dive in!"
                : "We'll help you analyze patterns for your exam."
        };
    }
};

// Generate subject analysis
const generateSubjectAnalysis = async (subjectName, examName, gradeLevel) => {
    try {
        const prompt = `Analyze the subject "${subjectName}" for the exam "${examName}"${gradeLevel ? ` (${gradeLevel})` : ''}. Provide comprehensive analysis including:
        
        - Difficulty level (0-100)
        - Exam weight percentage
        - Number of main topics covered
        - Average student performance percentage
        - Study priority level (High/Medium/Low)
        - Success rate percentage
        
        Consider factors like:
        - Historical exam patterns
        - Topic complexity
        - Student performance trends
        - Exam importance
        
        Return a JSON response with:
        {
            "difficulty": number (0-100),
            "examWeight": number (0-100),
            "topicVolume": number,
            "performance": number (0-100),
            "priority": "High/Medium/Low",
            "successRate": number (0-100)
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const analysis = JSON.parse(jsonContent);
        return analysis;
    } catch (error) {
        console.error('Error generating subject analysis:', error);
        // Return fallback analysis instead of crashing
        return {
            difficulty: 70,
            examWeight: 25,
            topicVolume: 8,
            performance: 65,
            priority: "Medium",
            successRate: 75
        };
    }
};

// Get all available subjects for an exam using OpenAI
const getAllAvailableSubjects = async (examName, gradeLevel = null, stream = null) => {
    try {
        const prompt = `
        You are an expert in educational exams and assessments worldwide. Given the exam name "${examName}"${gradeLevel ? `, grade level "${gradeLevel}"` : ''}${stream ? `, and stream "${stream}"` : ''}, please provide ALL available subjects for this exam.

        Respond with a JSON object containing:

        {
            "examName": string,
            "officialName": string,
            "subjects": {
                "mandatory": array of objects,
                "optional": array of objects,
                "streamSpecific": object or null
            },
            "totalSubjects": number,
            "mandatoryCount": number,
            "optionalCount": number,
            "streams": array of strings or null,
            "gradeLevels": array of strings or null
        }

        For each subject in mandatory and optional arrays, include:
        {
            "name": string,
            "code": string,
            "description": string,
            "weightage": string,
            "duration": string,
            "marks": string,
            "isCompulsory": boolean,
            "stream": string or null,
            "gradeLevel": string or null,
            "topics": array of strings,
            "difficulty": "Easy/Medium/Hard",
            "examWeight": number,
            "prerequisites": array of strings,
            "careerRelevance": array of strings,
            "studyHours": string,
            "papers": array of strings or null,
            "practical": boolean,
            "theory": boolean
        }

        EXAMPLES FOR DIFFERENT EXAMS:

        1. SAT (USA):
        - Mandatory: Mathematics, Evidence-Based Reading and Writing
        - Optional: Essay

        2. JEE Main (India):
        - Mandatory: Physics, Chemistry, Mathematics
        - Optional: None

        3. NEET (India):
        - Mandatory: Physics, Chemistry, Biology
        - Optional: None

        4. GCE Advanced Level (Sri Lanka):
        - Streams: Science, Commerce, Arts
        - Science Stream: Physics, Chemistry, Biology, Mathematics
        - Commerce Stream: Accounting, Business Studies, Economics, Mathematics
        - Arts Stream: Literature, History, Geography, Political Science

        5. IB (International):
        - Core: Theory of Knowledge, Extended Essay, Creativity Activity Service
        - Group 1: Language A (Literature, Language and Literature)
        - Group 2: Language B (Second Language)
        - Group 3: Individuals and Societies (History, Geography, Economics, etc.)
        - Group 4: Sciences (Biology, Chemistry, Physics, etc.)
        - Group 5: Mathematics
        - Group 6: Arts (Visual Arts, Music, Theatre, etc.)

        6. AP (USA):
        - Various AP subjects as optional: AP Calculus, AP Physics, AP Chemistry, AP Biology, AP English, AP History, etc.

        7. GCSE (UK):
        - Mandatory: English, Mathematics, Science
        - Optional: History, Geography, Modern Languages, Art, Music, etc.

        IMPORTANT RULES:
        1. Provide ALL subjects that are officially available for this exam
        2. Distinguish between mandatory and optional subjects
        3. For exams with streams, organize subjects by stream
        4. For exams with grade levels, specify which subjects are available at each level
        5. Use official subject names and codes
        6. Include comprehensive subject details with topics, difficulty, and career relevance
        7. Provide accurate weightage and duration information
        8. Include prerequisites and study recommendations
        9. Specify if subjects have practical components
        10. Include exam weight and importance for the overall exam

        Respond only with the JSON object, no additional text or explanations.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 3000
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error getting all available subjects:', error);
        // Fallback data
        return {
            examName: examName,
            officialName: examName,
            subjects: {
                mandatory: [
                    {
                        name: 'General Subject',
                        code: 'GEN',
                        description: 'General examination subject',
                        weightage: '100%',
                        duration: '3 hours',
                        marks: '100',
                        isCompulsory: true,
                        stream: stream,
                        gradeLevel: gradeLevel,
                        topics: ['General Topics'],
                        difficulty: 'Medium',
                        examWeight: 100,
                        prerequisites: [],
                        careerRelevance: ['General'],
                        studyHours: '5-7 hours per week',
                        papers: null,
                        practical: false,
                        theory: true
                    }
                ],
                optional: []
            },
            totalSubjects: 1,
            mandatoryCount: 1,
            optionalCount: 0,
            streams: null,
            gradeLevels: null
        };
    }
};

// Get comprehensive exam information including streams and subjects
const getComprehensiveExamInfo = async (examName, gradeLevel = null) => {
    try {
        const prompt = `
        You are an expert in educational exams and assessments worldwide. Given the exam name "${examName}"${gradeLevel ? ` and grade level "${gradeLevel}"` : ''}, please provide comprehensive information about this exam.

        Respond with a JSON object containing:

        {
            "examName": string,
            "officialName": string,
            "description": string,
            "examType": string,
            "country": string,
            "duration": string,
            "totalMarks": string,
            "passingCriteria": string,
            "gradeLevels": array of strings,
            "streams": array of strings or null,
            "hasStreams": boolean,
            "hasGradeLevels": boolean,
            "subjects": {
                "mandatory": array of objects,
                "optional": array of objects
            },
            "examPattern": string,
            "syllabus": string,
            "importantDates": array of strings,
            "officialWebsite": string,
            "conductingBody": string
        }

        For each subject in mandatory and optional arrays, include:
        {
            "name": string,
            "code": string,
            "description": string,
            "weightage": string,
            "duration": string,
            "marks": string,
            "isCompulsory": boolean
        }

        EXAMPLES:
        - For "SAT": Include Math, Evidence-Based Reading and Writing as mandatory subjects
        - For "JEE Main": Include Physics, Chemistry, Mathematics as mandatory subjects
        - For "NEET": Include Physics, Chemistry, Biology as mandatory subjects
        - For "GCE Advanced Level": Include various subjects based on streams (Science, Arts, Commerce)
        - For "IB": Include core subjects and group subjects
        - For "AP": Include various AP subjects as optional

        IMPORTANT RULES:
        1. Provide accurate, official information about the exam
        2. Include all mandatory subjects that every student must take
        3. Include optional subjects that students can choose from
        4. For exams with streams, organize subjects by stream
        5. For exams with grade levels, specify which subjects are available at each level
        6. Use official subject names and codes where available
        7. Provide realistic weightage and duration information
        8. Include official website and conducting body information

        Respond only with the JSON object, no additional text or explanations.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content.trim();
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error getting comprehensive exam info:', error);
        // Fallback data
        return {
            examName: examName,
            officialName: examName,
            description: 'A recognized examination',
            examType: 'Standard Exam',
            country: 'International',
            duration: '3 hours',
            totalMarks: '100',
            passingCriteria: '40%',
            gradeLevels: ['Standard'],
            streams: null,
            hasStreams: false,
            hasGradeLevels: false,
            subjects: {
                mandatory: [
                    {
                        name: 'General Subject',
                        code: 'GEN',
                        description: 'General examination subject',
                        weightage: '100%',
                        duration: '3 hours',
                        marks: '100',
                        isCompulsory: true
                    }
                ],
                optional: []
            },
            examPattern: 'Standard pattern',
            syllabus: 'Standard syllabus',
            importantDates: ['Registration', 'Exam Date', 'Result Date'],
            officialWebsite: 'https://example.com',
            conductingBody: 'Exam Board'
        };
    }
};

// Get grade levels and streams for a specific exam
const getExamGradeLevelsAndStreams = async (examName) => {
    try {
        const prompt = `
        You are an expert in educational exams. For the exam "${examName}", please provide detailed information about available grade levels and streams.

        Respond with a JSON object containing:

        {
            "examName": string,
            "officialName": string,
            "gradeLevels": [
                {
                    "name": string,
                    "description": string,
                    "typicalAge": string,
                    "duration": string,
                    "isAvailable": boolean
                }
            ],
            "streams": [
                {
                    "name": string,
                    "description": string,
                    "subjects": array of strings,
                    "careerPaths": array of strings,
                    "isAvailable": boolean
                }
            ],
            "hasGradeLevels": boolean,
            "hasStreams": boolean,
            "examStructure": {
                "totalDuration": string,
                "totalSubjects": number,
                "mandatorySubjects": number,
                "optionalSubjects": number,
                "minOptionalRequired": number,
                "maxOptionalAllowed": number
            },
            "description": string,
            "country": string,
            "examBoard": string
        }

        EXAMPLES:
        - For "GCE Advanced Level (Sri Lanka)":
          * gradeLevels: ["Grade 12", "Grade 13"]
          * streams: ["Science", "Arts", "Commerce", "Technology"]
        
        - For "GCE Ordinary Level (Sri Lanka)":
          * gradeLevels: ["Grade 10", "Grade 11"]
          * streams: null (no streams at O/L level)
        
        - For "SAT":
          * gradeLevels: ["High School (Grade 11-12)"]
          * streams: null
        
        - For "JEE Main":
          * gradeLevels: ["Grade 12"]
          * streams: null

        IMPORTANT RULES:
        1. Provide accurate grade levels that are officially available for this exam
        2. Include streams only if they are officially part of the exam structure
        3. For each grade level, specify the typical age range and duration
        4. For each stream, list the main subjects and potential career paths
        5. Use official names and terminology
        6. Specify if grade levels or streams are available (isAvailable field)
        7. Provide realistic exam structure information

        Respond only with the JSON object, no additional text or explanations.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 2000
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error getting grade levels and streams:', error);
        // Fallback data
        return {
            examName: examName,
            officialName: examName,
            gradeLevels: [
                {
                    name: 'Standard',
                    description: 'Standard grade level',
                    typicalAge: '16-18',
                    duration: '2 years',
                    isAvailable: true
                }
            ],
            streams: null,
            hasGradeLevels: false,
            hasStreams: false,
            examStructure: {
                totalDuration: '3 hours',
                totalSubjects: 1,
                mandatorySubjects: 1,
                optionalSubjects: 0,
                minOptionalRequired: 0,
                maxOptionalAllowed: 0
            },
            description: 'A recognized examination',
            country: 'International',
            examBoard: 'Standard Board'
        };
    }
};

// Get comprehensive subjects for final review
const getComprehensiveSubjectsForReview = async (examName, gradeLevel = null, stream = null) => {
    try {
        const gradeContext = gradeLevel ? ` for ${gradeLevel}` : '';
        const streamContext = stream ? ` in ${stream} stream` : '';
        const prompt = `
        You are an expert in educational exams. For the exam "${examName}"${gradeContext}${streamContext}, please provide comprehensive information about ALL available subjects.

        Respond with a JSON object containing:

        {
            "examName": string,
            "officialName": string,
            "gradeLevel": string,
            "stream": string,
            "mandatorySubjects": [
                {
                    "name": string,
                    "code": string,
                    "description": string,
                    "weightage": string,
                    "duration": string,
                    "marks": string,
                    "isCompulsory": boolean,
                    "topics": array of strings,
                    "difficulty": string,
                    "examWeight": number,
                    "prerequisites": array of strings,
                    "careerRelevance": array of strings,
                    "studyHours": string,
                    "papers": array of objects or null,
                    "practical": boolean,
                    "theory": boolean
                }
            ],
            "optionalSubjects": [
                {
                    "name": string,
                    "code": string,
                    "description": string,
                    "weightage": string,
                    "duration": string,
                    "marks": string,
                    "isCompulsory": boolean,
                    "topics": array of strings,
                    "difficulty": string,
                    "examWeight": number,
                    "prerequisites": array of strings,
                    "careerRelevance": array of strings,
                    "studyHours": string,
                    "papers": array of objects or null,
                    "practical": boolean,
                    "theory": boolean
                }
            ],
            "examStructure": {
                "totalDuration": string,
                "totalSubjects": number,
                "mandatoryCount": number,
                "optionalCount": number,
                "minOptionalRequired": number,
                "maxOptionalAllowed": number,
                "passingCriteria": string,
                "gradingSystem": string
            },
            "description": string,
            "country": string,
            "examBoard": string,
            "importantNotes": array of strings
        }

        EXAMPLES:
        1. For "GCE Advanced Level (Sri Lanka) - Science Stream":
           * Mandatory: Combined Mathematics, Physics, Chemistry
           * Optional: Biology, Information Technology, etc.
        
        2. For "GCE Ordinary Level (Sri Lanka)":
           * Mandatory: Sinhala, English, Mathematics, Science, History, Religion
           * Optional: Additional languages, arts, etc.
        
        3. For "SAT":
           * Mandatory: Evidence-Based Reading and Writing, Mathematics
           * Optional: Essay (optional)
        
        4. For "JEE Main":
           * Mandatory: Physics, Chemistry, Mathematics
           * Optional: None

        IMPORTANT RULES:
        1. Provide ALL subjects that are officially available for this exam
        2. Distinguish clearly between mandatory and optional subjects
        3. For exams with streams, organize subjects by stream
        4. For exams with grade levels, specify which subjects are available at each level
        5. Use official subject names and codes
        6. Include comprehensive subject details with topics, difficulty, and career relevance
        7. Provide accurate weightage and duration information
        8. Include prerequisites and study recommendations
        9. Specify if subjects have practical components
        10. Include exam weight and importance for the overall exam
        11. Provide realistic exam structure information
        12. Include important notes about subject selection and requirements

        Respond only with the JSON object, no additional text or explanations.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 3000
        });

        const content = response.choices[0].message.content.trim();
        
        // Clean the response to extract only JSON
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        // Remove any comments or extra text before parsing
        jsonContent = jsonContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        
        const result = JSON.parse(jsonContent);
        return result;
    } catch (error) {
        console.error('Error getting comprehensive subjects for review:', error);
        // Fallback data
        return {
            examName: examName,
            officialName: examName,
            gradeLevel: gradeLevel,
            stream: stream,
            mandatorySubjects: [
                {
                    name: 'General Subject',
                    code: 'GEN',
                    description: 'General examination subject',
                    weightage: '100%',
                    duration: '3 hours',
                    marks: '100',
                    isCompulsory: true,
                    topics: ['General Topics'],
                    difficulty: 'Medium',
                    examWeight: 100,
                    prerequisites: [],
                    careerRelevance: ['General'],
                    studyHours: '5-7 hours per week',
                    papers: null,
                    practical: false,
                    theory: true
                }
            ],
            optionalSubjects: [],
            examStructure: {
                totalDuration: '3 hours',
                totalSubjects: 1,
                mandatoryCount: 1,
                optionalCount: 0,
                minOptionalRequired: 0,
                maxOptionalAllowed: 0,
                passingCriteria: '40%',
                gradingSystem: 'Standard'
            },
            description: 'A recognized examination',
            country: 'International',
            examBoard: 'Standard Board',
            importantNotes: ['Please verify subject information with official sources']
        };
    }
};

module.exports = {
    validateExamName,
    getSubjectsForExam,
    checkExamPopularity,
    generateSubjectAnalysis,
    getAllAvailableSubjects,
    getComprehensiveExamInfo,
    getExamGradeLevelsAndStreams,
    getComprehensiveSubjectsForReview
}; 