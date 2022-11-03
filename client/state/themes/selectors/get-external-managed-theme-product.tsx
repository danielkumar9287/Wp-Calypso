export type GetExternalManagedThemeProduct = ( themeId: string ) => {
	product_slug: string;
};

/**
 * Creates a new shopping cart item for a External Managed theme.
 *
 * @param themeId he unique string that identifies the product
 * @returns { object } the new item
 */
export const getExternalManagedThemeProduct: GetExternalManagedThemeProduct = (
	themeId: string
) => {
	return {
		product_slug: 'premium_theme',
		meta: themeId,
	};
};
