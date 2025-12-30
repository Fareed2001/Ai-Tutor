-- ============================================
-- Populate chemistry_chapters table with O-Level Chemistry chapters
-- This script inserts all 12 chapters with syllabus text and placeholder URLs
-- Uses ON CONFLICT DO NOTHING to avoid errors if chapters already exist
-- ============================================

-- 1. Stoichiometry
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Stoichiometry',
    'Formulae and equations: Writing chemical formulae, balancing equations. Relative atomic and molecular masses. The mole concept: Avogadro constant, molar mass, calculations involving moles. Percentage composition and empirical formulae. Calculations from equations: Mass-mass, mass-volume, volume-volume relationships. Limiting reactants and percentage yield.',
    'https://supabase.storage/chemistry/stoichiometry/paper.pdf',
    'https://supabase.storage/chemistry/stoichiometry/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 2. Atomic Structure
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Atomic Structure',
    'Structure of the atom: Protons, neutrons, electrons. Atomic number and mass number. Isotopes: Definition, relative atomic mass calculations. Electronic configuration: Shells, subshells, electron arrangement for elements 1-20. Periodic trends: Atomic radius, ionization energy, electron affinity. Ions: Formation, ionic charges, electron transfer.',
    'https://supabase.storage/chemistry/atomic-structure/paper.pdf',
    'https://supabase.storage/chemistry/atomic-structure/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 3. Periodic Table
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Periodic Table',
    'Organization: Groups and periods, periodic law. Group properties: Alkali metals, halogens, noble gases. Periodicity: Trends across periods (atomic size, ionization energy, electronegativity). Transition metals: Properties, variable oxidation states. Predicting properties: Based on position in periodic table. Uses of elements: Applications based on properties.',
    'https://supabase.storage/chemistry/periodic-table/paper.pdf',
    'https://supabase.storage/chemistry/periodic-table/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 4. Chemical Bonding
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Chemical Bonding',
    'Ionic bonding: Formation, structure, properties of ionic compounds. Covalent bonding: Single, double, triple bonds, Lewis structures. Metallic bonding: Structure, properties. Intermolecular forces: Van der Waals, hydrogen bonding. Bond polarity: Electronegativity, polar and non-polar bonds. Shapes of molecules: VSEPR theory, molecular geometry. Properties related to bonding: Melting/boiling points, conductivity, solubility.',
    'https://supabase.storage/chemistry/chemical-bonding/paper.pdf',
    'https://supabase.storage/chemistry/chemical-bonding/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 5. Acids, Bases and Salts
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Acids, Bases and Salts',
    'Acids and bases: Definitions (Arrhenius, Bronsted-Lowry), properties, pH scale. Strong and weak acids/bases: Degree of dissociation, pH calculations. Salts: Preparation methods (acid + base, acid + metal, acid + carbonate), solubility rules. Neutralization: Reactions, applications. Titration: Calculations, indicators. Common acids and bases: Uses, properties.',
    'https://supabase.storage/chemistry/acids-bases-salts/paper.pdf',
    'https://supabase.storage/chemistry/acids-bases-salts/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 6. Energetics
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Energetics',
    'Energy changes: Exothermic and endothermic reactions, energy level diagrams. Enthalpy: Definition, standard conditions, enthalpy changes (formation, combustion, neutralization). Hess''s law: Calculations using enthalpy cycles. Bond energies: Calculating enthalpy changes from bond energies. Calorimetry: Measuring energy changes, calculations. Applications: Fuel cells, energy sources.',
    'https://supabase.storage/chemistry/energetics/paper.pdf',
    'https://supabase.storage/chemistry/energetics/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 7. Rates of Reaction
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Rates of Reaction',
    'Reaction rate: Definition, measuring rates, factors affecting rate. Collision theory: Activation energy, effective collisions. Factors affecting rate: Temperature, concentration, pressure, surface area, catalysts. Catalysts: Types, mechanisms, industrial applications. Rate equations: Order of reaction, rate constants. Graphical analysis: Rate-time graphs, concentration-time graphs.',
    'https://supabase.storage/chemistry/rates-of-reaction/paper.pdf',
    'https://supabase.storage/chemistry/rates-of-reaction/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 8. Reversible Reactions
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Reversible Reactions',
    'Equilibrium: Dynamic equilibrium, characteristics. Le Chatelier''s principle: Effect of concentration, pressure, temperature on equilibrium. Equilibrium constant: Kc and Kp, calculations. Factors affecting equilibrium position: Temperature, pressure, concentration changes. Industrial applications: Haber process, Contact process. Equilibrium in solutions: Solubility product, common ion effect.',
    'https://supabase.storage/chemistry/reversible-reactions/paper.pdf',
    'https://supabase.storage/chemistry/reversible-reactions/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 9. Organic Chemistry
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Organic Chemistry',
    'Introduction: Carbon compounds, homologous series, functional groups. Alkanes: Structure, naming (IUPAC), properties, reactions (combustion, substitution). Alkenes: Structure, naming, addition reactions, polymerization. Alcohols: Structure, naming, properties, reactions (oxidation, esterification). Carboxylic acids: Structure, naming, properties, reactions. Esters: Formation, naming, uses. Isomerism: Structural isomers, stereoisomers.',
    'https://supabase.storage/chemistry/organic-chemistry/paper.pdf',
    'https://supabase.storage/chemistry/organic-chemistry/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 10. Metals
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Metals',
    'Properties of metals: Physical and chemical properties, reactivity series. Extraction of metals: Methods based on reactivity (electrolysis, reduction with carbon, heating). Reactivity series: Order, displacement reactions, predicting reactions. Corrosion: Rusting of iron, prevention methods. Alloys: Composition, properties, uses. Uses of metals: Based on properties, common applications.',
    'https://supabase.storage/chemistry/metals/paper.pdf',
    'https://supabase.storage/chemistry/metals/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 11. Electrochemistry
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Electrochemistry',
    'Electrolysis: Principles, molten and aqueous electrolytes. Electrolysis of solutions: Products at anode and cathode, factors affecting products. Electroplating: Process, applications. Electrochemical cells: Voltaic cells, standard electrode potentials, EMF calculations. Redox reactions: Oxidation and reduction, oxidizing and reducing agents, balancing redox equations. Applications: Batteries, fuel cells, corrosion prevention.',
    'https://supabase.storage/chemistry/electrochemistry/paper.pdf',
    'https://supabase.storage/chemistry/electrochemistry/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;

-- 12. Air and Water
INSERT INTO chemistry_chapters (
    chapter_name,
    syllabus_text,
    past_paper_pdf_url,
    answer_key_pdf_url
) VALUES (
    'Air and Water',
    'Composition of air: Percentage composition, uses of components. Air pollution: Pollutants (CO, SO2, NOx), sources, effects, prevention. Water: Properties, water cycle, water treatment. Water pollution: Sources, effects, treatment methods. Hard and soft water: Causes of hardness, removal methods. Environmental chemistry: Greenhouse effect, acid rain, ozone depletion, solutions.',
    'https://supabase.storage/chemistry/air-and-water/paper.pdf',
    'https://supabase.storage/chemistry/air-and-water/answers.pdf'
)
ON CONFLICT (chapter_name) DO NOTHING;


