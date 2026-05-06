import './Pagination.css'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = number | 'ellipsis'

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  pages.add(total)
  pages.add(current)
  if (current - 1 >= 1) pages.add(current - 1)
  if (current + 1 <= total) pages.add(current + 1)

  const sorted = [...pages].sort((a, b) => a - b)
  const items: PageItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push('ellipsis')
    }
    items.push(sorted[i])
  }
  return items
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const items = getPageItems(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label="ページネーション">
      <button
        type="button"
        className="pagination__nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        前へ
      </button>

      <ul className="pagination__list">
        {items.map((item, i) => (
          <li key={item === 'ellipsis' ? `e-${i}` : `p-${item}`}>
            {item === 'ellipsis' ? (
              <span className="pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                className={`pagination__page${
                  item === currentPage ? ' pagination__page--active' : ''
                }`}
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`${item} ページ目`}
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="pagination__nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </button>
    </nav>
  )
}
