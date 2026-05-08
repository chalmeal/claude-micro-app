import './SkeletonRows.css'

type Props = {
  count?: number
  rowHeight?: number
}

export function SkeletonRows({ count = 5, rowHeight = 36 }: Props) {
  return (
    <div className="skeleton-rows" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-rows__row"
          style={rowHeight !== 36 ? { height: `${rowHeight}px` } : undefined}
        />
      ))}
    </div>
  )
}
