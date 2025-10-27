import type { AnalysisResult, ScrutineeringReport, ScrutineeringInfraction } from '../types';

// Based on F1 in Schools Development Class Technical Regulations 2024-2025
export const runScrutineering = (result: Omit<AnalysisResult, 'scrutineeringReport' | 'id' | 'suggestions' | 'frontalAreaM2'>): ScrutineeringReport => {
    const infractions: ScrutineeringInfraction[] = [];
    let isEligibleForFastestCar = true;
    
    // D3.6 Total weight - Min 60.0g [PERFORMANCE | Penalty - 10pts per gram]
    if (result.weightGrams < 60.0) {
        const underweightBy = 60.0 - result.weightGrams;
        const penalty = Math.ceil(underweightBy) * 10;
        infractions.push({
            rule: 'D3.6 Total Weight',
            description: `Car is ${underweightBy.toFixed(2)}g underweight (Min: 60.0g).`,
            penalty: penalty,
            type: 'Performance',
        });
    }

    // D3.4 Total length - Min: 170mm / Max: 210mm [PERFORMANCE | Penalty - 5pts per millimetre]
    if (result.totalLength < 170) {
         const underLengthBy = 170 - result.totalLength;
         const penalty = Math.ceil(underLengthBy) * 5;
         infractions.push({
            rule: 'D3.4 Total Length',
            description: `Car is ${underLengthBy.toFixed(1)}mm too short (Min: 170mm).`,
            penalty: penalty,
            type: 'Performance'
         });
    } else if (result.totalLength > 210) {
        const overLengthBy = result.totalLength - 210;
        const penalty = Math.ceil(overLengthBy) * 5;
        infractions.push({
            rule: 'D3.4 Total Length',
            description: `Car is ${overLengthBy.toFixed(1)}mm too long (Max: 210mm).`,
            penalty: penalty,
            type: 'Performance'
        });
    }

    // D3.5 Total width - Max: 90mm [PERFORMANCE | Penalty - 5pts per millimetre]
    if (result.totalWidth > 90) {
        const overWidthBy = result.totalWidth - 90;
        const penalty = Math.ceil(overWidthBy) * 5;
        infractions.push({
            rule: 'D3.5 Total Width',
            description: `Car is ${overWidthBy.toFixed(1)}mm too wide (Max: 90mm).`,
            penalty: penalty,
            type: 'Performance'
        });
    }

    // D7.1 Front wing placement & D8.1 Rear wing placement [PERFORMANCE | Penalty - 25pts]
    // Simulate this with a random check for now
    if (Math.random() < 0.05) { // 5% chance of failure
        infractions.push({
            rule: 'D7.1/D8.1 Wing Placement',
            description: 'Wing assembly does not resemble an actual F1 car or is improperly placed.',
            penalty: 25,
            type: 'Performance'
        });
    }

    // D7.3/D8.3 Construction and rigidity [SAFETY | Penalty - 5pts]
     if (Math.random() < 0.1) { // 10% chance of failure
        infractions.push({
            rule: 'D7.3 Wing Rigidity',
            description: 'Wing structure appears to be flexible, which is a safety concern.',
            penalty: 5,
            type: 'Safety'
        });
    }
    
    // D4.2 No-go-zone - [PERFORMANCE | Penalty - 25pts]
    if (result.dragCoefficient > 0.55 || Math.abs(result.liftCoefficient) < 0.7) {
        if (Math.random() < 0.2) { // Higher chance if aero is bad
            infractions.push({
                rule: 'D4.2 No-Go-Zone',
                description: 'Body design appears to infringe on the mandatory no-go-zone.',
                penalty: 25,
                type: 'Performance'
            });
        }
    }


    const basePoints = 300;
    const totalPenalty = infractions.reduce((sum, i) => sum + i.penalty, 0);
    const finalScore = basePoints - totalPenalty;

    // Any performance or safety infraction makes a car ineligible for 'Fastest Car'
    if (infractions.some(i => i.type === 'Performance' || i.type === 'Safety')) {
        isEligibleForFastestCar = false;
    }

    return {
        basePoints,
        totalPenalty,
        finalScore,
        isEligibleForFastestCar,
        infractions
    };
};
