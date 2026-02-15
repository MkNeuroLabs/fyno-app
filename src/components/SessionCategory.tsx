'use client'

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Play } from "lucide-react"
import { useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export interface SessionItem {
  id: string
  title: string
  durationLabel: "30 min" | "60 min" | "90 min"
  topic: string
  reason: string
  thumbs: string[]
  hrefs: string[]
}

interface SessionCategoryProps {
  title: string
  subtitle?: string
  items: SessionItem[]
}

export default function SessionCategory({ title, subtitle, items }: SessionCategoryProps) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<any>(null)

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      const swiper = swiperRef.current
      swiper.params.navigation.prevEl = prevRef.current
      swiper.params.navigation.nextEl = nextRef.current
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }, [])

  return (
    <section className="bg-[#141414] py-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-gray-300 text-sm md:text-base">{subtitle}</p>}
          </div>

          <div className="mt-3 md:mt-0 flex items-center space-x-3 bg-[#0F0F0F] p-2 rounded-md">
            <button
              ref={prevRef}
              className="flex items-center justify-center h-10 w-10 bg-[#1A1A1A] rounded-md hover:bg-gray-700 transition p-2"
              aria-label="Anterior"
              type="button"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>

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

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          modules={[Navigation, Pagination]}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          pagination={{ clickable: true, el: ".session-pagination" }}
          slidesPerView={1.05}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 1.6 },
            1024: { slidesPerView: 2.2 },
            1280: { slidesPerView: 2.6 },
          }}
          className="pb-10"
        >
          {items.map((s) => {
            const firstHref = s.hrefs && s.hrefs[0] ? s.hrefs[0] : "#"
            const thumbs = s.thumbs.slice(0, 6)

            return (
              <SwiperSlide key={s.id} className="w-[420px] md:w-[520px]">
                <div className="group rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-lg">
                  <Link href={firstHref} target={firstHref !== "#" ? "_blank" : undefined} className="block">
                    {/* Mosaic */}
                    <div className="relative w-full aspect-[16/9]">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-1">
                        {thumbs.map((t, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden">
                            <Image src={t} alt={s.title} fill className="object-cover" />
                          </div>
                        ))}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* top-left badges */}
                      <div className="absolute top-4 left-4 flex items-center">
                        <span className="bg-red-600 text-white text-xs font-semibold rounded-full px-3 py-1">
                          {s.durationLabel}
                        </span>
                        <span className="ml-2 bg-white/10 text-white text-xs font-semibold rounded-full px-3 py-1">
                          {s.topic}
                        </span>
                      </div>

                      {/* bottom CTA */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="text-white font-semibold text-lg line-clamp-1">{s.title}</div>
                        <div className="flex items-center gap-2 opacity-90 group-hover:opacity-100 transition">
                          <div className="bg-white text-black rounded-xl px-4 py-2 font-semibold flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Iniciar
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4">
                      <div className="text-gray-300 text-sm">{s.reason}</div>
                      <div className="text-gray-400 text-xs mt-2">
                        {s.hrefs.length} contenidos encadenados
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Pagination OUTSIDE the swiper so it never overlaps */}
        <div className="session-pagination flex justify-center gap-2 mt-3" />
      </div>
    </section>
  )
}