import { useTranslate } from 'i18n-calypso';
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import MainComponent from 'calypso/components/main';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import Categories from 'calypso/my-sites/plugins/categories';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import EducationFooter from 'calypso/my-sites/plugins/education-footer';
import JetpackDisconnectedNotice from 'calypso/my-sites/plugins/jetpack-disconnected-notice';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import PluginsDiscoveryPage from 'calypso/my-sites/plugins/plugins-discovery-page';
import PluginsNavigationHeader from 'calypso/my-sites/plugins/plugins-navigation-header';
import PluginsPageViewTracker from 'calypso/my-sites/plugins/plugins-page-view-tracker';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSitePlan, isJetpackSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const PluginsBrowser = ( { trackPageViews = true, category, search, hideHeader } ) => {
	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();
	const searchRef = useRef( null );

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);

	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );
	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	const translate = useTranslate();

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	if ( ! isRequestingSitesData && noPermissionsError ) {
		return <NoPermissionsError title={ translate( 'Plugins', { textOnly: true } ) } />;
	}

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PluginsPageViewTracker
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />

			<PluginsAnnouncementModal />
			{ ! hideHeader && (
				<PluginsNavigationHeader
					navigationHeaderRef={ navigationHeaderRef }
					categoryName={ categoryName }
					category={ category }
					search={ search }
				/>
			) }
			<JetpackDisconnectedNotice />
			<SearchBoxHeader
				searchRef={ searchRef }
				popularSearchesRef={ searchHeaderRef }
				isSticky={ isAboveElement }
				searchTerm={ search }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			<Categories selected={ category } />
			<div className="plugins-browser__main-container">
				<PluginsDiscoveryPage
					siteSlug={ siteSlug }
					jetpackNonAtomic={ jetpackNonAtomic }
					selectedSite={ selectedSite }
					sitePlan={ sitePlan }
					isVip={ isVip }
					sites={ sites }
				/>
			</div>
			<EducationFooter />
		</MainComponent>
	);
};

export default PluginsBrowser;
