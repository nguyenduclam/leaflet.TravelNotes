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

/*
--- TravelEditorUI.js file --------------------------------------------------------------------------------------------
This file contains:
	- the TravelEditorUI object
	- the module.exports implementation
Changes:
	- v1.0.0:
		- created
	- v1.1.0:
		- Issue #26 : added confirmation message before leaving the page when data modified.
		- Issue #31 : Add a command to import from others maps
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- moving file functions from TravelEditor to the new FileLoader
		- modified event listener for cancel travel button ( issue #45 )
Doc reviewed 20170930
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

( function ( ){
	
	'use strict';
	
	var _Translator = require ( './Translator' ) ( );
	var _TravelNotesData = require ( '../L.TravelNotes' );
	var _RoutesList = null;
	
	// Events handler for expand and expand list buttons

	var onClickExpandButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelHeaderDiv' ).classList.toggle ( 'TravelNotes-Control-SmallHeader' );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelButtonsDiv' ).classList.toggle ( 'TravelNotes-Control-HiddenList' );
		var hiddenList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-HiddenList' );
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).innerHTML = hiddenList ? '&#x25b6;' : '&#x25bc;';
		document.getElementById ( 'TravelNotes-ControlTravelExpandButton' ).title = hiddenList ? _Translator.getText ( 'TravelEditorUI - Show' ) : _Translator.getText ( 'TravelEditorUI - Hide' );
		clickEvent.stopPropagation ( );
	};
	
	var onClickExpandListButton = function ( clickEvent ) {
		clickEvent.stopPropagation ( );
		document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.toggle ( 'TravelNotes-Control-ExpandedList' );
		var expandedList = document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ).classList.contains ( 'TravelNotes-Control-ExpandedList' );
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).innerHTML = expandedList ? '&#x25b3;' : '&#x25bd;';
		document.getElementById ( 'TravelNotes-Control-ExpandRoutesListButton' ).title = expandedList ? _Translator.getText ( 'TravelEditorUI - Reduce the list' ) : _Translator.getText ( 'TravelEditorUI - Expand the list' );		
	};

	var _TimerId = null;
	
	var onMouseEnterControl = function ( event ) {
		if ( _TimerId ) {
			clearTimeout ( _TimerId );
			_TimerId = null;
		}
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Minimize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
	};
	
	var onTimeOut = function ( ) {
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.remove ( 'TravelNotes-Control-MainDiv-Maximize' );
		document.getElementById ( 'TravelNotes-Control-MainDiv' ).classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
	};
	
	var onMouseLeaveControl =function ( event ) {
		_TimerId = setTimeout(onTimeOut, _TravelNotesData.config.travelEditor.timeout );
	};
	
	var onClickPinButton = function ( event ) {
		var control = document.getElementById ( 'TravelNotes-Control-MainDiv' );
		if ( 10060 === event.target.innerHTML.charCodeAt ( 0 ) ) {
			event.target.innerHTML = '&#x1f4cc;';
			control.addEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
		else
		{
			event.target.innerHTML = '&#x274c;';
			control.removeEventListener ( 'mouseenter', onMouseEnterControl, false );
			control.removeEventListener ( 'mouseleave', onMouseLeaveControl, false );
		}
	};

	var onCancelTravelClick = function ( clickEvent ) {
		clickEvent.stopPropagation();
		require ( '../core/TravelEditor' ) ( ).clear ( );
		if ( require ( '../L.TravelNotes' ).config.travelEditor.startupRouteEdition ) {
			require ( '../core/TravelEditor' ) ( ).editRoute ( require ( '../L.TravelNotes' ).travel.routes.first.objId );
		}
		require ( '../L.TravelNotes' ).map.fire ( 'travelnotesfileloaded', { readOnly : false, name : '' } );
	};
				
	var TravelEditorUI = function ( ) {
				
		/*
		--- _CreateUI function ----------------------------------------------------------------------------------------

		This function creates the UI
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _CreateUI = function ( controlDiv ){ 
		
			if ( document.getElementById ( 'TravelNotes-Control-TravelDataDiv' ) ) {
				return;
			}

			var htmlElementsFactory = require ( './HTMLElementsFactory' ) ( ) ;
			
			// header
			var headerDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-TravelHeaderDiv', 
					className : 'TravelNotes-Control-HeaderDiv'
				},
				controlDiv
			);

			// expand button
			var expandButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x25bc;', 
					id : 'TravelNotes-ControlTravelExpandButton', 
					className : 'TravelNotes-Control-ExpandButton'
				},
				headerDiv
			);
			expandButton.addEventListener ( 'click' , onClickExpandButton, false );

			// title
			htmlElementsFactory.create ( 
				'span', 
				{ 
					innerHTML : _Translator.getText ( 'TravelEditorUI - Travel routes' ), 
					id : 'TravelNotes-Control-TravelHeaderText', 
					className : 'TravelNotes-Control-HeaderText'
				},
				headerDiv 
			);
		
			// pin button
			var pinButton = htmlElementsFactory.create (
				'span',
				{ 
					innerHTML : '&#x274c;', 
					id : 'TravelNotes-Control-PinButton', 
				},
				headerDiv
			);
			pinButton.addEventListener ( 'click', onClickPinButton, false );

			// data div
			var dataDiv = htmlElementsFactory.create ( 
				'div',
				{ 
					id : 'TravelNotes-Control-TravelDataDiv', 
					className : 'TravelNotes-Control-DataDiv'
				},
				controlDiv 
			);
			
			// Routes list
			_RoutesList = require ( './SortableList' ) ( { minSize : 0, id : 'TravelNotes-Control-TravelRoutesList' }, dataDiv );
			_RoutesList.container.addEventListener ( 
				'SortableListDelete',
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).removeRoute ( event.itemNode.dataObjId );
				}, 
				false
			);
			_RoutesList.container.addEventListener ( 
				'SortableListUpArrow', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, true );
				},
				false 
			);
			_RoutesList.container.addEventListener ( 
				'SortableListDownArrow', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).swapRoute ( event.itemNode.dataObjId, false );
				}, 
				false 
			);
			_RoutesList.container.addEventListener ( 
				'SortableListRightArrow', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).editRoute ( event.itemNode.dataObjId );
				}, 
				false 
			);
			_RoutesList.container.addEventListener ( 
				'SortableListChange', 
				function ( event ) {
					event.stopPropagation();
					require ( '../core/TravelEditor' ) ( ).renameRoute ( event.dataObjId, event.changeValue );
				}, 
				false 
			);
			_RoutesList.container.addEventListener ( 
				'SortableListDrop', 
				function ( event ) {
					event.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).routeDropped ( event.draggedObjId, event.targetObjId, event.draggedBefore );
				}, 
				false 
			);
			
			// buttons div
			var buttonsDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-ControlTravelButtonsDiv', 
					className : 'TravelNotes-Control-ButtonsDiv'
				}, 
				controlDiv
			);

			// expand list button
			var expandListButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ExpandRoutesListButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Expand the list' ), 
					innerHTML : '&#x25bd;'
				}, 
				buttonsDiv 
			);
			expandListButton.addEventListener ( 'click' , onClickExpandListButton, false );
			
			// cancel travel button
			var cancelTravelButton = htmlElementsFactory.create (
				'div', 
				{ 
					id : 'TravelNotes-Control-CancelTravelButton',
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Cancel travel' ), 
					innerHTML : '&#x274c'
				},
				buttonsDiv 
			);
			cancelTravelButton.addEventListener ( 'click', onCancelTravelClick, false );

			// save travel button
			var saveTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-SaveTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Save travel' ), 
					innerHTML : '&#x1f4be;'
				}, 
				buttonsDiv 
			);
			saveTravelButton.addEventListener ( 
				'click' , 
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
					require ( '../core/TravelEditor' ) ( ).saveTravel ( );
				},
				false 
			);

			// open travel button with the well know hack....
			// See also UserInterface.js. Click events are first going to the interface div...
			var openTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelDiv'
				}, 
				buttonsDiv 
			);
			var openTravelInput = htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-OpenTravelInput', 
					type : 'file',
					accept : '.trv'
				},
				openTravelDiv
			);
			openTravelInput.addEventListener ( 
				'change', 
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
					require ( '../core/RouteEditor' ) ( ).cancelEdition ( );
					require ( '../core/FileLoader' ) ( ).openLocalFile ( clickEvent );
				},
				false 
			);
			var openTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-OpenTravelFakeDiv'
				}, 
				openTravelDiv 
			);
			var openTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel' ), 
					innerHTML : '&#x1F4C2;'
				}, 
				openTravelFakeDiv 
			);
			openTravelButton.addEventListener ( 
				'click' , 
				function ( ) 
				{ 
					if ( ! require ( '../core/TravelEditor' ) ( ).confirmClose ( ) )
					{
						return;
					}
					openTravelInput.click ( );
				}, 
				false 
			);

			// import travel button with the well know hack....
			// See also UserInterface.js. Click events are first going to the interface div...
			var importTravelDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelDiv'
				}, 
				buttonsDiv 
			);
			var importTravelInput = htmlElementsFactory.create ( 
				'input',
				{
					id : 'TravelNotes-Control-ImportTravelInput', 
					type : 'file',
					accept : '.trv,.map'
				},
				importTravelDiv
			);
			importTravelInput.addEventListener ( 
				'change', 
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
					require ( '../core/FileLoader' ) ( ).mergeLocalFile ( clickEvent );
				},
				false 
			);
			var importTravelFakeDiv = htmlElementsFactory.create ( 
				'div', 
				{ 
					id: 'TravelNotes-Control-ImportTravelFakeDiv'
				}, 
				importTravelDiv 
			);
			var importTravelButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-ImportTravelButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Import travel' ), 
					innerHTML : '&#x1F30F;'
				}, 
				importTravelFakeDiv 
			);
			importTravelButton.addEventListener ( 
				'click' , 
				function ( event ) 
				{ 
					importTravelInput.click ( );
				}, 
				false 
			);

			// roadbook button
			var openTravelRoadbookButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-OpenTravelRoadbookButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Open travel roadbook' ), 
					innerHTML : '<a id="TravelNotes-Control-OpenTravelRoadbookLink" href="TravelNotesRoadbook.html?page=' + _TravelNotesData.UUID + '" target="_blank">&#x1F4CB;</a>' //'&#x23CD;'
				}, 
				buttonsDiv
			);

			// import button
			
			/*
			// Todo...
			var undoButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-UndoButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - Undo' ), 
					innerHTML : '&#x21ba;'
				}, 
				buttonsDiv 
			);
			undoButton.addEventListener ( 
				'click' ,
				function ( clickEvent ) {
					clickEvent.stopPropagation ( );
				},
				false 
			);
			*/

			// add route button
			var addRouteButton = htmlElementsFactory.create ( 
				'div', 
				{ 
					id : 'TravelNotes-Control-AddRoutesButton', 
					className: 'TravelNotes-Control-Button', 
					title : _Translator.getText ( 'TravelEditorUI - New route' ), 
					innerHTML : '+'
				}, 
				buttonsDiv 
			);
			addRouteButton.addEventListener ( 
				'click' , 
				function ( event ) {
					event.stopPropagation();
					require ( '../core/TravelEditor' ) ( ).addRoute ( );
				},
				false
			);
			if ( _TravelNotesData.config.travelEditor.startMinimized ) {
				pinButton.innerHTML = '&#x1f4cc;';
				controlDiv.addEventListener ( 'mouseenter', onMouseEnterControl, false );
				controlDiv.addEventListener ( 'mouseleave', onMouseLeaveControl, false );
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Minimize' );
			}
			else {
				controlDiv.classList.add ( 'TravelNotes-Control-MainDiv-Maximize' );
			}
		};	
		
		/*
		--- _SetRoutesList function -----------------------------------------------------------------------------------

		This function fill the routes list
		
		---------------------------------------------------------------------------------------------------------------
		*/

		var _SetRoutesList = function (  ) {
			_RoutesList.removeAllItems ( );
			var routesIterator = _TravelNotesData.travel.routes.iterator;
			while ( ! routesIterator.done ) {
				_RoutesList.addItem ( routesIterator.value.name, routesIterator.value.chain ? '&#x26d3;' : '', _Translator.getText ( 'TravelEditorUI - Route' ) ,routesIterator.value.objId, false );
			}
		};

		/*
		--- TravelEditorUI object -------------------------------------------------------------------------------------

		---------------------------------------------------------------------------------------------------------------
		*/

		return {
			createUI : function ( controlDiv ) { 
				_CreateUI ( controlDiv ); 
			},
			
			setRoutesList : function (  ) {
				_SetRoutesList ( );
			}
		};
	};
	
	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = TravelEditorUI;
	}

}());

/*
--- End of TravelEditorUI.js file -------------------------------------------------------------------------------------
*/