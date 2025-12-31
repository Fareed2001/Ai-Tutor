-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS chemistry_chapters CASCADE;

-- Create chemistry_chapters table
CREATE TABLE chemistry_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_name VARCHAR(255) NOT NULL UNIQUE,
    syllabus_text TEXT NOT NULL,
    syllabus_pdf_url TEXT,
    past_paper_pdf_url TEXT,
    answer_key_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on chapter_name for faster lookups
CREATE INDEX idx_chemistry_chapters_chapter_name ON chemistry_chapters(chapter_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_chemistry_chapters_updated_at
    BEFORE UPDATE ON chemistry_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE chemistry_chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all chapters
CREATE POLICY "Allow authenticated users to read chapters"
    ON chemistry_chapters
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Allow service role to manage chapters (for backend)
CREATE POLICY "Allow service role to manage chapters"
    ON chemistry_chapters
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert sample record for Stoichiometry
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    syllabus_pdf_url,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Stoichiometry',
    '## 3.1 Formulae

1. State the formulae of the elements and compounds named in the subject content
2. Define the molecular formula of a compound as the number and type of different atoms in one molecule
3. Define the empirical formula of a compound as the simplest whole number ratio of the different atoms or ions in a compound
4. Deduce the formula of a simple compound from the relative numbers of atoms or ions present in a model or a diagrammatic representation
5. Deduce the formula of an ionic compound from the charges on the ions
6. Construct word equations, symbol equations and ionic equations to show how reactants form products, including state symbols
7. Deduce the symbol equation with state symbols for a chemical reaction, given relevant information

## 3.2 Relative masses of atoms and molecules

1. Describe relative atomic mass, Ar, as the average mass of the isotopes of an element compared to 1/12th of the mass of an atom of ¹²C
2. Define relative molecular mass, Mr, as the sum of the relative atomic masses. Relative formula mass, Mr, will be used for ionic compounds

## 3.3 The mole and the Avogadro constant

1. State that the mole, mol, is the unit of amount of substance and that one mole contains 6.02 × 10²³ particles, e.g. atoms, ions, molecules; this number is the Avogadro constant
2. Use the relationship amount of substance (mol) = mass (g) / molar mass (g/mol) to calculate:
   - (a) amount of substance
   - (b) mass
   - (c) molar mass
   - (d) relative atomic mass or relative molecular/formula mass
   - (e) number of particles, using the value of the Avogadro constant
3. Use the molar gas volume, taken as 24dm³ at room temperature and pressure, r.t.p., in calculations involving gases
4. State that concentration can be measured in g/dm³ or mol/dm³
5. Calculate stoichiometric reacting masses, limiting reactants, volumes of gases at r.t.p., volumes of solutions and concentrations of solutions expressed in g/dm³ and mol/dm³, including conversion between cm³ and dm³
6. Use experimental data to calculate the concentration of a solution in a titration
7. Calculate empirical formulae and molecular formulae, given appropriate data
8. Calculate percentage yield, percentage composition by mass and percentage purity, given appropriate data',
    'https://ixphkrsxltrcdotviftp.supabase.co/storage/v1/object/sign/chemistry-pdfs/Syllabus.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNzlmMzRkZC0xMjVhLTQyYTMtOTJhOC1lYmQ1NWRmNmExYmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaGVtaXN0cnktcGRmcy9TeWxsYWJ1cy5wZGYiLCJpYXQiOjE3NjY3NTk0NTcsImV4cCI6MTc2NzM2NDI1N30.SbgOC_tfnXKTFpx2gC4BVAHVHzQS9tZXyV3H_dFtw1g',
    'https://ixphkrsxltrcdotviftp.supabase.co/storage/v1/object/sign/chemistry-pdfs/Topical%20Past%20Papers.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNzlmMzRkZC0xMjVhLTQyYTMtOTJhOC1lYmQ1NWRmNmExYmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaGVtaXN0cnktcGRmcy9Ub3BpY2FsIFBhc3QgUGFwZXJzLnBkZiIsImlhdCI6MTc2Njc1OTQ5NiwiZXhwIjoxNzY3MzY0Mjk2fQ.nwgcqGraVRm9GnpjIBwwwpW-v7lnevlmNkaqpyZurxo',
    'https://ixphkrsxltrcdotviftp.supabase.co/storage/v1/object/sign/chemistry-pdfs/Answer%20Key.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNzlmMzRkZC0xMjVhLTQyYTMtOTJhOC1lYmQ1NWRmNmExYmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaGVtaXN0cnktcGRmcy9BbnN3ZXIgS2V5LnBkZiIsImlhdCI6MTc2Njc1OTQxMiwiZXhwIjoxNzY3MzY0MjEyfQ.-JAUXVSTdRjmrttTR5NnwtRr6ooZYFMpI4Sny40kvrs'
);

