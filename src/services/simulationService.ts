import type { AnalysisResult, Suggestion } from '../types';
import { runScrutineering } from './scrutineeringService';

// Simple hash function to create a seed from a string (e.g., filename)
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Simple seeded pseudo-random number generator (PRNG)
const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};


// Helper to generate a seeded random number in a range
const randomInRange = (randomFn: () => number, min: number, max: number, precision: number = 4) => {
  const value = randomFn() * (max - min) + min;
  return parseFloat(value.toFixed(precision));
};

// A curated list of potential suggestions based on F1 in Schools rules
const ALL_SUGGESTIONS: Omit<Suggestion, 'id'>[] = [
  {
    title: 'Streamline the Car Body',
    description: 'Reduce the frontal area and create smoother surfaces to minimize pressure drag. Ensure the body shape guides air cleanly over the car and towards the rear wing. Avoid abrupt changes in geometry.',
    impact: 'High',
    category: 'Drag',
  },
  {
    title: 'Increase Wing Downforce',
    description: "Your downforce is on the lower side. Consider increasing the wing's angle of attack for more grip in corners, but be mindful of the drag penalty.",
    impact: 'High',
    category: 'Downforce',
  },
   {
    title: 'Balance High Downforce',
    description: 'Very high downforce can create excess drag on straights. Consider reducing the wing angle of attack for a better balance between cornering and top speed.',
    impact: 'Medium',
    category: 'Downforce',
  },
  {
    title: 'Optimize Lift-to-Drag Ratio',
    description: 'Your L/D ratio indicates a potential imbalance. Aim for the highest possible downforce for the lowest drag penalty. This might involve small adjustments to wing profiles or body shape.',
    impact: 'High',
    category: 'General',
  },
  {
    title: 'Refine Nose Cone Shape',
    description: 'The nose cone is the first point of contact with the air. A more pointed or elliptical shape can help reduce drag by splitting the air more efficiently. Check regulations for minimum radius requirements.',
    impact: 'Medium',
    category: 'Drag',
  },
  {
    title: 'Ensure Smooth Surface Finish',
    description: 'A polished, smooth surface reduces skin friction drag. Sand and paint your car to the highest possible finish. Even small imperfections can disrupt airflow.',
    impact: 'Medium',
    category: 'General',
  },
  {
    title: 'Manage Airflow Around Wheels',
    description: 'Wheels create significant turbulence. Consider using small deflectors or shaping the bodywork ahead of the wheels to divert air around them, reducing wake and drag. Must comply with bodywork regulations.',
    impact: 'Medium',
    category: 'Drag',
  },
  {
    title: 'Check Regulation "No-Go" Zones',
    description: 'Double-check your design against the Development Class technical regulations, especially concerning exclusion zones around the virtual cargo and cartridge housing. Infringements lead to disqualification.',
    impact: 'High',
    category: 'Regulations',
  },
  {
    title: 'Improve Rear Wake Management',
    description: 'The area behind the car is crucial. A tapered rear end helps the airflow to converge smoothly, reducing the low-pressure wake that causes drag. A well-designed diffuser can also help.',
    impact: 'Medium',
    category: 'Drag',
  },
  {
    title: 'Verify Wing Dimensions',
    description: 'Ensure your front and rear wings are within the maximum and minimum dimensions specified in the Dev Class regulations. This includes span, chord, and placement on the car body.',
    impact: 'High',
    category: 'Regulations',
  },
];


