import type { Supplement } from '@/types'

/**
 * What every new account starts with on its Supplements row. Seeded once per
 * user (see `seedSupplements`); after that the user's own copy is the truth and
 * changing these values affects new accounts only.
 *
 * Macros are per unit, as a tub label prints them. Whey is a typical
 * unflavoured 30g scoop; creatine monohydrate carries no calories.
 */
const supplements: Supplement[] = [
  {
    id: 'supp:whey',
    name: 'Whey protein',
    unit: 'scoop',
    gramsPerUnit: 30,
    step: 0.5,
    nutrition: { calories: 120, protein: 24, carbs: 3, fat: 1.5 },
    order: 0,
  },
  {
    id: 'supp:creatine',
    name: 'Creatine',
    unit: 'g',
    gramsPerUnit: 1,
    step: 1,
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    order: 1,
  },
]

export default supplements
