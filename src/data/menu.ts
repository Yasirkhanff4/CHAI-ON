import type { MenuOption, Product, SugarLevel, TeaStrength } from '@/types'

export const MENU_CATEGORIES = ['Chai', 'Coffee', 'Bites', 'Combos'] as const
export type MenuCategory = (typeof MENU_CATEGORIES)[number]

export type ChayonMenuItem = {
  name: string
  category: MenuCategory
  price: number
  description: string
  sortOrder: number
}

/**
 * The CHAYON menu. The same list powers the built-in launch catalog and the
 * one-click admin import, so both always show the same names, prices and order.
 */
export const CHAYON_MENU: ChayonMenuItem[] = [
  {
    name: 'Doodh Patti',
    category: 'Chai',
    price: 80,
    description: 'Milk tea, slow simmered.',
    sortOrder: 10,
  },
  {
    name: 'Karak Chai',
    category: 'Chai',
    price: 100,
    description: 'Strong tea, boiled with cardamom.',
    sortOrder: 20,
  },
  {
    name: 'Elaichi Chai',
    category: 'Chai',
    price: 100,
    description: 'Milk tea with green cardamom.',
    sortOrder: 30,
  },
  {
    name: 'Green Tea',
    category: 'Chai',
    price: 60,
    description: 'Light and clear.',
    sortOrder: 40,
  },
  {
    name: 'Cappuccino',
    category: 'Coffee',
    price: 180,
    description: 'Espresso with steamed milk.',
    sortOrder: 110,
  },
  {
    name: 'Cold Coffee',
    category: 'Coffee',
    price: 250,
    description: 'Chilled coffee with milk.',
    sortOrder: 120,
  },
  {
    name: 'Chicken Nuggets 6 pcs',
    category: 'Bites',
    price: 300,
    description: 'Six pieces.',
    sortOrder: 210,
  },
  {
    name: 'Chicken Nuggets 10 pcs',
    category: 'Bites',
    price: 450,
    description: 'Ten pieces.',
    sortOrder: 220,
  },
  {
    name: 'Cake Rusk 4 pcs',
    category: 'Bites',
    price: 80,
    description: 'Four pieces of cake rusk.',
    sortOrder: 230,
  },
  {
    name: 'Chai + Cake Rusk',
    category: 'Combos',
    price: 150,
    description: 'One chai with cake rusk.',
    sortOrder: 310,
  },
  {
    name: 'Chai + Nuggets 6 pcs',
    category: 'Combos',
    price: 350,
    description: 'One chai with six nuggets.',
    sortOrder: 320,
  },
]

const PRODUCT_IMAGES: Record<string, { imageUrl: string; imagePosition?: string; badge?: string }> = {
  'Doodh Patti': {
    imageUrl: '/images/doodh-patti.jpg',
    imagePosition: '50% 58%',
    badge: 'House classic',
  },
  'Karak Chai': {
    imageUrl: '/images/karak-chai.jpg',
    imagePosition: '50% 52%',
    badge: 'Bold and spiced',
  },
}

function slugifyMenuName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

export const featuredProducts: Product[] = CHAYON_MENU.map((item) => {
  const image = PRODUCT_IMAGES[item.name]
  return {
    id: slugifyMenuName(item.name),
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: image?.imageUrl ?? '/images/chayon-placeholder.webp',
    imagePosition: image?.imagePosition,
    badge: image?.badge,
    isAvailable: true,
    isActive: true,
    sortOrder: item.sortOrder,
  }
})

const KNOWN_CATEGORIES = new Map<string, MenuCategory>(
  CHAYON_MENU.map((item) => [item.name.trim().toLowerCase(), item.category]),
)

/**
 * Products do not carry a category field in the existing schema. The menu tabs
 * classify by name: the CHAYON menu names are mapped exactly, and other admin
 * products fall back to simple keywords.
 */
export function categoryForProduct(product: { name: string }): MenuCategory {
  const key = product.name.trim().toLowerCase()
  const known = KNOWN_CATEGORIES.get(key)
  if (known) return known

  if (/\b(combo|with|\+)\b/.test(key)) return 'Combos'
  if (/\b(coffee|cappuccino|latte|espresso|mocha|frappe)\b/.test(key)) return 'Coffee'
  if (/\b(nugget|rusk|cake|bite|sandwich|fries|samosa|roll|snack)\b/.test(key)) return 'Bites'
  return 'Chai'
}

export function supportsTeaOptions(category: MenuCategory): boolean {
  return category === 'Chai' || category === 'Coffee'
}

export const sugarOptions: MenuOption<SugarLevel>[] = [
  { value: 'none', label: 'No Sugar' },
  { value: 'less', label: 'Less Sugar' },
  { value: 'normal', label: 'Normal Sugar' },
  { value: 'extra', label: 'Extra Sugar' },
]

export const strengthOptions: MenuOption<TeaStrength>[] = [
  { value: 'light', label: 'Light' },
  { value: 'normal', label: 'Normal' },
  { value: 'strong', label: 'Strong' },
]

export const defaultSugar: SugarLevel = 'normal'
export const defaultStrength: TeaStrength = 'normal'

export function sugarLabel(value: SugarLevel): string {
  return sugarOptions.find((option) => option.value === value)?.label ?? value
}

export function strengthLabel(value: TeaStrength): string {
  return strengthOptions.find((option) => option.value === value)?.label ?? value
}
