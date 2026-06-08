# 🚀 GenAI-Resume Backend

An AI-powered recruitment and interview preparation backend that parses PDF resumes, matches them against job descriptions, and utilizes the Google Gemini API to generate tailored interview questions, skill gap analyses, and weekly preparation plans.

---

## ✨ Features

- **Auth System**: Full user registration, login, logout, and token blacklisting using JWT and Cookie Parser.
- **PDF Resume Parsing**: Extracts text dynamically from uploaded PDF resumes in-memory.
- **Google Gemini Integration**: Uses `gemini-2.5-flash` to execute structured LLM prompt reasoning and schema compliance.
- **Detailed Interview Coaching Reports**:
  - **Match Score**: Candidate profile alignment percentage (0-100%).
  - **Technical Interview Questions**: 5-7 customized questions with candidate-intent explanations and optimal answers.
  - **Behavioral Questions**: 3-5 tailored behavioral questions.
  - **Skill Gaps**: Realistic assessment of developer skill gaps, tagged with severity (`low`, `medium`, `high`).
  - **7-day Preparation Plan**: Day-by-day customized curriculum of focus topics and tasks.

---

## 🛠️ Tech Stack & Dependencies

All dependencies are defined in [backend/package.json](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/package.json):

### Core Server
- **Express** (`^5.2.1`): Main web framework for building APIs.
- **Mongoose** (`^9.6.3`): MongoDB Object Data Modeling (ODM) library.
- **Cookie Parser** (`^1.4.7`): Middleware to parse cookies for auth tokens.
- **Nodemon** (`^3.1.14`): Development utility to auto-restart the application.

### Security & Authentication
- **JSON Web Tokens (JWT)** (`^9.0.2`): Tokens for user sessions.
- **Bcrypt** (`^6.0.0`): Hashing user passwords securely.

### AI & Data Processing
- **Google GenAI SDK** (`@google/genai` `^2.8.0`): SDK integration for Google Gemini models.
- **Zod** (`^4.4.3`): Schema validation for input parsing and structured output.
- **Zod to JSON Schema** (`^3.25.2`): Translates Zod schemas into JSON structures for Gemini configuration.
- **PDF-Parse** (`^1.1.1`): Server-side library to read and parse PDF documents.
- **Multer** (`^2.1.1`): Multipart form-data parser for processing file uploads in-memory.

---

## 📁 Project Structure

The project directory consists of the following components:

- **Root files**:
  - [README.md](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/README.md): Project overview and installation instructions.
  - [.gitignore](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/.gitignore): Tells Git which files to ignore (such as `.env` and `node_modules`).
