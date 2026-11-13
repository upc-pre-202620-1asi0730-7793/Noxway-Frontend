export interface PagedResource<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}
