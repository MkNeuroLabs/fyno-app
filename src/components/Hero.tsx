import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
      
      {/* Logo */}
      <div className="mb-10">
        <Image 
          src="/images/logo.png" 
          alt="Fyno Logo" 
          width={180} 
          height={180} 
          className="mx-auto opacity-90"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Fyno
      </h1>

      {/* Subtitle */}
      <p className="max-w-2xl text-sm md:text-base text-white/80 mb-8">
        Tu universo personal de contenidos.
        Lo que te gusta, cuando te apetece.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button size="lg" className="bg-white text-black hover:bg-gray-200">
          Configurar Seeds
        </Button>

        <Button size="lg" className="bg-[#1A1A1A] border border-gray-600 text-white hover:bg-gray-800">
          Actualizar Cartelera
        </Button>
      </div>
    </section>
  )
}