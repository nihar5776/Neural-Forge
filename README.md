# 🚀 Neural Forge: Agentic AI Career Coach & Resume Mentor

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)

An advanced, end-to-end **Agentic AI-powered career coach** designed to automate resume feedback, tailor resumes, track professional skill gaps, generate custom timelines, run adaptive technical interview quizzes, support real-time voice conversational mock interviews, and fetch matching job listings using an intelligent scraping loop.

</div>

---

## 🗺️ System Architecture

The diagram below details the data flow and integration between the Vite client, the MERN server, and the Google Gemini API agent:

```mermaid
graph TD
    Client[React Client / Vite] -->|1. Uploads PDF or Selects Resume| Backend[Express Backend / Node.js]
    Backend -->|2. Saves User / Resume / Quiz / Interview Results| Database[(MongoDB / Mongoose)]
    Backend -->|3. Feeds Raw Parsing + Settings| Gemini[Google Gemini AI / Zod Validation]
    Gemini -->|4. Tool Call Request| JobScraper[LinkedIn & Unstop Scraper Service]
    JobScraper -->|5. Scraped Opportunity Feeds| Gemini
    Gemini -->|6. Validated Structured JSON| Backend
    Backend -->|7. API Response / HSL Dashboard render| Client
```

---

## ✨ Core Features

### 📁 Resume Portfolio & Profile Manager
* **In-Memory PDF Parser**: Converts PDF uploads into raw text structures instantly.
* **Resume Manager Collection**: Users can drag-and-drop multiple resumes to their profile.
* **Dropdown Selection**: Generated reports can target stored profile resumes, eliminating redundant uploads.
* **Resume Maintenance**: Full dashboard to view upload histories, rename resumes, and delete files dynamically.

### 🎯 AI Coaching Reports & Prep Roadmaps
* **Intelligent Match Score**: Instant alignment metrics (0-100%) against target job descriptions.
* **Mock Questions**: Returns 5-7 technical questions and 3-5 behavioral questions matching candidate-intent and answers.
* **Adaptive Timelines**: Dynamic preparation timelines that scale from 7 up to 30+ days based on skill gaps.
* **Learning Badges**: Clickable video resources (🎥 YouTube) and official reference pages (📄 documentation).

### ✂️ AI Resume Tailoring & Enhancer
* **Job Description Alignment**: Matches resume content against job descriptions, identifying key matches and highlights.
* **Tailored Resume Generation**: Generates refined markdown copies of professional experiences and qualifications.
* **Interactive Editing & Saving**: Users can edit generated resumes in the UI and save them directly back to their resume portfolio.

### 🧠 Adaptive Interview Prep Quizzes
* **Hybrid Scope Selectors**: Launch quizzes targeting either job description history or identified skill gaps.
* **Custom Parameter Bounds**: Supports custom numeric input count (1-30 questions) and difficulty levels.
* **MCQ Game Loop**: Interactive deck showing progress bars and immediate choice checkmarks.
* **Detailed AI Explanations**: Explains the correct answer logic with Gemini-backed explanations.
* **Performance Tracker**: Score logging and past quiz history persisted in MongoDB.

### 🎙️ Conversational Mock Interviews
* **Multi-Agent Orchestration**: Plan, interview, evaluate, and deliver comprehensive feedback via four dedicated AI agents.
* **Voice and Audio Integration**: Supports voice answers via audio upload, dynamically transcribing and scoring responses.
* **Adaptive Difficulty Scaling**: Real-time updates adjusting difficulty (Easy/Medium/Hard) based on cumulative performance grades.
* **Detailed Dashboard Reports**: Summarizes performance, overall/technical/communication scores, strengths, weaknesses, and key tips.

### 💼 Agentic Job Discovery
* **Scraper Tool Loops**: Uses Gemini function declarations to search LinkedIn and Unstop.
* **AI Relevance Filter**: Discards unrelated profiles and filters jobs matching the search query.

### 🛡️ Admin Portal Telemetry & Control
* **Admin Overview Dashboard**: Dynamic line chart of daily activity trends (parallel aggregation) and AI model distribution.
* **User Management System**: Admin controls to suspend, activate, inspect details, or delete users (cascade deletion).
* **AI Analytics Cost Auditor**: Real-time calculations of latency, success rates, token weights, and estimated billing.
* **Low-Memory Export Streams**: Streams large reports in CSV, XLSX workbook chunks, or formatted PDFs.

### 🔒 Dedicated Admin Profile
* **Role-Separated Profile Pages**: Admins get a purpose-built profile panel — separate from the user career profile — focused on account management, security, and login history.
* **Security Center**: Change password with live strength indicator, validation rules, and success/error feedback.
* **Login Activity Log**: Displays last login details (browser, OS, device, IP) and a scrollable table of the 5 most recent sessions.

---

## 📁 Repository Directory Structure

