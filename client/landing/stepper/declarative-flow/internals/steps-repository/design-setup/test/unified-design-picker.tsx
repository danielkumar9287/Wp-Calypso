/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as wpcomProxyRequest from 'wpcom-proxy-request';
import wpcomXhrRequest from 'wpcom-xhr-request';
import {
	MOCKED_SITE,
	generateMockedStarterDesignDetails,
	generateMockedStarterDesigns,
} from '../mocks';
import UnifiedDesignPickerStep from '../unified-design-picker';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn( () => false ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/designSetup',
		search: '?siteSlug=test.wordpress.com',
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( 'wpcom-proxy-request', () => jest.requireActual( 'wpcom-proxy-request' ) );

jest.mock( '../../../../../hooks/use-site', () => ( {
	useSite: () => MOCKED_SITE,
} ) );

/**
 * Mock wpcom-proxy-request so that we could use wpcom-xhr-request to call the endpoint
 * and get the response from nock
 */
jest
	.spyOn( wpcomProxyRequest, 'default' )
	.mockImplementation(
		( ...args ) =>
			new Promise( ( resolve, reject ) =>
				wpcomXhrRequest( ...args, ( err, res ) => ( err ? reject( err ) : resolve( res ) ) )
			)
	);

const middlewares = [ thunk ];

const mockStore = configureStore( middlewares );

const renderComponent = ( component, initialState = {} ) => {
	const queryClient = new QueryClient();
	const store = mockStore( {
		purchases: {},
		...initialState,
	} );

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ component }</QueryClientProvider>
		</Provider>
	);
};

describe( 'UnifiedDesignPickerStep', () => {
	let originalScrollTo;
	const user = userEvent.setup();

	const navigation = {
		goBack: jest.fn(),
		goNext: jest.fn(),
		submit: jest.fn(),
	};

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = jest.fn();

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/starter-designs' )
			.query( true )
			.reply( 200, generateMockedStarterDesigns );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( /\/wpcom\/v2\/starter-designs\/\w+/ )
			.query( true )
			.reply( 200, generateMockedStarterDesignDetails );
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;

		nock.cleanAll();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basics', () => {
		it( 'should render successfully', async () => {
			const { container } = renderComponent(
				<UnifiedDesignPickerStep flow="site-setup" navigation={ navigation } />
			);

			await waitFor( () => {
				expect( screen.getByText( 'Pick a design' ) ).toBeInTheDocument();
				expect(
					container.getElementsByClassName( 'unified-design-picker__standard-designs' )
				).toHaveLength( 1 );
			} );
		} );
	} );

	describe( 'Skip for now', () => {
		it( 'should call submit successfully', async () => {
			renderComponent( <UnifiedDesignPickerStep flow="site-setup" navigation={ navigation } /> );

			await waitFor( () => screen.getByText( 'Pick a design' ) );
			await user.click( screen.getByText( 'Skip for now' ) );

			expect( navigation.submit ).toHaveBeenCalled();
		} );
	} );
} );