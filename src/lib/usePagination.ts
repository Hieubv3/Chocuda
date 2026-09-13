import { useEffect, useMemo, useState } from 'react';

const VALID_SIZES = [20, 100, 200];

/**
 * Hook phân trang: mặc định 20 bài/trang, lưu lựa chọn vào localStorage.
 * Bài mới nhất nằm ở trang 1 (danh sách đầu vào phải đã sắp xếp mới nhất trước).
 */
export function usePagination<T>(items: T[], storageKey: string, defaultSize = 20) {
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem(storageKey));
      return VALID_SIZES.includes(v) ? v : defaultSize;
    } catch {
      return defaultSize;
    }
  });
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Đảm bảo trang hiện tại hợp lệ khi dữ liệu thay đổi
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
    try {
      localStorage.setItem(storageKey, String(size));
    } catch {
      /* ignore */
    }
  };

  return { page, pageSize, total, totalPages, pageItems, setPage, changePageSize };
}