```text
├── backend/
│   ├── config/              # MongoDB ODM connections
│   ├── src/
│   │   ├── controllers/     # Auth, reports, resumes, quiz, tailoring, mock interviews, admin control
│   │   ├── middlewares/     # JWT authentication, role guards (isAdmin), multer upload
│   │   ├── models/          # Mongoose database schemas
│   │   ├── routes/          # Mounted endpoints
│   │   └── services/        # Gemini/Groq AI integrations, scraper methods, exports
│   ├── index.js             # Middleware configurations & routes binding
│   └── server.js            # Node HTTP server listener
└── frontend/
    ├── src/
    │   ├── components/      # UI components (Sidebar, Report Details, Profile sub-cards)
    │   ├── pages/           # Pages (Dashboard, Profile, Quiz, Search)
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx            # User career profile
    │   │   ├── ResumeUpload.jsx
    │   │   ├── TailorResume.jsx       # AI Resume Tailoring Interface
    │   │   ├── Quiz.jsx               # Adaptive MCQ Prep Quizzes
    │   │   ├── MockInterview.jsx      # Voice Conversational Interview Board
    │   │   ├── JobSearch.jsx
    │   │   ├── Login.jsx / Register.jsx
    │   │   └── admin/                 # System Administration Dashboards:
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminUsers.jsx
    │   │       ├── AdminAnalytics.jsx
    │   │       ├── AdminProfile.jsx   # Dedicated Admin Profile Panel
    │   │       └── AdminExport.jsx
    │   ├── App.jsx          # Route configurations
    │   ├── index.css        # Core custom HSL-based stylesheet
    │   └── main.jsx         # App bootstrap anchor
```

---

## ⚙️ Prerequisites & Environment Variables

Create a file named `.env` in the `backend` directory:

```env
# MongoDB Connection URI (Local database or Atlas Cluster)
mongo_uri=mongodb://localhost:27017/agentic-ai-resume

# Google Gemini API credential (used for text processing & agent flows)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Groq API key (used for high-speed conversational mock interview agent loops)
GROQ_API_KEY=your_groq_api_key_here

# JWT Secret key for authentication token hashing
jwt_secret=your_super_secret_jwt_key_here
```

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally:

### 1. Start the Backend API
Navigate to the `backend` folder, install npm packages, and start the development server:
```bash
cd backend
npm install
npm start
```
*(The backend server will connect to MongoDB and start listening on port `3000`)*

### 2. Start the Frontend Client
Open a new terminal window, navigate to the `frontend` folder, install npm packages, and launch Vite:
```bash
cd frontend
npm install
npm run dev
```
*(The client application will start running on port `5173`)*

---

## 🔌 Core API Specifications

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registers a new user account | No |
| **POST** | `/api/auth/login` | Authenticates user and sets token cookie | No |
| **GET** | `/api/auth/get-me` | Validates session token and returns credentials | Yes |
| **POST** | `/api/auth/logout` | Clears local cookie and blacklists token | Yes |
| **PUT** | `/api/auth/profile` | Updates authenticated user name and email | Yes |
| **PUT** | `/api/auth/profile/change-password` | Changes the authenticated user's password | Yes |
| **GET** | `/api/auth/profile/login-history` | Retrieves the user's session login history | Yes |
| **POST** | `/api/interview/` | Generates a career report from parsed PDF upload or stored resume | Yes |
| **GET** | `/api/interview/history` | Fetches historical reports generated by user | Yes |
| **GET** | `/api/resumeUpload/` | Lists metadata of user's stored resumes | Yes |
| **POST** | `/api/resumeUpload/` | Uploads and saves a new resume to profile | Yes |
| **DELETE**| `/api/resumeUpload/:id` | Deletes a stored resume from database | Yes |
| **PATCH** | `/api/resumeUpload/rename/:id` | Renames an existing stored resume file | Yes |
| **POST** | `/api/quiz/generate` | Generates custom multiple-choice quiz questions | Yes |
| **POST** | `/api/quiz/submit` | Grades and saves the completed quiz score | Yes |
| **GET** | `/api/quiz/history` | Retrieves the history of completed quizzes | Yes |
| **POST** | `/api/jobs/search` | Scrapes public search opportunities agentically | Yes |
| **POST** | `/api/tailor/` | Generates a tailored resume alignment against a job description | Yes |
| **POST** | `/api/tailor/save` | Saves edited tailored resume back to profile resumes list | Yes |
| **POST** | `/api/mock-interview/start` | Initializes a conversational mock interview and generates Q1 | Yes |
| **POST** | `/api/mock-interview/:id/answer` | Evaluates question response (text/audio) and returns next question | Yes |
| **POST** | `/api/mock-interview/:id/finish` | Compiles session transcript and outputs final evaluation report | Yes |
| **GET** | `/api/mock-interview/history` | Fetches history of completed conversational mock interviews | Yes |
| **GET** | `/api/mock-interview/:id` | Retrieves full details of a specific interview session | Yes |
| **GET** | `/api/admin/stats` | Fetches overall telemetry statistics & daily engagement trend | Yes (Admin) |
| **GET** | `/api/admin/analytics` | Fetches aggregated AI request counts, success rate, and costs | Yes (Admin) |
| **GET** | `/api/admin/users` | Retrieves paginated search results of registered user accounts | Yes (Admin) |
| **GET** | `/api/admin/users/:id` | Retrieves detailed information for a specific user profile | Yes (Admin) |
| **PATCH** | `/api/admin/users/:id/suspend` | Suspends user profile (locks session) | Yes (Admin) |
| **PATCH** | `/api/admin/users/:id/activate` | Re-activates a suspended user profile | Yes (Admin) |
| **DELETE**| `/api/admin/users/:id` | Cascades delete user and all resumes/reports/logs | Yes (Admin) |
| **GET** | `/api/admin/export/users` | Streams registered users table as CSV, Excel, or PDF | Yes (Admin) |
| **GET** | `/api/admin/export/ats` | Streams resume matching reports as CSV, Excel, or PDF | Yes (Admin) |
| **GET** | `/api/admin/export/interviews` | Streams mock interview lists as CSV, Excel, or PDF | Yes (Admin) |
| **GET** | `/api/admin/export/analytics` | Streams AI request telemetry as CSV, Excel, or PDF | Yes (Admin) |

