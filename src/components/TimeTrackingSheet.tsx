import React from 'react';
import SpreadsheetCell from './SpreadsheetCell';
import TimeSelect from './TimeSelect';
import SessionManager from './SessionManager';
import { useTimeTracking } from '../hooks/useTimeTracking';
import './TimeTrackingSheet.css';

const TimeTrackingSheet: React.FC = () => {
  const {
    currentSession,
    allSessions,
    loading,
    error,
    isSaving,
    saveSession,
    startNewSession,
    loadSession,
    updateEntries,
    calculateTotalHours
  } = useTimeTracking();

  const entries = currentSession.entries;

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
  };

  const resetToDefault = () => {
    startNewSession();
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
      
      <SessionManager
        allSessions={allSessions}
        currentSessionId={currentSession.id}
        isSaving={isSaving}
        onSave={(sessionName) => saveSession(entries, sessionName)}
        onNewSession={startNewSession}
        onLoadSession={loadSession}
        totalHours={calculateTotalHours(entries)}
      />
      
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
              <th>操作</th>
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
                      <SpreadsheetCell
                        type="number"
                        value={task.time}
                        onChange={(value) => updateTask(entry.id, taskIndex, 'time', value)}
                        placeholder="30"
                      />
                    </td>
                  </React.Fragment>
                ))}
                <td>
                  {index === 0 && (
                    <button 
                      onClick={resetToDefault}
                      className="reset-btn"
                    >
                      リセット
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
    </div>
  );
};

export default TimeTrackingSheet;