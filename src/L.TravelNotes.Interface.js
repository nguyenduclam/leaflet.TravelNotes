/*
Copyright - 2017 - Christian Guyette - Contact: http//www.ouaie.be/

This  program is free software;
you can redistribute it and/or modify it under the terms of the 
GNU General Public License as published by the Free Software Foundation;
either version 3 of the License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

( function ( ){
	
	'use strict';
	
	
	L = L || {};
	L.TravelNotes = L.TravelNotes || {};
	L.travelNotes = L.travelNotes || {};
	
	var _LeftUserContextMenu = [];
	var _RightUserContextMenu = [];
	var _RightContextMenu = false;
	var _LeftContextMenu = false;
	
	var _Langage = '';
	var _DataManager = require ( './data/DataManager' ) ( );
	var _Utilities = require ( './util/Utilities' ) ( );

	
	/* 
	--- L.TravelNotes.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use TravelNotes :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.TravelNotes.getInterface = function ( ) {

		
		var _ReadURL = function ( ) {
			var urlSearch = decodeURI ( window.location.search ).substr ( 1 ).split ( '&' );
			var newUrlSearch = '?' ;
			for ( var urlCounter = 0; urlCounter < urlSearch.length; urlCounter ++ ) {
				var param = urlSearch [ urlCounter ].split ( '=' );
				if ( ( 2 === param.length ) && ( -1 !== param [ 0 ].indexOf ( 'ProviderKey' ) ) ) {
					if ( _Utilities.storageAvailable ( 'sessionStorage' ) ) {
						sessionStorage.setItem ( 
							param [ 0 ].substr ( 0, param [ 0 ].length - 11 ).toLowerCase ( ),
							btoa ( param [ 1 ] )
						);
					}
				}
				else if ( ( 2 === param.length ) && 'lng' === param [ 0 ].toLowerCase ( ) ) {
					_Langage = param [ 1 ].toLowerCase ( );
				}
				else {
					newUrlSearch += ( newUrlSearch === '?' ) ? '' :  '&';
					newUrlSearch += urlSearch [ urlCounter ];
				}
			}
			var stateObj = { index: "bar" };
			history.pushState(stateObj, "page", newUrlSearch );
		};

		var onMapClick = function ( event ) {
			require ('./UI/ContextMenu' ) ( 
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _LeftUserContextMenu ) 
			);
		};
		var onMapContextMenu = function ( event ) {
			require ('./UI/ContextMenu' ) (
				event, 
				require ( './core/RouteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] )
				.concat ( require ( './core/NoteEditor' ) ( ).getMapContextMenu ( [ event.latlng.lat, event.latlng.lng ] ) )
				.concat ( _RightUserContextMenu )
			);
		};

		return {

			addControl : function ( map, divControlId, options ) {
				
				_DataManager.init ( map );
				_ReadURL ( );

				var configHttpRequest = new XMLHttpRequest ( );
				configHttpRequest.onreadystatechange = function ( event ) {
					if ( this.readyState === configHttpRequest.DONE ) {
						if ( this.status === 200 ) {
							try {
								_DataManager.config = JSON.parse ( this.responseText );
								
								console.log ( _DataManager.config );
								
								if ( '' !== _Langage ) {
									_DataManager.config.language = _Langage;
								}
								_DataManager.travel = require ( './data/Travel' ) ( );

								var translationsHttpRequest = new XMLHttpRequest ( );
								translationsHttpRequest.onreadystatechange = function ( event ) {
									if ( this.readyState === translationsHttpRequest.DONE ) {
										if ( this.status === 200 ) {
											try {
												require ( './UI/Translator' ) ( ).setTranslations ( JSON.parse ( this.responseText ) );
											}
											catch ( e ) {
												console.log ( 'Not possible to parse ' + _DataManager.config.language.toLowerCase ( ) + '.json' );
											}
										}
										else {
											console.log ( 'Not possible to load ' + _DataManager.config.language.toLowerCase ( ) + '.json' );
										}
										if ( divControlId )	{
											document.getElementById ( divControlId ).appendChild ( require ( './UI/UserInterface' ) ( ).UI );
										}	
										else {
											if ( typeof module !== 'undefined' && module.exports ) {
												map.addControl ( require ('./L.TravelNotes.Control' ) ( options ) );
											}
										}
										require ( './UI/TravelEditorUI' ) ( ).setRoutesList ( _DataManager.travel.routes );
										require ( './core/TravelEditor' ) ( ).openServerTravel ( );
									}
								};
								translationsHttpRequest.open ( 
									'GET',
									window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) + _DataManager.config.language.toLowerCase ( ) + '.json',
									true
								);
								translationsHttpRequest.send ( null );
							}
							catch ( e ) {
								console.log ( 'Not possible to parse config.json' );
							}
						} 
						else {
							console.log ( 'Not possible to load config.json' );
						}
					}
				};
				configHttpRequest.open ( 
					'GET',
					window.location.href.substr (0, window.location.href.lastIndexOf( '/') + 1 ) +'config.json',
					true
				);
				configHttpRequest.send ( null );

			},
			
			addMapContextMenu : function ( leftButton, rightButton ) {
				if ( leftButton ) {
					_DataManager.map.on ( 'click', onMapClick );
				}
				if ( rightButton ) {
					_DataManager.map.on ( 'contextmenu', onMapClick );
				}
			},
			get rightContextMenu ( ) { return _RightContextMenu; },
			
			set rightContextMenu ( RightContextMenu ) { 
				if  ( ( RightContextMenu ) && ( ! _RightContextMenu ) ) {
					_DataManager.map.on ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = true;
				}
				else if ( ( ! RightContextMenu ) && ( _RightContextMenu ) ) {
					_DataManager.map.off ( 'contextmenu', onMapContextMenu );
					_RightContextMenu = false;
				}
			},
			
			get leftContextMenu ( ) { return _LeftContextMenu; },
			
			set leftContextMenu ( LeftContextMenu ) { 
				if  ( ( LeftContextMenu ) && ( ! _LeftContextMenu ) ) {
					_DataManager.map.on ( 'click', onMapClick );
					_LeftContextMenu = true;
				}
				else if ( ( ! LeftContextMenu ) && ( _LeftContextMenu ) ) {
					_DataManager.map.off ( 'click', onMapClick );
					_LeftContextMenu = false;
				}
			},
			
			get leftUserContextMenu ( ) { return _LeftUserContextMenu; },
			
			set leftUserContextMenu ( LeftUserContextMenu ) {_LeftUserContextMenu = LeftUserContextMenu; },
			
			get rightUserContextMenu ( ) { return _RightUserContextMenu; },
			
			set rightUserContextMenu ( RightUserContextMenu ) {_RightUserContextMenu = RightUserContextMenu; },
			
			addProvider : function ( provider ) { 
			
				if ( ! global.providers ) {
					global.providers = new Map ( );
				}
				global.providers.set ( provider.name.toLowerCase( ), provider );
			},
			
			get maneuver ( ) { return require ( './data/Maneuver' ) ( ); },
			
			get itineraryPoint ( ) { return require ( './data/ItineraryPoint' ) ( );},
			
			get version ( ) { return '1.0.0'; }
		};
	};
	
	/* --- End of L.TravelNotes.Interface object --- */		

	L.travelNotes.interface = function ( ) {
		return L.TravelNotes.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelNotes.interface;
	}

}());
