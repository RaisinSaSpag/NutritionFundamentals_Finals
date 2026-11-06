import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory FHIR store for simulation
const encounters: any[] = [];
const nutritionOrders: any[] = [];

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mock-ehr-fhir', timestamp: new Date().toISOString() });
});

// FHIR Patient Resource
app.get('/Patient/:id', (req: Request, res: Response) => {
  const patientId = req.params.id;
  res.json({
    resourceType: 'Patient',
    id: patientId,
    active: true,
    identifier: [
      {
        system: 'urn:oid:2.16.840.1.113883.4.1',
        value: `MRN-${patientId.substring(0, 8)}`
      }
    ],
    telecom: [
      {
        system: 'email',
        value: 'patient@hospital.org'
      }
    ]
  });
});

// FHIR Observation Resource Bundle
app.get('/Observation', (req: Request, res: Response) => {
  const patientId = (req.query.patient as string) || 'default';

  // Return standard clinical observations (HbA1c, BP, weight, height, electrolytes)
  const observations = [
    {
      resourceType: 'Observation',
      id: `obs-hba1c-${patientId}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '4548-4', display: 'Hemoglobin A1c/Hemoglobin.total in Blood' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: '2026-10-15T08:30:00Z',
      valueQuantity: { value: 7.2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      referenceRange: [{ low: { value: 4.0 }, high: { value: 5.6 } }]
    },
    {
      resourceType: 'Observation',
      id: `obs-bp-${patientId}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: '2026-10-15T08:30:00Z',
      component: [
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
          valueQuantity: { value: 138, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
          valueQuantity: { value: 88, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
        }
      ]
    },
    {
      resourceType: 'Observation',
      id: `obs-potassium-${patientId}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '2823-3', display: 'Potassium [Moles/volume] in Serum or Plasma' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: '2026-10-15T08:30:00Z',
      valueQuantity: { value: 5.1, unit: 'mmol/L', system: 'http://unitsofmeasure.org', code: 'mmol/L' },
      referenceRange: [{ low: { value: 3.5 }, high: { value: 5.0 } }]
    },
    {
      resourceType: 'Observation',
      id: `obs-egfr-${patientId}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '33914-3', display: 'Glomerular filtration rate/1.73 sq M.predicted' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: '2026-10-15T08:30:00Z',
      valueQuantity: { value: 54, unit: 'mL/min/1.73m2', system: 'http://unitsofmeasure.org', code: 'mL/min/1.73m2' },
      referenceRange: [{ low: { value: 60 } }]
    }
  ];

  res.json({
    resourceType: 'Bundle',
    type: 'searchset',
    total: observations.length,
    entry: observations.map((resource) => ({ resource }))
  });
});

// FHIR Encounter creation
app.post('/Encounter', (req: Request, res: Response) => {
  const encounter = {
    resourceType: 'Encounter',
    id: `enc-${Date.now()}`,
    status: req.body.status || 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'VR',
      display: 'virtual'
    },
    subject: req.body.subject,
    participant: req.body.participant,
    period: req.body.period || { start: new Date().toISOString(), end: new Date().toISOString() },
    reasonCode: req.body.reasonCode || [{ text: 'Tele-nutrition Medical Nutrition Therapy' }],
    diagnosis: req.body.diagnosis || [],
    notes: req.body.notes || []
  };

  encounters.push(encounter);
  res.status(201).json(encounter);
});

// FHIR NutritionOrder creation
app.post('/NutritionOrder', (req: Request, res: Response) => {
  const order = {
    resourceType: 'NutritionOrder',
    id: `nut-ord-${Date.now()}`,
    status: 'active',
    intent: 'order',
    dateTime: new Date().toISOString(),
    patient: req.body.patient,
    orderer: req.body.orderer,
    oralDiet: req.body.oralDiet || {}
  };

  nutritionOrders.push(order);
  res.status(201).json(order);
});

app.listen(port, () => {
  console.log(`Mock EHR FHIR service running on http://localhost:${port}`);
});
