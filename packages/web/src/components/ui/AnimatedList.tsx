import { useEffect, useState } from 'react'

interface AnimatedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  className?: string
  itemClassName?: string
  animation?: 'slide' | 'pop' | 'fade'
  staggerDelay?: number
  emptyMessage?: React.ReactNode
}

export default function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = '',
  itemClassName = '',
  animation = 'slide',
  staggerDelay = 50,
  emptyMessage,
}: AnimatedListProps<T>) {
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Animate items one by one with stagger
    items.forEach((item, index) => {
      const key = keyExtractor(item)
      if (!animatedItems.has(key)) {
        setTimeout(() => {
          setAnimatedItems((prev) => new Set([...prev, key]))
        }, index * staggerDelay)
      }
    })
  }, [items, keyExtractor, staggerDelay, animatedItems])

  const getAnimationClass = () => {
    switch (animation) {
      case 'pop':
        return 'animate-list-pop'
      case 'fade':
        return 'animate-fade-in-up'
      default:
        return 'animate-list-item'
    }
  }

  if (items.length === 0 && emptyMessage) {
    return <>{emptyMessage}</>
  }

  return (
    <div className={className}>
      {items.map((item, index) => {
        const key = keyExtractor(item)
        const isAnimated = animatedItems.has(key)

        return (
          <div
            key={key}
            className={`
              ${itemClassName}
              ${isAnimated ? getAnimationClass() : 'opacity-0'}
            `}
            style={{
              animationDelay: `${index * staggerDelay}ms`,
            }}
          >
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}
