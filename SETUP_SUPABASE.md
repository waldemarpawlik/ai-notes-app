# 🚀 Konfiguracja Supabase dla AI Notes

## Krok 1: Utworzenie projektu Supabase

1. **Przejdź do [supabase.com](https://supabase.com)**
2. **Zaloguj się** lub **załóż konto**
3. **Kliknij "New Project"**
4. **Wypełnij dane:**
   - Name: `ai-notes-app`
   - Organization: (wybierz swoją organizację)
   - Database Password: (wygeneruj silne hasło i zapisz je!)
   - Region: `Central EU (Frankfurt)` (najlepszy dla Polski)
5. **Kliknij "Create new project"**
6. **Czekaj 2-3 minuty** na utworzenie projektu

## Krok 2: Konfiguracja zmiennych środowiskowych

1. **W dashboardzie Supabase przejdź do:**
   ```
   Settings → API
   ```

2. **Skopiuj dane i wklej do pliku `.env`:**
   ```bash
   # URL projektu (z sekcji Project URL)
   PUBLIC_SUPABASE_URL=https://twoj-projekt-id.supabase.co
   
   # Anon key (z sekcji Project API keys → anon public)
   PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Service role key (z sekcji Project API keys → service_role)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Krok 3: Utworzenie tabeli notes

1. **Przejdź do zakładki "SQL Editor"**
2. **Kliknij "New query"**
3. **Skopiuj i wklej zawartość pliku:**
   ```sql
   -- Zawartość z: supabase/migrations/01_create_notes_table.sql
   ```
4. **Kliknij "Run"**
5. **Sprawdź czy tabela została utworzona w zakładce "Table Editor"**

## Krok 4: Konfiguracja autentykacji

1. **Przejdź do zakładki "Authentication"**
2. **W sekcji "Settings" sprawdź:**
   - ✅ Enable email confirmations (opcjonalne)
   - ✅ Enable signup (włączone domyślnie)
   - ✅ Enable email OTP (opcjonalne)

## Krok 5: Test konfiguracji

1. **Zapisz plik `.env`**
2. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```
3. **Otwórz http://localhost:4321**
4. **Spróbuj się zarejestrować z testowym emailem**

## ⚠️ Ważne uwagi

- **Nigdy nie commituj pliku `.env`** do repozytorium!
- **Service role key ma pełne uprawnienia** - używaj tylko po stronie serwera
- **Anon key jest bezpieczny** do użycia po stronie klienta
- **Hasło do bazy danych** zapisz w bezpiecznym miejscu

## 🔧 Rozwiązywanie problemów

### Problem: "Invalid API key"
- Sprawdź czy skopiowałeś pełny klucz (kończy się na kropkę lub znak równości)
- Sprawdź czy nie ma spacji na początku/końcu klucza

### Problem: "Project not found"
- Sprawdź URL projektu (powinien kończyć się na `.supabase.co`)
- Sprawdź czy projekt jest aktywny w dashboardzie

### Problem: Tabela nie istnieje
- Sprawdź czy migracja SQL została wykonana bez błędów
- Sprawdź w Table Editor czy tabela `notes` istnieje

## 📞 Następne kroki

Po skonfigurowaniu Supabase będziesz mógł:
1. ✅ Rejestrować nowych użytkowników
2. ✅ Logować się do aplikacji  
3. ✅ Wylogowywać się
4. 🔄 Przejść do implementacji CRUD notatek
