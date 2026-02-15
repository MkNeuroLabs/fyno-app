'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export type ReasonCode =
  | 'SEED_CHANNEL'
  | 'LIVE_OR_PREMIERE'
  | 'NEW_COMPATIBLE'
  | 'DISCOVERED';

export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumb: string;
  href?: string;
  reason?: ReasonCode;
  meta?: string;
}

interface MovieCategoryProps {
  title: string;
  subtitle?: string;
  items: VideoItem[];
}

function reasonBadge(reason?: ReasonCode) {
  if (!reason) return null;

  if (reason === 'SEED_CHANNEL') return { text: 'Seed', className: 'bg-blue-600' };
  if (reason === 'LIVE_OR_PREMIERE') return { text: 'Live', className: 'bg-purple-600' };
  if (reason === 'NEW_COMPATIBLE') return { text: 'Nuevo', className: 'bg-yellow-500 text-black' };
  if (reason === 'DISCOVERED') return { text: 'Descubierto', className: 'bg-gray-500' };

  return null;
}

export default function MovieCategory({ title, subtitle, items }: MovieCategoryProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (
      swiperRef.current &&
      prevRef.current instanceof HTMLElement &&
      nextRef.current instanceof HTMLElement
    ) {
      const swiper = swiperRef.current;
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  return (
    <section className="bg-[#141414] py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-gray-300 text-sm md:text-base">{subtitle}</p>}
          </div>

          {/* Nav */}
          <div className="mt-3 md:mt-0 flex items-center space-x-3 bg-[#0F0F0F] p-2 rounded-md">
            <button
              ref={prevRef}
              className="flex items-center justify-center h-10 w-10 bg-[#1A1A1A] rounded-md hover:bg-gray-700 transition p-2"
              aria-label="Anterior"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>

            <div className="swiper-pagination-custom flex space-x-1" />

            <button
              ref={nextRef}
              className="flex items-center justify-center h-10 w-10 bg-[#1A1A1A] rounded-md hover:bg-gray-700 transition p-2"
              aria-label="Siguiente"
              type="button"
            >
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation, Pagination]}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          pagination={{ clickable: true }}
          slidesPerView={1.6}
          spaceBetween={12}
          breakpoints={{
            640: { slidesPerView: 2.8 },
            768: { slidesPerView: 4.2 },
            1024: { slidesPerView: 6.2 },
            1280: { slidesPerView: 7.2 },
          }}
          className="relative swiper-pagination-custom"
        >
          {items.map((v) => {
            const badge = reasonBadge(v.reason);
            const href = v.href ? v.href : '#';

            return (
              <SwiperSlide key={v.id} className="w-[260px]">
                <div className="group rounded-lg overflow-hidden bg-[#1A1A1A] shadow-lg transition-transform duration-200 hover:scale-[1.02]">
                  <Link href={href} className="block" target={v.href ? "_blank" : undefined}>
                    {/* Thumbnail (16:9) */}
                    <div className="relative w-full aspect-video">
                      <Image
                        src={v.thumb}
                        alt={v.title}
                        fill
                        className="object-cover"
                      />

                      {/* Badge */}
                      {badge && (
                        <div className={`absolute top-3 left-3 ${badge.className} text-[11px] font-semibold rounded-full px-3 py-1`}>
                          {badge.text}
                        </div>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-end justify-end p-3">
                        <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                          <button
                            type="button"
                            className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded-md"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded-md"
                          >
                            👎
                          </button>
                          <button
                            type="button"
                            className="bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-2 rounded-md"
                          >
                            🚫
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-3">
                      <div className="text-white font-semibold text-[13px] leading-snug line-clamp-2">
                        {v.title}
                      </div>
                      <div className="text-gray-300 text-[11px] mt-2">
                        {v.channel}
                        {v.meta ? <span className="text-gray-400"> · {v.meta}</span> : null}
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}