- **[backend/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend)**:
  - [server.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/server.js): Starts the HTTP server listener on port 3000 and initializes the database connection.
  - [index.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/index.js): Sets up Express middleware, loads routes, and exports the app.
  - **[config/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/config)**:
    - [db.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/config/db.js): Handles connections to MongoDB.
  - **[src/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src)**:
    - **[routes/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes)**:
      - [user.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/user.routes.js): User registration, login, logout, and self retrieval routes.
      - [interview.routes.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/routes/interview.routes.js): PDF resume upload and AI analysis generation routes.
    - **[controllers/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers)**:
      - [user.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js): Route handlers for auth operations. Contains [userRegisterController](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L6), [userloginController](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L31), [userLogoutController](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L67), and [getUserController](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/user.controller.js#L93).
      - [interview.controller.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/interview.controller.js): Handler for uploading, generating, and retrieving reports. Contains [generateUserInterviewReport](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/interview.controller.js#L7) and [getUserInterviewReportsHistory](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/controllers/interview.controller.js#L46).
    - **[middlewares/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares)**:
      - [auth.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/auth.middleware.js): Token checking and blacklisting check via [authUser](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/auth.middleware.js#L4).
      - [file.middleware.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/file.middleware.js): Sets up [upload](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/middlewares/file.middleware.js#L3) via Multer memory storage.
    - **[services/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services)**:
      - [ai.services.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js): Core integration with Gemini API containing [generateInterviewReport](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/services/ai.services.js#L45).
    - **[models/](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models)**:
      - [user.models.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/user.models.js): MongoDB schema defining user credentials.
      - [BlackList.model.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/BlackList.model.js): Token blacklist storage for logging out users.
      - [interviewReportModel.js](file:///c:/Users/mibni/OneDrive/Desktop/GenAI-Resume/backend/src/models/interviewReportModel.js): Stores analysis results and scores.

---

## ⚙️ Prerequisites & Environment Variables

Make sure you have **Node.js** (v18+) and **MongoDB** installed on your system. 

Before running the application, you must set up the environment variables. Create a file named `.env` in the `backend` directory:

```env
# MongoDB Connection String (Local or Atlas)
mongo_uri=mongodb://localhost:27017/genai-resume

# Google Gemini API key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret key for authentication encryption
jwt_secret=your_super_secret_jwt_key_here
```

---

## 🚀 Getting Started

Follow these steps to run the application on your local system:

### 1. Install Dependencies
Open your terminal, navigate to the `backend` folder, and install node packages:
```bash
cd backend
npm install
```

### 2. Run the Server
- **Production Mode / Run Server**:
  To start the server listener properly (which initializes the database connection and listens on port 3000), run:
  ```bash
  npm start
  ```
  *(This executes `nodemon server.js`)*

- **Development Route Check**:
  To verify `index.js` file structure during coding without opening port 3000:
  ```bash
  npm run dev
  ```
  *(This executes `nodemon index.js`)*

---

## 🔌 API Documentation

### 🔑 Authentication Endpoints

#### 1. Register User
- **Route**: `POST /api/auth/register`
- **Body (`application/json`)**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "securepassword"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "user": {
      "_id": "60d0fe4f5311236168a109a2",
      "email": "johndoe@example.com",
      "name": "John Doe"
    }
  }
  ```

#### 2. Login User
- **Route**: `POST /api/auth/login`
- **Body (`application/json`)**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword"
  }
  ```
- **Response (`200 OK`)** (Sets a cookie named `token`):
  ```json
  {
    "user": {
      "_id": "60d0fe4f5311236168a109a2",
      "email": "johndoe@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 3. Fetch User Profile
- **Route**: `GET /api/auth/get-me`
- **Headers**: Cookies must contain `token=<jwt_token>`
- **Response (`200 OK`)**:
  ```json
  {
    "message": "User details fetched successfully",
    "user": {
      "id": "60d0fe4f5311236168a109a2",
      "email": "johndoe@example.com"
    }
  }
  ```

#### 4. Logout User
- **Route**: `POST /api/auth/logout`
- **Headers**: Cookie `token` or Authorization Bearer header
- **Response (`200 OK`)**:
  ```json
  {
    "status": "Success",
    "message": "User Logout Successful"
  }
  ```

---

### 📝 Interview Preparation Endpoints

#### 1. Generate & Save Interview Report
- **Route**: `POST /api/interview/`
- **Headers**: Cookies must contain `token=<jwt_token>` (required)
- **Body (`multipart/form-data`)**:
  - `resume`: PDF resume file (required)
  - `selfDescription`: String (optional)
  - `jobDescription`: String (optional)
- **Response (`201 Created`)** (Saves the report dynamically to MongoDB linked to the active user profile):
  ```json
  {
    "status": "Successful",
    "response": {
      "_id": "60d0fe4f5311236168a109c4",
      "title": "Software Engineer",
      "matchScore": 85,
      "technicalQuestions": [
        {
          "question": "What is...",
          "intention": "To assess...",
          "answer": "..."
        }
      ],
      "behavioralQuestions": [
        {
          "question": "Tell me about...",
          "intention": "To test...",
          "answer": "..."
        }
      ],
      "skillGaps": [
        {
          "skill": "System Design",
          "severity": "medium"
        }
      ],
      "preparationPlan": [
        {
          "day": 1,
          "focus": "Algorithm Practice",
          "tasks": ["Solve two graph theory challenges"]
        }
      ],
      "user": "60d0fe4f5311236168a109a2",
      "jobDescription": "General Profile Assessment",
      "selfDescription": "",
      "createdAt": "2026-06-08T11:30:00.000Z",
      "updatedAt": "2026-06-08T11:30:00.000Z"
    }
  }
  ```

#### 2. Get User Report History
- **Route**: `GET /api/interview/history`
- **Headers**: Cookies must contain `token=<jwt_token>` (required)
- **Response (`200 OK`)**:
  ```json
  {
    "status": "Successful",
    "reports": [
      {
        "_id": "60d0fe4f5311236168a109c4",
        "title": "Software Engineer",
        "matchScore": 85,
        "technicalQuestions": [...],
        "behavioralQuestions": [...],
        "skillGaps": [...],
        "preparationPlan": [...],
        "user": "60d0fe4f5311236168a109a2",
        "jobDescription": "General Profile Assessment",
        "selfDescription": "",
        "createdAt": "2026-06-08T11:30:00.000Z",
        "updatedAt": "2026-06-08T11:30:00.000Z"
      }
    ]
  }
  ```
