import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
}

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-background-secondary rounded-lg p-8 shadow-2xl border border-border-color animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-text-primary mb-2">Upload Vehicle Model</h2>
        <p className="text-center text-text-secondary mb-6">Upload <code className="bg-background-tertiary text-accent px-1 rounded">.step</code> or <code className="bg-background-tertiary text-accent px-1 rounded">.stp</code> model for CFD analysis.</p>

        <div 
            className={`mt-6 flex justify-center rounded-lg border-2 border-dashed ${isDragging ? 'border-accent scale-105 bg-accent/10 animate-breathing' : 'border-border-color'} px-6 py-10 transition-all duration-300`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
        >
            <div className="text-center">
                <UploadIcon />
                <div className="mt-4 flex text-sm leading-6 text-text-secondary">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background-primary hover:text-primary"
                    >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".step,.stp" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-text-secondary">STEP or STP files only</p>
            </div>
        </div>
        {error && (
            <div className="mt-4 text-center bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-lg">
                <p>{error}</p>
            </div>
        )}
    </div>
  );
};