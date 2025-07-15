# Car Recommendation App 🚗

This is a full-stack car recommendation system built as a Bachelor’s thesis project. The app uses modern web technologies and machine learning to provide users with personalized and intelligent car suggestions based on their behavior and preferences.

## 🔍 Key Features

- **Car recommendations** based on:
  - a structured **form** with user preferences;
  - a **free-text description** of driving style or personal needs;
- **Semi-automated AI assistant** that classifies user messages into categories (e.g., accidents, documents, account issues) for quick responses;
- **Custom OCR** system for verifying identity documents (ID card and driving license, category B);
- **LLM-powered NLP processing**: transforms user input text into usable JSON for recommendation logic;
- **Web scraping** to collect real-world car listings for training the ML model.

## ⚙️ Technologies Used

### 🧠 Machine Learning & AI
- `scikit-learn`, `joblib` – model training and serialization
- `nltk`, `langchain`, `pydantic`, `ollama` – NLP and LLM pipeline
- `easyocr` – Optical Character Recognition

### 🖥️ Frontend
- `React` with `Vite`
- `Material UI (MUI)`

### 🖥️ Backend
- `Node.js`, `Express` – main API server
- `Flask` – ML model serving

### 🗃️ Databases
- `MongoDB` – for user and document data
- `Firebase Realtime Database` – real-time interactions (e.g., AI assistant)

### 🔧 Other Tools
- `Selenium` – for automated data collection via web scraping

## ▶️ How to Run the App

### 1. Clone the Repository
```bash
git clone https://github.com/stefanoctavian85/Car-Recommendation-App.git
cd Car-Recommendation-App
```

### 2. Start the React Client
```bash
cd client
npm install
npm run dev
```

### 3. Start the Node.js Backend
```bash
cd server
npm install
npm start
```

### 4. Start the Flask ML Server
```bash
cd carPredict
pip install -r requirements.txt
python model_ML.py
```

### 5. Start Ollama (LLM Service)
```bash
ollama serve
```

> Make sure you have an LLM (e.g., LLaMA 3.2:3b) already pulled:  
> `ollama run llama3.2:3b`

---

## 📁 Project Structure (Simplified)

```
Car-Recommendation-App/
│
├── client/              # React frontend
├── server/              # Node.js backend (Express)
├── carPredict/          # Flask ML model server
├── scrapers/            # Selenium scripts for data collection
└── README.md
```

## 📌 Status

This app was created as a final year Bachelor's thesis project.