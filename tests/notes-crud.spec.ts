import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: 'test@example.com',
  password: 'test123456'
}

const TEST_NOTE = {
  title: 'Test Note Title',
  content: 'This is a test note content that is longer than 50 characters to trigger AI features.'
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('complete user flow: signup, login, create note, edit note, delete note', async ({ page }) => {
    // 1. User Registration (if not exists)
    await expect(page.locator('h1')).toContainText('AI Notes')
    
    // Sprawdź czy formularz logowania jest widoczny
    const signUpToggle = page.locator('button', { hasText: 'Nie masz konta?' })
    if (await signUpToggle.isVisible()) {
      await signUpToggle.click()
    }

    // Wypełnij formularz rejestracji
    await page.locator('input[type="email"]').fill(TEST_USER.email)
    await page.locator('input[type="password"]').fill(TEST_USER.password)
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // 2. Sprawdź czy zalogowało (lub przeszło do logowania)
    // Może być redirect do potwierdzenia emaila lub od razu logowanie
    await page.waitForTimeout(2000)

    // Jeśli trzeba się zalogować
    const loginButton = page.locator('button', { hasText: 'Zaloguj się' })
    if (await loginButton.isVisible()) {
      await page.locator('input[type="email"]').fill(TEST_USER.email)
      await page.locator('input[type="password"]').fill(TEST_USER.password)
      await loginButton.click()
    }

    // 3. Sprawdź czy jesteśmy w Dashboard
    await expect(page.locator('h1')).toContainText('AI Notes', { timeout: 10000 })
    await expect(page.locator('text=Moje notatki')).toBeVisible({ timeout: 5000 })

    // 4. Utwórz nową notatkę
    const createButton = page.locator('button', { hasText: 'Nowa notatka' })
    await createButton.click()

    // Sprawdź czy formularz jest widoczny
    await expect(page.locator('h2', { hasText: 'Nowa notatka' })).toBeVisible()

    // Wypełnij formularz
    await page.locator('input[placeholder*="tytuł"]').fill(TEST_NOTE.title)
    await page.locator('textarea[placeholder*="treść"]').fill(TEST_NOTE.content)

    // Zapisz notatkę
    const saveButton = page.locator('button', { hasText: 'Utwórz notatkę' })
    await saveButton.click()

    // 5. Sprawdź czy notatka została utworzona
    await expect(page.locator('text=Moje notatki')).toBeVisible({ timeout: 5000 })
    await expect(page.locator(`text=${TEST_NOTE.title}`)).toBeVisible()

    // 6. Edytuj notatkę
    const editButton = page.locator('[data-testid="edit-note"], [title="Edytuj notatkę"]').first()
    await editButton.click()

    // Sprawdź czy jesteśmy w trybie edycji
    await expect(page.locator('h2', { hasText: 'Edytuj notatkę' })).toBeVisible()

    // Zmodyfikuj tytuł
    const updatedTitle = `${TEST_NOTE.title} - Updated`
    await page.locator('input[id="note-title"]').fill(updatedTitle)

    // Zapisz zmiany
    const updateButton = page.locator('button', { hasText: 'Zapisz zmiany' })
    await updateButton.click()

    // 7. Sprawdź czy zmiany zostały zapisane
    await expect(page.locator('text=Moje notatki')).toBeVisible({ timeout: 5000 })
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible()

    // 8. Usuń notatkę
    const deleteButton = page.locator('[data-testid="delete-note"], [title="Usuń notatkę"]').first()
    await deleteButton.click()

    // Potwierdź usunięcie w modal
    const confirmDeleteButton = page.locator('button', { hasText: 'Usuń notatkę' })
    await confirmDeleteButton.click()

    // 9. Sprawdź czy notatka została usunięta
    await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible({ timeout: 5000 })
    
    // Powinien być widoczny stan pustej listy
    await expect(page.locator('text=Brak notatek')).toBeVisible()
})

test('navigation and UI elements', async ({ page }) => {
    // Ten test sprawdza podstawowe elementy UI bez logowania
    
    // Sprawdź główną stronę
    await expect(page.locator('h1')).toContainText('AI Notes')
    
    // Sprawdź czy formularz logowania jest widoczny
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Sprawdź przełączanie między logowaniem a rejestracją
    const toggleButton = page.locator('button', { hasText: 'Nie masz konta?' })
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      await expect(page.locator('button', { hasText: 'Zarejestruj się' })).toBeVisible()
      
      // Przełącz z powrotem
      await page.locator('button', { hasText: 'Masz już konto?' }).click()
      await expect(page.locator('button', { hasText: 'Zaloguj się' })).toBeVisible()
    }
})

test('form validation', async ({ page }) => {
    // Test walidacji formularzy bez faktycznego logowania
    
    // Spróbuj wysłać pusty formularz logowania
    const loginButton = page.locator('button[type="submit"]')
    await loginButton.click()
    
    // Przeglądarki zwykle pokazują native validation dla wymaganych pól
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    
    // Sprawdź czy input ma atrybut required
    await expect(emailInput).toHaveAttribute('required')
    
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput).toHaveAttribute('required')
})
