'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, XIcon } from 'lucide-react';

interface GalleryProps {
  images: string[];
  title: string;
}

export function Gallery({ images, title }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const go = (delta: number) =>
  setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl bg-navy-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[index]}
            src={images[index]}
            alt={`${title} — photo ${index + 1} of ${images.length}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 h-full w-full object-cover" />
          
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 opacity-0 transition-all hover:bg-white group-hover:opacity-100 focus-visible:opacity-100">
          
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 opacity-0 transition-all hover:bg-white group-hover:opacity-100 focus-visible:opacity-100">
          
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-navy-900/85 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition-all hover:bg-navy-900">
          
          <ExpandIcon className="h-3.5 w-3.5" aria-hidden="true" />
          View all {images.length} photos
        </button>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 rail-scroll">
        {images.map((image, i) =>
        <button
          key={image}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={`View photo ${i + 1}`}
          aria-current={i === index}
          className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl transition-all ${
          i === index ?
          'ring-2 ring-amber-500 ring-offset-2' :
          'opacity-70 hover:opacity-100'}`
          }>
          
            <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {lightbox &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-[60] flex flex-col bg-navy-950/95 p-4 sm:p-8">
          
            <div className="flex items-center justify-between text-white">
              <p className="text-sm font-semibold">
                {index + 1} / {images.length}
              </p>
              <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close gallery"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
              
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative mt-4 flex flex-1 items-center justify-center">
              <img
              src={images[index]}
              alt={`${title} — photo ${index + 1}`}
              className="max-h-full max-w-full rounded-2xl object-contain" />
            
              <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-0 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25">
              
                <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-0 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25">
              
                <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 flex justify-center gap-2 overflow-x-auto no-scrollbar">
              {images.map((image, i) =>
            <button
              key={image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${
              i === index ? 'ring-2 ring-amber-500' : 'opacity-50 hover:opacity-100'}`
              }>
              
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
            )}
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}