/**
 * Создает объект Date из строки, компенсируя двойную конвертацию часового пояса
 * @param dateString - строка с датой
 * @returns объект Date
 */
function parseAsUTC(dateString: string): Date {
  const trimmed = dateString.trim();

  if (trimmed.endsWith('Z')) {
    const date = new Date(trimmed);
    const correctedDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return correctedDate;
  }

  if (trimmed.includes('+') || trimmed.match(/-\d{2}:\d{2}$/)) {
    return new Date(trimmed);
  }

  return new Date(trimmed);
}

/**
 * Форматирует дату и время в местное время пользователя с русской локалью
 * @param dateString - строка с датой
 * @returns отформатированная строка даты и времени
 */
export function formatDateTime(dateString: string): string {
  const date = parseAsUTC(dateString);

  if (isNaN(date.getTime())) {
    return 'Неверная дата';
  }

  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Форматирует только дату в местное время с русской локалью
 * @param dateString - строка с датой
 * @returns отформатированная строка даты
 */
export function formatDate(dateString: string): string {
  const date = parseAsUTC(dateString);

  if (isNaN(date.getTime())) {
    return 'Неверная дата';
  }

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Форматирует только время в местное время с русской локалью
 * @param dateString - строка с датой
 * @returns отформатированная строка времени
 */
export function formatTime(dateString: string): string {
  const date = parseAsUTC(dateString);

  if (isNaN(date.getTime())) {
    return 'Неверное время';
  }

  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Форматирует дату и время раздельно (дата и время на разных строках или с разделителем)
 * @param dateString - строка с датой
 * @returns объект с отформатированными датой и временем
 */
export function formatDateTimeSeparate(dateString: string): { date: string; time: string } {
  return {
    date: formatDate(dateString),
    time: formatTime(dateString),
  };
}
