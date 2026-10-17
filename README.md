# CogniScan 🧠

> **AI-Powered Cognitive Health & Early Impairment Assessment Platform**

CogniScan is a full-stack, clinically grounded web application built to help individuals and caregivers screen, track, and monitor cognitive health. By integrating AI-powered speech analysis through Groq Whisper and LLaMA with interactive micro-cognitive assessments, CogniScan delivers real-time scoring, longitudinal trend tracking, and multilingual support.

---
## 🧪 Assessment Workflow

CogniScan combines speech-based analysis with interactive cognitive assessments to provide a broader view of cognitive performance. Users can complete individual activities, review their assessment results, and track changes over time through personalized dashboards.

## 🌟 Key Features

### 1. 🎙️ AI Speech & Acoustic Analysis

- **Automatic Speech Recognition:** Uses Groq Whisper for audio transcription with word-level timestamps.
- **Acoustic & Linguistic Biomarkers:** Analyzes Words Per Minute (WPM), speech pause durations, filler word frequency, and grammatical cohesion.
- **Cognitive Prompts:** Provides daily recall activities and targeted cognitive speech prompts with AI-powered qualitative evaluation.

### 2. 🧩 Interactive Cognitive & Brain Tests

- **Memory Recall:** Generates dynamic word lists and evaluates both exact and semantic recall.
- **Reaction Time:** Measures reaction speed and vigilance with millisecond-level precision.
- **Number Sequence / Working Memory:** Uses dynamic pattern puzzles to assess working memory and processing speed.
- **Word Fluency Test:** Offers category-based semantic and phonemic fluency challenges.
- **Pattern Matching:** Evaluates visuospatial reasoning and processing speed through visual matching tasks.
- **Clock Drawing Test & Dual-Task Assessments:** Includes digitized, clinically inspired screening activities.

### 3. 👥 Patient & Caregiver Portals

- Supports dedicated, role-based experiences for patients and caregivers.
- Provides longitudinal dashboards with interactive performance charts using Chart.js and Recharts.
- Displays real-time risk indicators and tracks cognitive performance over time.

### 4. 🌐 Multilingual & Localized

- Offers internationalization support through `i18next`, with **English, Hindi, and Marathi** available.

---

## 🏗️ Architecture & Tech Stack

### **Frontend**

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion for smooth transitions and animations
- **State Management:** Zustand
- **Local Database & Sync:** Dexie (IndexedDB)
- **Authentication & Cloud Backend:** Firebase Authentication & Firestore
- **Charts:** Chart.js, React-Chartjs-2, Recharts
- **Internationalization:** i18next + react-i18next

### **Backend**

- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn
- **AI / LLM Integration:** Groq Cloud SDK (`groq-python`)
  - Whisper API for audio transcription and word-level timestamps
  - LLaMA models for semantic reasoning and qualitative assessment
- **Data & Numerical Processing:** NumPy, Pydantic

---

## 📁 Repository Structure

```text
CogniScan/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                      # Backend environment variables
│   ├── main.py                   # FastAPI application entrypoint
│   ├── requirements.txt          # Python dependencies
│   ├── routers/
│   │   ├── cognitive.py          # Cognitive test endpoints
│   │   └── speech.py             # Speech recording & analysis endpoints
│   └── services/
│       ├── cognitive_service.py  # Scoring algorithms & prompt generation
│       └── groq_service.py       # Groq Whisper & LLaMA integration
└── frontend/
    ├── package.json              # Frontend dependencies and scripts
    ├── vite.config.js            # Vite configuration
    ├── tailwind.config.js        # Tailwind CSS configuration
    └── src/
        ├── components/           # Reusable UI, layout & navigation
        ├── pages/                # Patient, Caregiver & Test views
        ├── firebase/             # Firebase auth and database services
        ├── i18n/                 # Localization files (en, hi, mr)
        └── store/                # Zustand global application state
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher) and **npm**
- **Python** (v3.10 or higher)
- **Groq API Key:** [Get one from Groq Console](https://console.groq.com/)
- **Firebase Project:** Optional, for authentication and cloud synchronization

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   - **Windows (PowerShell):**

     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

   - **macOS / Linux:**

     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the environment variables:

   Create a `.env` file inside the `backend/` directory and add your Groq API key:

   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. Launch the FastAPI development server:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

   - **API URL:** `http://localhost:8000`
   - **Swagger Docs:** `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:

   ```bash
   npm install
   ```

3. Configure the environment variables (if applicable):

   Create a `.env` file inside the `frontend/` directory and add your Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the Vite development server:

   ```bash
   npm run dev
   ```

   - **Access the application at:** `http://localhost:5173`

---

## 🔒 Security & Privacy Notice

CogniScan is designed for cognitive screening, research, and tracking purposes. It is **not a replacement for professional clinical diagnosis**. Audio recordings and cognitive inputs are securely analyzed and are not stored without explicit user consent.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
