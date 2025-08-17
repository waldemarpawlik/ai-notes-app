# 📝 AI Notes - Aplikacja Zaliczeniowa

Inteligentna aplikacja do zarządzania notatkami z funkcjami AI, stworzona jako projekt zaliczeniowy.

## 🎯 Opis Projektu

AI Notes to nowoczesna aplikacja webowa umożliwiająca tworzenie, edytowanie i zarządzanie notatkami z wykorzystaniem sztucznej inteligencji do automatycznego generowania podsumowań, kategoryzacji i analizy sentymentu.

## ✅ Wymagania Zaliczeniowe - Realizacja

### 1. 🔐 **Obsługa logowania użytkownika (auth)**
- ✅ **Implementacja**: Supabase Auth
- ✅ **Funkcjonalności**:
  - Rejestracja nowych użytkowników
  - Logowanie/wylogowanie
  - Ochrona tras (ProtectedRoute)
  - Zarządzanie sesją użytkownika
- ✅ **Pliki**: `src/lib/auth-context.tsx`, `src/components/LoginForm.tsx`, `src/components/ProtectedRoute.tsx`

### 2. 🧠 **Podstawowa logika biznesowa**
- ✅ **Implementacja**: AI Summary Service + Notes Business Logic
- ✅ **Funkcjonalności**:
  - Integracja z OpenAI GPT-3.5-turbo
  - Automatyczne generowanie podsumowań notatek
  - Kategoryzacja treści (10 kategorii)
  - Analiza sentymentu i generowanie tagów
  - Real-time synchronizacja danych
- ✅ **Pliki**: `src/lib/ai-summary.ts`, `src/lib/notes.ts`

### 3. 📊 **CRUD - Zarządzanie danymi**
- ✅ **Implementacja**: Pełny CRUD notatek
- ✅ **Operacje**:
  - **Create**: Tworzenie nowych notatek z AI analizą
  - **Read**: Wyświetlanie listy notatek z filtrowaniem/sortowaniem
  - **Update**: Edycja notatek z aktualizacją metadanych
  - **Delete**: Usuwanie notatek z potwierdzeniem
- ✅ **Dodatkowe funkcje**: 
  - Wyszukiwanie w treści
  - Batch processing (masowe podsumowania)
  - Kategoryzacja i tagowanie
- ✅ **Pliki**: `src/components/NoteForm.tsx`, `src/components/NotesList.tsx`, `src/components/NoteCard.tsx`

### 4. 🧪 **Testy**
- ✅ **Testy jednostkowe (Vitest)**:
  - Testowanie funkcji NotesUtils (21 testów)
  - Pokrycie: formatowanie dat, truncation, word count, reading time
  - Lokalizacja: `src/test/notes.test.ts`
- ✅ **Testy E2E (Playwright)**:
  - Pełny przepływ użytkownika: rejestracja → logowanie → CRUD notatek
  - Testowanie UI i nawigacji
  - Lokalizacja: `tests/notes-crud.spec.ts`

### 5. 🔄 **CI/CD Pipeline (GitHub Actions)**
- ✅ **Implementacja**: `.github/workflows/ci.yml`
- ✅ **Etapy pipeline**:
  - **Test Job**: Linting + Unit Tests + E2E Tests
  - **Build Job**: Budowanie aplikacji produkcyjnej
  - **Deploy Job**: Przygotowanie do wdrożenia
- ✅ **Triggery**: Push/PR na main/master branch
- ✅ **Artefakty**: Build artifacts, Playwright reports

## 🛠️ Stack Technologiczny

- **Frontend**: Astro 5 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI GPT-3.5-turbo
- **Testing**: Vitest (unit) + Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Deployment Ready**: Vercel/Netlify compatible

## 🚀 Instrukcja Uruchomienia

### Wymagania
- Node.js 20+
- npm lub yarn
- Konto Supabase
- Klucz OpenAI API (opcjonalnie)

### 1. Instalacja
```bash
git clone <repository-url>
cd ai-notes-app
npm install
```

### 2. Konfiguracja środowiska
Utwórz plik `.env` na podstawie `.env.example`:
```bash
# Supabase (wymagane)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (opcjonalne - dla funkcji AI)
PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 3. Baza danych
```bash
# Uruchom migracje Supabase
npx supabase init
npx supabase start
npx supabase db push
```

### 4. Uruchomienie
```bash
# Development
npm run dev

# Testy
npm test                  # Unit tests
npm run test:e2e         # E2E tests

# Production build
npm run build
```

## 📁 Struktura Projektu

```
ai-notes-app/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx         # Main app
│   │   ├── LoginForm.tsx   # Auth form
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── NoteForm.tsx    # CRUD form
│   │   ├── NoteCard.tsx    # Note display
│   │   └── NotesList.tsx   # Notes listing
│   ├── lib/
│   │   ├── auth-context.tsx # Auth logic
│   │   ├── notes.ts        # Notes service
│   │   ├── ai-summary.ts   # AI logic
│   │   └── supabase.ts     # DB config
│   ├── test/               # Unit tests
│   └── types/              # TypeScript types
├── tests/                  # E2E tests
├── supabase/
│   └── migrations/         # DB migrations
├── .github/workflows/      # CI/CD
└── docs/                   # Documentation
```

## 🧪 Informacje o Testach

### Unit Tests (Vitest)
```bash
npm test
```
- **Lokalizacja**: `src/test/notes.test.ts`
- **Pokrycie**: NotesUtils functions (21 tests)
- **Funkcje testowane**: formatDate, truncateText, generateSummary, countWords, etc.

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
- **Lokalizacja**: `tests/notes-crud.spec.ts`
- **Scenariusze**: 
  - Pełny przepływ CRUD
  - Walidacja formularzy
  - Nawigacja UI

## 🔧 CI/CD Pipeline

Pipeline automatycznie uruchamia się przy każdym push/PR:

1. **Test Phase**: 
   - Instalacja dependencies
   - Linting (build check)
   - Unit tests
   - E2E tests

2. **Build Phase**: 
   - Production build
   - Upload artifacts

3. **Deploy Phase**: 
   - Ready for deployment

## 🌟 Funkcjonalności Dodatkowe

Oprócz wymagań zaliczeniowych, aplikacja zawiera:

- 🤖 **AI-powered features**: Automatyczne podsumowania, kategoryzacja
- 🔍 **Advanced search**: Wyszukiwanie w treści notatek  
- 🏷️ **Tagging system**: Automatyczne i manualne tagowanie
- 📱 **Responsive design**: Pełna responsywność
- ⚡ **Real-time sync**: Synchronizacja w czasie rzeczywistym
- 🎨 **Modern UI**: Tailwind CSS + Lucide Icons

## 🎓 Projekt Zaliczeniowy - Podsumowanie

Aplikacja AI Notes spełnia wszystkie wymagania zaliczeniowe:

✅ **Auth** - Supabase Auth z rejestracją/logowaniem  
✅ **Logika biznesowa** - AI Summary + Notes management  
✅ **CRUD** - Pełny CRUD notatek z zaawansowanymi funkcjami  
✅ **Testy** - Unit (Vitest) + E2E (Playwright)  
✅ **CI/CD** - GitHub Actions pipeline  

Dodatkowo projekt demonstruje:
- Nowoczesny stack technologiczny
- Integrację z AI (OpenAI)
- Zaawansowane testowanie
- Production-ready deployment
- Dokumentację i best practices

---

**Autor**: Waldemar Pawlik  
**Technologie**: Astro + React + TypeScript + Supabase + OpenAI  
**Status**: ✅ Kompletna implementacja wymagań zaliczeniowych