import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from '../PageHeader'

describe('PageHeader', () => {
  it('タイトルを表示する', () => {
    render(
      <MemoryRouter>
        <PageHeader title="ユーザー管理" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'ユーザー管理' })).toBeInTheDocument()
  })

  it('description を表示する', () => {
    render(
      <MemoryRouter>
        <PageHeader title="成績" description="成績一覧を表示します" />
      </MemoryRouter>,
    )
    expect(screen.getByText('成績一覧を表示します')).toBeInTheDocument()
  })

  it('description が未指定のときは表示しない', () => {
    render(
      <MemoryRouter>
        <PageHeader title="タイトル" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('action が指定されているときはリンクを表示する', () => {
    render(
      <MemoryRouter>
        <PageHeader title="一覧" action={{ label: '新規作成', to: '/create' }} />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: '新規作成' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/create')
  })

  it('action が未指定のときはリンクを表示しない', () => {
    render(
      <MemoryRouter>
        <PageHeader title="一覧" />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
