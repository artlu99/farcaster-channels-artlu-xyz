type SortDirection = number;
const sortAttributes = ["id", "createdAt"] as const;
type SortAttribute = (typeof sortAttributes)[number];

export interface SortMethod {
  attribute: SortAttribute;
  direction: SortDirection;
}

export const alphaAscendingSortMethod: SortMethod = {
  attribute: "id",
  direction: 1,
};
export const alphaDescendingSortMethod: SortMethod = {
  attribute: "id",
  direction: -1,
};
export const createdAtOldestFirstSortMethod: SortMethod = {
  attribute: "createdAt",
  direction: 1,
};
export const createdAtNewestFirstSortMethod: SortMethod = {
  attribute: "createdAt",
  direction: -1,
};
