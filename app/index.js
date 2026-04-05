// app/index.js — Splash / restore session
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/utils/store';
import { FullScreenLoader } from '../src/components/UI';

export default function Index() {
  const router = useRouter();
  const restoreSession = useAppStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession().then((ok) => {
      router.replace(ok ? '/vehicle' : '/login');
    });
  }, []);

  return <FullScreenLoader message="Chargement…" />;
}
