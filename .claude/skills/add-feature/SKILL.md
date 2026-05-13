---
name: add-feature
description: CRUD機能を一式追加するスキル。「orders機能を追加して」のような指示に対して、backend（検索・取得・登録・更新・論理削除 API）とfrontend（一覧・詳細・登録・編集画面）をすべて実装し、マイグレーション実行とテスト追加まで行う。"〜機能を追加", "〜のCRUDを作って", "add feature", "add 〜 feature" などで起動する。
---

# add-feature

このスキルは新しいドメイン機能を backend + frontend 一式で追加します。
以下では追加するリソース名を `Order`（複数形 `orders`）として説明します。実際の機能名に読み替えてください。

---

## Step 1: ヒアリング

実装前に 1 つのメッセージで次を確認する。

1. **リソース名**（英語・単数形）例: `order`
2. **主要フィールド**（名前・型・必須か）例: `title: string, amount: number, status: string`
3. **検索条件**（一覧画面のフィルタ項目）例: `keyword（タイトル部分一致）, status（完全一致）`
4. **書き込み操作の権限**（全認証ユーザー or 管理者のみ）

ユーザーがすでに回答済みの項目は省略する。

---

## Step 2: Backend 実装

### 2-1. スキーマ定義

`backend/src/db/schema/<feature>.ts` を作成する。
論理削除のために `deletedAt` カラムを必ず含める。

```ts
import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // ── ドメイン固有カラム ──
  title: varchar('title', { length: 255 }).notNull(),
  // ────────────────────────
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
```

`backend/src/db/schema/index.ts` に `export * from './<feature>.js'` を追加する。

### 2-2. Repository

`backend/src/features/<feature>/repository.ts` を作成する。
- `findAll`: `deletedAt IS NULL` でフィルタ + 検索条件を受け取る
- `findById`: `deletedAt IS NULL` でフィルタ
- `create`, `update`, `softDelete`（`deletedAt` を現在時刻に更新）

```ts
import { and, eq, isNull, like } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { orders } from '../../db/schema/index.js'
import type { NewOrder, Order } from '../../db/schema/index.js'

type SearchParams = {
  keyword?: string
  // 検索条件フィールドを追加
}

export const ordersRepository = {
  findAll: async (params: SearchParams = {}): Promise<Order[]> => {
    const conditions = [isNull(orders.deletedAt)]
    if (params.keyword) conditions.push(like(orders.title, `%${params.keyword}%`))
    return db.select().from(orders).where(and(...conditions))
  },

  findById: async (id: string): Promise<Order | undefined> => {
    const [row] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), isNull(orders.deletedAt)))
    return row
  },

  create: async (data: NewOrder): Promise<Order> => {
    await db.insert(orders).values(data)
    const [created] = await db.select().from(orders).where(eq(orders.id, data.id as string))
    return created
  },

  update: async (id: string, data: Partial<Order>): Promise<Order | undefined> => {
    await db.update(orders).set(data).where(eq(orders.id, id))
    const [updated] = await db.select().from(orders).where(eq(orders.id, id))
    return updated
  },

  softDelete: async (id: string): Promise<void> => {
    await db.update(orders).set({ deletedAt: new Date() }).where(eq(orders.id, id))
  },
}
```

### 2-3. Service

`backend/src/features/<feature>/service.ts` を作成する。
NotFoundError を使い、必要に応じて ConflictError も投げる。

```ts
import { NotFoundError } from '../../shared/errors.js'
import { ordersRepository } from './repository.js'

type CreateOrderInput = {
  title: string
  // ドメイン固有フィールド
}

type SearchInput = {
  keyword?: string
}

export const ordersService = {
  search: async (params: SearchInput) => ordersRepository.findAll(params),

  getById: async (id: string) => {
    const order = await ordersRepository.findById(id)
    if (!order) throw new NotFoundError('Order not found')
    return order
  },

  create: async (input: CreateOrderInput) => {
    return ordersRepository.create({ id: crypto.randomUUID(), ...input })
  },

  update: async (id: string, input: Partial<CreateOrderInput>) => {
    const order = await ordersRepository.findById(id)
    if (!order) throw new NotFoundError('Order not found')
    return ordersRepository.update(id, input)
  },

  delete: async (id: string) => {
    const order = await ordersRepository.findById(id)
    if (!order) throw new NotFoundError('Order not found')
    await ordersRepository.softDelete(id)
  },
}
```

