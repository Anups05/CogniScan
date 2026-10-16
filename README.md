# CogniScan 🧠

> **AI-Powered Cognitive Health & Early Impairment Assessment Platform**

CogniScan is a full-stack, clinically-grounded web application designed to help individuals and caregivers screen, track, and monitor cognitive health. By combining AI speech analysis (via Groq Whisper & LLaMA) and interactive micro-cognitive assessments, CogniScan provides real-time scoring, longitudinal trend tracking, and multi-language support.

---

## 🌟 Key Features

### 1. 🎙️ AI Speech & Acoustic Analysis
- **Automatic Speech Recognition:** Powered by Groq Whisper with word-level timestamps.
- **Acoustic & Linguistic Biomarkers:** Measures Words Per Minute (WPM), speech pause durations, filler word frequency, and grammatical cohesion.
- **Cognitive Prompts:** Daily Recall and targeted cognitive speech prompts with AI qualitative evaluation.

### 2. 🧩 Interactive Cognitive & Brain Tests
- **Memory Recall:** Generates dynamic word lists and scores both exact and semantic recall.
- **Reaction Time:** Millisecond-accurate reaction and vigilance measurements.
- **Number Sequence / Working Memory:** Dynamic pattern puzzles assessing working memory and processing speed.
- **Word Fluency Test:** Category-based semantic and phonemic fluency challenges.
- **Pattern Matching:** Visual spatial reasoning and speed tests.
- **Clock Drawing Test & Dual-Task Assessments:** Digitized clinical-inspired screenings.

### 3. 👥 Patient & Caregiver Portals
- Role-based experiences for both patients and caregivers.
- Longitudinal dashboards with interactive performance charts (Chart.js & Recharts).
- Instant risk indicators and longitudinal progression tracking.

### 4. 🌐 Multilingual & Localized
- Full internationalization support with `i18next` (**English**, **Hindi**, **Marathi**).

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion (fluid transitions & animations)
- **State Management:** Zustand
- **Local Database & Sync:** Dexie (IndexedDB)
- **Authentication & Cloud Backend:** Firebase Authentication & Firestore
- **Charts:** Chart.js, React-Chartjs-2, Recharts
- **Internationalization:** i18next + react-i18next

### **Backend**
- **Framework:** FastAPI (Python 3.10+)
- **Server:** Uvicorn
- **AI / LLM Integration:** Groq Cloud SDK (`groq-python`)
  - Whisper API (Audio transcription + word timestamps)
  - LLaMA Models (Semantic reasoning, qualitative assessment)
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
        ├── firebase/             # Firebase auth & database services
        ├── i18n/                 # Localization files (en, hi, mr)
        └── store/                # Zustand global application state
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **Python** (v3.10 or higher)
- **Groq API Key** ([Get one from Groq Console](https://console.groq.com/))
- **Firebase Project** (Optional, for Auth and cloud syncing)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
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

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create a `.env` file inside `backend/`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - **API URL:** `http://localhost:8000`
   - **Swagger Docs:** `http://localhost:8000/docs`

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (if applicable):
   Create a `.env` file in `frontend/` with your Firebase credentials:
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
   - Access the application at: `http://localhost:5173`

---

## 🔒 Security & Privacy Notice
CogniScan is developed for cognitive screening, research, and tracking purposes. It is **not a replacement for professional clinical diagnosis**. Audio recordings and cognitive inputs are securely analyzed and not stored without explicit user consent.

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
