# Konfiguracja bazy danych Supabase

## Kroki konfiguracji

### 1. Utwórz nowy projekt Supabase
1. Przejdź do [supabase.com](https://supabase.com)
2. Zaloguj się i kliknij "New Project"
3. Wybierz organizację i nazwij projekt "ai-notes-app"
4. Wybierz hasło dla bazy danych (zapisz je bezpiecznie)
5. Wybierz region (najlepiej Frankfurt dla lepszej latencji z Polski)

### 2. Skonfiguruj zmienne środowiskowe
1. Skopiuj plik `.env.example` do `.env`
2. W dashboardzie Supabase przejdź do Settings > API
3. Skopiuj URL projektu do `PUBLIC_SUPABASE_URL`
4. Skopiuj "anon public" klucz do `PUBLIC_SUPABASE_ANON_KEY`
5. Skopiuj "service_role" klucz do `SUPABASE_SERVICE_ROLE_KEY`

### 3. Uruchom migracje
1. W dashboardzie Supabase przejdź do SQL Editor
2. Skopiuj zawartość pliku `migrations/01_create_notes_table.sql`
3. Wklej do edytora i uruchom migrację
4. Sprawdź czy tabela `notes` została utworzona w zakładce Table Editor

### 4. Włącz autentykację email
1. Przejdź do Authentication > Settings
2. Włącz "Enable email confirmations" jeśli chcesz weryfikację email
3. Skonfiguruj email templates według potrzeb

### 5. Testowanie połączenia
Po skonfigurowaniu uruchom aplikację lokalnie:
```bash
npm run dev
```

Aplikacja powinna się połączyć z Supabase bez błędów.
