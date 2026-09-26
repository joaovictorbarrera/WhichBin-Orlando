export interface Item {
  id: number;
  name: string;
  recycleable: boolean;
  information: string;
  createdAt?: string;
}

const MOCK_ITEMS: Item[] = [
  {
    id: 1,
    name: 'Plastic Water Bottle',
    recycleable: true,
    information: 'Empty, rinse, and replace the cap before placing in the blue bin.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Pizza Box (Greasy)',
    recycleable: false,
    information: 'Soiled cardboard cannot be recycled due to grease contamination. Dispose in regular trash.',
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 3,
    name: 'Aluminum Soda Can',
    recycleable: true,
    information: 'Rinse lightly. Accepted in all curbside recycling containers.',
    createdAt: '2026-09-03T14:15:00Z',
  },
  {
    id: 4,
    name: 'Alkaline Batteries',
    recycleable: false,
    information: 'Single-use alkaline batteries belong in household trash or at designated hazardous drop-off centers.',
    createdAt: '2026-09-04T09:00:00Z',
  },
];

export async function fetchItems(searchText = '', recycleable?: boolean): Promise<Item[]> {
  try {
    const params = new URLSearchParams();
    if (searchText) params.append('searchText', searchText);
    if (recycleable !== undefined) params.append('recycleable', String(recycleable));

    const response = await fetch(`/api/item?${params.toString()}`);
    if (!response.ok) throw new Error('API offline');
    return await response.json();
  } catch {
    // Graceful fallback to mock data when backend endpoint isn't ready
    return MOCK_ITEMS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter = recycleable === undefined || item.recycleable === recycleable;
      return matchesSearch && matchesFilter;
    });
  }
}

export async function fetchItemById(id: string | number): Promise<Item> {
  try {
    const response = await fetch(`/api/item/${id}`);
    if (!response.ok) throw new Error('API offline');
    return await response.json();
  } catch {
    const item = MOCK_ITEMS.find((i) => i.id === Number(id));
    if (!item) throw new Error('Item not found');
    return item;
  }
}