### 2-4. Routes

`backend/src/features/<feature>/routes.ts` を作成する。
- 全ルートに `authMiddleware` を適用（書き込みを管理者限定にする場合は `adminMiddleware`）
- 一覧は query パラメータで検索条件を受け取る
- 削除は `DELETE /{id}` で 204 を返す（論理削除）

```ts
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { authMiddleware } from '../../shared/middleware/auth.js'
import type { HonoEnv } from '../../shared/types.js'
import { ordersService } from './service.js'

const OrderSchema = z.object({
  id: z.string(),
  title: z.string(),
  // ドメイン固有フィールド
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

const security = [{ bearerAuth: [] }]

const listOrdersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Orders'],
  summary: '一覧取得',
  security,
  request: {
    query: z.object({ keyword: z.string().optional() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(OrderSchema) } },
      description: '一覧',
    },
  },
})

const getOrderRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Orders'],
  summary: '取得',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { 'application/json': { schema: OrderSchema } },
      description: '詳細',
    },
  },
})

const createOrderRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Orders'],
  summary: '登録',
  security,
  request: {
    body: {
      content: {
        'application/json': { schema: z.object({ title: z.string().min(1) }) },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: OrderSchema } },
      description: '登録済みデータ',
    },
  },
})

const updateOrderRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Orders'],
  summary: '更新',
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': { schema: z.object({ title: z.string().min(1) }) },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: OrderSchema } },
      description: '更新済みデータ',
    },
  },
})

const deleteOrderRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Orders'],
  summary: '削除（論理削除）',
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: '削除成功' },
  },
})

export const ordersRoutes = new OpenAPIHono<HonoEnv>()
ordersRoutes.use(authMiddleware)

ordersRoutes.openapi(listOrdersRoute, async (c) => {
  const { keyword } = c.req.valid('query')
  return c.json(await ordersService.search({ keyword }), 200)
})
ordersRoutes.openapi(getOrderRoute, async (c) => {
  return c.json(await ordersService.getById(c.req.param('id')), 200)
})
ordersRoutes.openapi(createOrderRoute, async (c) => {
  return c.json(await ordersService.create(c.req.valid('json')), 201)
})
ordersRoutes.openapi(updateOrderRoute, async (c) => {
  return c.json(await ordersService.update(c.req.param('id'), c.req.valid('json')), 200)
})
ordersRoutes.openapi(deleteOrderRoute, async (c) => {
  await ordersService.delete(c.req.param('id'))
  return c.body(null, 204)
})
```

### 2-5. app.ts に登録

`backend/src/app.ts` に import と `app.route()` を追加する。

```ts
import { ordersRoutes } from './features/orders/routes.js'
// ...
app.route('/api/orders', ordersRoutes)
```

### 2-6. Backend テスト

`backend/src/features/<feature>/service.test.ts` を作成する（vitest）。

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./repository.js')

import * as repo from './repository.js'
import { ordersService } from './service.js'

const mockOrder = {
  id: 'order-1',
  title: 'テスト注文',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('ordersService.getById', () => {
  beforeEach(() => vi.clearAllMocks())

  it('存在するデータを返す', async () => {
    vi.mocked(repo.ordersRepository.findById).mockResolvedValue(mockOrder)
    const result = await ordersService.getById('order-1')
    expect(result.id).toBe('order-1')
  })

  it('存在しない ID → NotFoundError', async () => {
    vi.mocked(repo.ordersRepository.findById).mockResolvedValue(undefined)
    await expect(ordersService.getById('no-id')).rejects.toThrow('not found')
  })
})

describe('ordersService.create', () => {
  it('データを作成して返す', async () => {
    vi.mocked(repo.ordersRepository.create).mockResolvedValue(mockOrder)
    const result = await ordersService.create({ title: 'テスト注文' })
    expect(repo.ordersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'テスト注文' }),
    )
    expect(result).toEqual(mockOrder)
  })
})

