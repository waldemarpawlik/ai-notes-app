# 🧠 AI Summary - Przewodnik funkcjonalności

## 📋 Przegląd

Funkcja AI Summary dodaje inteligentne możliwości do aplikacji AI Notes, pozwalając na automatyczne generowanie podsumowań, kategoryzację notatek i analizę sentymentu za pomocą OpenAI GPT.

## 🔧 Konfiguracja

### 1. Klucz API OpenAI

Aby korzystać z funkcji AI Summary, potrzebujesz klucza API OpenAI:

1. Zarejestruj się na [OpenAI Platform](https://platform.openai.com/)
2. Utwórz klucz API w sekcji API Keys
3. Dodaj go do zmiennych środowiskowych:

```bash
# .env lub .env.local
PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Migracja bazy danych

Uruchom nową migrację żeby dodać pola AI:

```sql
-- Już zawarte w supabase/migrations/02_add_ai_fields.sql
ALTER TABLE notes 
ADD COLUMN category TEXT,
ADD COLUMN tags TEXT[];
```

## 🚀 Funkcjonalności

### 1. **Automatyczne podsumowania**
- **Szybkie podsumowanie**: 1-2 zdania głównych punktów
- **Pełna analiza**: Szczegółowe podsumowanie z kluczowymi punktami
- **Edytowalne**: Wszystkie podsumowania można ręcznie modyfikować

### 2. **Inteligentna kategoryzacja**
- Automatyczne przypisywanie kategorii (Praca, Osobiste, Nauka, etc.)
- 10 predefiniowanych kategorii
- Możliwość ręcznej zmiany

### 3. **System tagów**
- Automatyczne generowanie tagów na podstawie treści
- Dodawanie tagów ręcznie
- Maksymalnie 5 tagów na notatkę

### 4. **Analiza sentymentu**
- Wykrywanie nastrojów: pozytywny 😊, neutralny 😐, negatywny 😔
- Wskaźnik pewności analizy (0-100%)

### 5. **Masowe przetwarzanie**
- Przycisk "AI Batch" do przetworzenia wszystkich notatek
- Limit 10 notatek na raz (aby nie przeciążyć API)
- Progress feedback z liczbą przetworzonych notatek

## 💻 Jak używać

### W formularzu notatki (NoteForm):

1. **Napisz treść notatki** (minimum 50 znaków)
2. **Sekcja "AI Asystent" się pojawi** automatycznie
3. **Kliknij "Szybkie podsumowanie"** dla podstawowej analizy
4. **Kliknij "Pełna analiza"** dla szczegółowego podsumowania z tagami
5. **Edytuj wyniki** jeśli potrzeba
6. **Zapisz notatkę** z danymi AI

### Na liście notatek (NotesList):

1. **Przycisk "AI Batch"** pojawia się gdy masz notatki
2. **Kliknij żeby przetworzyć** wszystkie notatki bez podsumowań
3. **Obserwuj progress** - do 10 notatek na raz

### W karcie notatki (NoteCard):

- **Kategorie** wyświetlane jako niebieskie znaczki z ikoną folderu
- **Tagi** pokazane jako szare znaczki (max 3 + licznik)
- **Ikona AI** 🧠 przy notatkach z AI-podsumowaniem
- **Analiza sentymentu** widoczna w szczegółach

## 🛠️ Architektura techniczna

### Pliki i komponenty:

```
src/
├── lib/
│   ├── ai-summary.ts         # Główny serwis AI 
│   ├── notes-context.tsx     # Zaktualizowany kontekst
│   └── supabase.ts          # Rozszerzone typy bazy
├── components/
│   ├── NoteForm.tsx         # Formularz z AI UI
│   ├── NoteCard.tsx         # Wyświetlanie AI danych
│   └── NotesList.tsx        # Batch processing
├── types/index.ts           # Nowe typy AI
└── supabase/migrations/
    └── 02_add_ai_fields.sql # Migracja bazy
```

### API i koszty:

- **Model**: GPT-3.5-turbo (ekonomiczny)
- **Średni koszt**: ~$0.002 za notatkę
- **Timeout**: 30 sekund na request
- **Rate limiting**: Wbudowane w OpenAI SDK

## 🔒 Bezpieczeństwo

### Ważne uwagi:

⚠️ **Browser API**: Obecnie klucz API jest używany w przeglądarce
- ✅ **Dla rozwoju**: OK
- ❌ **Dla produkcji**: Wymaga backend proxy

### Zalecenia produkcyjne:

1. **Stwórz backend endpoint** dla AI calls
2. **Przenieś klucz API** na serwer
3. **Dodaj rate limiting** per użytkownik
4. **Implementuj queue system** dla batch operations

## 📊 Analityka i monitoring

### Metryki do śledzenia:

- Liczba wygenerowanych podsumowań
- Accuracy kategoryzacji (feedback użytkowników)
- Koszty API calls
- Czas odpowiedzi AI

### Możliwe ulepszenia:

1. **Własny model** fine-tunowany na notatkach użytkownika
2. **Offline processing** dla dużych batch operations
3. **Feedback loop** - użytkownicy oceniają jakość
4. **Cache** popularnych zapytań

## 🐛 Troubleshooting

### Częste problemy:

1. **"OpenAI API key nie jest skonfigurowany"**
   - Sprawdź czy `OPENAI_API_KEY` jest w `.env.local`
   - Zrestartuj dev server po dodaniu zmiennej

2. **"Błąd autoryzacji OpenAI API"**
   - Sprawdź czy klucz API jest prawidłowy
   - Sprawdź czy masz credits na koncie OpenAI

3. **"Nie udało się wygenerować podsumowania"**
   - Sprawdź połączenie internetowe
   - Sprawdź czy OpenAI API nie ma outage
   - Spróbuj z krótszą treścią

4. **Brak przycisków AI**
   - Sprawdź czy `AISummaryService.isAvailable()` zwraca `true`
   - Sprawdź console na błędy JavaScript

### Debug mode:

```javascript
// W console przeglądarki
localStorage.setItem('debug-ai', 'true')
// Włącza dodatkowe logi
```

## 🚀 Roadmap

### Planowane funkcje:

- [ ] **Smart search** - wyszukiwanie semantyczne w notatkach
- [ ] **Auto-tagging** w czasie rzeczywistym podczas pisania  
- [ ] **Summary templates** - różne style podsumowań
- [ ] **AI Chat** - zadawanie pytań o swoje notatki
- [ ] **Export z AI** - generowanie raportów z notatek
- [ ] **Collaboration AI** - sugestie do współdzielonych notatek

---

*Funkcja AI Summary została zaimplementowana w ramach projektu AI Notes jako demonstracja możliwości integracji LLM z aplikacjami webowymi.*
