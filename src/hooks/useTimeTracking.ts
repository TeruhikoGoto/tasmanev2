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

  // 初期化フラグを追加
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化
  useEffect(() => {
    if (user && !isInitialized) {
      const today = getTodayString();
      
      console.log('🚀 useTimeTracking 初期化:', {
        user: user.uid,
        today,
        loading,
        dataCount: data.length,
        sessions: data.map(s => ({ id: s.id, date: s.sessionDate })),
        isInitialized
      });
      
      // loadingが終わったら処理を実行
      if (!loading) {
        // 今日の日付のセッションを検索
        const todaySession = data.find(session => session.sessionDate === today);
        
        if (todaySession) {
          // 今日のセッションが存在する場合は読み込み
          console.log('✅ 今日のセッションを読み込み:', todaySession.id);
          setCurrentSession({
            id: todaySession.id,
            sessionDate: todaySession.sessionDate,
            entries: todaySession.entries || createDefaultEntries(),
            totalHours: todaySession.totalHours || 0,
            userId: user.uid
          });
        } else {
          // 今日のセッションが存在しない場合は新規作成
          console.log('➕ 新しいセッションを作成:', today);
          setCurrentSession({
            sessionDate: today,
            entries: createDefaultEntries(),
            totalHours: 0,
            userId: user.uid
          });
        }
        setIsInitialized(true);
      }
    }
  }, [data, loading, user, isInitialized]);

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

  // 特定のセッションに保存する関数
  const saveSessionToSpecificSession = async (sessionId: string, sessionDate: string, entries: TimeEntry[]) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      const sessionData: Omit<TimeTrackingSession, 'id'> = {
        sessionDate: sessionDate,
        entries,
        totalHours: calculateTotalHours(entries),
        userId: user.uid
      };

      console.log('💾 特定セッションに保存:', {
        sessionId,
        sessionDate,
        entriesCount: entries.length,
        totalHours: sessionData.totalHours
      });

      if (sessionId) {
        // 指定されたセッションを更新
        await updateDocument(sessionId, sessionData);
        
        // 現在のセッションが保存対象と同じ場合は、ローカル状態も更新（初期化フラグは保持）
        if (currentSession.id === sessionId) {
          setCurrentSession({ ...sessionData, id: sessionId });
          console.log('💾 ローカル状態も更新（セッション継続）');
        } else {
          console.log('💾 他のセッションを保存（現在のセッション継続）');
        }
      } else {
        // 新規セッションを作成
        const newId = await addDocument(sessionData);
        console.log('新規セッション作成:', newId);
      }
      setIsSaving(false);
      return true;
    } catch (err) {
      setIsSaving(false);
      console.error('特定セッション保存エラー:', err);
      return false;
    }
  };

  // 新しいセッションを開始
  const startNewSession = async (sessionDate?: string) => {
    if (!user) return;
    
    const targetDate = sessionDate || getTodayString();
    
    // 同じ日付のセッションが既に存在するかチェック
    const existingSession = data.find(session => session.sessionDate === targetDate);
    if (existingSession) {
      // 既存のセッションがある場合は、そのセッションを読み込み
      setCurrentSession({
        id: existingSession.id,
        sessionDate: existingSession.sessionDate,
        entries: existingSession.entries || createDefaultEntries(),
        totalHours: existingSession.totalHours || 0,
        userId: user.uid
      });
      console.log('既存のセッションを読み込みました:', existingSession.id);
      return;
    }
    
    const newSession = {
      sessionDate: targetDate,
      entries: createDefaultEntries(),
      totalHours: 0,
      userId: user.uid
    };
    
    try {
      // 新しいセッションをFirestoreに保存
      const sessionId = await addDocument(newSession);
      
      // 保存されたセッションを現在のセッションとして設定
      setCurrentSession({
        ...newSession,
        id: sessionId
      });
      
      console.log('新しいセッションが作成されました:', sessionId);
    } catch (error) {
      console.error('セッション作成エラー:', error);
      // エラーが発生した場合でも、ローカル状態は更新
      setCurrentSession(newSession);
    }
  };

  // セッションを読み込み
  const loadSession = async (sessionId: string) => {
    console.log('🔍 セッション読み込み開始:', sessionId);
    console.log('📚 利用可能なセッション一覧:', data.map(s => ({ id: s.id, date: s.sessionDate })));
    
    const session = data.find(s => s.id === sessionId);
    console.log('✅ 見つかったセッション:', session ? {
      id: session.id,
      sessionDate: session.sessionDate,
      entriesCount: session.entries?.length || 0,
      hasData: !!session.entries
    } : 'セッションが見つかりません');
    
    if (session && user) {
      // 初期化フラグを設定して今後の自動初期化を防ぐ
      setIsInitialized(true);
      // 完全に新しいオブジェクトを作成してReactの変更検知を確実にする
      const newSession = {
        id: session.id,
        sessionDate: session.sessionDate || getTodayString(),
        entries: session.entries ? [...session.entries.map((entry: TimeEntry) => ({
          ...entry,
          tasks: [...entry.tasks.map((task: any) => ({...task}))]
        }))] : createDefaultEntries(),
        totalHours: session.totalHours || 0,
        userId: user.uid
      };
      
      console.log('🚀 新しいセッションを設定:', {
        id: newSession.id,
        sessionDate: newSession.sessionDate,
        entriesCount: newSession.entries.length,
        totalHours: newSession.totalHours,
        entriesData: newSession.entries.slice(0, 2).map(entry => ({
          id: entry.id,
          startTime: entry.startTime,
          endTime: entry.endTime,
          tasksWithContent: entry.tasks.filter((t: any) => t.content).length
        }))
      });
      
      // 強制的に状態を更新（前の状態と確実に異なるオブジェクトにする）
      setCurrentSession(prev => {
        console.log('🔄 setCurrentSession実行:', {
          previousId: prev.id,
          newId: newSession.id,
          previousDate: prev.sessionDate,
          newDate: newSession.sessionDate,
          objectsAreDifferent: prev !== newSession,
          entriesChanged: prev.entries !== newSession.entries
        });
        return newSession;
      });
      
      // 追加の確認用ログ
      setTimeout(() => {
        console.log('⏰ セッション設定完了確認:', {
          sessionId: newSession.id,
          sessionDate: newSession.sessionDate,
          timestamp: new Date().toISOString()
        });
      }, 50);
      
    } else {
      console.log('❌ セッション読み込み失敗:', {
        sessionFound: !!session,
        userExists: !!user,
        userId: user?.uid,
        dataLength: data.length
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

  // 指定した行の下に新しい行を追加
  const insertRowAfter = (index: number) => {
    const newEntries = [...currentSession.entries];
    const previousEntry = newEntries[index];
    
    // 新しいエントリのIDを生成（最大ID + 1）
    const maxId = Math.max(0, ...newEntries.map(entry => parseInt(entry.id) || 0));
    const newId = (maxId + 1).toString();
    
    // 前の行の完了時間から1時間後の範囲を計算
    const calculateNextTimeRange = (prevEndTime: string) => {
      if (!prevEndTime || prevEndTime === '') {
        return { startTime: '', endTime: '' };
      }
      
      // 時間形式をパース（HH:MM形式）
      const timeMatch = prevEndTime.match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) {
        return { startTime: prevEndTime, endTime: '' };
      }
      
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      
      // 1時間後を計算
      const nextHours = (hours + 1) % 24;
      const newStartTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
      const newEndTime = `${nextHours}:${minutes.toString().padStart(2, '0')}`;
      
      return { startTime: newStartTime, endTime: newEndTime };
    };
    
    const nextTimeRange = calculateNextTimeRange(previousEntry.endTime);
    
    const newEntry: TimeEntry = {
      id: newId,
      startTime: nextTimeRange.startTime,
      endTime: nextTimeRange.endTime,
      tasks: [
        { content: '', time: 0 },
        { content: '', time: 0 },
        { content: '', time: 0 }
      ]
    };
    
    // 指定したインデックスの後に挿入
    newEntries.splice(index + 1, 0, newEntry);
    
    updateEntries(newEntries);
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
    saveSessionToSpecificSession,
    startNewSession,
    loadSession,
    updateEntries,
    insertRowAfter,
    calculateTotalHours
  };
};