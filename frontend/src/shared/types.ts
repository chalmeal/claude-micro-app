export type Announcement = {
  id: string
  title: string
  body: string
  date: string
  category: 'important' | 'info' | 'maintenance'
}
