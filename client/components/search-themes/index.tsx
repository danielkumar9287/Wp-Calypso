import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import KeyedSuggestions from 'calypso/components/keyed-suggestions';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import StickyPanel from 'calypso/components/sticky-panel';
import { getThemeFilters } from 'calypso/state/themes/selectors';
import { allowSomeThemeFilters, computeEditedSearchElement, insertSuggestion } from './utils';
import type { ThemeFilters } from './types';
import './style.scss';

interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
}

const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch } ) => {
	const searchRef = useRef< Search | null >( null );
	const translate = useTranslate();
	const filters = useSelector( ( state ) =>
		allowSomeThemeFilters( getThemeFilters( state ) as ThemeFilters )
	);
	const [ searchInput, setSearchInput ] = useState( query );
	const [ cursorPosition, setCursorPosition ] = useState( 0 );
	const [ editedSearchElement, setEditedSearchElement ] = useState( '' );
	const [ isApplySearch, setIsApplySearch ] = useState( false );
	const [ isSearchOpen, setIsSearchOpen ] = useState( false );

	const findTextForSuggestions = ( inputValue: string ) => {
		const val = inputValue;
		window.requestAnimationFrame( () => {
			const selectionStart = searchRef.current?.searchInput.selectionStart;
			const [ editedSearchElement, cursorPosition ] = computeEditedSearchElement(
				val,
				selectionStart
			);

			setEditedSearchElement( editedSearchElement );
			setCursorPosition( cursorPosition );
		} );
	};

	const updateInput = ( updatedInput: string ) => {
		setSearchInput( updatedInput );
		setIsApplySearch( true );
		searchRef.current?.clear();
	};

	const focusOnInput = () => {
		searchRef.current?.focus();
	};

	const suggest = ( suggestion: string ) => {
		const updatedInput = insertSuggestion( suggestion, searchInput, cursorPosition );
		updateInput( updatedInput );
		focusOnInput();
	};

	const clearSearch = () => {
		setSearchInput( '' );
		focusOnInput();
	};

	return (
		<div
			className={ classNames( 'search-themes', {
				'has-keyed-suggestions': isSearchOpen,
			} ) }
		>
			<StickyPanel>
				<div
					className="search-themes-card"
					role="presentation"
					data-tip-target="search-themes-card"
				>
					<Search
						initialValue={ searchInput }
						value={ searchInput }
						ref={ searchRef }
						placeholder={ translate( 'Search all themes…' ) }
						analyticsGroup="Themes"
						searchMode={ SEARCH_MODE_ON_ENTER }
						applySearch={ isApplySearch }
						hideClose
						onSearch={ onSearch }
						onSearchOpen={ () => setIsSearchOpen( true ) }
						onSearchClose={ () => setIsSearchOpen( false ) }
						onSearchChange={ ( inputValue: string ) => {
							findTextForSuggestions( inputValue );
							setSearchInput( inputValue );
							setIsApplySearch( false );
						} }
					>
						{ editedSearchElement !== '' && editedSearchElement.length > 2 && (
							<KeyedSuggestions
								input={ editedSearchElement }
								terms={ filters }
								suggest={ suggest }
								exclusions={ [ /twenty.*?two/ ] }
								showAllLabelText={ translate( 'View all' ) }
								showLessLabelText={ translate( 'View less' ) }
							/>
						) }
						{ searchInput !== '' && (
							<div className="search-themes-card__icon">
								<Gridicon
									icon="cross"
									className="search-themes-card__icon-close"
									tabIndex={ 0 }
									aria-controls="search-component-search-themes"
									aria-label={ translate( 'Clear Search' ) }
									onClick={ clearSearch }
								/>
							</div>
						) }
					</Search>
				</div>
			</StickyPanel>
		</div>
	);
};

export default SearchThemes;
