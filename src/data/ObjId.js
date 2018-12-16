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
--- ObjId.js file -----------------------------------------------------------------------------------------------------

Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Initialization changed
Doc reviewed 20181216
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

(function() {

	'use strict';

	/*
	--- objId function ------------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	var objId = function ( ) {
		if ( ! global.TravelNotesObjId ) {
			global.TravelNotesObjId = 0;
		}
		
		return ++ global.TravelNotesObjId;
	};

	/*
	--- Exports -------------------------------------------------------------------------------------------------------
	*/

	if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = objId;

	}

} ) ( );

/*
--- End of ObjId.js file ----------------------------------------------------------------------------------------------
*/