---

## 🔄 Detailed Feature & API Workflows

This section details the step-by-step execution flow for every application feature and API request, complete with interactive Mermaid diagrams mapping frontend triggers directly to backend controllers, MongoDB schemas, and the Google Gemini/Groq AI loops.

### 🔑 1. User Authentication Flow
Handles registering accounts, logging in, managing browser cookies/session validation, and handling secure sign-out.

#### 🛠️ Files Involved:
* **Routes**: [user.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/user.routes.js)
* **Controller**: [user.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js)
* **Model**: [user.models.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/user.models.js)
* **Auth Guard Middleware**: [auth.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/auth.middleware.js)

#### 📝 Step-by-Step Flow:
1. **Registration**: 
   * Client sends a `POST` request to `/api/auth/register` with `name`, `email`, and `password`.
   * The backend validates if the email is already registered using [userModel.findOne()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L9).
   * If not registered, [userModel.create()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L18) inserts a new document. A database pre-save hook automatically hashes the password using `bcrypt` (10 rounds).
2. **Login**: 
   * Client sends a `POST` request to `/api/auth/login` with credentials.
   * Backend retrieves the user by email including the password hash.
   * `bcrypt.compare()` checks credentials.
   * On success, a JWT is signed with `userId` and a cookie named `token` is set with a 2-hour expiration.
3. **Session Check**:
   * On application mount, Vite sends a `GET` request to `/api/auth/get-me`.
   * The `authUser` middleware intercepts, checks/verifies the token, and loads user info.
4. **Logout**:
   * Client sends a `POST` request to `/api/auth/logout`.
   * The backend clears the `token` cookie and registers the JWT inside `BlackListModel` to blacklist the token.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    
    Start["User Actions: Register / Login / Logout / Session Check"] --> Route{Select Action}
    
    %% Register
    Route -->|Register| RegisterPost["POST /api/auth/register"]:::server
    RegisterPost --> FindUser{"Check existing email"}:::db
    FindUser -->|Exists| RegFail["Return 422: User Already Exists"]:::server
    FindUser -->|New| CreateUser["Create User in DB"]:::db
    CreateUser --> RegSuccess["Return 201: Created User Metadata"]:::server
    
    %% Login
    Route -->|Login| LoginPost["POST /api/auth/login"]:::server
    LoginPost --> FindLoginUser{"Fetch User & select Password"}:::db
    FindLoginUser -->|Not Found| LoginFailEmail["Return 401: Account does not exist"]:::server
    FindLoginUser -->|Found| CheckPassword{"Compare Password Hash"}:::db
    CheckPassword -->|Mismatch| LoginFailPass["Return 401: Invalid Password"]:::server
    CheckPassword -->|Match| GenToken["Sign JWT Token & set HTTP-Only Cookie"]:::server
    GenToken --> LoginSuccess["Return 200: User details + JWT Token"]:::server
    
    %% Session Check
    Route -->|Session Check| GetMe["GET /api/auth/get-me"]:::server
    GetMe --> AuthGuard["authMiddleware.authUser: Verify Token & check Blacklist"]:::server
    AuthGuard -->|Invalid or Blacklisted| GetMeFail["Return 401: Unauthorized"]:::server
    AuthGuard -->|Valid| FetchUser["Fetch User details by ID"]:::db
    FetchUser --> GetMeSuccess["Return 200: User Details"]:::server
 
    %% Logout
    Route -->|Logout| LogoutPost["POST /api/auth/logout"]:::server
    LogoutPost --> ClearCookie["Clear token Cookie from browser"]:::server
    ClearCookie --> Blacklist["Store token in BlackListModel"]:::db
    Blacklist --> LogoutSuccess["Return 200: Logout Successful"]:::server

    class Start,RegFail,RegSuccess,LoginFailEmail,LoginFailPass,LoginSuccess,GetMeFail,GetMeSuccess,LogoutSuccess client;
