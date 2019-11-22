/*
Copyright - 2019 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- SvgIconFromOsmFactory.js file -------------------------------------------------------------------------------------
This file contains:
	-
Changes:
	- v1.4.0:
		- created
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
Doc reviewed ...
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

'use strict';

/* global L */

export { newSvgIconFromOsmFactory };

import { g_Config } from '../data/Config.js';
import { g_TravelNotesData } from '../data/TravelNotesData.js';

import { newDataSearchEngine } from '../data/DataSearchEngine.js';

var s_RequestStarted = false;

var newSvgIconFromOsmFactory = function ( ) {

	var m_IconLatLng = L.latLng ( 0, 0 ); // the icon lat and lng
	var m_IconDistance = 0; // the icon distance from the beginning of the route
	var m_IconPoint = null;
	var m_Route = null; // the L.TravelNotes route object
	
	var m_Response = {}; // the xmlHttpRequest parsed
	
	var m_WaysMap = new Map ( );
	var m_NodesMap = new Map ( );
	var m_Places = [];
	var m_Place = null;
	var m_City = null;
	
	var m_Svg = null; // the svg element
	var m_StartStop = 0; // a flag to indicates where is the icon : -1 on the first node, 1 on the end node, 0 on an intermediate node
	
	var m_Translation = L.point ( 0, 0 );
	var m_Rotation = 0;
	var m_Direction = null;
	
	var m_SvgIconSize = g_Config.note.svgIconWidth;
	var m_SvgZoom = g_Config.note.svgZoom;
	var m_SvgAngleDistance = g_Config.note.svgAngleDistance;
	
	var m_IncomingPoint = null;
	var m_OutgoingPoint = null;
	var m_PassingStreets = [];
			
	/*
	--- m_CreateNodesAndWaysMaps function -----------------------------------------------------------------------------

	This function create the way and node maps from the XmlHttpRequest response

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateNodesAndWaysMaps = function ( )
	{
		m_WaysMap.clear ( );
		m_NodesMap.clear ( );
		// Elements are pushed in 2 maps: 1 for nodes and 1 for ways
		m_Response.elements.forEach (
			function ( element ) {
				switch ( element.type ) {
					case 'area' :
						if ( element.tags && element.tags.boundary && element.tags.name ) {
							m_City = element.tags.name;
						}
						break;
					case 'way' :
						// replacing the nodes property with the nodesId property to 
						// avoid confusion between nodes and nodesId. The element.nodes contains nodesIds!!
						element.nodesIds = element.nodes;
						delete element.nodes;
						m_WaysMap.set ( element.id, element );
						break;
					case 'node' :
						m_NodesMap.set ( element.id, element );
						if ( element.tags && element.tags.place && [ 'town', 'city', 'village', 'hamlet' ].includes ( element.tags.place ) ) {
							m_Places.push ( element );
						}
						break;
					default:
						break;
				}
			}
		);
	};
	
	/*
	--- End of m_CreateNodesAndWaysMaps function ---
	*/

	/*
	--- m_SearchItineraryPoints function ------------------------------------------------------------------------------

	This function search the nearest route point from the icon and compute the distance from the begining of the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SearchItineraryPoints = function ( ) {
		// Searching the nearest itinerary point
		var minDistance = Number.MAX_VALUE;
		var distance = 0;
		
		// Iteration on the points...
		m_Route.itinerary.itineraryPoints.forEach ( 
			function ( itineraryPoint ) {
				var pointDistance = m_IconLatLng.distanceTo ( L.latLng ( itineraryPoint.latLng ) );
				if ( minDistance > pointDistance ) {
					minDistance = pointDistance;
					m_IconPoint = itineraryPoint;
					m_IconDistance = distance;
				}
				distance += itineraryPoint.distance;
			}
		);
		
		// The coordinates of the nearest point are used as position of the icon
		m_IconLatLng = L.latLng ( m_IconPoint.latLng );
		var latLngCompare = function ( itineraryPoint ) {
			var isntWayPoint = true;
			m_Route.wayPoints.forEach ( 
				function ( wayPoint ) {
					if ( ( Math.abs ( itineraryPoint.lat - wayPoint.lat ) < 0.00001 ) && ( Math.abs ( itineraryPoint.lng - wayPoint.lng ) < 0.00001 ) ) {
						isntWayPoint = false;
					}
				}
			);
			return  isntWayPoint && ( m_IconPoint.lat !== itineraryPoint.lat || m_IconPoint.lng !== itineraryPoint.lng );
		};
		
		m_IncomingPoint = m_Route.itinerary.itineraryPoints.previous ( m_IconPoint.objId, latLngCompare );
		m_OutgoingPoint = m_Route.itinerary.itineraryPoints.next ( m_IconPoint.objId, latLngCompare );
	};
	
	/*
	--- End of m_SearchItineraryPoints function ---
	*/
	
	/*
	--- m_SearchHamlet function ---------------------------------------------------------------------------------------

	This function 

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SearchHamlet = function ( ) {
		var minDistance = Number.MAX_VALUE;
		m_Places.forEach (
			function ( place ) {
			var placeDistance = L.latLng ( m_IconPoint.latLng ).distanceTo ( L.latLng ( place.lat, place.lon ) );
				if ( minDistance > placeDistance ) {
					minDistance = placeDistance;
					m_Place = place.tags.name;
				}
			}
		);
	};
	
	/*
	--- End of m_SearchHamlet function ---
	*/

	/*
	--- m_SearchPassingStreets function -------------------------------------------------------------------------------

	This function 

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_SearchPassingStreets = function ( ) {

		var iconPointId = -1;
		var incomingPointId = -1;
		var outgoingPointId = -1;
		var iconPointDistance = Number.MAX_VALUE;
		var incomingPointDistance = Number.MAX_VALUE;
		var outgoingPointDistance = Number.MAX_VALUE;
		var pointDistance = 0;
		m_NodesMap.forEach (
			function ( node ) {
				if ( m_IconPoint ) {
					pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_IconPoint.lat, m_IconPoint.lng ) );
					if ( pointDistance < iconPointDistance ) {
						iconPointId = node.id;
						iconPointDistance = pointDistance;
					}
				}
				if ( m_IncomingPoint ) {
					pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_IncomingPoint.lat, m_IncomingPoint.lng ) );
					if ( pointDistance < incomingPointDistance ) {
						incomingPointId = node.id;
						incomingPointDistance = pointDistance;
					}
				}
				if ( m_OutgoingPoint   ) {
					pointDistance =  L.latLng ( node.lat, node.lon ).distanceTo ( L.latLng ( m_OutgoingPoint.lat, m_OutgoingPoint.lng ) );
					if ( pointDistance < outgoingPointDistance ) {
						outgoingPointId = node.id;
						outgoingPointDistance = pointDistance;
					}
				}
			}
		);
		var incomingStreet = '';
		var outgoingStreet = '';
		m_WaysMap.forEach ( 
			function ( way ) {
				var name = ( way.tags.name ? way.tags.name : '' ) + ( way.tags.name && way.tags.ref ? ' '  : '' ) + ( way.tags.ref ? '[' + way.tags.ref + ']' : '' );
				if ( way.nodesIds.includes ( iconPointId ) ) {
					var isClosed = way.nodesIds [ 0 ] === way.nodesIds [ way.nodesIds.length - 1 ];
					var isInOutStreet = ( 0 !== way.nodesIds.indexOf ( iconPointId ) ) && ( way.nodesIds.length - 1 !== way.nodesIds.lastIndexOf ( iconPointId ) );
					var isIncomingStreet = way.nodesIds.includes ( incomingPointId );
					var isOutgoingStreet = way.nodesIds.includes ( outgoingPointId );
					var isSimpleStreet = ! isInOutStreet && ! isIncomingStreet && ! isOutgoingStreet;
					var haveName = name!== '';
					
					if ( isSimpleStreet && haveName )  {
						m_PassingStreets.push ( name );
					}
					if ( ( isInOutStreet && haveName ) || ( isClosed && haveName ) )  {
						if ( ! isIncomingStreet && ! isOutgoingStreet ) {
							m_PassingStreets.push ( name );
							m_PassingStreets.push ( name );
						}
						else if ( ( isIncomingStreet && ! isOutgoingStreet ) || ( ! isIncomingStreet && isOutgoingStreet ) ) {
							m_PassingStreets.push ( name );
						}
					}
					if ( isIncomingStreet )  {
						incomingStreet = haveName ? name : '???';
					}
					if ( isOutgoingStreet )  {
						outgoingStreet =  haveName ? name : '???';
					}
				}
			}
		);
		m_PassingStreets.unshift ( incomingStreet );
		m_PassingStreets.push ( outgoingStreet );
	};

	/*
	--- End of m_SearchPassingStreets function ---
	*/

	/*
	--- m_ComputeTranslation function ---------------------------------------------------------------------------------

	This function compute the needed translation to have the icon at the center point of the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_ComputeTranslation = function ( ) {
		m_Translation = L.point ( m_SvgIconSize / 2, m_SvgIconSize / 2 ).subtract ( g_TravelNotesData.map.project ( m_IconLatLng, m_SvgZoom ) );
	};
	
	/*
	--- End of m_ComputeTranslation function ---
	*/

	/*
	--- m_ComputeRotationAndDirection function ------------------------------------------------------------------------

	This function compute the rotation needed to have the SVG oriented on the itinerary and the direction to take after the icon

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_ComputeRotationAndDirection = function ( ) {
		// searching points at least at 10 m ( m_SvgAngleDistance ) from the icon point, one for rotation and one for direction
		var distance = 0;
		var rotationItineraryPoint = m_Route.itinerary.itineraryPoints.first;
		var directionItineraryPoint = m_Route.itinerary.itineraryPoints.last;
		var directionPointReached = false;

		m_Route.itinerary.itineraryPoints.forEach ( 
			function ( itineraryPoint ) {
				if ( m_IconDistance - distance > m_SvgAngleDistance ) {
					rotationItineraryPoint = itineraryPoint;
				}
				if ( distance - m_IconDistance > m_SvgAngleDistance && ! directionPointReached ) {
					directionItineraryPoint = itineraryPoint;
					directionPointReached = true;
				}
				distance += itineraryPoint.distance;
			}
		);
		
		var iconPoint = g_TravelNotesData.map.project ( m_IconLatLng , m_SvgZoom ).add ( m_Translation );
		// computing rotation... if possible
		if ( m_IconPoint.objId !== m_Route.itinerary.itineraryPoints.first.objId  ) {
			var rotationPoint = g_TravelNotesData.map.project ( L.latLng ( rotationItineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
			m_Rotation = Math.atan (  ( iconPoint.y - rotationPoint.y ) / ( rotationPoint.x - iconPoint.x ) ) * 180 / Math.PI;
			if ( 0 > m_Rotation ) {
				m_Rotation += 360;
			}
			m_Rotation -= 270;
			
			// point 0,0 of the svg is the UPPER left corner
			if ( 0 > rotationPoint.x - iconPoint.x ) {
				m_Rotation += 180;
			}
		}
		//computing direction ... if possible

		if ( m_IconPoint.objId !== m_Route.itinerary.itineraryPoints.last.objId  ) {
			var directionPoint = g_TravelNotesData.map.project ( L.latLng ( directionItineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
			m_Direction = Math.atan (  ( iconPoint.y - directionPoint.y ) / ( directionPoint.x - iconPoint.x ) ) * 180 / Math.PI;
			// point 0,0 of the svg is the UPPER left corner
			if ( 0 > directionPoint.x - iconPoint.x ) {
				m_Direction += 180;
			}
			m_Direction -= m_Rotation;
			// setting direction between 0 and 360
			while ( 0 > m_Direction ) {
				m_Direction += 360;
			}
			while ( 360 < m_Direction ) {
				m_Direction -= 360;
			}
		}
		if ( m_IconPoint.objId === m_Route.itinerary.itineraryPoints.first.objId  ) {
			m_Rotation = - m_Direction - 90;
			m_Direction = null;
			m_StartStop = -1;
		}
		
		if ( m_IconLatLng.lat === m_Route.itinerary.itineraryPoints.last.lat  && m_IconLatLng.lng === m_Route.itinerary.itineraryPoints.last.lng ) { //using lat & lng because last point is sometime duplicated
			m_Direction = null;
			m_StartStop = 1;
		}
	};

	/*
	--- End of m_ComputeRotationAndDirection function ---
	*/

	/*
	--- m_CreateRoute function ----------------------------------------------------------------------------------------

	This function create the SVG polyline for the route

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateRoute = function ( ) {
		// to avoid a big svg, all points outside the svg viewBox are not added
		var index = -1;
		var firstPointIndex = -1;
		var lastPointIndex = -1;
		var points = [];
		m_Route.itinerary.itineraryPoints.forEach ( 
			function ( itineraryPoint ) {
				index++;
				var point = g_TravelNotesData.map.project ( L.latLng ( itineraryPoint.latLng ), m_SvgZoom ).add ( m_Translation );
				points.push ( point );
				var pointIsInside = point.x >= 0 && point.y >= 0 && point.x <=  m_SvgIconSize && point.y <= m_SvgIconSize;
				if ( pointIsInside ) {
					if ( -1 === firstPointIndex )  {
						firstPointIndex = index;
					}
					lastPointIndex = index;
				}
			}
		);
		if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
			if ( 0 < firstPointIndex ) {
				firstPointIndex --;
			}
			if ( m_Route.itinerary.itineraryPoints.length -1 > lastPointIndex ) {
				lastPointIndex ++;
			}
			var pointsAttribute = '';
			for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
					pointsAttribute += points[ index ].x.toFixed ( 0 ) + ',' + points[ index ].y.toFixed ( 0 ) + ' ';
			}
			var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
			polyline.setAttributeNS ( null, "points", pointsAttribute );
			polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Itinerary" );
			polyline.setAttributeNS ( null, "transform",  "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
			m_Svg.appendChild ( polyline );
		}
		
	};

	/*
	--- End of m_CreateRoute function ---
	*/

	/*
	--- m_CreateWays function -----------------------------------------------------------------------------------------

	This function creates the ways from OSM

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_CreateWays = function ( ) {
		
		// to avoid a big svg, all points outside the svg viewBox are not added
		m_WaysMap.forEach ( 
			function ( way ) {
				var firstPointIndex = -1;
				var lastPointIndex = -1;
				var index = -1;
				var points = [ ];
				way.nodesIds.forEach (
					function ( nodeId ) {
						index ++;
						var node = m_NodesMap.get ( nodeId );
						var point = g_TravelNotesData.map.project ( L.latLng ( node.lat, node.lon ), m_SvgZoom ).add ( m_Translation );
						points.push ( point );
						var pointIsInside = point.x >= 0 && point.y >= 0 && point.x <=  m_SvgIconSize && point.y <= m_SvgIconSize;
						if ( pointIsInside ) {
							if ( -1 === firstPointIndex )  {
								firstPointIndex = index;
							}
							lastPointIndex = index;
						}
					}
				);
				if ( -1 !== firstPointIndex && -1 !== lastPointIndex ) {
					if ( 0 < firstPointIndex ) {
						firstPointIndex --;
					}
					if ( way.nodesIds.length -1 > lastPointIndex ) {
						lastPointIndex ++;
					}
					var pointsAttribute = '';
					for ( index = firstPointIndex; index <= lastPointIndex; index ++ ) {
							pointsAttribute += points[ index ].x.toFixed ( 0 ) + ',' + points[ index ].y.toFixed ( 0 ) + ' ';
					}

					var polyline = document.createElementNS ( "http://www.w3.org/2000/svg", "polyline" );
					polyline.setAttributeNS ( null, "points", pointsAttribute );
					polyline.setAttributeNS ( null, "class", "TravelNotes-OSM-Highway TravelNotes-OSM-Highway-" + way.tags.highway );
					polyline.setAttributeNS ( null, "transform", "rotate(" + m_Rotation + "," + m_SvgIconSize / 2 + "," + m_SvgIconSize / 2 + ")" );
					
					m_Svg.appendChild ( polyline );
				}
			}
		);
		
	};

	/*
	--- End of m_CreateWays function ---
	*/

	/*
	--- m_createSvg function ------------------------------------------------------------------------------------------

	This function creates the SVG

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_createSvg = function ( ) {
		m_CreateNodesAndWaysMaps ( );

		m_Svg = document.createElementNS ( "http://www.w3.org/2000/svg", "svg" );
		m_Svg.setAttributeNS ( null, "viewBox", "" + m_SvgIconSize / 4 + " " + m_SvgIconSize / 4 + " " + m_SvgIconSize / 2 + " " + m_SvgIconSize / 2 );
		m_Svg.setAttributeNS ( null, "class", "TravelNotes-SvgIcon" );
		
		m_SearchItineraryPoints ( );
		m_SearchPassingStreets ( );
		m_SearchHamlet ( );
		m_ComputeTranslation ( );
		m_ComputeRotationAndDirection ( );
		m_CreateRoute ( );
		m_CreateWays ( );
	};
	
	/*
	--- End of m_createSvg function ---
	*/
	
	/*
	--- m_StartXMLHttpRequest function --------------------------------------------------------------------------------

	This function start the http request to OSM

	-------------------------------------------------------------------------------------------------------------------
	*/

	var m_StartXMLHttpRequest = function ( returnOnOk, returnOnError ) {

		var xmlHttpRequest = new XMLHttpRequest ( );
		xmlHttpRequest.timeout = g_Config.note.svgTimeOut;
		
		xmlHttpRequest.ontimeout = function ( ) {
			returnOnError ( 'TimeOut error' );
		};
		
		xmlHttpRequest.onreadystatechange = function ( ) {
			if ( xmlHttpRequest.readyState === 4 ) {
				if ( xmlHttpRequest.status === 200 ) {
					try {
						m_Response = JSON.parse ( xmlHttpRequest.responseText );
					}
					catch ( e ) {
						s_RequestStarted = false;
						returnOnError ( 'Parsing error' );
					}
					m_createSvg ( );
					s_RequestStarted = false;
					returnOnOk ( { svg : m_Svg, direction : m_Direction, startStop: m_StartStop, city : m_City, place: m_Place, streets: m_PassingStreets, latLng : m_IconPoint.latLng } );
				}
				else {
					s_RequestStarted = false;
					returnOnError ( 'Status : ' + this.status + ' statusText : ' + this.statusText );
				}
			}
		};

		var requestLatLng = m_IconLatLng.lat.toFixed ( 6 ) + ',' + m_IconLatLng.lng.toFixed ( 6 );

		var requestUrl = g_Config.overpassApiUrl + '?data=[out:json][timeout:' + g_Config.note.svgTimeOut + '];' +
			'way[highway](around:' + ( m_SvgIconSize * 1.5 ).toFixed ( 0 ) + ',' + requestLatLng + ')->.a;(.a >;.a;)->.a;.a out;' +
			'is_in(' + requestLatLng + ')->.e;' +
			'area.e[admin_level="2"][name="United Kingdom"]->.f;' +
			'area.e[admin_level="8"]->.g;' +
			'area.e[admin_level="10"]->.h;' +
			'if(f.count(deriveds)==0){.g->.i;}else{if(h.count(deriveds)==0){.g->.i;}else{.h->.i;}}.i out;' +
			'(node(area.i)[place="village"];node(area.i)[place="hamlet"];node(area.i)[place="city"];node(area.i)[place="town"];)->.k;' +
			'( ' +
			'node(around:' + g_Config.note.svgHamletDistance + ',' + requestLatLng + ')[place="hamlet"];' +
			'node(around:' + g_Config.note.svgVillageDistance + ',' + requestLatLng + ')[place="village"];' +
			'node(around:' + g_Config.note.svgCityDistance + ',' + requestLatLng + ')[place="city"];' +
			'node(around:' + g_Config.note.svgTownDistance + ',' + requestLatLng + ')[place="town"];' +
			')->.l;' +
			'node.k.l->.m;' +
			'.m out;';

		xmlHttpRequest.open ( "GET", requestUrl, true);
		xmlHttpRequest.overrideMimeType ( 'application/json' );
		xmlHttpRequest.send ( null );
	
	};
	
	/*
	--- End of _StartXMLHttpRequest function ---
	*/

	/*
	--- m_GetPromiseSvgIcon function ----------------------------------------------------------------------------------

	This function creates the SVG promise

	-------------------------------------------------------------------------------------------------------------------
	*/
	
	var m_GetPromiseSvgIcon = function ( iconLatLng, routeObjId ) {
		
		// We verify that another request is not loaded
		if ( s_RequestStarted ) {
			return Promise.reject ( );
		}
		s_RequestStarted = true;
		
		m_IconLatLng = L.latLng ( iconLatLng );
		m_Route = newDataSearchEngine ( ).getRoute ( routeObjId );
		m_Response = {};
		m_Svg = null;
		m_City = null;
		
		return new Promise ( m_StartXMLHttpRequest );
	};
	
	/*
	--- End of m_GetPromiseSvgIcon function ---
	*/
	
	/*
	--- svgIconFromOsmFactory object ----------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getPromiseSvgIcon : function ( iconLatLng, routeObjId ) { return m_GetPromiseSvgIcon ( iconLatLng, routeObjId ); }				
		}
	);
};

/*
--- End of svgIconFromOsmFactory.js file ------------------------------------------------------------------------------
*/