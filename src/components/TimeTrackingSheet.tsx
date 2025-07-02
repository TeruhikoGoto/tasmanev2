import React, { useEffect, useRef, useState, useMemo } from 'react';
import SpreadsheetCell from './SpreadsheetCell';
import TimeSelect from './TimeSelect';
import TimeInputSelect from './TimeInputSelect';
import { useTimeTracking } from '../hooks/useTimeTracking';
import { TimeTrackingSession } from '../types/TimeEntry';
import './TimeTrackingSheet.css';

interface TimeTrackingSheetProps {
  currentSession: TimeTrackingSession;
}

const TimeTrackingSheet: React.FC<TimeTrackingSheetProps> = ({ currentSession: propsCurrentSession }) => {
  const {
    loading,
    error,
    saveSessionToSpecificSession,
    updateEntries,
    insertRowAfter
  } = useTimeTracking();

  // propsから受け取ったcurrentSessionを使用
  const currentSession = propsCurrentSession;

  // デバッグ用：currentSessionが変更された際の追跡
  console.log('🎯 TimeTrackingSheet レンダー (props使用):', {
    currentSessionId: currentSession.id,
    currentSessionDate: currentSession.sessionDate,
    entriesCount: currentSession.entries?.length || 0,
    timestamp: new Date().toISOString(),
    source: 'props'
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const prevSessionRef = useRef(currentSession);

  // 強制再レンダリング用の関数
  const triggerUpdate = () => {
    setUpdateTrigger(prev => {
      const newValue = prev + 1;
      console.log('🎯 強制再レンダリング実行:', newValue, 'updateTrigger:', updateTrigger);
      return newValue;
    });
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // currentSessionからentriesを取得（状態変更を確実に反映）
  const [displayEntries, setDisplayEntries] = useState(currentSession.entries || []);
  
  // currentSessionが変更されたときの処理
  useEffect(() => {
    const prev = prevSessionRef.current;
    const hasChanged = prev.id !== currentSession.id || prev.sessionDate !== currentSession.sessionDate;
    
    console.log('🔄 TimeTrackingSheet: セッション変更検知 (props使用):', {
      id: currentSession.id,
      sessionDate: currentSession.sessionDate,
      entriesCount: currentSession.entries?.length || 0,
      totalHours: currentSession.totalHours,
      hasEntries: !!(currentSession.entries && currentSession.entries.length > 0),
      firstEntryContent: currentSession.entries?.[0]?.tasks?.[0]?.content || 'なし',
      timestamp: new Date().toISOString(),
      hasChanged: hasChanged,
      previousId: prev.id,
      previousDate: prev.sessionDate,
      source: 'props'
    });
    
    prevSessionRef.current = currentSession;
    
    // displayEntriesを完全に新しい配列で更新
    const newEntries = currentSession.entries ? 
      currentSession.entries.map(entry => ({
        ...entry,
        tasks: entry.tasks.map(task => ({...task}))
      })) : [];
    
    setDisplayEntries(newEntries);
    
    console.log('📊 表示用entriesを更新:', {
      sessionId: currentSession.id,
      sessionDate: currentSession.sessionDate,
      newEntriesCount: newEntries.length,
      entryIds: newEntries.map(e => e.id),
      entriesWithData: newEntries.filter(e => e.tasks.some(t => t.content)).length
    });
    
    // 強制的に再レンダリング
    triggerUpdate();
    
  }, [currentSession]); // オブジェクト全体を監視

  const entries = displayEntries;

  // 分を時間分形式に変換する関数
  const formatTimeDisplay = (minutes: number): string => {
    if (minutes === 0) return '0分';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}分`;
    } else if (remainingMinutes === 0) {
      return `${hours}時間`;
    } else {
      return `${hours}時間${remainingMinutes}分`;
    }
  };

  // 工数サマリーをuseMemoで計算（entriesの変更に応じて再計算）
  const workSummary = useMemo(() => {
    console.log('🧮 工数サマリーを再計算 (props使用):', {
      sessionId: currentSession.id,
      sessionDate: currentSession.sessionDate,
      entriesCount: entries.length,
      source: 'props'
    });
    
    const workGroups: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      entry.tasks?.forEach((task) => {
        if (task.content && task.content.trim() && task.time > 0) {
          const content = task.content.trim();
          workGroups[content] = (workGroups[content] || 0) + task.time;
        }
      });
    });
    
    return workGroups;
  }, [entries, currentSession.id, currentSession.sessionDate]);

  const sortedWorkItems = useMemo(() => 
    Object.entries(workSummary).sort(([, a], [, b]) => b - a),
    [workSummary]
  );
  
  const totalTime = useMemo(() => 
    Object.values(workSummary).reduce((sum, time) => sum + time, 0),
    [workSummary]
  );

  // 自動保存関数
  const autoSave = async (updatedEntries: any[]) => {
    // 既存のタイマーをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 6秒後に保存実行
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('💾 自動保存実行:', {
          sessionId: currentSession.id,
          sessionDate: currentSession.sessionDate,
          entriesCount: updatedEntries.length
        });
        await saveSessionToSpecificSession(currentSession.id || '', currentSession.sessionDate, updatedEntries);
      } catch (error) {
        console.error('自動保存エラー:', error);
      }
    }, 6000);
  };

  // 時刻を1時間進める関数
  const addOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours}:${minutes.toString().padStart(2, '0')}`;
  };

  // 最初の行の開始時刻が変更されたときに全ての行の時刻を自動設定
  const handleFirstStartTimeChange = (startTime: string) => {
    if (!startTime) {
      // 時刻がクリアされた場合、全ての時刻をクリア
      const clearedEntries = entries.map(entry => ({
        ...entry,
        startTime: '',
        endTime: ''
      }));
      updateEntries(clearedEntries);
      setDisplayEntries(clearedEntries);
      autoSave(clearedEntries);
      return;
    }

    // 時刻を順次計算して設定
    let currentTime = startTime;
    const finalEntries = entries.map((entry) => {
      const startTime = currentTime;
      const endTime = addOneHour(currentTime);
      currentTime = endTime;
      return {
        ...entry,
        startTime: startTime,
        endTime: endTime
      };
    });

    updateEntries(finalEntries);
    setDisplayEntries(finalEntries);
    autoSave(finalEntries);
  };

  const updateTask = (entryId: string, taskIndex: number, field: 'content' | 'time', value: string) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        const updatedTasks = [...entry.tasks];
        if (field === 'content') {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], content: value };
        } else {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], time: parseInt(value) || 0 };
        }
        return { ...entry, tasks: updatedTasks };
      }
      return entry;
    });
    updateEntries(updatedEntries);
    setDisplayEntries(updatedEntries);
    autoSave(updatedEntries);
  };


  if (loading) {
    return (
      <div className="time-tracking-sheet">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-tracking-sheet">
        <div className="error">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="time-tracking-sheet" key={`session-${currentSession.id}-${currentSession.sessionDate}`}>
      <div className="main-content">
        <div className="spreadsheet-container">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th>開始</th>
                <th>完了</th>
                <th>作業内容1</th>
                <th>時間1</th>
                <th>作業内容2</th>
                <th>時間2</th>
                <th>作業内容3</th>
                <th>時間3</th>
                <th>合計</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                // テーブル描画時のデバッグログ（最初の3行のみ）
                if (index < 3) {
                  console.log(`entry: ${entry}`);
                  console.log(`🎯 テーブル行 ${index}:`, {
                    entryId: entry.id,
                    startTime: entry.startTime,
                    endTime: entry.endTime,
                    tasksContent: entry.tasks.map(t => t.content).filter(Boolean)
                  });
                }
                
                return (
                <tr key={`${currentSession.id}-${entry.id}-${index}`}>
                  <td>
                    {index === 0 ? (
                      <TimeSelect
                        value={entry.startTime}
                        onChange={handleFirstStartTimeChange}
                      />
                    ) : (
                      <div className="time-display">{entry.startTime}</div>
                    )}
                  </td>
                  <td>
                    <div className="time-display">{entry.endTime}</div>
                  </td>
                  {entry.tasks.map((task, taskIndex) => (
                    <React.Fragment key={taskIndex}>
                      <td>
                        <SpreadsheetCell
                          value={task.content}
                          onChange={(value) => updateTask(entry.id, taskIndex, 'content', value)}
                          placeholder={`作業内容${taskIndex + 1}`}
                        />
                      </td>
                      <td>
                        <TimeInputSelect
                          value={task.time}
                          onChange={(value) => updateTask(entry.id, taskIndex, 'time', value)}
                        />
                      </td>
                    </React.Fragment>
                  ))}
                  <td>
                    <div className="total-time-cell">
                      {entry.tasks.reduce((sum, task) => sum + (task.time || 0), 0)}分
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          <div className="table-controls">
            <button
              className="add-row-btn-bottom"
              onClick={() => insertRowAfter(entries.length - 1)}
              title="一番下に行を追加"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="display-area">
          <h3>工数サマリー</h3>
          <div className="display-content">
            {sortedWorkItems.length === 0 ? (
              <p className="no-data">作業データがありません</p>
            ) : (
              <>
                <div className="work-summary">
                  {sortedWorkItems.map(([content, time]) => (
                    <div key={content} className="work-item">
                      <span className="work-content">{content}</span>
                      <span className="work-time">{formatTimeDisplay(time)}</span>
                    </div>
                  ))}
                </div>
                <div className="total-summary">
                  <div className="total-item">
                    <span className="total-label">合計</span>
                    <span className="total-time">{formatTimeDisplay(totalTime)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingSheet;