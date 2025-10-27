import React, { useState, useEffect } from 'react';
import { rdService } from '../services/rdService';
import type { Experiment } from '../types';
import { useAuth } from '../hooks/useAuth';

const AddExperimentModal: React.FC<{ onSave: (exp: Omit<Experiment, 'id'|'date'|'author'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
        component: '',
        hypothesis: '',
        materials: '',
        results: '',
        conclusion: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background-primary/75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
            <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-2xl border border-border-color modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Log New Experiment</h3>
                        <div className="space-y-4">
                            <input name="component" type="text" placeholder="Component Tested (e.g., Front Wing)" value={formData.component} onChange={handleChange} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            <textarea name="hypothesis" placeholder="Hypothesis" value={formData.hypothesis} onChange={handleChange} rows={2} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                            <textarea name="materials" placeholder="Materials & Methods" value={formData.materials} onChange={handleChange} rows={3} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                            <textarea name="results" placeholder="Results & Observations" value={formData.results} onChange={handleChange} rows={3} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                            <textarea name="conclusion" placeholder="Conclusion" value={formData.conclusion} onChange={handleChange} rows={2} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                        </div>
                    </div>
                    <div className="bg-background-tertiary px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-border-color hover:bg-opacity-70 text-text-primary font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">Save Log</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const RdPage: React.FC = () => {
    const { user, can } = useAuth();
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const canWrite = can('rd', 'write');

    useEffect(() => {
        setExperiments(rdService.getExperiments());
    }, []);

    const handleSaveExperiment = (exp: Omit<Experiment, 'id'|'date'|'author'>) => {
        if (!user || !canWrite) return;
        const newExperiments = rdService.addExperiment({ ...exp, author: user.nickname });
        setExperiments(newExperiments);
    };

    const handleDelete = (id: string) => {
        if (!canWrite) return;
        if (window.confirm("Are you sure you want to delete this experiment log?")) {
            setExperiments(rdService.deleteExperiment(id));
        }
    };
    
    const filteredExperiments = experiments.filter(exp => 
        exp.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.hypothesis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                        R&D Lab
                    </h1>
                    <p className="text-text-secondary mt-1">Documenting our journey of innovation.</p>
                </div>
                {canWrite && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        <span>Log Experiment</span>
                    </button>
                )}
            </div>
            
            <div className="mb-4">
                 <input 
                    type="text" 
                    placeholder="Search experiments..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-md bg-background-secondary text-text-primary rounded-lg p-2 border border-border-color focus:ring-accent focus:border-accent"
                />
            </div>

            <div className="space-y-4">
                {filteredExperiments.map(exp => (
                    <div key={exp.id} className="bg-background-secondary p-4 rounded-lg border border-border-color">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-accent">{exp.component}</h3>
                                <p className="text-xs text-text-secondary">Logged by {exp.author} on {new Date(exp.date).toLocaleDateString()}</p>
                            </div>
                            {canWrite && <button onClick={() => handleDelete(exp.id)} className="text-danger hover:text-danger-hover">&times;</button>}
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <p><strong className="font-semibold text-text-primary">Hypothesis:</strong> {exp.hypothesis}</p>
                            <p><strong className="font-semibold text-text-primary">Conclusion:</strong> <span className="text-success">{exp.conclusion}</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && canWrite && <AddExperimentModal onSave={handleSaveExperiment} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default RdPage;