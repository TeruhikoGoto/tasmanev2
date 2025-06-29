import React, { useEffect, useRef } from 'react';
import SpreadsheetCell from './SpreadsheetCell';
import TimeSelect from './TimeSelect';
import TimeInputSelect from './TimeInputSelect';
import { useTimeTracking } from '../hooks/useTimeTracking';
import './TimeTrackingSheet.css';

const TimeTrackingSheet: React.FC = () => {
  const {
    currentSession,
    loading,
    error,
    saveSession,
    updateEntries,
    insertRowAfter
  } = useTimeTracking();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const entries = currentSession.entries;

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

  // 工数サマリーを生成する関数
  const generateWorkSummary = () => {
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
  };

  const workSummary = generateWorkSummary();
  const sortedWorkItems = Object.entries(workSummary)
    .sort(([, a], [, b]) => b - a);
  const totalTime = Object.values(workSummary).reduce((sum, time) => sum + time, 0);

  // 自動保存関数
  const autoSave = async (updatedEntries: any[]) => {
    // 既存のタイマーをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 1秒後に保存実行
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveSession(updatedEntries);
      } catch (error) {
        console.error('自動保存エラー:', error);
      }
    }, 1000);
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
    <div className="time-tracking-sheet">
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
              {entries.map((entry, index) => (
                <tr key={entry.id}>
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
              ))}
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