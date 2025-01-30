import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    scope: 'openid email profile',
                },
            }
        }),
    ],
    debug: true,
    logger: {
        error: (code, ...message) => console.error(code, message),
        warn: (code, ...message) => console.warn(code, message),
        debug: (code, ...message) => console.debug(code, message),
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            if (account) {
                console.log(" Inside jwt callback", account);
                token.accessToken = account.id_token
                token.idTokenExpiresAt = Math.floor(Date.now() / 1000 + 3600) // 1 hour
            }
            if (Date.now() >= (token.idTokenExpiresAt ?? 0) * 1000) {
                return refreshIdToken(token)
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            return session;
        },
    }

})

async function refreshIdToken(token: JWT) {
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_ID!,
                client_secret: process.env.GOOGLE_SECRET!,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
                scope: 'openid email profile'
            }),
        })

        const refreshedTokens = await response.json()

        return {
            ...token,
            accessToken: refreshedTokens.id_token,
            idTokenExpiresAt: Math.floor(Date.now() / 1000 + 3600)
        }
    } catch (error) {
        return token
    }
}

export { handler as GET, handler as POST }