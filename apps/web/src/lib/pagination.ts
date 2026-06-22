export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

export function calculateRange(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}
