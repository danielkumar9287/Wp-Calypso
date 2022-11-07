/**
 * Global polyfills
 */
import config from '@automattic/calypso-config';
import '@automattic/calypso-polyfills';
import debugFactory from 'debug';
import page from 'page';
import { QueryClient } from 'react-query';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import consoleDispatcher from 'calypso/state/console-dispatch';
import currentUser from 'calypso/state/current-user/reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setLocale as setLocaleAction } from 'calypso/state/ui/language/actions';
import { hideMasterbar as hideMasterbarAction } from 'calypso/state/ui/masterbar-visibility/actions';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';
import { getUrlParts } from '../../../packages/calypso-url';
import registerStatsPages from './routes';

import 'calypso/assets/stylesheets/style.scss';

const debug = debugFactory( 'calypso' );

const setupContextMiddleware = ( reduxStore, reactQueryClient ) => {
	page( '*', ( context, next ) => {
		// page.js url parsing is broken so we had to disable it with `decodeURLComponents: false`
		const parsed = getUrlParts( context.path );
		const path = parsed.pathname + parsed.search || null;
		context.prevPath = path === context.path ? false : path;
		context.query = Object.fromEntries( parsed.searchParams.entries() );

		context.hashstring = ( parsed.hash && parsed.hash.substring( 1 ) ) || '';
		// set `context.hash` (we have to parse manually)
		if ( context.hashstring ) {
			try {
				context.hash = Object.fromEntries(
					new globalThis.URLSearchParams( context.hashstring ).entries()
				);
			} catch ( e ) {
				debug( 'failed to query-string parse `location.hash`', e );
				context.hash = {};
			}
		} else {
			context.hash = {};
		}

		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		// client version of the isomorphic method for redirecting to another page
		context.redirect = ( httpCode, newUrl = null ) => {
			if ( isNaN( httpCode ) && ! newUrl ) {
				newUrl = httpCode;
			}

			return page.replace( newUrl, context.state, false, false );
		};

		// Break routing and do full load for logout link in /me
		if ( context.pathname === '/wp-login.php' ) {
			window.location.href = context.path;
			return;
		}

		// Some paths live outside of Calypso and should be opened separately
		// Examples: /support, /forums
		// if ( isOutsideCalypso( context.pathname ) ) {
		// 	window.location.href = context.path;
		// 	return;
		// }

		next();
	} );

	page.exit( '*', ( context, next ) => {
		context.store = reduxStore;
		context.queryClient = reactQueryClient;

		next();
	} );
};

const setLocale = ( dispatch ) => {
	const defaultLocale = config( 'i18n_default_locale_slug' ) || 'en';
	const siteLocale = config( 'i18n_locale_slug' );
	dispatch( setLocaleAction( siteLocale ? siteLocale : defaultLocale ) );
};

const hideMasterbar = ( dispatch ) => {
	dispatch( hideMasterbarAction() );
};

async function AppBoot() {
	const siteId = config( 'blog_id' );

	const rootReducer = combineReducers( {
		currentUser,
		sites,
	} );

	const queryClient = new QueryClient();

	const store = createStore(
		rootReducer,
		config( 'intial_state' ) ?? {},
		compose(
			consoleDispatcher,
			addReducerEnhancer,
			applyMiddleware( thunkMiddleware, wpcomApiMiddleware )
		)
	);

	setStore( store );
	setLocale( store.dispatch );
	hideMasterbar( store.dispatch );
	setupContextMiddleware( store, queryClient );

	if ( ! window.location?.hash ) {
		window.location.hash = `#!/stats/day/${ siteId }`;
	}
	registerStatsPages( config( 'admin_page_base' ) );
}
AppBoot();
