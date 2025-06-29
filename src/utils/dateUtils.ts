export const getTodayString = (): string => {
  try {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.error('Error getting today string:', error);
    return '2024-01-01'; // フォールバック
  }
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return '無効な日付';
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '無効な日付';
    }
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '無効な日付';
  }
};

export const getYearFromDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return getTodayString().split('-')[0]; // 今年をフォールバック
  }
  
  try {
    const parts = dateString.split('-');
    if (parts.length >= 1) {
      return parts[0];
    }
    return getTodayString().split('-')[0];
  } catch (error) {
    console.error('Error getting year from date:', error, dateString);
    return getTodayString().split('-')[0];
  }
};

export const getMonthFromDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return '1月'; // フォールバック
  }
  
  try {
    const parts = dateString.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      
      if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('ja-JP', { month: 'long' });
      }
    }
    return '1月';
  } catch (error) {
    console.error('Error getting month from date:', error, dateString);
    return '1月';
  }
};

export const getMonthKey = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    return getTodayString().substring(0, 7); // YYYY-MM
  }
  
  try {
    if (dateString.length >= 7) {
      return dateString.substring(0, 7); // YYYY-MM
    }
    return getTodayString().substring(0, 7);
  } catch (error) {
    console.error('Error getting month key:', error, dateString);
    return getTodayString().substring(0, 7);
  }
};

export const sortSessionsByDate = (a: any, b: any): number => {
  try {
    const dateA = a?.sessionDate || getTodayString();
    const dateB = b?.sessionDate || getTodayString();
    
    const timeA = new Date(dateA).getTime();
    const timeB = new Date(dateB).getTime();
    
    if (isNaN(timeA) || isNaN(timeB)) {
      return 0; // ソート順を変更しない
    }
    
    return timeB - timeA; // 新しい順
  } catch (error) {
    console.error('Error sorting sessions by date:', error, a, b);
    return 0;
  }
};