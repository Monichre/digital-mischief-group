"use client"

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react"
import gsap from "gsap"

export interface CardSwapProps {
  width?: number | string
  height?: number | string
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  onCardClick?: (idx: number) => void
  skewAmount?: number
  easing?: "linear" | "elastic"
  children: ReactNode
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute left-1/2 top-1/2 rounded-lg ${customClass ?? ""} ${rest.className ?? ""}`.trim()}
  />
))
Card.displayName = "Card"

type CardRef = RefObject<HTMLDivElement | null>

interface Slot {
  x: number
  y: number
  z: number
  zIndex: number
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
})

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  })

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = "elastic",
  children,
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        }

  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children])
  const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length])

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i))
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const intervalRef = useRef<number>(0)
  const container = useRef<HTMLDivElement>(null)
  const isAnimating = useRef<boolean>(false)

  const bringToFront = (clickedIdx: number) => {
    const currentOrder = order.current
    const positionInOrder = currentOrder.indexOf(clickedIdx)

    if (positionInOrder === 0 || isAnimating.current) return

    isAnimating.current = true

    // Kill current timeline and clear interval
    tlRef.current?.kill()
    clearInterval(intervalRef.current)

    const total = refs.length
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
        // Restart auto-rotation after click animation
        intervalRef.current = window.setInterval(swap, delay)
      },
    })
    tlRef.current = tl

    // Move clicked card up and out
    const clickedEl = refs[clickedIdx].current
    if (!clickedEl) return

    tl.to(clickedEl, {
      scale: 1.05,
      y: "-=150",
      z: "+=150",
      skewY: 0,
      boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.4)",
      duration: 0.3,
      ease: "power2.out",
    })

    // Reorder: clicked card goes to front, others shift back
    const newOrder = [clickedIdx, ...currentOrder.filter((i) => i !== clickedIdx)]

    // Move all other cards to their new positions
    tl.addLabel("shuffle", "-=0.15")
    newOrder.slice(1).forEach((idx, i) => {
      const el = refs[idx].current
      if (!el) return
      const slot = makeSlot(i + 1, cardDistance, verticalDistance, total)
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          zIndex: slot.zIndex,
          duration: 0.4,
          ease: "power2.inOut",
        },
        "shuffle",
      )
    })

    // Bring clicked card to front position
    const frontSlot = makeSlot(0, cardDistance, verticalDistance, total)
    tl.to(
      clickedEl,
      {
        x: frontSlot.x,
        y: frontSlot.y,
        z: frontSlot.z,
        zIndex: frontSlot.zIndex,
        scale: 1,
        skewY: skewAmount,
        boxShadow: "none",
        duration: 0.5,
        ease: "back.out(1.4)",
      },
      "shuffle+=0.05",
    )

    // Update order
    tl.call(() => {
      order.current = newOrder
    })
  }

  const swap = () => {
    if (order.current.length < 2 || isAnimating.current) return

    isAnimating.current = true

    const [front, ...rest] = order.current
    const elFront = refs[front].current
    if (!elFront) return

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
      },
    })
    tlRef.current = tl

    tl.to(elFront, {
      y: "+=500",
      duration: config.durDrop,
      ease: config.ease,
    })

    tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`)
    rest.forEach((idx, i) => {
      const el = refs[idx].current
      if (!el) return
      const slot = makeSlot(i, cardDistance, verticalDistance, refs.length)
      tl.set(el, { zIndex: slot.zIndex }, "promote")
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: config.durMove,
          ease: config.ease,
        },
        `promote+=${i * 0.15}`,
      )
    })

    const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length)
    tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`)
    tl.call(
      () => {
        gsap.set(elFront, { zIndex: backSlot.zIndex })
      },
      undefined,
      "return",
    )
    tl.to(
      elFront,
      {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: config.durReturn,
        ease: config.ease,
      },
      "return",
    )

    tl.call(() => {
      order.current = [...rest, front]
    })
  }

  useEffect(() => {
    const total = refs.length
    refs.forEach((r, i) => {
      if (r.current) {
        placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount)
      }
    })

    swap()
    intervalRef.current = window.setInterval(swap, delay)

    if (pauseOnHover && container.current) {
      const node = container.current
      const pause = () => {
        tlRef.current?.pause()
        clearInterval(intervalRef.current)
      }
      const resume = () => {
        tlRef.current?.play()
        intervalRef.current = window.setInterval(swap, delay)
      }
      node.addEventListener("mouseenter", pause)
      node.addEventListener("mouseleave", resume)
      return () => {
        node.removeEventListener("mouseenter", pause)
        node.removeEventListener("mouseleave", resume)
        clearInterval(intervalRef.current)
      }
    }
    return () => clearInterval(intervalRef.current)
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing])

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: {
            width,
            height,
            cursor: "pointer",
            pointerEvents: "auto",
            ...(child.props.style ?? {}),
          },
          onClick: (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            child.props.onClick?.(e)
            onCardClick?.(i)
            bringToFront(i)
          },
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child,
  )

  return (
    <div
      ref={container}
      className="relative"
      style={{
        width,
        height,
        perspective: "1000px",
        perspectiveOrigin: "center center",
      }}
    >
      {rendered}
    </div>
  )
}

export { CardSwap }
export default CardSwap
