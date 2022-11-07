import { AppState } from 'calypso/types';

export function getIsLoadingCart( state: AppState ): boolean {
	return state?.themes?.isLoadingCart;
}
