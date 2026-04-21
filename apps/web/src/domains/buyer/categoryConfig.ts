export type BuyerCategoryDefinition = {
  code: string
  label: string
  icon: string
  desc: string
}

export const BUYER_CATEGORY_DEFINITIONS: BuyerCategoryDefinition[] = [
  { code: '蔬菜种子', label: '蔬菜种子', icon: '🥬', desc: '适合阳台菜园和家庭种植' },
  { code: '花卉种子', label: '花卉种子', icon: '🌸', desc: '打造四季开花的家庭花园' },
  { code: '草本植物', label: '草本植物', icon: '🌿', desc: '包含香草与常见草本类品种' },
  { code: '多肉植物', label: '多肉植物', icon: '🪴', desc: '适合桌面与窗台的耐养植物' },
  { code: '种植工具', label: '种植工具', icon: '🧰', desc: '播种、浇灌和日常养护工具' },
  { code: '营养肥料', label: '营养肥料', icon: '🌱', desc: '营养土、肥料和促生长用品' }
]

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  VEGETABLE: '蔬菜种子',
  FLOWER: '花卉种子',
  HERB: '草本植物',
  FRUIT: '草本植物',
  TOOL: '种植工具',
  FERTILIZER: '营养肥料',
  SUCCULENT: '多肉植物',
  香草种子: '草本植物',
  水果种子: '草本植物',
  园艺工具: '种植工具'
}

export function normalizeBuyerCategory(category: string | null | undefined) {
  if (!category) return '未分类'
  return CATEGORY_ALIAS_MAP[category] ?? category
}

export function findBuyerCategoryByLabel(label: string | null | undefined) {
  if (!label) return null
  const normalized = normalizeBuyerCategory(label)
  return BUYER_CATEGORY_DEFINITIONS.find((item) => item.label === normalized) ?? null
}
