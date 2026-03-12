import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

type Slide = {
  label: string
  title: string
  description: string
}

const slides: Slide[] = [
  {
    label: 'Extract',
    title: 'Snapshot the target brand',
    description:
      'Capture logos, colors, typography, and positioning in one pass.',
  },
  {
    label: 'Observe',
    title: 'Track critical page changes',
    description:
      'Monitor high-signal URLs and summarize meaningful diffs over time.',
  },
  {
    label: 'Scout',
    title: 'Surface net-new findings',
    description:
      'Run scheduled searches and keep only URLs the team has not seen.',
  },
]

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="flex h-56 flex-col justify-between rounded-2xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
          {slide.label}
        </p>
        <h3 className="text-xl font-semibold">{slide.title}</h3>
        <p className="text-muted-foreground text-sm">
          {slide.description}
        </p>
      </div>
      <div className="h-1.5 w-20 rounded-full bg-primary/20" />
    </div>
  )
}

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="mx-auto max-w-4xl px-12 py-6">
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <SlideCard slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

export const MultipleVisibleSlides = {
  render: () => (
    <div className="mx-auto max-w-5xl px-12 py-6">
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem
              key={slide.title}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <SlideCard slide={slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}
