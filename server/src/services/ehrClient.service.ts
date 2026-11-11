const DEFAULT_EHR_URL = process.env.EHR_BASE_URL || process.env.MOCK_EHR_URL || 'http://localhost:4000';
const EHR_TIMEOUT_MS = 5000;

export interface EhrObservationSummary {
  test: string;
  value: string;
  effectiveDate: string;
  loincCode?: string;
  isAbnormal?: boolean;
}

export interface EhrFetchResponse {
  observations: EhrObservationSummary[];
  isLive: boolean;
  message: string;
}

export interface EhrSyncResponse {
  success: boolean;
  encounterId?: string;
  message: string;
}

interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

interface FhirComponent {
  code: {
    coding: FhirCoding[];
  };
  valueQuantity?: FhirQuantity;
}

interface FhirObservationResource {
  resourceType: 'Observation';
  id?: string;
  code: {
    coding: FhirCoding[];
  };
  effectiveDateTime?: string;
  valueQuantity?: FhirQuantity;
  component?: FhirComponent[];
}

interface FhirObservationEntry {
  resource: FhirObservationResource;
}

interface FhirObservationBundle {
  resourceType: 'Bundle';
  entry?: FhirObservationEntry[];
}

export interface AdimeChartSyncPayload {
  id: string;
  consumerId: string;
  providerId: string;
  createdAt: string | Date;
  finalizedAt?: string | Date | null;
  diagnosisTerm?: string | null;
  pesStatement?: string | null;
  interventionFoodDelivery?: string | null;
}

export class EhrClientService {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_EHR_URL) {
    this.baseUrl = baseUrl;
  }

  async fetchObservations(patientId: string): Promise<EhrFetchResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EHR_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/Observation?patient=${encodeURIComponent(patientId)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`EHR gateway returned HTTP error ${response.status} (${response.statusText})`);
      }

      const bundle = (await response.json()) as FhirObservationBundle;
      const entries = bundle.entry || [];

      const observations: EhrObservationSummary[] = entries.map((e) => {
        const obs = e.resource;
        let valStr = '';
        if (obs.valueQuantity?.value !== undefined) {
          valStr = `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}`.trim();
        } else if (obs.component && obs.component.length > 0) {
          valStr = obs.component
            .map((c) => `${c.code.coding[0]?.display || 'Param'}: ${c.valueQuantity?.value ?? ''} ${c.valueQuantity?.unit ?? ''}`.trim())
            .join(', ');
        }

        return {
          test: obs.code.coding[0]?.display || 'Lab Observation',
          value: valStr,
          effectiveDate: obs.effectiveDateTime || new Date().toISOString(),
          loincCode: obs.code.coding[0]?.code
        };
      });

      return {
        observations,
        isLive: true,
        message: 'Successfully synchronized clinical observations from hospital FHIR server.'
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : 'Unknown EHR connection error';
      // In production, trigger critical telemetry alert; do not return fabricated/mock lab values
      throw new Error(`Critical: Hospital EHR service synchronization failed for patient ${patientId}: ${errorMessage}`);
    }
  }

  async pushEncounter(chart: AdimeChartSyncPayload): Promise<EhrSyncResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EHR_TIMEOUT_MS);

    try {
      const payload = {
        resourceType: 'Encounter',
        status: 'finished',
        subject: { reference: `Patient/${chart.consumerId}` },
        participant: [{ individual: { reference: `Practitioner/${chart.providerId}` } }],
        period: {
          start: typeof chart.createdAt === 'string' ? chart.createdAt : chart.createdAt.toISOString(),
          end: chart.finalizedAt ? (typeof chart.finalizedAt === 'string' ? chart.finalizedAt : chart.finalizedAt.toISOString()) : new Date().toISOString()
        },
        reasonCode: [{ text: chart.diagnosisTerm || 'Medical Nutrition Therapy Consultation' }],
        diagnosis: [{ condition: { display: chart.pesStatement || '' } }],
        notes: [{ text: `ADIME Care Plan: ${chart.interventionFoodDelivery || ''}` }]
      };

      const response = await fetch(`${this.baseUrl}/Encounter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`EHR Encounter creation failed with status ${response.status}`);
      }

      const created = (await response.json()) as { id: string };
      return {
        success: true,
        encounterId: created.id,
        message: `Care plan synchronized to hospital EHR Encounter record #${created.id}.`
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : 'EHR gateway communication failure';
      return {
        success: false,
        message: `EHR encounter push failed: ${errorMessage}. Chart saved locally and queued for retry.`
      };
    }
  }
}

export const ehrClient = new EhrClientService();
