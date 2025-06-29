import React, { useState } from 'react';
import { TimeTrackingSession, SessionsByDate } from '../types/TimeEntry';
import { formatDateForDisplay, getMonthFromDate } from '../utils/dateUtils';
import './SessionSidebar.css';

interface SessionSidebarProps {
  sessionsByDate: SessionsByDate;
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  loading: boolean;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessionsByDate,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  loading
}) => {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
      // 年を閉じる時は、その年の月もすべて閉じる
      Object.keys(sessionsByDate[year] || {}).forEach(month => {
        const monthKey = `${year}-${month}`;
        expandedMonths.delete(monthKey);
      });
      setExpandedMonths(new Set(expandedMonths));
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleMonth = (year: string, month: string) => {
    const monthKey = `${year}-${month}`;
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const years = Object.keys(sessionsByDate || {}).sort((a, b) => parseInt(b) - parseInt(a));

  if (loading) {
    return (
      <div className="session-sidebar">
        <div className="sidebar-header">
          <h2>セッション履歴</h2>
        </div>
        <div className="sidebar-loading">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="session-sidebar">
      <div className="sidebar-header">
        <h2>セッション履歴</h2>
        <button onClick={onNewSession} className="new-session-btn">
          新規セッション
        </button>
      </div>

      <div className="sidebar-content">
        {years.length === 0 ? (
          <div className="no-sessions">
            <p>セッションがありません</p>
            <button onClick={onNewSession} className="create-first-session-btn">
              最初のセッションを作成
            </button>
          </div>
        ) : (
          <div className="session-tree">
            {years.map(year => (
              <div key={year} className="year-group">
                <div 
                  className={`year-header ${expandedYears.has(year) ? 'expanded' : ''}`}
                  onClick={() => toggleYear(year)}
                >
                  <span className="expand-icon">
                    {expandedYears.has(year) ? '▼' : '▶'}
                  </span>
                  <span className="year-title">{year}年</span>
                  <span className="year-count">
                    ({Object.values(sessionsByDate[year] || {}).flat().length})
                  </span>
                </div>

                {expandedYears.has(year) && (
                  <div className="year-content">
                    {Object.keys(sessionsByDate[year] || {})
                      .sort((a, b) => b.localeCompare(a))
                      .map(month => {
                        const monthKey = `${year}-${month}`;
                        const sessions = sessionsByDate[year][month] || [];
                        const monthName = getMonthFromDate(`${month}-01`);

                        return (
                          <div key={month} className="month-group">
                            <div 
                              className={`month-header ${expandedMonths.has(monthKey) ? 'expanded' : ''}`}
                              onClick={() => toggleMonth(year, month)}
                            >
                              <span className="expand-icon">
                                {expandedMonths.has(monthKey) ? '▼' : '▶'}
                              </span>
                              <span className="month-title">{monthName}</span>
                              <span className="month-count">({sessions.length})</span>
                            </div>

                            {expandedMonths.has(monthKey) && (
                              <div className="month-content">
                                {sessions.map((session: TimeTrackingSession) => {
                                  if (!session || !session.id) {
                                    return null; // 無効なセッションをスキップ
                                  }
                                  
                                  return (
                                    <div
                                      key={session.id}
                                      className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
                                      onClick={() => session.id && onSessionSelect(session.id)}
                                    >
                                      <div className="session-name">
                                        {session.sessionDate || '日付不明'}
                                      </div>
                                      <div className="session-meta">
                                        <span className="session-date">
                                          {formatDateForDisplay(session.sessionDate)}
                                        </span>
                                        <span className="session-hours">
                                          {session.totalHours || 0}分
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionSidebar;