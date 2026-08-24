import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/lib/session';

export default function ParentLayout() {
  const { user, loading } = useSession();
  if (loading) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'parent') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