```

---

### 📁 2. Resume Portfolio & Profile Manager Flow
Users can upload, persist, view, and delete multiple resumes in their profile page to build a career portfolio.

#### 🛠️ Files Involved:
* **Routes**: [resumeUpload.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/resumeUpload.routes.js)
* **Controller**: [resumeUpload.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js)
* **Model**: [resume.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/resume.model.js)
* **File Middleware**: [file.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/file.middleware.js) (Multer configuration)

#### 📝 Step-by-Step Flow:
1. **Upload**:
   * React client posts a multipart `FormData` object containing the `.pdf` file to `POST /api/resumeUpload/`.
   * Multer intercepts the file buffer in memory.
   * `pdf-parse` extracts raw text from the parsed buffer immediately.
   * A document containing the filename, parsed text contents, and associated `userId` is saved in the `Resume` collection via [resumeUpload()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js#L26).
2. **List Resumes**:
   * React client fetches saved resumes using `GET /api/resumeUpload/`.
   * Backend queries MongoDB matching `userId` and projects `-resume` to exclude the heavy parsed text field, ensuring fast payloads.
3. **Rename Resume**:
   * React client requests `PATCH /api/resumeUpload/rename/:id` containing `newName`.
   * Backend updates the filename of the matching resume owned by the active user.
4. **Delete**:
   * Client calls `DELETE /api/resumeUpload/:id`.
   * Backend performs a secure delete check ([deleteUserResume](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/resumeUpload.controller.js#L77)) validating both the `_id` and owner `user` fields match the request context.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;

    Start["Profile / Resumes Manager Dashboard"] --> ActionRoute{Select Action}

    %% Upload
    ActionRoute -->|Upload PDF| UploadPost["POST /api/resumeUpload/"]:::server
    UploadPost --> Multer["file.middleware: Parse Form-Data & extract PDF buffer"]:::server
    Multer --> PDFParse["pdf-parse: Extract raw text from PDF buffer"]:::server
    PDFParse --> FetchUser["Find User account in DB"]:::db
    FetchUser --> CreateResume["Save Resume to DB: text, original filename, userId"]:::db
    CreateResume --> UploadSuccess["Return 201: Upload Successful with metadata"]:::server

    %% List Resumes
    ActionRoute -->|List Resumes| ListGet["GET /api/resumeUpload/"]:::server
    ListGet --> FindResumes["Query DB for Resumes matching userId"]:::db
    FindResumes --> SelectExclusion["Exclude heavy 'resume' text field from projection"]:::db
    SelectExclusion --> ListSuccess["Return 200: Sorted Resumes List metadata"]:::server

    %% Rename Resume
    ActionRoute -->|Rename Resume| RenamePatch["PATCH /api/resumeUpload/rename/:id"]:::server
    RenamePatch --> FindRename["Update filename in DB for matching resume & userId"]:::db
    FindRename --> RenameSuccess["Return 200: Rename Successful"]:::server

    %% Delete Resume
    ActionRoute -->|Delete Resume| DeleteReq["DELETE /api/resumeUpload/:id"]:::server
    DeleteReq --> FindDelete["Find & Delete Resume matching resumeId and userId"]:::db
    FindDelete -->|Not Found| DeleteFail["Return 404: Not found or Unauthorized"]:::server
    FindDelete -->|Found| DeleteSuccess["Return 200: Resume Deleted successfully"]:::server

    class Start,UploadSuccess,ListSuccess,RenameSuccess,DeleteFail,DeleteSuccess client;
```

---

### 🎯 3. AI Coaching Reports & Prep Roadmaps Flow
Analyzes candidate details, parsed resumes, and job roles to draft actionable career roadmaps and prep reports.

