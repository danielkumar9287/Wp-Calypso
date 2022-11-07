import { addQueryArgs } from '@wordpress/url';
import page from 'page';
import 'calypso/state/themes/init';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	// isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	getExternalManagedThemeProduct,
	isPremiumThemeAvailable,
} from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';
import { THEMES_LOADING_CART } from '../action-types';

const isLoadingCart = ( isLoading: boolean ) => ( dispatch: CalypsoDispatch ) => {
	dispatch( {
		type: THEMES_LOADING_CART,
		isLoading,
	} );
};

export function addExternalManagedThemeToCart( themeId: string, siteId: number ) {
	return async ( dispatch: CalypsoDispatch, getState: AppState ) => {
		const siteSlug = getSiteSlug( getState(), siteId );

		const isSiteEligibleForManagedExternalThemes = getIsSiteEligibleForManagedExternalThemes(
			getState(),
			siteId
		);
		// const isExternallyManagedTheme = getIsExternallyManagedTheme( getState(), themeId );
		const externalManagedThemeProduct = getExternalManagedThemeProduct( themeId );
		const isPurchased = isPremiumThemeAvailable( getState(), themeId, siteId );

		let products: Array< any > = [];
		let redirectUrl = `/checkout/${ siteSlug }`;
		const planCycle = 'business-monthly';
		if ( ! isSiteEligibleForManagedExternalThemes && ! isPurchased ) {
			products = [ externalManagedThemeProduct ];
			redirectUrl = `/checkout/${ siteSlug }/${ planCycle }`;
		} else if ( isSiteEligibleForManagedExternalThemes && ! isPurchased ) {
			products = [ externalManagedThemeProduct ];
		}

		const { origin = 'https://wordpress.com' } =
			typeof window !== 'undefined' ? window.location : {};

		redirectUrl = addQueryArgs( redirectUrl, {
			redirect_to: `${ origin }/theme/${ themeId }/${ siteSlug }`,
		} );

		if ( products.length ) {
			dispatch( isLoadingCart( true ) );
			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( siteSlug as string );
			cartManagerClient
				.forCartKey( cartKey )
				.actions.addProductsToCart( products )
				.then( () => {
					page( redirectUrl );
				} )
				.finally( () => {
					dispatch( isLoadingCart( false ) );
				} );
		} else {
			page( redirectUrl );
		}
	};
}
