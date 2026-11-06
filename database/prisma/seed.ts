import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FOOD_ITEMS = [
  // Filipino Dishes
  { name: 'Chicken Adobo', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'cup', calories: 320, protein: 28, carbs: 6, fat: 20, fiber: 0.5, sodium: 980, potassium: 340, allergenTags: '["soy"]' },
  { name: 'Pork Sinigang', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'bowl', calories: 290, protein: 24, carbs: 10, fat: 16, fiber: 2, sodium: 1050, potassium: 450, allergenTags: '[]' },
  { name: 'White Rice (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'cup', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6, sodium: 2, potassium: 55, allergenTags: '[]' },
  { name: 'Brown Rice (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'cup', calories: 218, protein: 4.5, carbs: 46, fat: 1.6, fiber: 3.5, sodium: 3, potassium: 150, allergenTags: '[]' },
  { name: 'Pandesal', category: 'Grains', servingSize: 2, servingUnit: 'pieces', calories: 190, protein: 6, carbs: 36, fat: 2.5, fiber: 1.5, sodium: 320, potassium: 85, allergenTags: '["gluten"]' },
  { name: 'Chicken Tinola', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'bowl', calories: 220, protein: 26, carbs: 7, fat: 8, fiber: 2.5, sodium: 780, potassium: 520, allergenTags: '[]' },
  { name: 'Kare-Kare', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'cup', calories: 390, protein: 25, carbs: 14, fat: 26, fiber: 3, sodium: 820, potassium: 410, allergenTags: '["peanuts"]' },
  { name: 'Lumpiang Shanghai', category: 'Filipino Dishes', servingSize: 3, servingUnit: 'rolls', calories: 240, protein: 12, carbs: 18, fat: 14, fiber: 1, sodium: 460, potassium: 160, allergenTags: '["gluten","eggs"]' },
  { name: 'Pinakbet', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'cup', calories: 140, protein: 4, carbs: 12, fat: 8, fiber: 4, sodium: 620, potassium: 380, allergenTags: '["shellfish"]' },
  { name: 'Bangus Daing (Milkfish)', category: 'Filipino Dishes', servingSize: 100, servingUnit: 'g', calories: 195, protein: 21, carbs: 0, fat: 12, fiber: 0, sodium: 410, potassium: 320, allergenTags: '["fish"]' },
  { name: 'Champorado', category: 'Filipino Dishes', servingSize: 1, servingUnit: 'bowl', calories: 260, protein: 5, carbs: 52, fat: 4, fiber: 3, sodium: 180, potassium: 220, allergenTags: '["dairy"]' },
  { name: 'Pork Tocino', category: 'Filipino Dishes', servingSize: 100, servingUnit: 'g', calories: 280, protein: 16, carbs: 22, fat: 14, fiber: 0, sodium: 680, potassium: 240, allergenTags: '[]' },
  // Common Proteins
  { name: 'Grilled Chicken Breast', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, potassium: 256, allergenTags: '[]' },
  { name: 'Baked Salmon Fillet', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59, potassium: 363, allergenTags: '["fish"]' },
  { name: 'Hard Boiled Egg', category: 'Proteins', servingSize: 1, servingUnit: 'large egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, sodium: 62, potassium: 63, allergenTags: '["eggs"]' },
  { name: 'Tofu (Firm)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sodium: 7, potassium: 121, allergenTags: '["soy"]' },
  { name: 'Lean Ground Beef (90%)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 215, protein: 26, carbs: 0, fat: 11.5, fiber: 0, sodium: 72, potassium: 318, allergenTags: '[]' },
  { name: 'Canned Light Tuna in Water', category: 'Proteins', servingSize: 120, servingUnit: 'g', calories: 130, protein: 29, carbs: 0, fat: 1, fiber: 0, sodium: 320, potassium: 240, allergenTags: '["fish"]' },
  // Dairy & Alternatives
  { name: 'Whole Cow Milk', category: 'Dairy', servingSize: 1, servingUnit: 'cup', calories: 149, protein: 7.7, carbs: 11.7, fat: 8, fiber: 0, sodium: 105, potassium: 322, allergenTags: '["dairy"]' },
  { name: 'Plain Greek Yogurt (Non-fat)', category: 'Dairy', servingSize: 170, servingUnit: 'g', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, sodium: 60, potassium: 240, allergenTags: '["dairy"]' },
  { name: 'Cheddar Cheese', category: 'Dairy', servingSize: 28, servingUnit: 'g', calories: 113, protein: 7, carbs: 0.4, fat: 9.3, fiber: 0, sodium: 174, potassium: 27, allergenTags: '["dairy"]' },
  { name: 'Unsweetened Soy Milk', category: 'Dairy', servingSize: 1, servingUnit: 'cup', calories: 80, protein: 7, carbs: 4, fat: 4, fiber: 1, sodium: 90, potassium: 290, allergenTags: '["soy"]' },
  // Grains
  { name: 'Oatmeal (Rolled, Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'cup', calories: 158, protein: 5.5, carbs: 27, fat: 3.2, fiber: 4, sodium: 5, potassium: 143, allergenTags: '[]' },
  { name: 'Whole Wheat Bread', category: 'Grains', servingSize: 1, servingUnit: 'slice', calories: 80, protein: 4, carbs: 14, fat: 1, fiber: 2, sodium: 130, potassium: 70, allergenTags: '["gluten"]' },
  { name: 'Baked Sweet Potato', category: 'Grains', servingSize: 1, servingUnit: 'medium', calories: 103, protein: 2.3, carbs: 24, fat: 0.2, fiber: 3.8, sodium: 41, potassium: 542, allergenTags: '[]' },
  { name: 'Cooked Quinoa', category: 'Grains', servingSize: 1, servingUnit: 'cup', calories: 222, protein: 8.1, carbs: 39.4, fat: 3.6, fiber: 5.2, sodium: 13, potassium: 318, allergenTags: '[]' },
  { name: 'Corn Tortilla', category: 'Grains', servingSize: 1, servingUnit: 'tortilla', calories: 52, protein: 1.4, carbs: 10.7, fat: 0.7, fiber: 1.5, sodium: 11, potassium: 45, allergenTags: '[]' },
  // Vegetables
  { name: 'Steamed Broccoli', category: 'Vegetables', servingSize: 1, servingUnit: 'cup', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, fiber: 5.1, sodium: 64, potassium: 457, allergenTags: '[]' },
  { name: 'Fresh Baby Spinach', category: 'Vegetables', servingSize: 2, servingUnit: 'cups', calories: 14, protein: 1.7, carbs: 2.2, fat: 0.2, fiber: 1.4, sodium: 48, potassium: 334, allergenTags: '[]' },
  { name: 'Raw Carrot', category: 'Vegetables', servingSize: 1, servingUnit: 'medium', calories: 25, protein: 0.6, carbs: 5.8, fat: 0.1, fiber: 1.7, sodium: 42, potassium: 195, allergenTags: '[]' },
  { name: 'Fresh Tomato', category: 'Vegetables', servingSize: 1, servingUnit: 'medium', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, sodium: 6, potassium: 292, allergenTags: '[]' },
  { name: 'Cucumber Slices', category: 'Vegetables', servingSize: 1, servingUnit: 'cup', calories: 16, protein: 0.7, carbs: 3.8, fat: 0.2, fiber: 0.5, sodium: 2, potassium: 152, allergenTags: '[]' },
  { name: 'Fresh Malunggay Leaves (Moringa)', category: 'Vegetables', servingSize: 1, servingUnit: 'cup', calories: 25, protein: 2, carbs: 3, fat: 0.5, fiber: 2, sodium: 15, potassium: 260, allergenTags: '[]' },
  // Fruits
  { name: 'Banana (Lakatan / Cavendish)', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.1, sodium: 1, potassium: 422, allergenTags: '[]' },
  { name: 'Red Apple with Skin', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sodium: 2, potassium: 195, allergenTags: '[]' },
  { name: 'Ripe Mango Slices', category: 'Fruits', servingSize: 1, servingUnit: 'cup', calories: 99, protein: 1.4, carbs: 24.7, fat: 0.6, fiber: 2.6, sodium: 2, potassium: 277, allergenTags: '[]' },
  { name: 'Fresh Papaya Cubes', category: 'Fruits', servingSize: 1, servingUnit: 'cup', calories: 62, protein: 0.7, carbs: 15.7, fat: 0.4, fiber: 2.5, sodium: 12, potassium: 264, allergenTags: '[]' },
  { name: 'Navel Orange', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, sodium: 0, potassium: 237, allergenTags: '[]' },
  { name: 'Avocado', category: 'Fruits', servingSize: 0.5, servingUnit: 'medium', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sodium: 7, potassium: 485, allergenTags: '[]' },
  // Snacks & Others
  { name: 'Creamy Peanut Butter', category: 'Snacks', servingSize: 2, servingUnit: 'tbsp', calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 1.9, sodium: 152, potassium: 208, allergenTags: '["peanuts"]' },
  { name: 'Raw Almonds', category: 'Snacks', servingSize: 28, servingUnit: 'g', calories: 164, protein: 6, carbs: 6.1, fat: 14.2, fiber: 3.5, sodium: 1, potassium: 208, allergenTags: '["tree_nuts"]' },
  { name: 'Salted Potato Chips', category: 'Snacks', servingSize: 28, servingUnit: 'g', calories: 152, protein: 2, carbs: 15, fat: 9.8, fiber: 1.2, sodium: 148, potassium: 365, allergenTags: '[]' }
];

async function main() {
  console.log('Seeding Tele-nutrition Database...');
  
  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.cdsAlert.deleteMany();
  await prisma.adimeChart.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.mealFoodItem.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.weightHistory.deleteMany();
  await prisma.healthProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Food Items
  console.log(`Seeding ${FOOD_ITEMS.length} verified food items...`);
  const foodRecordMap = new Map<string, string>();
  for (const item of FOOD_ITEMS) {
    const created = await prisma.foodItem.create({ data: item });
    foodRecordMap.set(item.name, created.id);
  }

  // 2. Hash default password
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 3. Create Registered Dietitian (Provider)
  console.log('Creating Provider (Maria Santos, RDN)...');
  const providerUser = await prisma.user.create({
    data: {
      email: 'dietitian@telenutrition.demo',
      passwordHash: defaultPasswordHash,
      role: 'PROVIDER',
      profile: {
        create: {
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '+63-917-555-0101',
          dateOfBirth: new Date('1985-06-12')
        }
      },
      providerProfile: {
        create: {
          licenseNumber: 'PRC-ND-008921',
          credentials: 'RDN, LDN, MS Clinical Nutrition',
          bio: 'Registered Dietitian Nutritionist with 12+ years experience in chronic disease management, diabetes self-management education, and medical nutrition therapy.',
          specialties: JSON.stringify(['Type 2 Diabetes', 'Hypertension & Renal Nutrition', 'Cardiometabolic Health', 'Weight Management'])
        }
      }
    }
  });

  // Create Provider Availability Slots (Mon - Fri: 09:00 - 17:00)
  console.log('Creating Provider Availability Slots...');
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilitySlot.create({
      data: {
        providerId: providerUser.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
        isActive: true
      }
    });
  }

  // 4. Create Consumer 1: Diabetic Patient (Juan Dela Cruz)
  console.log('Creating Consumer 1 (Juan Dela Cruz - Diabetic)...');
  const juanUser = await prisma.user.create({
    data: {
      email: 'juan.diabetes@telenutrition.demo',
      passwordHash: defaultPasswordHash,
      role: 'CONSUMER',
      profile: {
        create: {
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phone: '+63-918-555-0202',
          dateOfBirth: new Date('1978-04-15')
        }
      },
      healthProfile: {
        create: {
          sex: 'MALE',
          heightCm: 172,
          weightKg: 84.5,
          activityLevel: 'SEDENTARY',
          allergies: JSON.stringify(['shellfish']),
          medicalConditions: JSON.stringify(['DIABETES', 'HYPERTENSION']),
          nutritionGoals: 'Improve glycemic stability, reduce fasting blood glucose to <110 mg/dL, lower daily sodium intake.',
          useAsianPacificBmi: true
        }
      }
    }
  });

  // Weight history for Juan (e.g. steady overweight)
  await prisma.weightHistory.createMany({
    data: [
      { userId: juanUser.id, weightKg: 85.2, recordedAt: new Date(Date.now() - 30 * 86400000) },
      { userId: juanUser.id, weightKg: 84.8, recordedAt: new Date(Date.now() - 15 * 86400000) },
      { userId: juanUser.id, weightKg: 84.5, recordedAt: new Date() }
    ]
  });

  // 5. Create Consumer 2: Hypertensive & CKD Patient (Clara Reyes)
  console.log('Creating Consumer 2 (Clara Reyes - Hypertensive / CKD)...');
  const claraUser = await prisma.user.create({
    data: {
      email: 'clara.hypertension@telenutrition.demo',
      passwordHash: defaultPasswordHash,
      role: 'CONSUMER',
      profile: {
        create: {
          firstName: 'Clara',
          lastName: 'Reyes',
          phone: '+63-919-555-0303',
          dateOfBirth: new Date('1965-09-22')
        }
      },
      healthProfile: {
        create: {
          sex: 'FEMALE',
          heightCm: 158,
          weightKg: 71.0,
          activityLevel: 'LIGHT',
          allergies: JSON.stringify(['peanuts']),
          medicalConditions: JSON.stringify(['HYPERTENSION', 'CKD']),
          nutritionGoals: 'Prevent potassium accumulation, maintain renal function stage 3a, strictly restrict sodium < 2000mg/day.',
          useAsianPacificBmi: true
        }
      }
    }
  });

  // 6. Create Consumer 3: Healthy / Active (Alex Tan)
  console.log('Creating Consumer 3 (Alex Tan - Healthy)...');
  const alexUser = await prisma.user.create({
    data: {
      email: 'alex.healthy@telenutrition.demo',
      passwordHash: defaultPasswordHash,
      role: 'CONSUMER',
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Tan',
          phone: '+63-920-555-0404',
          dateOfBirth: new Date('1996-11-10')
        }
      },
      healthProfile: {
        create: {
          sex: 'MALE',
          heightCm: 178,
          weightKg: 73.0,
          activityLevel: 'ACTIVE',
          allergies: JSON.stringify([]),
          medicalConditions: JSON.stringify([]),
          nutritionGoals: 'Optimize marathon fueling, hit 1.6g/kg daily protein target, balanced macronutrients.',
          useAsianPacificBmi: false
        }
      }
    }
  });

  // 7. Seed 2 Weeks of Meal Logs for Consumers
  console.log('Generating 14 days of realistic meal logs...');
  const adoboId = foodRecordMap.get('Chicken Adobo')!;
  const sinigangId = foodRecordMap.get('Pork Sinigang')!;
  const whiteRiceId = foodRecordMap.get('White Rice (Cooked)')!;
  const brownRiceId = foodRecordMap.get('Brown Rice (Cooked)')!;
  const pandesalId = foodRecordMap.get('Pandesal')!;
  const tinolaId = foodRecordMap.get('Chicken Tinola')!;
  const bananaId = foodRecordMap.get('Banana (Lakatan / Cavendish)')!;
  const eggId = foodRecordMap.get('Hard Boiled Egg')!;
  const oatmealId = foodRecordMap.get('Oatmeal (Rolled, Cooked)')!;
  const chickenBreastId = foodRecordMap.get('Grilled Chicken Breast')!;
  const broccoliId = foodRecordMap.get('Steamed Broccoli')!;
  const chipsId = foodRecordMap.get('Salted Potato Chips')!;

  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    const dateStr = logDate.toISOString().split('T')[0];

    // Juan: High carb and high sodium Filipino dishes (triggers CDS rules)
    const juanBreakfast = await prisma.mealLog.create({
      data: {
        userId: juanUser.id,
        date: dateStr,
        mealType: 'BREAKFAST',
        notes: 'Coffee with 2 pandesal and egg'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: juanBreakfast.id, foodItemId: pandesalId, servings: 2 },
        { mealLogId: juanBreakfast.id, foodItemId: eggId, servings: 2 }
      ]
    });

    const juanLunch = await prisma.mealLog.create({
      data: {
        userId: juanUser.id,
        date: dateStr,
        mealType: 'LUNCH',
        notes: 'Adobo lunch with extra rice'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: juanLunch.id, foodItemId: adoboId, servings: 1.5 },
        { mealLogId: juanLunch.id, foodItemId: whiteRiceId, servings: 2.0 },
        { mealLogId: juanLunch.id, foodItemId: bananaId, servings: 1.0 }
      ]
    });

    const juanDinner = await prisma.mealLog.create({
      data: {
        userId: juanUser.id,
        date: dateStr,
        mealType: 'DINNER',
        notes: 'Sinigang dinner'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: juanDinner.id, foodItemId: sinigangId, servings: 1.5 },
        { mealLogId: juanDinner.id, foodItemId: whiteRiceId, servings: 1.5 }
      ]
    });

    // Clara: Monitored intake with occasional high-potassium/sodium spikes
    const claraLunch = await prisma.mealLog.create({
      data: {
        userId: claraUser.id,
        date: dateStr,
        mealType: 'LUNCH',
        notes: 'Tinola soup and rice'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: claraLunch.id, foodItemId: tinolaId, servings: 1.0 },
        { mealLogId: claraLunch.id, foodItemId: whiteRiceId, servings: 1.0 },
        { mealLogId: claraLunch.id, foodItemId: bananaId, servings: 1.0 }
      ]
    });

    // Alex: Balanced athletic meals
    const alexBreakfast = await prisma.mealLog.create({
      data: {
        userId: alexUser.id,
        date: dateStr,
        mealType: 'BREAKFAST',
        notes: 'Pre-workout oatmeal and eggs'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: alexBreakfast.id, foodItemId: oatmealId, servings: 1.5 },
        { mealLogId: alexBreakfast.id, foodItemId: eggId, servings: 3 },
        { mealLogId: alexBreakfast.id, foodItemId: bananaId, servings: 1 }
      ]
    });

    const alexDinner = await prisma.mealLog.create({
      data: {
        userId: alexUser.id,
        date: dateStr,
        mealType: 'DINNER',
        notes: 'Clean post-run dinner'
      }
    });
    await prisma.mealFoodItem.createMany({
      data: [
        { mealLogId: alexDinner.id, foodItemId: chickenBreastId, servings: 2.0 },
        { mealLogId: alexDinner.id, foodItemId: brownRiceId, servings: 1.5 },
        { mealLogId: alexDinner.id, foodItemId: broccoliId, servings: 1.5 }
      ]
    });
  }

  // 8. Create Appointments & ADIME Charts
  console.log('Creating Appointments and Sample ADIME Chart...');
  
  // Future appointment for Juan Dela Cruz (for live demo video session)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const juanAppt = await prisma.appointment.create({
    data: {
      consumerId: juanUser.id,
      providerId: providerUser.id,
      scheduledAt: tomorrow,
      durationMinutes: 30,
      status: 'SCHEDULED',
      roomName: `telenutrition-session-juan-${Date.now().toString(36)}`,
      notes: 'Initial MNT consultation for Type 2 Diabetes and glycemic regulation.'
    }
  });

  // Past completed appointment for Clara Reyes with finalized eNCPT ADIME chart
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  pastDate.setHours(10, 0, 0, 0);

  const claraAppt = await prisma.appointment.create({
    data: {
      consumerId: claraUser.id,
      providerId: providerUser.id,
      scheduledAt: pastDate,
      durationMinutes: 30,
      status: 'COMPLETED',
      roomName: `telenutrition-session-clara-${Date.now().toString(36)}`,
      notes: 'Follow-up consultation on renal sodium/potassium restrictions.'
    }
  });

  // Create Finalized ADIME Chart for Clara Reyes
  await prisma.adimeChart.create({
    data: {
      appointmentId: claraAppt.id,
      consumerId: claraUser.id,
      providerId: providerUser.id,
      status: 'FINALIZED',
      // Assessment
      assessmentFoodNutritionHistory: '24-hour recall shows average sodium intake ~2,700 mg/day (exceeding renal target of <2,000 mg). Occasional high-potassium fruits (bananas) consumed during snacks.',
      assessmentAnthropometrics: JSON.stringify({ heightCm: 158, weightKg: 71.0, bmi: 28.44, bmr: 1324, tee: 1820 }),
      assessmentBiochemical: JSON.stringify([{ test: 'eGFR', value: '54 mL/min/1.73m²', date: '2026-10-20' }, { test: 'Serum Potassium', value: '5.1 mEq/L', date: '2026-10-20' }]),
      assessmentPhysicalFindings: 'Mild peripheral edema (1+) observed at lower extremities. Blood pressure 138/88 mmHg.',
      assessmentClientHistory: '61 y.o. female diagnosed with Stage 3a CKD and Primary Hypertension.',
      // Diagnosis (eNCPT PES statement)
      diagnosisDomain: 'INTAKE',
      diagnosisTerm: 'Excessive sodium intake (NI-5.10.1)',
      diagnosisEtiology: 'Related to frequent consumption of high-sodium savory soups (Sinigang) and processed seasonings',
      diagnosisSignsSymptoms: 'As evidenced by estimated daily sodium intake exceeding 2,700 mg/day, elevated BP (138/88 mmHg), and mild lower extremity edema.',
      pesStatement: 'Excessive sodium intake (NI-5.10.1) related to frequent consumption of high-sodium savory soups and processed seasonings as evidenced by estimated daily sodium intake exceeding 2,700 mg/day, elevated BP (138/88 mmHg), and mild lower extremity edema.',
      // Intervention
      interventionFoodDelivery: 'Prescribed renal DASH modification: Sodium restricted to < 2,000 mg/day; phosphorus and potassium monitoring.',
      interventionEducation: 'Educated client on label reading for milligrams of sodium per serving and low-sodium Filipino seasoning substitutes (calamansi, garlic, ginger).',
      interventionCounseling: 'Motivational interviewing to set manageable target of limiting Sinigang soup broth consumption to once weekly.',
      interventionCoordination: 'Shared consultation summary with primary care physician and ordered follow-up renal electrolyte panel.',
      // Monitoring & Evaluation
      meIndicators: 'Daily dietary sodium logs, resting systolic and diastolic blood pressure, serum potassium.',
      meTargets: 'Sodium < 2,000 mg/day, blood pressure < 130/80 mmHg, serum potassium 3.5 - 5.0 mEq/L.',
      meFollowUpDate: new Date(Date.now() + 14 * 86400000),
      finalizedAt: new Date(Date.now() - 3 * 86400000)
    }
  });

  // Seed sample CDS alerts
  await prisma.cdsAlert.create({
    data: {
      userId: juanUser.id,
      ruleId: 'CDS-SODIUM-HIGH',
      severity: 'WARNING',
      message: 'Daily sodium intake exceeded 2,300 mg (recorded 2,820 mg). Given diagnosed Hypertension, restrict sodium to protect cardiovascular and renal function.',
      triggeredAt: new Date()
    }
  });

  await prisma.cdsAlert.create({
    data: {
      userId: juanUser.id,
      ruleId: 'CDS-CARB-DIABETES',
      severity: 'WARNING',
      message: 'Carbohydrate intake was 68% of total daily energy, exceeding the recommended 65% ceiling for diabetes management.',
      triggeredAt: new Date()
    }
  });

  console.log('Database successfully seeded with demo accounts, foods, meal logs, appointments, and eNCPT chart!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
