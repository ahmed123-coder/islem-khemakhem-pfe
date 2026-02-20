import { prisma } from './prisma'

export async function checkMissionAccess(missionId: string, userId: string, role: string): Promise<boolean> {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: { clientId: true, consultantId: true }
  })

  if (!mission) return false

  // Admin has full access
  if (role === 'ADMIN') return true

  // Client can access their own missions
  if (role === 'CLIENT' && mission.clientId === userId) return true

  // Consultant can access assigned missions
  if (role === 'CONSULTANT' && mission.consultantId === userId) return true

  return false
}