describe('ordersService.delete', () => {
  it('論理削除を呼び出す', async () => {
    vi.mocked(repo.ordersRepository.findById).mockResolvedValue(mockOrder)
    vi.mocked(repo.ordersRepository.softDelete).mockResolvedValue(undefined)
    await ordersService.delete('order-1')
    expect(repo.ordersRepository.softDelete).toHaveBeenCalledWith('order-1')
  })

  it('存在しない ID → NotFoundError', async () => {
    vi.mocked(repo.ordersRepository.findById).mockResolvedValue(undefined)
    await expect(ordersService.delete('no-id')).rejects.toThrow('not found')
  })
})
```

---

## Step 3: マイグレーション

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
```

エラーが出た場合はスキーマ定義を修正してから再実行する。

---

## Step 4: Frontend 実装

### 4-1. 型定義

`frontend/src/features/<feature>/types.ts`

```ts
export type Order = {
  id: string
  title: string
  // ドメイン固有フィールド
  createdAt: string
  updatedAt: string
}

export type OrderSearchParams = {
  keyword: string
  // フィルタフィールド
}

export const emptyOrderSearchParams: OrderSearchParams = {
  keyword: '',
}
```

### 4-2. API クライアント

`frontend/src/features/<feature>/api/<feature>.ts`

```ts
import { apiFetch } from '@/shared/api/client'
import type { Order } from '../types'

export async function searchOrders(params: { keyword?: string }): Promise<Order[]> {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  return apiFetch<Order[]>(`/orders?${query}`)
}

export async function getOrderById(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`)
}

export async function createOrder(data: { title: string }): Promise<Order> {
  return apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateOrder(id: string, data: { title: string }): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteOrder(id: string): Promise<void> {
  await apiFetch(`/orders/${id}`, { method: 'DELETE' })
}
```

### 4-3. Hooks

`frontend/src/features/<feature>/hooks/use<Feature>s.ts`（一覧用）

```ts
import { useState } from 'react'
import { searchOrders } from '../api/<feature>'
import type { Order, OrderSearchParams } from '../types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (params: OrderSearchParams) => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await searchOrders(params))
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return { orders, loading, error, search }
}
```

`frontend/src/features/<feature>/hooks/use<Feature>.ts`（単件用）

```ts
import { useEffect, useState } from 'react'
import { getOrderById } from '../api/<feature>'
import type { Order } from '../types'

export function useOrder(id: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrderById(id)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : '取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  return { order, loading, error }
}
```

### 4-4. List コンポーネント

`frontend/src/features/<feature>/components/<Feature>List.tsx`

`DataTable` 共有コンポーネントを使う。

```tsx
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/shared/components/DataTable'
import type { Order } from '../types'

type Props = { orders: Order[] }

const columns: Column<Order>[] = [
  { key: 'title', label: 'タイトル', render: (o) => o.title },
  // ドメイン固有カラム
]

export function OrderList({ orders }: Props) {
  const navigate = useNavigate()
  return (
    <DataTable
      columns={columns}
      rows={orders}
      getRowKey={(o) => o.id}
      onRowClick={(o) => navigate(`/orders/${o.id}`)}
      getRowAriaLabel={(o) => `${o.title} の詳細を表示`}
      emptyMessage="該当するデータがありません"
      className="order-list"
    />
  )
}
```

### 4-5. 一覧ページ（検索条件つき）

`frontend/src/features/<feature>/pages/<Feature>sPage.tsx`

- 検索フォーム送信で `search()` を呼ぶ
- 初回は空表示（「検索してください」を促す）
- `PageHeader` で右上に「新規登録」ボタン
- `SkeletonRows` でローディング表示
- `ErrorAlert` でエラー表示

```tsx
import { useState } from 'react'
import { OrderList } from '../components/OrderList'
import { useOrders } from '../hooks/useOrders'
import { emptyOrderSearchParams, type OrderSearchParams } from '../types'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonRows } from '@/shared/components/SkeletonRows'

