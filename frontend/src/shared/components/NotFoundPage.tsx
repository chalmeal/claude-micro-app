import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__card">
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">ページが見つかりません</h1>
        <p className="not-found__message">
          お探しのページは存在しないか、移動または削除された可能性があります。
        </p>
        <Link to="/" className="not-found__button">
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
