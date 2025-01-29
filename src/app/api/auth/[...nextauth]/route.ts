import NextAuth from 'next-auth'
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
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            return session;
        },
    }
})

export { handler as GET, handler as POST }