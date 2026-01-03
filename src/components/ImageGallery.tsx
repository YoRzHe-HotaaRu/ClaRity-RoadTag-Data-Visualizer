"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

interface ImageGalleryProps {
    images: {
        id: string;
        publicId: string;
        isPrimary: boolean;
    }[];
    locationName: string;
}

export default function ImageGallery({ images, locationName }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    if (images.length === 0) return null;

    const handleClose = () => setSelectedIndex(null);

    const handlePrev = () => {
        if (selectedIndex !== null) {
            setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
        }
    };

    const handleNext = () => {
        if (selectedIndex !== null) {
            setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
        if (e.key === "ArrowLeft") handlePrev();
        if (e.key === "ArrowRight") handleNext();
    };

    return (
        <>
            <div className="mb-6 md:mb-10">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative overflow-hidden glass-card cursor-pointer ${index === 0 ? "md:col-span-2 md:row-span-2" : ""
                                }`}
                            onClick={() => setSelectedIndex(index)}
                        >
                            <CldImage
                                src={image.publicId}
                                alt={`${locationName} - Image ${index + 1}`}
                                width={index === 0 ? 800 : 400}
                                height={index === 0 ? 600 : 300}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            {image.isPrimary && (
                                <span className="absolute top-3 left-3 px-2 py-1 bg-[var(--primary)] text-white text-xs font-medium">
                                    Primary
                                </span>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                <svg
                                    className="w-10 h-10 text-white drop-shadow-lg"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fullscreen Lightbox Modal */}
            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    onClick={handleClose}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image counter */}
                    <div className="absolute top-4 left-4 text-white/70 font-mono text-sm">
                        {selectedIndex + 1} / {images.length}
                    </div>

                    {/* Previous button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {/* Next button */}
                    {images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Main image */}
                    <div
                        className="max-w-[90vw] max-h-[90vh] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CldImage
                            src={images[selectedIndex].publicId}
                            alt={`${locationName} - Image ${selectedIndex + 1}`}
                            width={1920}
                            height={1080}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    {/* Keyboard hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono">
                        ESC to close • ← → to navigate
                    </div>
                </div>
            )}
        </>
    );
}
