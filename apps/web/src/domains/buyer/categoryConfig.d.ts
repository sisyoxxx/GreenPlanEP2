export type BuyerCategoryDefinition = {
    code: string;
    label: string;
    icon: string;
    desc: string;
};
export declare const BUYER_CATEGORY_DEFINITIONS: BuyerCategoryDefinition[];
export declare function normalizeBuyerCategory(category: string | null | undefined): string;
export declare function findBuyerCategoryByLabel(label: string | null | undefined): BuyerCategoryDefinition | null;
