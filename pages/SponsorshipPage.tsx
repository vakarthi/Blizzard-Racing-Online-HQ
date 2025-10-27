import React, { useState, useEffect } from 'react';
import { sponsorshipService } from '../services/sponsorshipService';
import type { Sponsor, SponsorStatus } from '../types';
import { useAuth } from '../hooks/useAuth';

const statusColors: Record<SponsorStatus, string> = {
    'Potential': 'bg-accent/20 text-accent',
    'Contacted': 'bg-yellow-500/20 text-yellow-500',
    'Secured': 'bg-success/20 text-success',
    'Rejected': 'bg-danger/20 text-danger'
};

const EditSponsorModal: React.FC<{ sponsor: Sponsor | null, onClose: () => void, onSave: (sponsor: Sponsor | Omit<Sponsor, 'id'>) => void }> = ({ sponsor, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Sponsor, 'id'>>({
        name: sponsor?.name || '',
        contact: sponsor?.contact || '',
        tier: sponsor?.tier || 'Bronze',
        amount: sponsor?.amount || 0,
        status: sponsor?.status || 'Potential',
        notes: sponsor?.notes || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sponsor) {
            onSave({ ...formData, id: sponsor.id });
        } else {
            onSave(formData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background-primary/75 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
            <div className="bg-background-secondary rounded-lg shadow-xl w-full max-w-lg border border-border-color modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">{sponsor ? 'Edit' : 'Add'} Sponsor</h3>
                        <div className="space-y-4">
                            <input name="name" type="text" placeholder="Sponsor Name" value={formData.name} onChange={handleChange} required className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            <input name="contact" type="text" placeholder="Contact Info (Email/Phone)" value={formData.contact} onChange={handleChange} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="tier" type="text" placeholder="Sponsorship Tier" value={formData.tier} onChange={handleChange} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                                <input name="amount" type="number" placeholder="Amount (£)" value={formData.amount} onChange={handleChange} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent" />
                            </div>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent">
                                <option value="Potential">Potential</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Secured">Secured</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full bg-background-tertiary text-text-primary rounded p-2 border border-border-color focus:ring-accent focus:border-accent"></textarea>
                        </div>
                    </div>
                    <div className="bg-background-tertiary px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-border-color hover:bg-opacity-70 text-text-primary font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg">Save Sponsor</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SponsorshipPage: React.FC = () => {
    const { user, can } = useAuth();
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

    const canWrite = can('sponsorship', 'write');

    useEffect(() => {
        setSponsors(sponsorshipService.getSponsors());
    }, []);

    const handleSaveSponsor = (sponsor: Sponsor | Omit<Sponsor, 'id'>) => {
        if (!user || !canWrite) return;
        if ('id' in sponsor) {
            setSponsors(sponsorshipService.updateSponsor(sponsor, user.nickname));
        } else {
            setSponsors(sponsorshipService.addSponsor(sponsor, user.nickname));
        }
    };
    
    const handleDeleteSponsor = (sponsorId: string) => {
        if (!canWrite) return;
        if (window.confirm("Are you sure you want to delete this sponsor?")) {
            setSponsors(sponsorshipService.deleteSponsor(sponsorId));
        }
    };
    
    const openAddModal = () => {
        if (!canWrite) return;
        setEditingSponsor(null);
        setIsModalOpen(true);
    };

    const openEditModal = (sponsor: Sponsor) => {
        if (!canWrite) return;
        setEditingSponsor(sponsor);
        setIsModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                    Sponsorship Tracker
                </h1>
                {canWrite && (
                    <button
                        onClick={openAddModal}
                        className="bg-primary hover:bg-primary-hover text-text-on-primary font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 100-2 1 1 0 000 2zm-1 2a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        <span>Add Sponsor</span>
                    </button>
                )}
            </div>
            
            <div className="bg-background-secondary rounded-lg shadow-lg border border-border-color overflow-hidden">
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-primary uppercase bg-background-tertiary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Sponsor Name</th>
                                <th scope="col" className="px-6 py-3">Tier / Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Contact</th>
                                <th scope="col" className="px-6 py-3 hidden md:table-cell">Notes</th>
                                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sponsors.map(sponsor => (
                                <tr key={sponsor.id} className="bg-background-secondary border-b border-border-color hover:bg-background-tertiary/50">
                                    <th scope="row" className="px-6 py-4 font-bold text-text-primary whitespace-nowrap">{sponsor.name}</th>
                                    <td className="px-6 py-4">{sponsor.tier} ({new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(sponsor.amount)})</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 font-semibold text-xs rounded-full ${statusColors[sponsor.status]}`}>{sponsor.status}</span>
                                    </td>
                                    <td className="px-6 py-4">{sponsor.contact}</td>
                                    <td className="px-6 py-4 hidden md:table-cell truncate max-w-xs" title={sponsor.notes}>{sponsor.notes}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {canWrite && (
                                            <>
                                                <button onClick={() => openEditModal(sponsor)} className="font-medium text-accent hover:underline">Edit</button>
                                                <button onClick={() => handleDeleteSponsor(sponsor.id)} className="font-medium text-danger hover:underline">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </div>
            {isModalOpen && canWrite && <EditSponsorModal sponsor={editingSponsor} onClose={() => setIsModalOpen(false)} onSave={handleSaveSponsor} />}
        </div>
    );
};

export default SponsorshipPage;