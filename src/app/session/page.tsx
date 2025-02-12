import MainSession from '@/app/components/MainSession';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export default async function SessionPage() {
    const session = await getServerSession();

    if (!session) {
        redirect('/');
    }

    return <MainSession />;
}
