import type { Experiment } from '../types';
import { activityService } from './activityService';

const RD_KEY = 'blizzard_racing_rd_lab';

const defaultExperiments: Experiment[] = [
    {
        id: 'rd-1',
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        author: 'Anish',
        component: 'Front Wing Endplates',
        hypothesis: 'Adding a small curve to the endplates will improve outwash and reduce drag created by the front wheels.',
        materials: 'Standard PLA+, 3D printed prototype v4.1 vs v4.2',
        results: 'CFD simulation showed a 2% reduction in total drag coefficient (from 0.41 to 0.402). L/D ratio increased from 2.9 to 3.0.',
        conclusion: 'The change is beneficial and should be implemented in the next car version. The manufacturing process is slightly more complex but worth the performance gain.'
    },
    {
        id: 'rd-2',
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        author: 'Hadi',
        component: 'Wheel Bearings',
        hypothesis: 'Switching to full ceramic bearings will reduce rolling resistance, resulting in a faster track time.',
        materials: 'Standard steel bearings vs. full ceramic bearings.',
        results: 'Physical track tests showed an average time reduction of 0.015 seconds over 20 runs. The car rolls more freely.',
        conclusion: 'The performance gain is significant. We will use ceramic bearings for the competition car, budget permitting.'
    },
];

const getStoredExperiments = (): Experiment[] => {
    const data = localStorage.getItem(RD_KEY);
    if(data) return JSON.parse(data);
    localStorage.setItem(RD_KEY, JSON.stringify(defaultExperiments));
    return defaultExperiments;
};

export const rdService = {
    getExperiments: (): Experiment[] => {
        return getStoredExperiments().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    addExperiment: (experiment: Omit<Experiment, 'id' | 'date'>): Experiment[] => {
        const experiments = getStoredExperiments();
        const newExperiment: Experiment = {
            ...experiment,
            id: `rd-${Date.now()}`,
            date: new Date().toISOString(),
        };
        const newExperiments = [newExperiment, ...experiments];
        localStorage.setItem(RD_KEY, JSON.stringify(newExperiments));
        
        activityService.logActivity(newExperiment.author, 'R&D Log Created', newExperiment.component);

        return newExperiments;
    },
    
    deleteExperiment: (id: string): Experiment[] => {
        let experiments = getStoredExperiments();
        const newExperiments = experiments.filter(e => e.id !== id);
        localStorage.setItem(RD_KEY, JSON.stringify(newExperiments));
        return newExperiments;
    }
};