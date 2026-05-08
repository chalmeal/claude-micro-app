import { Link } from 'react-router-dom'
import './PageHeader.css'

type Action = {
  label: string
  to: string
}

type Props = {
  title: string
  description?: string
  action?: Action
}

export function PageHeader({ title, description, action }: Props) {
  return (
    <section className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {action && (
        <Link to={action.to} className="page-header__action">
          {action.label}
        </Link>
      )}
    </section>
  )
}
