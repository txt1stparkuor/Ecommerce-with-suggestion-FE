import { get } from 'react-hook-form'
import { api, apiDefaultUpload } from '.'
import { ApiConstant } from '../constants/api.constant'

const classroomApi = () => ({
  getAllClassrooms: async (params) => api.get(ApiConstant.classrooms.base, { params }),

  getClassroomById: async (classroomId) =>
    api.get(ApiConstant.classrooms.getById(classroomId)),

  createClassroom: async (formDataPayload) =>
    apiDefaultUpload.post(ApiConstant.classrooms.base, formDataPayload),

  updateClassroom: async (classroomId, formDataPayload) =>
    apiDefaultUpload.patch(ApiConstant.classrooms.getById(classroomId), formDataPayload),

  getMembersInClassroom: async (classroomId, params) =>
    api.get(ApiConstant.classrooms.members(classroomId), { params }),

  getMembersNotInClassroom: async (classroomId, params) =>
    api.get(ApiConstant.classrooms.nonMembers(classroomId), { params }),

  addMembersToClassroom: async (classroomId, payload) =>
    api.post(ApiConstant.classrooms.members(classroomId), payload),

  removeMembersFromClassroom: async (classroomId, payload) =>
    api.delete(ApiConstant.classrooms.members(classroomId), { data: payload }),

  getManagedClasses: async (params) => api.get(ApiConstant.classrooms.getManaged, { params }),

  getClassroomMembers: async (classroomId, params) => {
    if (!classroomId) return Promise.reject(new Error('Classroom ID is required.'))
    const url = ApiConstant.classrooms.members(classroomId)
    return api.get(url, { params })
  },

  createNotification: async (classroomId, payload) => {
    const url = ApiConstant.classrooms.createNotification(classroomId)
    return api.post(url, payload)
  },

  getNotificationsOfClassroom: async (classroomId, params) => {
    const url = ApiConstant.classrooms.getNotificationsOfClassroom(classroomId)
    return api.get(url, { params })
  }
})

export const {
  getAllClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  addMembersToClassroom,
  getMembersInClassroom,
  removeMembersFromClassroom,
  getClassroomMembers,
  getManagedClasses,
  getMembersNotInClassroom,
  createNotification,
  getNotificationsOfClassroom
} = classroomApi()
