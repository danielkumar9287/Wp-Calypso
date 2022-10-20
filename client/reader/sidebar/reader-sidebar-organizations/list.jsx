import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import IconSidebarA8c from 'calypso/assets/images/reader/sidebar/a8c.svg';
import IconSidebarP2s from 'calypso/assets/images/reader/sidebar/p2s.svg';
import SidebarItem from 'calypso/layout/sidebar/item';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import { toggleReaderSidebarOrganization } from 'calypso/state/reader-ui/sidebar/actions';
import getOrganizationSites from 'calypso/state/reader/follows/selectors/get-reader-follows-organization';
import { AUTOMATTIC_ORG_ID } from 'calypso/state/reader/organizations/constants';
import '../style.scss';

export class ReaderSidebarOrganizationsList extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		organization: PropTypes.object,
		sites: PropTypes.array,
		teams: PropTypes.array,
	};

	renderIcon() {
		const { organization } = this.props;
		if ( organization.id === AUTOMATTIC_ORG_ID ) {
			return IconSidebarA8c;
		}
		return IconSidebarP2s;
	}

	render() {
		const { organization, path } = this.props;

		if ( ! organization.sites_count ) {
			return null;
		}
		return (
			<SidebarItem
				className={ ReaderSidebarHelper.itemLinkClass( '/read/' + organization.slug, path, {
					'sidebar-streams__all': true,
				} ) }
				label={ organization.title }
				link={ '/read/' + organization.slug }
				customSvg={ this.renderIcon() }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			sites: getOrganizationSites( state, ownProps.organization.id ), // get p2 network organizations
		};
	},
	{
		toggleReaderSidebarOrganization,
	}
)( localize( ReaderSidebarOrganizationsList ) );
