export type EnceptDiagnosisDomain = 'INTAKE' | 'CLINICAL' | 'BEHAVIORAL_ENVIRONMENTAL';

export interface EnceptDiagnosisTerm {
  code: string;
  domain: EnceptDiagnosisDomain;
  term: string;
  definition: string;
}

export const ENCPT_DIAGNOSIS_TERMS: EnceptDiagnosisTerm[] = [
  // Intake Domain
  {
    code: 'NI-5.10.1',
    domain: 'INTAKE',
    term: 'Excessive sodium intake',
    definition: 'Intake of sodium exceeding recommended dietary limits or individualized therapeutic targets.'
  },
  {
    code: 'NI-1.2',
    domain: 'INTAKE',
    term: 'Inadequate energy intake',
    definition: 'Energy intake that fails to meet estimated energy requirements.'
  },
  {
    code: 'NI-1.3',
    domain: 'INTAKE',
    term: 'Excessive energy intake',
    definition: 'Energy intake exceeding estimated basal and activity needs over a sustained period.'
  },
  {
    code: 'NI-5.7.1',
    domain: 'INTAKE',
    term: 'Inadequate protein intake',
    definition: 'Protein intake below recommended daily allowance or clinical requirements.'
  },
  {
    code: 'NI-5.8.2',
    domain: 'INTAKE',
    term: 'Excessive carbohydrate intake',
    definition: 'Carbohydrate intake exceeding therapeutic targets, compromising glycemic control.'
  },
  {
    code: 'NI-5.8.5',
    domain: 'INTAKE',
    term: 'Inappropriate intake of food fats',
    definition: 'Intake of saturated or trans fatty acids exceeding cardiovascular guidelines.'
  },
  {
    code: 'NI-5.8.4',
    domain: 'INTAKE',
    term: 'Inadequate fiber intake',
    definition: 'Daily dietary fiber intake substantially below age- and sex-adjusted DRI targets.'
  },
  {
    code: 'NI-5.10.2',
    domain: 'INTAKE',
    term: 'Excessive potassium intake',
    definition: 'Potassium intake exceeding clinical thresholds in renal compromise or hyperkalemia.'
  },

  // Clinical Domain
  {
    code: 'NC-3.3',
    domain: 'CLINICAL',
    term: 'Overweight/obesity',
    definition: 'Increased adiposity resulting in a BMI above normal reference standards.'
  },
  {
    code: 'NC-3.1',
    domain: 'CLINICAL',
    term: 'Underweight',
    definition: 'Low body weight resulting in a BMI below 18.5 kg/m².'
  },
  {
    code: 'NC-2.2',
    domain: 'CLINICAL',
    term: 'Altered nutrition-related laboratory values',
    definition: 'Biochemical markers (e.g. HbA1c, lipid panel, serum creatinine, eGFR) outside normal limits.'
  },
  {
    code: 'NC-3.2',
    domain: 'CLINICAL',
    term: 'Unintended weight loss',
    definition: 'Involuntary weight reduction exceeding 5% in 30 days or 10% in 180 days.'
  },
  {
    code: 'NC-1.4',
    domain: 'CLINICAL',
    term: 'Altered GI function',
    definition: 'Changes in digestion, absorption, or elimination of nutrients.'
  },

  // Behavioral-Environmental Domain
  {
    code: 'NB-1.1',
    domain: 'BEHAVIORAL_ENVIRONMENTAL',
    term: 'Food- and nutrition-related knowledge deficit',
    definition: 'Lack of awareness or misunderstanding of nutrition-related concepts or guidelines.'
  },
  {
    code: 'NB-1.7',
    domain: 'BEHAVIORAL_ENVIRONMENTAL',
    term: 'Inappropriate food choices',
    definition: 'Food selection patterns inconsistent with disease management and nutritional recommendations.'
  },
  {
    code: 'NB-1.5',
    domain: 'BEHAVIORAL_ENVIRONMENTAL',
    term: 'Disordered eating pattern',
    definition: 'Irregular eating intervals or skipping meals resulting in nutritional inadequacy.'
  }
];

/**
 * Synthesizes a standardized eNCPT PES Statement.
 * Structure: [Problem] related to [Etiology] as evidenced by [Signs & Symptoms]
 */
export function formatPesStatement(
  problemTerm: string,
  etiology: string,
  signsSymptoms: string
): string {
  const cleanProblem = problemTerm.trim();
  const cleanEtiology = etiology.trim();
  const cleanSigns = signsSymptoms.trim();

  if (!cleanProblem || !cleanEtiology || !cleanSigns) {
    return '';
  }

  return `${cleanProblem} related to ${cleanEtiology} as evidenced by ${cleanSigns}.`;
}
