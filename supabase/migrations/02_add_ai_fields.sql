-- Add AI-related fields to notes table
ALTER TABLE notes 
ADD COLUMN category TEXT,
ADD COLUMN tags TEXT[];

-- Create indexes for new fields to improve search performance
CREATE INDEX IF NOT EXISTS notes_category_idx ON notes(category);
CREATE INDEX IF NOT EXISTS notes_tags_idx ON notes USING GIN(tags);

-- Update the Database type in TypeScript for new fields
-- This is a comment for reference - the actual TypeScript types are updated separately
