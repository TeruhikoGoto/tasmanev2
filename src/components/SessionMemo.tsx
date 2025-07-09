import React, { useState, useRef, useEffect } from 'react';
import './SessionMemo.css';

interface SessionMemoProps {
  memo: string;
  onMemoChange: (memo: string) => Promise<void>;
}

const SessionMemo: React.FC<SessionMemoProps> = ({ memo, onMemoChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMemo, setTempMemo] = useState(memo || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // propsのmemoが変更された時にtempMemoを更新
  useEffect(() => {
    setTempMemo(memo || '');
  }, [memo]);

  // 編集モードに入った時にテキストエリアにフォーカス
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // カーソルを末尾に移動
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  // 自動保存（デバウンス付き）
  const autoSave = (value: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onMemoChange(value);
        console.log('📝 メモの自動保存完了');
      } catch (error) {
        console.error('メモの自動保存エラー:', error);
      }
    }, 1000); // 1秒後に保存
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsEditing(false);
    try {
      await onMemoChange(tempMemo);
      console.log('📝 メモの手動保存完了');
    } catch (error) {
      console.error('メモの手動保存エラー:', error);
    }
    // 保存タイマーをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempMemo(memo || '');
    // 保存タイマーをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTempMemo(value);
    autoSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="session-memo">
      <div className="memo-header">
        <h4>セッションメモ</h4>
        {!isEditing && (
          <button 
            type="button"
            className="memo-edit-btn"
            onClick={handleEdit}
            title="メモを編集"
          >
            編集
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="memo-editing">
          <textarea
            ref={textareaRef}
            className="memo-textarea"
            value={tempMemo}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="セッションのメモを入力してください..."
            rows={6}
          />
          <div className="memo-actions">
            <button 
              type="button"
              className="memo-save-btn"
              onClick={handleSave}
              title="保存 (Ctrl+Enter)"
            >
              保存
            </button>
            <button 
              type="button"
              className="memo-cancel-btn"
              onClick={handleCancel}
              title="キャンセル (Esc)"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="memo-display">
          {memo ? (
            <div className="memo-content">
              {memo.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>
          ) : (
            <div className="memo-placeholder">
              メモがありません
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionMemo;