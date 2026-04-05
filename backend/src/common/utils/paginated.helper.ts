import { PaginationParams, PaginatedResponse } from '../dto/paginated.dto';

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export function calculatePageSkip(params: PaginationParams): number {
  const page = params.page || 1;
  const limit = params.limit || 10;
  return (page - 1) * limit;
}