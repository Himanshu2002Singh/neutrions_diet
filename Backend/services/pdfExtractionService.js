/**
 * PDF Extraction Service
 * Parses diet plan PDFs and converts them to structured JSON format
 * Specifically designed for the Simmi diet plan format
 */

const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const pdfParseLib = require('pdf-parse');
// pdf-parse v2.x exports PDFParse as a function, not the default export
const pdfParse = pdfParseLib.PDFParse || pdfParseLib;

/**
 * Safely delete a file, logging warnings instead of throwing errors
 * @param {string} filePath - Path to the file to delete
 */
async function cleanupFile(filePath) {
  try {
    if (!filePath) return;
    
    // Check if file exists before attempting to delete
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log(`[PDF Cleanup] Successfully deleted file: ${absolutePath}`);
  } catch (error) {
    // Log warning instead of throwing - file cleanup should not break the process
    if (error.code === 'ENOENT') {
      console.warn(`[PDF Cleanup] File not found (already deleted or never created): ${filePath}`);
    } else {
      console.warn(`[PDF Cleanup] Failed to delete file ${filePath}: ${error.message}`);
    }
  }
}

/**
 * Extract text from a PDF file using pdf-lib
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    
    // Try pdf-parse first (works for simple PDFs)
    try {
      const data = await pdfParse(dataBuffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (parseError) {
      // pdf-parse failed, try pdf-lib as fallback
    }
    
    // Fallback: Use pdf-lib to extract text
    const pdfDoc = await PDFDocument.load(dataBuffer);
    const pages = pdfDoc.getPages();
    let fullText = '';
    
    for (const page of pages) {
      const { items } = page.getTextContent();
      const pageText = items
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    if (fullText.trim().length > 0) {
      return fullText;
    }
    
    throw new Error('Could not extract text from PDF');
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Parse the extracted text into a structured diet plan object
 * @param {string} text - Extracted text from PDF
 * @returns {Object} - Structured diet plan object
 */
function parseDietPlanText(text) {
  const dietPlan = {
    userName: 'User',
    profile: {
      age: null,
      weight: null,
      height: null,
      bmiCategory: null,
      target: null,
      medicalConditions: [],
      medications: null,
      deficiency: null,
      profession: null,
      lifestyle: null,
      liveWithFamily: null
    },
    nutritionTargets: {
      calories: null,
      protein: null,
      fiber: null,
      fat: null,
      carbs: null
    },
    dailySchedule: [],
    lateNightOptions: [],
    importantPoints: [],
    portionSizeReference: {},
    goals: []
  };

  // Normalize text - remove extra spaces and normalize newlines
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
  
  // Extract user name from the first line (usually the title contains the name)
  const nameMatch = text.match(/^(Simmi\s*Ji|Dear\s+\w+|Customer\s+\w+)/i);
  if (nameMatch) {
    dietPlan.userName = nameMatch[1].trim();
  }

  // Extract profile information
  dietPlan.profile = parseProfileInfo(text, dietPlan.profile);

  // Extract nutrition targets
  dietPlan.nutritionTargets = parseNutritionTargets(text);

  // Extract daily schedule
  dietPlan.dailySchedule = parseDailySchedule(text);

  // Extract late night options
  dietPlan.lateNightOptions = parseLateNightOptions(text);

  // Extract important points
  dietPlan.importantPoints = parseImportantPoints(text);

  // Extract portion size reference
  dietPlan.portionSizeReference = parsePortionSizeReference(text);

  // Extract goals
  dietPlan.goals = parseGoals(text);

  return dietPlan;
}

/**
 * Parse profile information from the text
 */
