export const compressImageFile = (
  file: File,
  maxWidth = 1200,
  maxHeight = 900,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  });
};

export const safeLocalStorageSet = (key: string, value: any) => {
  try {
    const json = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, json);
  } catch (e) {
    console.warn(`localStorage quota exceeded for key "${key}". Cleaning cache...`, e);
    try {
      // Clear non-essential items to free up browser storage
      localStorage.removeItem('hb_saved_properties');
      const json = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (err) {
      console.warn(`Could not save key "${key}" to localStorage due to browser storage limits.`, err);
    }
  }
};

export const safeLocalStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed ?? fallback;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}":`, e);
    return fallback;
  }
};
