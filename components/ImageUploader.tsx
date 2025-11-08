import React, { useRef } from 'react';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
    images: UploadedImage[];
    onAddImages: (files: FileList) => void;
    onRemoveImage: (id: number) => void;
    onClearImages: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onAddImages, onRemoveImage, onClearImages }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onAddImages(e.target.files);
        }
    };

    return (
        <div className="neo-card p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">1. Upload Images</h2>
                {images.length > 0 && (
                    <button onClick={onClearImages} className="text-sm font-semibold hover:text-[var(--error-color)] transition-colors">
                        Clear All
                    </button>
                )}
            </div>
            {images.length > 0 && (
                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    {images.map(img => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-[var(--border-color)]">
                            <img src={`data:image/png;base64,${img.base64Data}`} alt={img.file.name} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => onRemoveImage(img.id)}
                                className="remove-upload-btn absolute top-1 right-1 bg-[var(--bg-color)] text-[var(--text-color)] rounded-full w-6 h-6 flex items-center justify-center font-bold border border-[var(--border-color)] text-xs hover:bg-[var(--error-color)] hover:text-[var(--bg-color)] transition-colors"
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <label htmlFor="file-upload" className="neo-button w-full text-center block py-3 cursor-pointer" style={{ backgroundColor: 'var(--accent2-color)' }}>
                Add Images
            </label>
            <input 
                ref={fileInputRef}
                type="file" 
                id="file-upload" 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
            />
            <p className="text-xs text-center mt-2">You can upload multiple images.</p>
        </div>
    );
};

export default ImageUploader;
