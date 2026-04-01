'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageGalleryProps {
    images: string[]; // Array of URLs
    onImagesChange: (newImages: string[]) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ImageGallery({ images, onImagesChange }: ImageGalleryProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API}/storage/upload`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { url } = await res.json();
                onImagesChange([...images, url]);
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
                        <img
                            src={url.startsWith('/') ? `${API}${url}` : url}
                            alt={`Product ${idx}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-red-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400">
                    {uploading ? (
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                    ) : (
                        <>
                            <Upload size={20} />
                            <span className="text-[10px] mt-1 font-medium">Încarcă</span>
                        </>
                    )}
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
                </label>
            </div>

            {images.length === 0 && !uploading && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <ImageIcon size={16} />
                    <span>Nicio imagine încărcată</span>
                </div>
            )}
        </div>
    );
}
