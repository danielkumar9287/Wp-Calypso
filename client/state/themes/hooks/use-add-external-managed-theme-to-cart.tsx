import { useShoppingCart } from '@automattic/shopping-cart';
import { addQueryArgs } from '@wordpress/url';
import page from 'page';
import { useState } from 'react';
import 'calypso/state/themes/init';
import { useSelector } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getExternalManagedThemeProduct } from '../selectors/get-external-managed-theme-product';

export type AddExternalManagedThemeToCartFunction = () => void;
export type UseAddExternalManagedThemeToCart = {
	id: string;
	siteSlug: string;
	siteEligibleForManagedExternalThemes: boolean;
	isPurchased: boolean;
};

/**
 * Adds a External Managed theme to the cart.
 *
 * @param {UseAddExternalManagedThemeToCart} options Options object
 * @returns {[ AddExternalManagedThemeToCartFunction, boolean ]}
 */
export function useAddExternalManagedThemeToCart( {
	id,
	siteSlug,
	siteEligibleForManagedExternalThemes,
	isPurchased,
}: UseAddExternalManagedThemeToCart ): [ AddExternalManagedThemeToCartFunction, boolean ] {
	const [ isLoading, setIsLoading ] = useState< boolean >( false );

	const cartKey = useCartKey();
	const { addProductsToCart } = useShoppingCart( cartKey );

	const externalManagedThemeProduct = useSelector( () => {
		return getExternalManagedThemeProduct( id );
	} );

	const addExternalManagedThemeToCart: AddExternalManagedThemeToCartFunction = () => {
		let products: Array< any > = [];
		let redirectUrl = `/checkout/${ siteSlug }`;
		const planCycle = 'business-monthly';
		if ( ! siteEligibleForManagedExternalThemes && ! isPurchased ) {
			products = [ externalManagedThemeProduct ];
			redirectUrl = `/checkout/${ siteSlug }/${ planCycle }`;
		} else if ( siteEligibleForManagedExternalThemes && ! isPurchased ) {
			products = [ externalManagedThemeProduct ];
		}

		const { origin = 'https://wordpress.com' } =
			typeof window !== 'undefined' ? window.location : {};

		redirectUrl = addQueryArgs( redirectUrl, {
			redirect_to: `${ origin }/theme/${ id }/${ siteSlug }`,
		} );

		if ( products.length ) {
			setIsLoading( true );
			addProductsToCart( products )
				.then( () => {
					page( redirectUrl );
				} )
				.finally( () => {
					setIsLoading( false );
				} );
		} else {
			page( redirectUrl );
		}
	};

	return [ addExternalManagedThemeToCart, isLoading ];
}
