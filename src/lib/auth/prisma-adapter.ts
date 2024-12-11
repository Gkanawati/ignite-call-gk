import { NextApiRequest, NextApiResponse } from 'next'
import { Adapter } from 'next-auth/adapters'
import { destroyCookie, parseCookies } from 'nookies'
import { User, Account } from '@prisma/client'
import { prisma } from '../prisma'

export function PrismaAdapter(
  req: NextApiRequest,
  res: NextApiResponse,
): Adapter {
  return {
    async createUser(user: User) {
      const { '@ignite-call-gk:userId': userIdOnCookies } = parseCookies({
        req,
      })

      if (!userIdOnCookies) {
        throw new Error('User ID not found on cookies')
      }

      const prismaUser = await prisma.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      destroyCookie({ res }, '@ignite-call-gk:userId', {
        path: '/',
      })

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: user.email ?? '',
        avatar_url: user.avatar_url ?? '',
        emailVerified: null,
      }
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email ?? '',
        avatar_url: user.avatar_url ?? '',
        emailVerified: null,
      }
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email ?? '',
        avatar_url: user.avatar_url ?? '',
        emailVerified: null,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!account) {
        return null
      }

      const user = account.user

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email ?? '',
        avatar_url: user.avatar_url ?? '',
        emailVerified: null,
      }
    },

    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
        },
      })

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email ?? '',
        avatar_url: updatedUser.avatar_url ?? '',
        emailVerified: null,
      }
    },

    // async deleteUser(userId) {},

    async linkAccount(account: Account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },

    // async unlinkAccount({ providerAccountId, provider }) {},

    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          userId,
          expires,
          sessionToken,
        },
      })

      return {
        sessionToken,
        userId,
        expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          user: true,
        },
      })

      if (!session) {
        return null
      }

      const user = session.user

      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email ?? '',
          avatar_url: user.avatar_url ?? '',
          emailVerified: null,
        },
      }
    },

    async updateSession({ sessionToken, userId, expires }) {
      const updatedSession = await prisma.session.update({
        where: {
          sessionToken,
        },
        data: {
          expires,
          userId,
        },
      })

      return {
        sessionToken: updatedSession.sessionToken,
        userId: updatedSession.userId,
        expires: updatedSession.expires,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          sessionToken,
        },
      })
    },

    // async createVerificationToken({ identifier, expires, token }) {},

    // async useVerificationToken({ identifier, token }) {},
  }
}
