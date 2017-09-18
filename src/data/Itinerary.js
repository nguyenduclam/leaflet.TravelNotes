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

(function() {
	
	'use strict';
	
	var _ObjType = require ( './ObjType' ) ( 'Itinerary', require ( '../UI/Translator' ) ( ).getText ( 'Version' ) );


	var getItinerary = function ( ) {
		
		var _ObjId = require ( './ObjId' ) ( );

		var _ItineraryPoints = require ( './Collection' ) ( 'ItineraryPoint' );

		var _Maneuvers = require ( './Collection' ) ( 'Maneuver' );
		
		var _Provider = '';
		
		var _TransitMode = '';
		
		return {
			
			get itineraryPoints ( ) { return _ItineraryPoints; },

			get maneuvers ( ) { return _Maneuvers; },
	 
			get objId ( ) { return _ObjId; },
			
			get objType ( ) { return _ObjType; },
			
			get provider ( ) { return _Provider; },
			
			set provider ( Provider ) { _Provider = Provider; },

			get transitMode ( ) { return _TransitMode; },
			
			set transitMode ( TransitMode ) { _TransitMode = TransitMode; },
			
			get object ( ) {
				return {
					itineraryPoints : _ItineraryPoints.object,
					maneuvers : _Maneuvers.object,
					provider : _Provider,
					transitMode : _TransitMode,
					objId : _ObjId,
					objType : _ObjType.object
				};
			},
			
			set object ( Object ) {
				Object = _ObjType.validate ( Object );
				_ItineraryPoints.object = Object.itineraryPoints || [];
				_Maneuvers.object = Object.maneuvers || [];
				_Provider = Object.provider || '';
				_TransitMode = Object.transitMode || '';
				_ObjId = require ( './ObjId' ) ( );
				// rebuilding links between maneuvers and itineraryPoints
				var itineraryPointObjIdMap = new Map ( );
				var sourceCounter = 0;
				var targetIterator = _ItineraryPoints.iterator;
				while ( ! targetIterator.done ) {
					itineraryPointObjIdMap.set ( Object.itineraryPoints [ sourceCounter ].objId, targetIterator.value.objId );
					sourceCounter ++;
				}
				var maneuverIterator = _Maneuvers.iterator;
				while ( ! maneuverIterator.done ) {
					maneuverIterator.value.itineraryPointObjId = itineraryPointObjIdMap.get ( maneuverIterator.value.itineraryPointObjId );
				}
			}
		};
	};
	
	/* 
	--- Exports ------------------------------------------------------------------------------------------------------------
	*/
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = getItinerary;
	}

} ) ( );
