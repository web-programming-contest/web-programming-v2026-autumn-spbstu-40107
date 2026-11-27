export type Size = 'S' | 'M' | 'L' | 'XL';

export class ClothingItem {
  id: number;
  name: string;
  size: Size;
  colors: string[];

  constructor(id: number, name: string, size: Size, colors: string[] = []) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.colors = [...colors];
  }

  addColor(color: string) {
    if (!this.colors.includes(color)) {
      this.colors.push(color);
    }
  }

  removeColor(color: string) {
    this.colors = this.colors.filter((item) => item !== color);
  }

  get colorsCount() {
    return this.colors.length;
  }
}

export function groupItemsBySize(items: ClothingItem[]) {
  const groups: Partial<Record<Size, ClothingItem[]>> = {};
  for (const item of items) {
    (groups[item.size] ??= []).push(item);
  }

  return groups;
}

export function getUniqueColors(items: ClothingItem[]) {
  const colors = items.flatMap((item) => item.colors);

  return [...new Set(colors)];
}

export function findItemsByColor(items: ClothingItem[], color: string) {
  return items.filter((item) => item.colors.includes(color));
}

export function groupItemsByColorCount(items: ClothingItem[]) {
  const groups: Record<number, ClothingItem[]> = {};
  for (const item of items) {
    (groups[item.colorsCount] ??= []).push(item);
  }

  return groups;
}

export function findItemsAboveColorCount(items: ClothingItem[], count: number) {
  return items.filter((item) => item.colorsCount > count);
}
