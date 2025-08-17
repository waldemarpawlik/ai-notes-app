import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotesUtils } from '../lib/notes'

describe('NotesUtils', () => {
  describe('formatDate', () => {
    beforeEach(() => {
      // Mock Date.now() żeby testy były deterministyczne
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    it('should format recent date as "przed chwilą"', () => {
      const recentDate = new Date('2024-01-15T11:59:30Z').toISOString()
      expect(NotesUtils.formatDate(recentDate)).toBe('przed chwilą')
    })

    it('should format date from minutes ago', () => {
      const minutesAgo = new Date('2024-01-15T11:45:00Z').toISOString()
      expect(NotesUtils.formatDate(minutesAgo)).toBe('15 min temu')
    })

    it('should format date from hours ago', () => {
      const hoursAgo = new Date('2024-01-15T10:00:00Z').toISOString()
      expect(NotesUtils.formatDate(hoursAgo)).toBe('2 godz. temu')
    })

    it('should format date from days ago', () => {
      const daysAgo = new Date('2024-01-13T12:00:00Z').toISOString()
      expect(NotesUtils.formatDate(daysAgo)).toBe('2 dni temu')
    })

    it('should format old date with full date', () => {
      const oldDate = new Date('2024-01-01T12:00:00Z').toISOString()
      const result = NotesUtils.formatDate(oldDate)
      expect(result).toMatch(/1 stycznia 2024/)
    })
  })

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const shortText = 'Krótki tekst'
      expect(NotesUtils.truncateText(shortText, 50)).toBe(shortText)
    })

    it('should truncate long text with default length', () => {
      const longText = 'A'.repeat(200)
      const result = NotesUtils.truncateText(longText)
      expect(result).toHaveLength(153) // 150 + '...'
      expect(result.endsWith('...')).toBe(true)
    })

    it('should truncate text with custom length', () => {
      const text = 'This is a longer text that should be truncated'
      const result = NotesUtils.truncateText(text, 10)
      expect(result).toBe('This is a...')
    })
  })

  describe('generateSummary', () => {
    it('should return first sentence when it meets length criteria', () => {
      const content = 'To jest wystarczająco długie pierwsze zdanie które powinno zostać zwrócone. Drugie zdanie. Trzecie zdanie.'
      const result = NotesUtils.generateSummary(content)
      expect(result).toBe('To jest wystarczająco długie pierwsze zdanie które powinno zostać zwrócone.')
    })

    it('should truncate content without proper sentences', () => {
      const content = 'To jest długi tekst bez właściwych zdań więc powinien zostać ucięty'
      const result = NotesUtils.generateSummary(content)
      expect(result.length).toBeLessThanOrEqual(103) // 100 + '...'
    })

    it('should handle short content', () => {
      const content = 'Krótka treść'
      const result = NotesUtils.generateSummary(content)
      expect(result).toBe(content)
    })
  })

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(NotesUtils.countWords('Ala ma kota')).toBe(3)
      expect(NotesUtils.countWords('Jeden')).toBe(1)
      expect(NotesUtils.countWords('')).toBe(0)
      expect(NotesUtils.countWords('   ')).toBe(0)
    })

    it('should handle multiple spaces', () => {
      expect(NotesUtils.countWords('Ala    ma     kota')).toBe(3)
    })

    it('should handle newlines and tabs', () => {
      expect(NotesUtils.countWords('Ala\nma\tkota')).toBe(3)
    })
  })

  describe('estimateReadingTime', () => {
    it('should estimate reading time correctly', () => {
      const text = 'słowo '.repeat(200) // 200 słów
      const result = NotesUtils.estimateReadingTime(text, 200) // 200 słów/min
      expect(result).toBe('1 minuta czytania')
    })

    it('should handle plural forms', () => {
      const text = 'słowo '.repeat(400) // 400 słów
      const result = NotesUtils.estimateReadingTime(text, 200) // 200 słów/min
      expect(result).toBe('2 minuty czytania')
    })

    it('should handle many minutes', () => {
      const text = 'słowo '.repeat(1000) // 1000 słów
      const result = NotesUtils.estimateReadingTime(text, 200) // 200 słów/min
      expect(result).toBe('5 minut czytania')
    })
  })

  describe('isRecentlyCreated', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
    })

    it('should return true for recent dates', () => {
      const recentDate = new Date('2024-01-15T00:00:00Z').toISOString()
      expect(NotesUtils.isRecentlyCreated(recentDate)).toBe(true)
    })

    it('should return false for old dates', () => {
      const oldDate = new Date('2024-01-13T12:00:00Z').toISOString()
      expect(NotesUtils.isRecentlyCreated(oldDate)).toBe(false)
    })
  })

  describe('wasRecentlyEdited', () => {
    it('should return true when updated significantly after creation', () => {
      const created = new Date('2024-01-15T12:00:00Z').toISOString()
      const updated = new Date('2024-01-15T12:05:00Z').toISOString()
      expect(NotesUtils.wasRecentlyEdited(created, updated)).toBe(true)
    })

    it('should return false when barely updated', () => {
      const created = new Date('2024-01-15T12:00:00Z').toISOString()
      const updated = new Date('2024-01-15T12:00:30Z').toISOString()
      expect(NotesUtils.wasRecentlyEdited(created, updated)).toBe(false)
    })
  })
})
