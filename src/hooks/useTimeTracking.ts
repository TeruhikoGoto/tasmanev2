import { useState, useEffect } from 'react';
import { useFirestore } from './useFirestore';
import { useAuth } from './useAuth';
import { TimeEntry, TimeTrackingSession, SessionsByDate } from '../types/TimeEntry';
import { getTodayString, getYearFromDate, getMonthKey, sortSessionsByDate } from '../utils/dateUtils';

export const useTimeTracking = () => {
  const { user } = useAuth();
  const collectionPath = user ? `users/${user.uid}/timeTracking` : 'timeTracking';
  const { data, loading, error, addDocument, updateDocument } = useFirestore(collectionPath);
  const [currentSession, setCurrentSession] = useState<TimeTrackingSession>({
    sessionDate: getTodayString(),
    entries: [],
    totalHours: 0,
    userId: user?.uid || ''
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
    if (user) {
      if (!loading && data.length === 0) {
        setCurrentSession({
          sessionDate: getTodayString(),
          entries: createDefaultEntries(),
          totalHours: 0,
          userId: user.uid
        });
      } else if (!loading && data.length > 0) {
        // 最新のセッションを読み込み
        const latestSession = data[0];
        setCurrentSession({
          id: latestSession.id,
          sessionDate: latestSession.sessionDate || getTodayString(),
          entries: latestSession.entries || createDefaultEntries(),
          totalHours: latestSession.totalHours || 0,
          userId: user.uid
        });
      }
    }
  }, [data, loading, user]);

  // セッションを保存
  const saveSession = async (entries: TimeEntry[]) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      const sessionData: Omit<TimeTrackingSession, 'id'> = {
        sessionDate: currentSession.sessionDate,
        entries,
        totalHours: calculateTotalHours(entries),
        userId: user.uid
      };

      if (currentSession.id) {
        // 既存セッションを更新
        await updateDocument(currentSession.id, sessionData);
      } else {
        // 新規セッションを作成
        const newId = await addDocument(sessionData);
        setCurrentSession({ ...sessionData, id: newId });
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
    if (!user) return;
    
    setCurrentSession({
      sessionDate: getTodayString(),
      entries: createDefaultEntries(),
      totalHours: 0,
      userId: user.uid
    });
  };

  // セッションを読み込み
  const loadSession = (sessionId: string) => {
    const session = data.find(s => s.id === sessionId);
    if (session && user) {
      setCurrentSession({
        id: session.id,
        sessionDate: session.sessionDate || getTodayString(),
        entries: session.entries || createDefaultEntries(),
        totalHours: session.totalHours || 0,
        userId: user.uid
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
    setCurrentSession(prev => ({ 
      ...prev, 
      entries,
      totalHours: calculateTotalHours(entries)
    }));
  };

  // セッションを年月別に整理
  const getSessionsByDate = (): SessionsByDate => {
    const sessionsByDate: SessionsByDate = {};
    
    try {
      if (!Array.isArray(data)) {
        return sessionsByDate;
      }
      
      data.forEach((session: TimeTrackingSession) => {
        if (!session || typeof session !== 'object') {
          return; // 無効なセッションをスキップ
        }
        
        // セッション日付のデフォルト値を設定
        const sessionDate = session.sessionDate || getTodayString();
        const year = getYearFromDate(sessionDate);
        const monthKey = getMonthKey(sessionDate);
        
        if (!sessionsByDate[year]) {
          sessionsByDate[year] = {};
        }
        if (!sessionsByDate[year][monthKey]) {
          sessionsByDate[year][monthKey] = [];
        }
        
        // セッションデータを正規化
        const normalizedSession: TimeTrackingSession = {
          ...session,
          sessionDate: sessionDate,
          entries: session.entries || [],
          totalHours: session.totalHours || 0,
          userId: session.userId || user?.uid || ''
        };
        
        sessionsByDate[year][monthKey].push(normalizedSession);
      });
      
      // 各月のセッションを日付順にソート
      Object.keys(sessionsByDate).forEach(year => {
        Object.keys(sessionsByDate[year]).forEach(month => {
          sessionsByDate[year][month].sort(sortSessionsByDate);
        });
      });
    } catch (error) {
      console.error('Error organizing sessions by date:', error);
    }
    
    return sessionsByDate;
  };

  return {
    currentSession,
    allSessions: data,
    sessionsByDate: getSessionsByDate(),
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