function parseProfileInfo(text, profile) {
  // Age
  const ageMatch = text.match(/age[:\s]*(\d+)/i);
  if (ageMatch) profile.age = parseInt(ageMatch[1]);

  // Weight
  const weightMatch = text.match(/weight[:\s]*(\d+(?:\.\d+)?)\s*kg/i);
  if (weightMatch) profile.weight = parseFloat(weightMatch[1]);

  // Height
  const heightMatch = text.match(/height[:\s]*(\d+(?:\.\d+)?)\s*cm/i);
  if (heightMatch) profile.height = parseFloat(heightMatch[1]);

  // BMI Category
  const bmiMatch = text.match(/BMI\s*Category[:\s]*([^.\n]+)/i);
  if (bmiMatch) profile.bmiCategory = bmiMatch[1].trim();

  // Medical Conditions
  const medicalMatch = text.match(/Medical\s*Conditions?[:\s]*([^\n.]+)/i);
  if (medicalMatch) {
    profile.medicalConditions = medicalMatch[1]
      .split(/[,&]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // Medications
  const medicationMatch = text.match(/Medications?[:\s]*([^\n.]+)/i);
  if (medicationMatch) profile.medications = medicationMatch[1].trim();

  // Deficiency
  const deficiencyMatch = text.match(/Deficiency[:\s]*([^\n.]+)/i);
  if (deficiencyMatch) profile.deficiency = deficiencyMatch[1].trim();

  // Profession
  const professionMatch = text.match(/Profession[:\s]*([^\n.]+)/i);
  if (professionMatch) profile.profession = professionMatch[1].trim();

  // Lifestyle
  const lifestyleMatch = text.match(/Lifestyle[:\s]*([^\n.]+)/i);
  if (lifestyleMatch) profile.lifestyle = lifestyleMatch[1].trim();

  // Live with family
  const familyMatch = text.match(/Live\s*with\s*family[:\s]*(Yes|No|TRUE|FALSE)/i);
  if (familyMatch) profile.liveWithFamily = /Yes|TRUE/i.test(familyMatch[1]);

  // Target/Goal
  const targetMatch = text.match(/Target[:\s]*([^\n.]+)/i);
  if (targetMatch) profile.target = targetMatch[1].trim();

  return profile;
}

/**
 * Parse nutrition targets from the text
 */
function parseNutritionTargets(text) {
  const targets = {
    calories: null,
    protein: null,
    fiber: null,
    fat: null,
    carbs: null
  };

  // Calories
  const caloriesMatch = text.match(/calories?[:\s]*(\d+(?:-\d+)?\s*kcal)/i);
  if (caloriesMatch) targets.calories = caloriesMatch[1].trim();

  // Protein
  const proteinMatch = text.match(/protein[:\s]*(\d+\s*g)/i);
  if (proteinMatch) targets.protein = proteinMatch[1].trim();

  // Fiber
  const fiberMatch = text.match(/fiber[:\s]*(\d+(?:-\d+)?\s*g)/i);
  if (fiberMatch) targets.fiber = fiberMatch[1].trim();

  // Fat
  const fatMatch = text.match(/fat[:\s]*(\d+(?:-\d+)?\s*g)/i);
  if (fatMatch) targets.fat = fatMatch[1].trim();

  // Carbs
  const carbsMatch = text.match(/carbs?[:\s]*(\d+\s*g)/i);
  if (carbsMatch) targets.carbs = carbsMatch[1].trim();

  return targets;
}

/**
 * Parse the daily meal schedule from the text
 */
function parseDailySchedule(text) {
  const schedule = [];

  // Define the expected meal times and their patterns
  const mealPatterns = [
    { time: '8:00 AM', mealType: 'Wake Up', patterns: [/wake\s*up[:\s]*/i, /early\s*morning[:\s]*/i, /8[:\s]*00\s*am/i] },
    { time: '10:00 AM', mealType: 'Breakfast', patterns: [/breakfast[:\s]*/i, /10[:\s]*00\s*am/i, /10[:\s]*am/i] },
    { time: '12:30 PM', mealType: 'Mid-Morning', patterns: [/mid[\s-]*morning[:\s]*/i, /12[:\s]*30\s*pm/i, /between\s*meals/i] },
    { time: '2:30 PM', mealType: 'Lunch', patterns: [/lunch[:\s]*/i, /2[:\s]*30\s*pm/i, /afternoon/i] },
    { time: '4:00 PM', mealType: 'Pre-Workout', patterns: [/pre[\s-]*workout[:\s]*/i, /4[:\s]*00\s*pm/i, /evening\s*snack/i] },
    { time: '5:00 PM', mealType: 'Evening Snacks', patterns: [/evening\s*snack[:\s]*/i, /5[:\s]*00\s*pm/i, /late\s*afternoon/i] },
    { time: '7:30 PM', mealType: 'Dinner', patterns: [/dinner[:\s]*/i, /7[:\s]*30\s*pm/i, /night\s*meal/i] },
    { time: '10:00 PM', mealType: 'Bed Time', patterns: [/bed[\s-]*time[:\s]*/i, /10[:\s]*00\s*pm/i, /before\s*sleep/i] }
  ];

  // Extract meal options using pattern matching
  const mealSections = extractMealSections(text);

  mealSections.forEach((section, index) => {
    const mealEntry = parseMealSection(section, index);
    if (mealEntry) {
      schedule.push(mealEntry);
    }
  });

  // If no sections found, try a more aggressive parsing approach
  if (schedule.length === 0) {
    const fallbackSchedule = parseDailyScheduleFallback(text);
    schedule.push(...fallbackSchedule);
  }

  return schedule;
}

/**
 * Extract meal sections from the text
 */
function extractMealSections(text) {
  const sections = [];
  
  // Split by common meal headers
  const sectionMarkers = [
    /WAK[EU]?\s*UP[:\s]*/i,
    /BREAKFAST[:\s]*/i,
    /MID[\s-]*MORNING[:\s]*/i,
    /LUNCH[:\s]*/i,
    /PRE[\s-]*WORKOUT[:\s]*/i,
    /EVENING\s*SNACK/i,
    /DINNER[:\s]*/i,
    /BED[\s-]*TIME[:\s]*/i
  ];

  let lastIndex = 0;
  let currentSection = '';

  for (const marker of sectionMarkers) {
    const match = text.match(marker);
    if (match && match.index > lastIndex) {
      currentSection = text.substring(lastIndex, match.index).trim();
      if (currentSection.length > 10) {
        sections.push(currentSection);
      }
      lastIndex = match.index;
    }
  }

  // Add the last section
  if (lastIndex < text.length) {
    currentSection = text.substring(lastIndex).trim();
    if (currentSection.length > 10) {
      sections.push(currentSection);
    }
  }

  return sections;
}

/**
 * Parse a single meal section
 */
function parseMealSection(section, index) {
  const mealEntry = {
    time: null,
    mealType: null,
    title: null,
    description: null,
    options: [],
    tips: null
  };

  // Try to extract time
  const timeMatch = section.match(/(\d{1,2}[:\.]\d{2}\s*(?:AM|PM|am|pm))/);
  if (timeMatch) {
    mealEntry.time = timeMatch[1].replace('.', ':');
  }

  // Try to extract meal type from the beginning
  const mealTypeMatch = section.match(/^(WAK[EU]?\s*UP|BREAKFAST|MID[\s-]*MORNING|LUNCH|PRE[\s-]*WORKOUT|EVENING\s*SNACK|DINNER|BED[\s-]*TIME)/i);
  if (mealTypeMatch) {
    const rawMealType = mealTypeMatch[1].toLowerCase();
    if (rawMealType.includes('wake')) mealEntry.mealType = 'Wake Up';
    else if (rawMealType.includes('break')) mealEntry.mealType = 'Breakfast';
    else if (rawMealType.includes('mid')) mealEntry.mealType = 'Mid-Morning';
    else if (rawMealType.includes('lunch')) mealEntry.mealType = 'Lunch';
    else if (rawMealType.includes('pre')) mealEntry.mealType = 'Pre-Workout';
    else if (rawMealType.includes('evening')) mealEntry.mealType = 'Evening Snacks';
    else if (rawMealType.includes('dinner')) mealEntry.mealType = 'Dinner';
    else if (rawMealType.includes('bed')) mealEntry.mealType = 'Bed Time';
  }

  // Try to extract food options
  const optionMatches = section.matchAll(/(?:^|\n)\s*[-•*]\s*([A-Za-z\s&]+?)\s*[-–—:]\s*(\d+(?:-\d+)?\s*(?:g|ml|pieces?|cups?|bowl|glass|tsp|tbsp|slices?|pieces?)?)/g);
  
  for (const match of optionMatches) {
    const name = match[1].trim();
    const portion = match[2].trim();
    
    // Estimate calories based on food type
    const calories = estimateCalories(name);
    
    mealEntry.options.push({
      name,
      portion,
      calories,
      macros: estimateMacros(name)
    });
  }

  // If no bullet options found, try numbered list
  if (mealEntry.options.length === 0) {
    const numberedMatches = section.matchAll(/(?:^|\n)\s*(\d+)[.)]\s*([A-Za-z\s&]+?)\s*[-–—:]\s*(\d+(?:-\d+)?\s*(?:g|ml|pieces?|cups?|bowl|glass|tsp|tbsp|slices?|pieces?)?)/g);
    
    for (const match of numberedMatches) {
      const name = match[2].trim();
      const portion = match[3].trim();
      const calories = estimateCalories(name);
      
      mealEntry.options.push({
        name,
        portion,
        calories,
        macros: estimateMacros(name)
      });
    }
  }

  return mealEntry;
}

/**
 * Fallback parser for daily schedule
 */
function parseDailyScheduleFallback(text) {
  const schedule = [];
  
  // Try to find common breakfast/lunch/dinner patterns
  const breakfastMatch = text.match(/breakfast[:\s]*([\s\S]*?)(?:lunch|dinner|mid[\s-]*morning)/i);
  if (breakfastMatch) {
    schedule.push({
      time: '10:00 AM',
      mealType: 'Breakfast',
      title: 'Breakfast Options',
      options: parseFoodOptions(breakfastMatch[1]),
      tips: 'Start your day with a healthy breakfast'
    });
  }

  const lunchMatch = text.match(/lunch[:\s]*([\s\S]*?)(?:dinner|evening|bed[\s-]*time)/i);
  if (lunchMatch) {
    schedule.push({
      time: '2:30 PM',
      mealType: 'Lunch',
      title: 'Lunch Options',
      options: parseFoodOptions(lunchMatch[1]),
      tips: 'Include protein and fiber in your lunch'
    });
  }

  const dinnerMatch = text.match(/dinner[:\s]*([\s\S]*?)(?:bed[\s-]*time|late[\s-]*night)/i);
  if (dinnerMatch) {
    schedule.push({
      time: '7:30 PM',
      mealType: 'Dinner',
      title: 'Dinner Options',
      options: parseFoodOptions(dinnerMatch[1]),
      tips: 'Keep dinner light and early'
    });
  }

  return schedule;
}

/**
 * Parse food options from a text block
 */
function parseFoodOptions(textBlock) {
  const options = [];
  
  const matches = textBlock.matchAll(/(?:^|\n)\s*[-•*]\s*([A-Za-z\s&]+?)\s*[-–—:]\s*(\d+(?:-\d+)?\s*(?:g|ml|pieces?|cups?|bowl|glass|tsp|tbsp|slices?|pieces?)?)/g);
  
  for (const match of matches) {
    const name = match[1].trim();
    const portion = match[2].trim();
    
    options.push({
      name,
      portion,
      calories: estimateCalories(name),
      macros: estimateMacros(name)
    });
  }
  
  return options;
}

/**
 * Estimate calories based on food name
 */
function estimateCalories(foodName) {
  const lowerName = foodName.toLowerCase();
  
  // High calorie foods
  if (lowerName.includes('paneer') && lowerName.includes('fried')) return 350;
  if (lowerName.includes('pulao') || lowerName.includes('pulaav')) return 400;
  if (lowerName.includes('paratha')) return 300;
  if (lowerName.includes('curry') && lowerName.includes('paneer')) return 300;
  if (lowerName.includes('rajma') || lowerName.includes('chana')) return 350;
  if (lowerName.includes('biryani')) return 450;
  
  // Medium calorie foods
  if (lowerName.includes('dal') || lowerName.includes('soup')) return 150;
  if (lowerName.includes('idli') || lowerName.includes('dosa')) return 200;
  if (lowerName.includes('salad')) return 150;
  if (lowerName.includes('curd') || lowerName.includes('yogurt')) return 100;
  if (lowerName.includes('fruit')) return 80;
  if (lowerName.includes('toast')) return 180;
  if (lowerName.includes('paneer') && !lowerName.includes('fried')) return 250;
  if (lowerName.includes('moong') || lowerName.includes('sprouted')) return 150;
  
  // Low calorie foods
  if (lowerName.includes('water') || lowerName.includes('tea')) return 10;
  if (lowerName.includes('vegetable')) return 100;
  if (lowerName.includes('roasted')) return 100;
  if (lowerName.includes('buttermilk') || lowerName.includes('lassi')) return 80;
  if (lowerName.includes('coconut')) return 60;
  
  // Default estimate
  return 200;
}

/**
 * Estimate macronutrients based on food name
 */
function estimateMacros(foodName) {
  const lowerName = foodName.toLowerCase();
  
  let protein = 5;
  let carbs = 20;
  let fats = 5;
  
  if (lowerName.includes('paneer') || lowerName.includes('chicken') || lowerName.includes('egg') || lowerName.includes('fish')) {
    protein = 15;
    carbs = 5;
    fats = 10;
  } else if (lowerName.includes('dal') || lowerName.includes('rajma') || lowerName.includes('chana') || lowerName.includes('moong')) {
    protein = 10;
    carbs = 25;
    fats = 3;
  } else if (lowerName.includes('rice') || lowerName.includes('quinoa') || lowerName.includes('pulao') || lowerName.includes('idli')) {
    protein = 5;
    carbs = 35;
    fats = 3;
  } else if (lowerName.includes('fruit') || lowerName.includes('salad') || lowerName.includes('vegetable')) {
    protein = 2;
    carbs = 15;
    fats = 1;
  } else if (lowerName.includes('nuts') || lowerName.includes('almond') || lowerName.includes('walnut') || lowerName.includes('peanut')) {
    protein = 5;
    carbs = 5;
    fats = 15;
  } else if (lowerName.includes('curd') || lowerName.includes('yogurt') || lowerName.includes('lassi')) {
    protein = 8;
    carbs = 12;
    fats = 5;
  } else if (lowerName.includes('soup') || lowerName.includes('water') || lowerName.includes('tea')) {
    protein = 2;
    carbs = 5;
    fats = 1;
  }
  
  return { protein, carbs, fats };
}

/**
 * Parse late night options from the text
 */
function parseLateNightOptions(text) {
  const options = [];
  
  const lateNightMatch = text.match(/Late[\s-]*Night\s*Option[s]?[:\s]*([\s\S]*?)(?:Important\s*Points?|Goals|Portion)/i);
  
  if (lateNightMatch) {
    const section = lateNightMatch[1];
    
    const matches = section.matchAll(/(?:^|\n)\s*[-•*]\s*([A-Za-z\s&]+?)\s*[-–—:]\s*(\d+(?:-\d+)?\s*(?:g|ml|pieces?|cups?|bowl|glass|tsp|tbsp|slices?|pieces?)?)/g);
    
    for (const match of matches) {
      const name = match[1].trim();
      const portion = match[2].trim();
      
      options.push({
        name,
        portion,
        calories: estimateCalories(name),
        macros: estimateMacros(name)
      });
    }
  }
  
  return options;
}

/**
 * Parse important points from the text
 */
function parseImportantPoints(text) {
  const points = [];
  
  const importantMatch = text.match(/Important\s*Points?[:\s]*([\s\S]*?)(?:Portion\s*Size|Goals|Late[\s-]*Night)/i);
  
  if (importantMatch) {
    const section = importantMatch[1];
    
    const matches = section.matchAll(/(?:^|\n)\s*[-•*]\s*([^\n.]+)/g);
    
    for (const match of matches) {
      const point = match[1].trim();
      if (point.length > 5) {
        points.push(point);
      }
    }
  }
  
  return points;
}

/**
 * Parse portion size reference
 */
function parsePortionSizeReference(text) {
  const reference = {};
  
  const portionMatch = text.match(/Portion\s*Size\s*Reference[:\s]*([\s\S]*?)(?:Goals|Important)/i);
  
  if (portionMatch) {
    const section = portionMatch[1];
    
    const matches = section.matchAll(/(\d+\s*(?:glass|bowl|cup|tsp|tbsp|plate)s?)[:\s]*(\d+(?:\.\d+)?\s*(?:ml|g))/gi);
    
    for (const match of matches) {
      const unit = match[1].toLowerCase().trim();
      const value = match[2].trim();
      reference[unit] = value;
    }
  }
  
  // Add default portion sizes if not found
  if (Object.keys(reference).length === 0) {
    reference['1 glass'] = '250 ml';
    reference['1 small bowl'] = '150 g';
    reference['1 medium bowl'] = '250 g';
    reference['1 big bowl'] = '350 g';
    reference['1 tsp'] = '5 g';
    reference['1 tbsp'] = '15 g';
  }
  
  return reference;
}

/**
 * Parse goals from the text
 */
function parseGoals(text) {
  const goals = [];
  
  const goalsMatch = text.match(/Goals[:\s]*([\s\S]*?)$/i);
  
  if (goalsMatch) {
    const section = goalsMatch[1];
    
    const matches = section.matchAll(/(?:^|\n)\s*[-•*]\s*([^\n.]+)/g);
    
    for (const match of matches) {
      const goal = match[1].trim();
      if (goal.length > 5) {
        goals.push(goal);
      }
    }
  }
  
  return goals;
}

/**
 * Main function to parse a PDF diet plan file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - Parsed diet plan object
 */
async function parseDietPlanPDF(pdfPath) {
  let text;
  try {
    // Extract text from PDF
    text = await extractTextFromPDF(pdfPath);
    
    // Parse the text into structured format
    const dietPlan = parseDietPlanText(text);
    
    return dietPlan;
  } catch (error) {
    console.error('Error parsing diet plan PDF:', error);
    throw error;
  } finally {
    // Always attempt cleanup after extraction (whether successful or failed)
    // This ensures the PDF file is deleted after it's no longer needed
    if (text) {
      await cleanupFile(pdfPath);
    }
  }
}

/**
 * Parse a diet plan from text content (for testing or manual input)
 * @param {string} text - Text content of the diet plan
 * @returns {Object} - Parsed diet plan object
 */
function parseDietPlanFromText(text) {
  return parseDietPlanText(text);
}

module.exports = {
  extractTextFromPDF,
  parseDietPlanPDF,
  parseDietPlanFromText,
  parseDietPlanText,
  cleanupFile
};