export const runAnalysis = (file: File): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    // Generate a consistent seed from the filename, size, and type
    const seed = simpleHash(file.name + file.size + file.type);
    const random = seededRandom(seed);
    const lowerFileName = file.name.toLowerCase();
    
    // Base coefficients
    let baseCd = 0.40;
    let baseCl = -1.1; // Negative for downforce

    // Modify base coefficients based on filename keywords (pseudo-physical model)
    if (lowerFileName.includes('streamline')) baseCd -= 0.08;
    if (lowerFileName.includes('aggressive')) baseCl -= 0.25;
    if (lowerFileName.includes('wing')) baseCl -= 0.1;
    if (lowerFileName.includes('brick') || lowerFileName.includes('block')) baseCd += 0.15;
    if (lowerFileName.includes('smooth')) baseCd -= 0.03;
    if (lowerFileName.includes('high_downforce')) {
        baseCl -= 0.3;
        baseCd += 0.05;
    }

    setTimeout(() => {
      // Simulate aerodynamic results using the seeded random generator on top of the base model
      const dragCoefficient = randomInRange(random, baseCd - 0.05, baseCd + 0.05);
      const liftCoefficient = randomInRange(random, baseCl - 0.1, baseCl + 0.1); 
      const frontalAreaM2 = randomInRange(random, 0.0020, 0.0035);
      
      const airDensity = 1.225; // kg/m^3
      const velocity = 22; // m/s (approx 80 km/h)

      // Calculate forces and key ratios
      const dragForce = 0.5 * airDensity * Math.pow(velocity, 2) * frontalAreaM2 * dragCoefficient;
      const downforce = 0.5 * airDensity * Math.pow(velocity, 2) * frontalAreaM2 * liftCoefficient;
      const liftToDragRatio = Math.abs(liftCoefficient / dragCoefficient);

      // Generate relevant suggestions
      const suggestions: Suggestion[] = [];
      const usedTitles = new Set<string>();

      const addSuggestion = (suggestion: Omit<Suggestion, 'id'>) => {
        if (!usedTitles.has(suggestion.title)) {
          suggestions.push({ ...suggestion, id: suggestion.title.replace(/\s+/g, '-') });
          usedTitles.add(suggestion.title);
        }
      };
      
      // Always add regulation checks
      addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Check Regulation "No-Go" Zones')!);
      addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Verify Wing Dimensions')!);
      addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Ensure Smooth Surface Finish')!);


      if (dragCoefficient > 0.45) {
        addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Streamline the Car Body')!);
        addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Manage Airflow Around Wheels')!);
      } else if (dragCoefficient > 0.35) {
         addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Refine Nose Cone Shape')!);
      }

      if (liftCoefficient < -1.4) { // Potentially too much downforce
        addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Balance High Downforce')!);
      }

      if (liftToDragRatio < 2.5) {
         addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Optimize Lift-to-Drag Ratio')!);
      }
      
      if(suggestions.length < 5){
         addSuggestion(ALL_SUGGESTIONS.find(s => s.title === 'Improve Rear Wake Management')!);
      }

      // Simulate physical properties for scrutineering
      const baseWeight = lowerFileName.includes('light') ? 58 : 62;
      const weightGrams = randomInRange(random, baseWeight, baseWeight + 5, 2);
      
      const baseLength = lowerFileName.includes('long') ? 212 : 190;
      const totalLength = randomInRange(random, baseLength, baseLength + 10, 1);

      const baseWidth = lowerFileName.includes('wide') ? 92 : 85;
      const totalWidth = randomInRange(random, baseWidth, baseWidth + 3, 1);
      
      const intermediateResult = {
        id: `${file.name}-${new Date().getTime()}`,
        fileName: file.name,
        dragCoefficient,
        liftCoefficient,
        downforceNewtons: parseFloat(downforce.toFixed(2)),
        dragForceNewtons: parseFloat(dragForce.toFixed(2)),
        liftToDragRatio: parseFloat(liftToDragRatio.toFixed(3)),
        frontalAreaM2,
        suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
        weightGrams,
        totalLength,
        totalWidth
      };

      const scrutineeringReport = runScrutineering(intermediateResult);

      const result: AnalysisResult = {
        ...intermediateResult,
        scrutineeringReport,
      };

      resolve(result);
    }, 4500); // Simulate a 4.5-second analysis
  });
};