#### 🛠️ Files Involved:
* **Routes**: [interview.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/interview.routes.js)
* **Controller**: [interview.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/interview.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (LLM Prompt & validation)
* **Model**: [interviewReportModel.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/interviewReportModel.js)

#### 📝 Step-by-Step Flow:
1. **Trigger Report Generation**:
   * Client posts data to `POST /api/interview/`.
   * **Source Select Option**: If `resumeId` is present, the backend queries the database for the resume's text. If a new file is uploaded, `pdf-parse` extracts the text on-the-fly.
2. **AI Analysis**:
   * The text, job description, and optional self-description are packaged and dispatched to [generateInterviewReport()](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js#L52).
   * Gemini (`gemini-3-flash-preview` with a fallback to `gemini-2.5-flash`) builds a structured career report matching `interviewReportSchema` rules.
3. **Structured Validation**:
   * Gemini returns a JSON object.
   * `Zod` validation parses and verifies the JSON structure.
   * The response is saved in the database under the user's account and returned to the client to render visual scores, timelines, and reference links.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Upload PDF Resume OR Select Saved Resume"] --> InputForm["Input: Target Job Description & Optional Self-Description"]
    InputForm --> AuthGuard["authMiddleware.authUser"]:::server
    AuthGuard --> POST_Req["POST /api/interview/"]:::server

    %% Resume Text retrieval
    POST_Req --> CheckResumeId{"Has resumeId in body?"}
    
    CheckResumeId -->|Yes| FetchStored["Find stored resume in DB by ID"]:::db
    FetchStored --> VerifyOwner{"Does resume user match logged-in userId?"}:::db
    VerifyOwner -->|No| Unauthorized["Return 404: Selected resume not found or unauthorized"]:::server
    VerifyOwner -->|Yes| ExtractSavedText["Retrieve saved resume text"]
    
    CheckResumeId -->|No| MulterParser["file.middleware: Parse multipart PDF upload"]:::server
    MulterParser --> PDFParse["pdf-parse: Extract raw text from PDF buffer"]:::server
    
    ExtractSavedText --> CombineInputs["Combine Resume Text, Job Description, & Self-Description"]
    PDFParse --> CombineInputs
    
    %% Gemini Core AI
    CombineInputs --> AICall["aiService.generateInterviewReport"]:::server
    AICall --> PromptBuilder["Construct Expert Technical Recruiter Prompt"]:::ai
    PromptBuilder --> GeminiCall["Call gemini-3-flash-preview with responseMimeType: application/json"]:::ai
    GeminiCall --> JSONParse["Parse AI response to JSON object"]:::ai
    JSONParse --> ZodValidation["Validate JSON against Zod interviewReportSchema"]:::ai
    ZodValidation -->|Valid JSON| SaveReport["Create new Coaching Report document in DB"]:::db
    SaveReport --> RespondReport["Return 201: Career Mentor Report Response"]:::server

    class Start,InputForm,Unauthorized,RespondReport client;
```

---

### 🧠 4. Adaptive Interview Prep Quizzes Flow
Enables interactive game-loop testing based on specific skill gaps or target job profiles.

#### 🛠️ Files Involved:
* **Routes**: [quiz.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/quiz.routes.js)
* **Controller**: [quiz.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/quiz.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (`generateQuizAgentically`)
* **Model**: [quiz.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/quiz.model.js)

#### 📝 Step-by-Step Flow:
1. **Initialize Setup**:
   * React calls `GET /api/interview/history` and `GET /api/quiz/history` to pre-populate setup fields with previous job profile titles and identified skill gaps.
2. **Generate Questions**:
   * User posts options (mode, question count, difficulty, target skills or job description) to `POST /api/quiz/generate`.
   * Backend forwards the data to `generateQuizAgentically`.
   * Gemini compiles customized MCQs with exactly 4 options, a correct answer string, and detailed explanations, which are validated by `aiQuizSchema` (Zod) and returned.
3. **Gameplay & Submission**:
   * React displays the interactive quiz questions in a deck-based UI with active progress bars.
   * On final click, answers are graded on-the-fly, and the results are sent via `POST /api/quiz/submit` to save the performance details in MongoDB.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Open Quiz Setup"] --> FetchData["GET /api/interview/history & GET /api/quiz/history"]:::server
    FetchData --> PopulateSetup["Pre-populate available Job Profiles & Skill Gaps from historical reports"]
    
    %% Setup & Generate
    PopulateSetup --> QuizSetup["User selects: Mode ('jd' or 'skills') & Parameters (Num Questions, Difficulty)"]
    QuizSetup --> GenerateReq["POST /api/quiz/generate"]:::server
    GenerateReq --> ValidateInputs{"Validate inputs based on Mode"}:::server
    ValidateInputs -->|Invalid| GenErr["Return 400: Validation Error"]:::server
    ValidateInputs -->|Valid| AICall["aiService.generateQuizAgentically"]:::server
    AICall --> QuizPrompt["Build technical interviewer MCQ prompt"]:::ai
    QuizPrompt --> GeminiCall["Call gemini-3-flash-preview with responseMimeType: application/json"]:::ai
    GeminiCall --> ZodValidate["Validate MCQ list with Zod aiQuizSchema"]:::ai
    ZodValidate --> ReturnQuiz["Return 200: Generated MCQ Quiz Data"]:::server

    %% Gameplay Loop
    ReturnQuiz --> PlayQuiz["Interactive MCQ Game Loop: Choose option, track progress"]
    
    %% Submit
    PlayQuiz --> SubmitQuiz["POST /api/quiz/submit"]:::server
    SubmitQuiz --> GradeCheck["Backend validates and stores completed quiz performance"]:::db
    GradeCheck --> SavedResponse["Return 201: Persisted Quiz Results & explanations"]:::server
    SavedResponse --> ResultsUI["Show interactive Results Dashboard with score ring & AI explanations"]

    class Start,PopulateSetup,QuizSetup,GenErr,PlayQuiz,ResultsUI client;
```

---

### 💼 5. Agentic Job Discovery Flow
Orchestrates an intelligent scraping loop utilizing Google Gemini function declarations to look up job postings on LinkedIn and Unstop.

#### 🛠️ Files Involved:
* **Routes**: [job.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/job.routes.js)
* **Controller**: [job.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/job.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (`retrieveJobsAgentically`)
* **Scraper Service**: [job.service.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/job.service.js)

#### 📝 Step-by-Step Flow:
1. **Search Request**:
   * Client posts the search query to `POST /api/jobs/search` with `{ jobRole }`.
2. **Gemini Agentic Tool Trigger**:
   * `retrieveJobsAgentically` sends a prompt specifying the tool definition of `fetchJobPostings` to Gemini.
   * Gemini interprets the intent and responds requesting the execution of the `fetchJobPostings` function with parameters.
3. **Execution Loop**:
   * The backend captures this function call and executes `jobService.fetchJobPostings(jobRole)`.
   * **LinkedIn Guest Scraper**: Runs a request to public Guest Search and extracts listing tags using customized regex match patterns.
   * **Unstop Scraper**: Queries Unstop's search APIs in parallel.
   * The gathered listings are compiled into a raw array and sent back to Gemini.
4. **Relevance Filter & Format**:
   * Gemini analyzes the raw results, filters out any unrelated postings, and structures the response into a validated JSON layout conforming to `jobSearchResultSchema` (Zod), which is then sent to the client.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Input Job Role"] --> AuthCheck{"authMiddleware.authUser"}:::server
    AuthCheck --> SearchPost["POST /api/jobs/search"]:::server
    SearchPost --> AgentCall["aiService.retrieveJobsAgentically"]:::server
    
    %% Call 1
    AgentCall --> AgentPrompt["Build search instruction prompt with fetchJobPostings tool definition"]:::ai
    AgentPrompt --> CallGemini1["Call gemini-3-flash-preview with Tool Declarations"]:::ai
    
    %% Check Tool
    CallGemini1 --> ToolRequested{"Does Gemini call fetchJobPostings tool?"}
    
    %% Branch A: Tool Called
    ToolRequested -->|Yes| RunScraper["Execute jobService.fetchJobPostings with arg jobRole"]:::server
    RunScraper --> ScrapeAPI["Parallel Guest Search Scraper Loop: scrape LinkedIn html & Unstop API"]:::server
    ScrapeAPI --> ScrapedJobs["Return array of scraped job raw objects"]:::server
    ScrapedJobs --> SendToolResult["Send Tool Response back to Gemini"]:::ai
    SendToolResult --> CallGemini2["Call gemini-3-flash-preview with search history + tool result"]:::ai
    
    %% Branch B: Manual Fallback
    ToolRequested -->|No| ManualScrape["Directly execute jobService.fetchJobPostings"]:::server
    ManualScrape --> SendFallbackResult["Send scraped jobs data to Gemini for formatting/filtering"]:::ai
    SendFallbackResult --> CallGeminiFallback["Call Gemini to format JSON response"]:::ai
    
    %% Merge & Zod
    CallGemini2 --> FinalJSON["Parse Gemini response JSON text"]
    CallGeminiFallback --> FinalJSON
    FinalJSON --> ZodCheck["Validate with Zod jobSearchResultSchema: Filter unrelated roles"]:::ai
    ZodCheck --> SearchResponse["Return 200: Clean filtered jobs array"]:::server
    SearchResponse --> DisplayJobs["Display matching job cards in UI"]

    class Start,DisplayJobs client;
```

---

### 🛡️ 6. Admin Management & Access Control Flow
Allows administrators to inspect system registrations, activate/suspend user access, and cascade-delete profiles securely.

#### 🛠️ Files Involved:
* **Routes**: [userManagement.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/userManagement.routes.js)
* **Controller**: [userManagement.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/userManagement.controller.js)
* **Service**: [userManagement.service.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/userManagement.service.js)
* **Auth Middleware**: [auth.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/auth.middleware.js) (`isAdmin` role guard)

#### 📝 Step-by-Step Flow:
1. **Admin Authorization Check**:
   * The `authUser` middleware decodes the JWT token.
   * The `isAdmin` middleware loads the user from the database and checks if `user.role === 'admin'`. If not, it rejects the request with a 403 Forbidden.
2. **List & Search**:
   * Admin opens `/admin/users` which calls `GET /api/admin/users?page=1&limit=10&search=john`.
   * `getUsers()` matches name/email case-insensitively, applies limits/skip values, and counts matches concurrently.
3. **Suspend/Activate**:
   * Admin triggers status toggles, requesting `PATCH /api/admin/users/:id/suspend` or `/activate`.
   * The controller prevents self-suspension by checking if the target ID matches the logged-in admin ID.
   * Status is updated to `suspended` or `active` in the collection.
4. **Cascade Delete**:
   * Admin calls `DELETE /api/admin/users/:id`.
   * The controller enforces a safety guard preventing admin self-deletion.
   * On validation, user is permanently deleted along with parallel deletions for all associated Resumes, Interview Reports, Mock Interviews, Quizzes, and Job Searches.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    
    Start["Admin Actions: Manage Users List"] --> Route{Select Action}
    
    %% List
    Route -->|List / Search| ListReq["GET /api/admin/users"]:::server
    ListReq --> AuthGuard["authMiddleware.authUser & authMiddleware.isAdmin"]:::server
    AuthGuard --> QueryUsers["Query DB with pagination limits & regex search"]:::db
    QueryUsers --> ReturnList["Return 200: Paginated users array + metadata"]:::server
    
    %% Suspend
    Route -->|Suspend User| SuspendReq["PATCH /api/admin/users/:id/suspend"]:::server
    SuspendReq --> CheckSelfSus["Check if target ID == admin ID"]:::server
    CheckSelfSus -->|Self| RejectSus["Return 400: Cannot suspend yourself"]:::server
    CheckSelfSus -->|Valid| UpdateSus["Update status to 'suspended' in DB"]:::db
    UpdateSus --> SusSuccess["Return 200: Account Suspended"]:::server
    
    %% Cascade Delete
    Route -->|Delete User| DeleteReq["DELETE /api/admin/users/:id"]:::server
    DeleteReq --> CheckSelfDel["Check if target ID == admin ID"]:::server
    CheckSelfDel -->|Self| RejectDel["Return 400: Cannot delete yourself"]:::server
    CheckSelfDel -->|Valid| DbDel["Delete user account from DB"]:::db
    DbDel --> CascadeClean["Parallel cleanup: Delete associated Resumes, Reports, Quizzes, Interviews"]:::db
    CascadeClean --> DelSuccess["Return 200: User and all data deleted"]:::server

    class Start,ReturnList,RejectSus,SusSuccess,RejectDel,DelSuccess client;
```

---

### 📊 7. Telemetry Monitoring & Streaming Exports Flow
Calculates parallel stats aggregates and streams massive log exports with low memory footprints.

#### 🛠️ Files Involved:
* **Routes**: [export.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/routes/export.routes.js), [dashboard.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/routes/dashboard.routes.js), [aiAnalytics.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/routes/aiAnalytics.routes.js)
* **Controller**: [export.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/controllers/export.controller.js), [dashboard.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/controllers/dashboard.controller.js), [aiAnalytics.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/controllers/aiAnalytics.controller.js)
* **Service**: [export.service.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/services/export.service.js), [dashboard.service.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/services/dashboard.service.js), [aiAnalytics.service.js](file:///c:/Users/mibni/OneDrive/Desktop/AGENTIC%20AI/backend/src/services/aiAnalytics.service.js)

#### 📝 Step-by-Step Flow:
1. **Parallel Aggregation**:
   * `GET /api/admin/stats` triggers `getDashboardStats()`. It runs concurrent aggregates on 5 models to fetch counts, scores, and weekly growth alongside the last 7 days of daily activity.
2. **Low-Memory Export Streams**:
   * Admin requests file downloads via `/api/admin/export/:module?format=csv|xlsx|pdf`.
   * **CSV Mode**: Uses a Mongoose cursor to pipe and write matching records row-by-row directly to the Express output stream, maintaining a constant memory profile.
   * **Excel Mode**: Initializes a streaming workbook writer (`ExcelJS.stream.xlsx.WorkbookWriter`) to pipe workbook parts dynamically.
   * **PDF Mode**: Directs a `PDFKit` document stream, rendering professional summaries, metadata headers, and formatted tables page-by-page.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    
    Start["Admin: Reports Export Request"] --> Route{Select API}
    
    %% Dashboard Stats
    Route -->|Dashboard Stats| StatsReq["GET /api/admin/stats"]:::server
    StatsReq --> ParallelAgg["Parallel DB aggregates: users, resumes, reports, quizzes, interviews"]:::db
    ParallelAgg --> StatsSuccess["Return 200: Counts, scores, weekly trend data"]:::server

    %% Streaming Exports
    Route -->|Export Logs| ExportReq["GET /api/admin/export/:module?format=csv|xlsx|pdf"]:::server
    ExportReq --> FormatBranch{Select Format}
    
    FormatBranch -->|CSV| CSVStream["Mongoose Cursor: stream & write rows to response stream"]:::server
    FormatBranch -->|XLSX| XLSXStream["ExcelJS stream writer: pipe chunk rows to response stream"]:::server
    FormatBranch -->|PDF| PDFStream["PDFKit stream: pipe document pages directly to client"]:::server
    
    CSVStream --> DownloadSuccess["Client completes download"]
    XLSXStream --> DownloadSuccess
    PDFStream --> DownloadSuccess

    class Start,StatsSuccess,DownloadSuccess client;
```

---

### ✂️ 8. AI Resume Tailoring Flow
Analyzes the uploaded resume or stored resume and tailors it specifically to align with target job requirements, allowing users to tweak it and persist the tailored copy.

#### 🛠️ Files Involved:
* **Routes**: [tailor.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/tailor.routes.js)
* **Controller**: [tailor.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/tailor.controller.js)
* **AI Service**: [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js) (`generateTailoredResume`)
* **Model**: [resume.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/resume.model.js)

#### 📝 Step-by-Step Flow:
1. **Tailor Request**:
   * Client posts the tailoring request to `POST /api/tailor/` with a target `jobDescription`.
   * **Source Select Option**: If `resumeId` is present, the backend queries MongoDB for the resume text. Otherwise, a PDF file is uploaded via Multer, and `pdf-parse` extracts the text dynamically.
2. **AI Resume Tailoring**:
   * The backend forwards the details to `aiService.generateTailoredResume()`.
   * Gemini analyzes the resume against the target description and structures a tailored copy (optimizing highlights, summary, experience, and project matches) alongside actionable suggestions.
3. **Save Tailored Resume**:
   * The client renders an editor. When the user saves the tailored resume, a `POST` request is sent to `/api/tailor/save` with the `editedData` (JSON) and custom `resumeName`.
   * The backend persists it inside `resumeModel` with a `[Tailored] ` prefix.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Select/Upload Resume & Input Job Description"] --> Route{Action}
    
    %% Tailor
    Route -->|Tailor Request| POST_Tailor["POST /api/tailor/"]:::server
    POST_Tailor --> CheckSource{"has resumeId?"}:::server
    CheckSource -->|Yes| FetchStored["Retrieve resume text from DB"]:::db
    CheckSource -->|No| ParsePDF["pdf-parse: parse PDF upload buffer"]:::server
    FetchStored --> CallAI["aiService.generateTailoredResume"]:::server
    ParsePDF --> CallAI
    CallAI --> Gemini["Gemini: Align skills & experiences to Job Description"]:::ai
    Gemini --> ReturnTailored["Return 200: Tailored resume JSON & suggestions"]:::server
    
    %% Save
    Route -->|Save Tailored| POST_Save["POST /api/tailor/save"]:::server
    POST_Save --> SaveDB["Create new resumeModel document (JSON text string)"]:::db
    SaveDB --> SaveSuccess["Return 201: Saved Tailored Resume to portfolio"]:::server

    class Start,ReturnTailored,SaveSuccess client;
```

---

### 🎙️ 9. Conversational Mock Interviews Flow
Implements voice-capable conversational mock interviews using a sequential multi-agent architecture with adaptive difficulty scaling.

#### 🛠️ Files Involved:
* **Routes**: [mockInterview.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/mockInterview.routes.js)
* **Controller**: [mockInterview.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/mockInterview.controller.js)
* **Agents Service**: [mockInterview.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/mockInterview.services.js) (`runPlannerAgent`, `runInterviewAgent`, `runEvaluatorAgent`, `runFeedbackAgent`)
* **Model**: [mockInterview.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/mockInterview.model.js), [resume.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/resume.model.js)

#### 📝 Step-by-Step Flow:
1. **Initiate Session**:
   * Client posts `jobRole`, optional `resumeId`, and `difficulty` to `POST /api/mock-interview/start`.
   * **Planner Agent**: Parses the target role and resume to identify exactly 3 core technical focus areas.
   * **Interview Agent**: Generates the first technical question targeting focal area 1.
   * The backend saves a new `MockInterview` session document in MongoDB and returns the session details with Question 1.
2. **Dynamic Q&A Loop**:
   * The user answers the question. The response can be submitted as text or as a recorded audio file (captured in `multipart/form-data` under the `audio` name).
   * **Evaluator Agent**: Evaluates the answer. If audio is uploaded, it transcribes the speech first. It scores the user (0-100), offers constructive feedback, and generates an ideal reference answer.
   * **Adaptive Difficulty**: If the score is $\ge 80$, the session difficulty increments (e.g. Easy $\to$ Medium). If the score is $< 60$, it drops.
   * **Interview Agent**: Generates the next question by analyzing the transcript history and focus areas.
   * The backend updates the database and returns the evaluation and Question 2.
3. **Session Finish & Report**:
   * The user clicks "Finish Interview". Client sends a `POST` request to `/api/mock-interview/:id/finish`.
   * **Feedback Agent**: Processes the entire interview history. It calculates overall performance scores, technical/communication grades, highlights strengths/weaknesses, lists lacking skills, and proposes study recommendations.
   * The backend sets status to `"completed"` and persists the feedback report.

```mermaid
graph TD
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef server fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef db fill:#f59e0b,stroke:#b45309,color:#fff,font-weight:bold;
    classDef ai fill:#8e75c2,stroke:#6b21a8,color:#fff,font-weight:bold;

    Start["Client: Select Job Role & Resume"] --> StartSession["POST /api/mock-interview/start"]:::server
    StartSession --> PlannerAgent["Run Planner Agent: Extract details & 3 focus areas"]:::ai
    PlannerAgent --> InterviewAgent1["Run Interview Agent: Generate Question 1"]:::ai
    InterviewAgent1 --> CreateSession["Create mockInterviewModel document (status: initiated)"]:::db
    CreateSession --> PlayUI["Client: Show dynamic Q&A voice dashboard"]
    
    %% Q&A Loop
    PlayUI --> SubmitAnswer["POST /api/mock-interview/:id/answer"]:::server
    SubmitAnswer --> EvaluatorAgent["Run Evaluator Agent: Transcribe audio/text & score (0-100)"]:::ai
    EvaluatorAgent --> AdaptiveDifficulty["Scale difficulty dynamically based on score"]:::server
    AdaptiveDifficulty --> InterviewAgent2["Run Interview Agent: Check history & generate next question"]:::ai
    InterviewAgent2 --> UpdateSession["Append question & update session details in DB"]:::db
    UpdateSession --> PlayUI
    
    %% Finish
    PlayUI --> FinishSession["POST /api/mock-interview/:id/finish"]:::server
    FinishSession --> FeedbackAgent["Run Feedback Agent: Compile score ring, strengths, weaknesses & guidelines"]:::ai
    FeedbackAgent --> CompleteSession["Update DB status to completed with report details"]:::db
    CompleteSession --> ShowReport["Client: Show final professional performance dashboard"]

    class Start,PlayUI,ShowReport client;
```
