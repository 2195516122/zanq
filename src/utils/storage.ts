// LocalStorage 封装，V2.0 时可替换为 API 调用

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage 写入失败，可能已满：', e);
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function clearAll(): void {
  localStorage.clear();
}
