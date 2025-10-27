import React from 'react';

interface SummaryWidgetProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    linkText?: string;
    onLinkClick?: () => void;
}

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, icon, children, linkText, onLinkClick }) => {
    return (
        <div className="bg-background-secondary rounded-lg border border-border-color shadow-lg h-full flex flex-col">
            <div className="p-4 border-b border-border-color flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-background-tertiary rounded-full">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                </div>
                {linkText && onLinkClick && (
                    <button onClick={onLinkClick} className="text-sm font-semibold text-accent hover:underline">
                        {linkText}
                    </button>
                )}
            </div>
            <div className="flex-1 p-4">
                {children}
            </div>
        </div>
    );
};