export function OrdersPage() {
  const { orders, loading, error, search } = useOrders()
  const [draft, setDraft] = useState<OrderSearchParams>(emptyOrderSearchParams)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await search(draft)
    setSearched(true)
  }

  function handleReset() {
    setDraft(emptyOrderSearchParams)
    setSearched(false)
  }

  return (
    <div className="orders-page">
      <PageHeader
        title="一覧"
        action={{ label: '新規登録', to: '/orders/new' }}
      />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="キーワード"
          value={draft.keyword}
          onChange={(e) => setDraft((d) => ({ ...d, keyword: e.target.value }))}
        />
        {/* フィルタフィールドを追加 */}
        <button type="button" onClick={handleReset}>リセット</button>
        <button type="submit">検索</button>
      </form>

      <ErrorAlert error={error} />
      {loading && <SkeletonRows count={5} />}
      {searched && !loading && <OrderList orders={orders} />}
    </div>
  )
}
```

### 4-6. 詳細ページ（削除ボタンつき）

`frontend/src/features/<feature>/pages/<Feature>DetailPage.tsx`

- `useOrder(id)` でデータ取得
- 削除ボタン → `ConfirmDialog` → `deleteOrder()` → 一覧へ遷移
- `useSnackbar` で完了メッセージ

```tsx
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteOrder } from '../api/<feature>'
import { useOrder } from '../hooks/useOrder'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { order, loading, error } = useOrder(id)
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteConfirm() {
    if (!order) return
    setConfirmOpen(false)
    setDeleting(true)
    try {
      await deleteOrder(order.id)
      snackbar.show('削除しました')
      navigate('/orders')
    } catch (e) {
      snackbar.show(e instanceof Error ? e.message : '削除に失敗しました')
      setDeleting(false)
    }
  }

  if (loading) return <p>読み込み中...</p>
  if (error) return <p role="alert">{error}</p>
  if (!order) return <p>データが見つかりません</p>

  return (
    <>
      {confirmOpen && (
        <ConfirmDialog
          title="削除しますか？"
          message={`「${order.title}」を削除します。この操作は元に戻せません。`}
          confirmLabel="削除する"
          dangerous
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
      <div>
        <Link to="/orders">← 一覧に戻る</Link>
        <h1>{order.title}</h1>
        {/* ドメイン固有フィールドの表示 */}
        <div>
          <Link to={`/orders/${order.id}/edit`}>編集</Link>
          <button type="button" onClick={() => setConfirmOpen(true)} disabled={deleting}>
            {deleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
    </>
  )
}
```

### 4-7. 登録ページ

`frontend/src/features/<feature>/pages/<Feature>CreatePage.tsx`

- フォーム submit → `ConfirmDialog` で確認 → `createOrder()` → 一覧へ
- `useSnackbar` で完了メッセージ

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/<feature>'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'

export function OrderCreatePage() {
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  async function doCreate() {
    setSubmitting(true)
    setError(null)
    try {
      await createOrder({ title })
      snackbar.show('登録しました')
      navigate('/orders')
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/orders">← 一覧に戻る</Link>
      <h1>新規登録</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }}>
        <label htmlFor="oc-title">タイトル</label>
        <input id="oc-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        {/* ドメイン固有フィールドを追加 */}
        <button type="submit" disabled={submitting}>登録</button>
      </form>
      {showConfirm && (
        <ConfirmDialog
          title="登録しますか？"
          message={`「${title}」を登録します。`}
          confirmLabel="登録する"
          onConfirm={() => { setShowConfirm(false); doCreate() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
```

### 4-8. 編集ページ

`frontend/src/features/<feature>/pages/<Feature>EditPage.tsx`

- `useOrder(id)` でデータ取得 → フォームに初期値をセット
- submit → `ConfirmDialog` → `updateOrder()` → 詳細ページへ

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { updateOrder } from '../api/<feature>'
import { useOrder } from '../hooks/useOrder'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useSnackbar } from '@/shared/hooks/useSnackbar'

export function OrderEditPage() {
  const { id } = useParams<{ id: string }>()
  const { order, loading, error } = useOrder(id)
  const navigate = useNavigate()
  const snackbar = useSnackbar()
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => { if (order) setTitle(order.title) }, [order])

  async function doSave() {
    if (!order) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateOrder(order.id, { title })
      snackbar.show('更新しました')
      navigate(`/orders/${order.id}`)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '更新に失敗しました')
      setSaving(false)
    }
  }

  if (loading) return <p>読み込み中...</p>
  if (error) return <p role="alert">{error}</p>
  if (!order) return <p>データが見つかりません</p>

  return (
    <div>
      <Link to={`/orders/${id}`}>← 詳細に戻る</Link>
      <h1>編集</h1>
      {saveError && <p role="alert">{saveError}</p>}
      <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }}>
        <label htmlFor="oe-title">タイトル</label>
        <input id="oe-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        {/* ドメイン固有フィールドを追加 */}
        <button type="submit" disabled={saving}>保存</button>
      </form>
      {showConfirm && (
        <ConfirmDialog
          title="更新しますか？"
          message={`「${title}」に更新します。`}
          confirmLabel="更新する"
          onConfirm={() => { setShowConfirm(false); doSave() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
```

### 4-9. Barrel（index.ts）

`frontend/src/features/<feature>/index.ts`

```ts
export { OrdersPage } from './pages/OrdersPage'
export { OrderDetailPage } from './pages/OrderDetailPage'
export { OrderCreatePage } from './pages/OrderCreatePage'
export { OrderEditPage } from './pages/OrderEditPage'
```

### 4-10. Router と Navigation に登録

`frontend/src/app/router.tsx` に import とルートを追加する。

```ts
import { OrdersPage, OrderDetailPage, OrderCreatePage, OrderEditPage } from '@/features/orders'

// children 内に追加:
{ path: 'orders', element: <OrdersPage /> },
{ path: 'orders/new', element: <OrderCreatePage /> },
{ path: 'orders/:id', element: <OrderDetailPage /> },
{ path: 'orders/:id/edit', element: <OrderEditPage /> },
```

`frontend/src/app/navigation.ts` にナビアイテムを追加する。

```ts
{ label: 'Orders', to: '/orders', icon: 'orders' },
```

---

## Step 5: Frontend テスト

### List コンポーネントテスト

`frontend/src/features/<feature>/components/__tests__/<Feature>List.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OrderList } from '../OrderList'
import type { Order } from '@/features/orders/types'

const orders: Order[] = [
  { id: '1', title: '注文A', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', title: '注文B', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

describe('OrderList', () => {
  it('タイトルを表示する', () => {
    render(<MemoryRouter><OrderList orders={orders} /></MemoryRouter>)
    expect(screen.getByText('注文A')).toBeInTheDocument()
    expect(screen.getByText('注文B')).toBeInTheDocument()
  })

  it('行に aria-label が設定される', () => {
    render(<MemoryRouter><OrderList orders={orders} /></MemoryRouter>)
    expect(screen.getByRole('row', { name: '注文A の詳細を表示' })).toBeInTheDocument()
  })

  it('空のときはメッセージを表示する', () => {
    render(<MemoryRouter><OrderList orders={[]} /></MemoryRouter>)
    expect(screen.getByText('該当するデータがありません')).toBeInTheDocument()
  })

  it('行にクリック可能なクラスが付く', () => {
    const { container } = render(<MemoryRouter><OrderList orders={orders} /></MemoryRouter>)
    expect(container.querySelectorAll('tr.data-table__row--clickable')).toHaveLength(orders.length)
  })
})
```

純粋なユーティリティ関数があれば `utils/__tests__/` にも追加する。

**ESM モードの注意**: `jest.fn()` / `jest.spyOn()` を使うファイルは先頭に以下を追加する。

```ts
import { jest } from '@jest/globals'
```

---

## Step 6: ビルドと確認

```bash
npm run lint
npm run build
npm test -w frontend
npm run test -w backend
```

エラーがあれば修正してから完了を報告する。

---

## Step 7: 完了報告

```
機能追加完了: <feature>

Backend:
  - GET    /api/<features>?keyword=...  （検索・一覧）
  - GET    /api/<features>/:id          （取得）
  - POST   /api/<features>              （登録）
  - PUT    /api/<features>/:id          （更新）
  - DELETE /api/<features>/:id          （論理削除）

Frontend:
  - /features/<feature>/           （一覧・検索）
  - /features/<feature>/components （<Feature>List）
  - /features/<feature>/hooks      （use<Feature>s, use<Feature>）
  - /features/<feature>/api        （CRUD API クライアント）
  - ページ: 一覧 / 詳細 / 登録 / 編集

Migration: 適用済み
Tests: service.test.ts / <Feature>List.test.tsx
```
