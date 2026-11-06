import { describe, it, expect } from 'vitest';
import {
  ENCPT_DIAGNOSIS_TERMS,
  formatPesStatement
} from '../../domain/encpt.constants';

describe('Domain: eNCPT Standardized Terminology & PES Synthesis', () => {
  it('contains at least 15 standardized eNCPT diagnosis terms', () => {
    expect(ENCPT_DIAGNOSIS_TERMS.length).toBeGreaterThanOrEqual(15);

    // Verify all 3 major eNCPT domains are represented
    const domains = new Set(ENCPT_DIAGNOSIS_TERMS.map((t) => t.domain));
    expect(domains.has('INTAKE')).toBe(true);
    expect(domains.has('CLINICAL')).toBe(true);
    expect(domains.has('BEHAVIORAL_ENVIRONMENTAL')).toBe(true);
  });

  // Hand Calculation / Synthesis 1: Excessive sodium intake
  // Problem: Excessive sodium intake (NI-5.10.1)
  // Etiology: frequent consumption of canned soups and processed meats
  // Signs: 24h sodium 3,200 mg and blood pressure 142/92 mmHg
  // Expected: "Excessive sodium intake (NI-5.10.1) related to frequent consumption of canned soups and processed meats as evidenced by 24h sodium 3,200 mg and blood pressure 142/92 mmHg."
  it('formats standardized PES statement accurately', () => {
    const pes = formatPesStatement(
      'Excessive sodium intake (NI-5.10.1)',
      'frequent consumption of canned soups and processed meats',
      '24h sodium 3,200 mg and blood pressure 142/92 mmHg'
    );

    expect(pes).toBe(
      'Excessive sodium intake (NI-5.10.1) related to frequent consumption of canned soups and processed meats as evidenced by 24h sodium 3,200 mg and blood pressure 142/92 mmHg.'
    );
  });

  it('returns empty string if any PES component is missing or whitespace', () => {
    expect(formatPesStatement('', 'etiology', 'signs')).toBe('');
    expect(formatPesStatement('problem', '   ', 'signs')).toBe('');
    expect(formatPesStatement('problem', 'etiology', '')).toBe('');
  });
});
