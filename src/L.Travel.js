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
	
	L.Travel = L.Travel || {};
	L.travelRoutingEngine = L.travelRoutingEngine || {};
	
	/* 
	--- L.Travel.Interface object -----------------------------------------------------------------------------
	
	This object contains all you need to use Travel :-)
	
	Patterns : Closure
	------------------------------------------------------------------------------------------------------------------------
	*/

	L.Travel.getInterface = function ( ) {

	
		return {

			/* --- public methods --- */
			
			/* addControl ( ) method --- 
			
			This method add the control 
			
			Parameters :
			
			*/

			addControl : function ( Map, DivControlId, options ) {
				if ( DivControlId )
				{
					document.getElementById ( DivControlId ).innerHTML = require ('./L.Travel.ControlUI' ) ( Map ).outerHTML;
				}
				else
				{
					if ( typeof module !== 'undefined' && module.exports ) {
						Map.addControl ( require ('./L.Travel.Control' ) ( options ) );
					}
					else {
						Map.addControl ( L.marker.pin.control ( options ) );
					}
				}
			},
			
			addWayPoint : function ( WayPoint, WayPointPosition ) {
				console.log ( 'addWayPoint' );
			},
			
		};
	};
	
	/* --- End of L.Travel.Interface object --- */		

	L.travelRoutingEngine.interface = function ( ) {
		return L.Travel.getInterface ( );
	};
	
	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = L.travelRoutingEngine.interface;
	}

}());