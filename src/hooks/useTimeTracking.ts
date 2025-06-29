import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';
import { TimeEntry } from '../types/TimeEntry';

export const useTimeTracking = () => {
  const { user } = useAuth();
  const collectionPath = user ? `users/${user.uid}/timeTracking` : 'timeTracking';
  const { data, loading, error, addDocument, updateDocument } = useFirestore(collectionPath);
  const [currentSession, setCurrentSession] = useState<{ id?: string; entries: TimeEntry[] }>({
    entries: []
  });
  const [isSaving, setIsSaving] = useState(false);

  // デフォルトの9行を作成する関数
  const createDefaultEntries = (): TimeEntry[] => {
    return Array.from({ length: 9 }, (_, index) => ({
      id: (index + 1).toString(),
      startTime: '',
      endTime: '',
      tasks: [
        { content: '', time: 0 },
        { content: '', time: 0 },
        { content: '', time: 0 }
      ]
    }));
  };

  // 初期化
  useEffect(() => {
    if (!loading && data.length === 0) {
      setCurrentSession({ entries: createDefaultEntries() });
    } else if (!loading && data.length > 0) {
      // 最新のセッションを読み込み
      const latestSession = data[0];
      setCurrentSession({
        id: latestSession.id,
        entries: latestSession.entries || createDefaultEntries()
      });
    }
  }, [data, loading]);

  // セッションを保存
  const saveSession = async (entries: TimeEntry[], sessionName?: string) => {
    try {
      setIsSaving(true);
      const sessionData = {
        entries,
        sessionName: sessionName || `セッション ${new Date().toLocaleString('ja-JP')}`,
        totalHours: calculateTotalHours(entries)
      };

      if (currentSession.id) {
        // 既存セッションを更新
        await updateDocument(currentSession.id, sessionData);
      } else {
        // 新規セッションを作成
        const newId = await addDocument(sessionData);
        setCurrentSession({ id: newId, entries });
      }
      setIsSaving(false);
      return true;
    } catch (err) {
      setIsSaving(false);
      console.error('保存エラー:', err);
      return false;
    }
  };

  // 新しいセッションを開始
  const startNewSession = () => {
    setCurrentSession({ entries: createDefaultEntries() });
  };

  // セッションを読み込み
  const loadSession = (sessionId: string) => {
    const session = data.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession({
        id: session.id,
        entries: session.entries || createDefaultEntries()
      });
    }
  };

  // 総時間を計算
  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      const taskTotal = entry.tasks.reduce((taskSum, task) => taskSum + (task.time || 0), 0);
      return total + taskTotal;
    }, 0);
  };

  // エントリを更新
  const updateEntries = (entries: TimeEntry[]) => {
    setCurrentSession(prev => ({ ...prev, entries }));
  };

  return {
    currentSession,
    allSessions: data,
    loading,
    error,
    isSaving,
    saveSession,
    startNewSession,
    loadSession,
    updateEntries,
    calculateTotalHours
  };
};