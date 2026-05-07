import { NotFoundError } from '../../shared/errors.js'
import type { AnnouncementCategory } from '../../shared/types.js'
import { announcementsRepository } from './repository.js'

type CreateAnnouncementInput = {
  title: string
  body: string
  date: string
  category: AnnouncementCategory
}

export const announcementsService = {
  getAll: async () => {
    return announcementsRepository.findAll()
  },

  getRecent: async (limit = 5) => {
    return announcementsRepository.findRecent(limit)
  },

  getById: async (id: string) => {
    const announcement = await announcementsRepository.findById(id)
    if (!announcement) throw new NotFoundError('Announcement not found')
    return announcement
  },

  create: async (input: CreateAnnouncementInput) => {
    return announcementsRepository.create({ id: crypto.randomUUID(), ...input })
  },

  update: async (id: string, input: Partial<CreateAnnouncementInput>) => {
    const announcement = await announcementsRepository.findById(id)
    if (!announcement) throw new NotFoundError('Announcement not found')
    return announcementsRepository.update(id, input)
  },

  delete: async (id: string) => {
    const announcement = await announcementsRepository.findById(id)
    if (!announcement) throw new NotFoundError('Announcement not found')
    await announcementsRepository.delete(id)
  },
}
