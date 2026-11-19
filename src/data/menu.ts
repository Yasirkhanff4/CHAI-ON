import type { MenuOption, Product, SugarLevel, TeaStrength } from '@/types'

export const featuredProducts: Product[] = [
  {
    id: 'doodh-patti',
    name: 'Doodh Patti',
    description: 'Slow-simmered milk tea, smooth and creamy.',
    price: 150,
    imageUrl: '/images/doodh-patti.jpg',
    imagePosition: '50% 58%',
    badge: 'House classic',
    isAvailable: true,
  },
  {
    id: 'karak-chai',
    name: 'Karak Chai',
    description: 'Strong tea boiled with cardamom, served hot.',
    price: 180,
    imageUrl: '/images/karak-chai.jpg',
    imagePosition: '50% 52%',
    badge: 'Bold & spiced',
    isAvailable: true,
  },
]

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
