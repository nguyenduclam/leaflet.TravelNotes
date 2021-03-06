/*
Copyright - 2017 - wwwouaiebe - Contact: http//www.ouaie.be/

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
--- GeoCoder.js file --------------------------------------------------------------------------------------------------
This file contains:
	- the GeoCoder object
Changes:
	- v1.0.0:
		- created
	- v1.4.0:
		- Replacing DataManager with TravelNotesData, Config, Version and DataSearchEngine
		- Working with Promise
		- returning the complete Nominatim responce in place of a computed address
	- v1.6.0:
		- Issue #65 : Time to go to ES6 modules?
		- Issue #68 : Review all existing promises.
Doc reviewed 20191122
Tests ...

-----------------------------------------------------------------------------------------------------------------------
*/

import { newHttpRequestBuilder } from '../util/HttpRequestBuilder.js';
import { theConfig } from '../data/Config.js';

import { ZERO, ONE } from '../util/Constants.js';

function newGeoCoder ( ) {

	/*
	--- myGetPromiseAddress function ----------------------------------------------------------------------------------

	This function creates the address promise

	-------------------------------------------------------------------------------------------------------------------
	*/

	function myGetPromiseAddress ( latLng ) {

		let NominatimUrl =
			theConfig.nominatim.url + 'reverse?format=json&lat=' +
			latLng [ ZERO ] + '&lon=' + latLng [ ONE ] +
			'&zoom=18&addressdetails=1';
		let nominatimLanguage = theConfig.nominatim.language;
		if ( nominatimLanguage && '*' !== nominatimLanguage ) {
			NominatimUrl += '&accept-language=' + nominatimLanguage;
		}
		let requestHeaders = null;

		if ( nominatimLanguage && '*' === nominatimLanguage ) {
			requestHeaders = [ { headerName : 'accept-language', headerValue : '' } ];
		}

		return newHttpRequestBuilder ( ).getJsonPromise ( NominatimUrl, requestHeaders );
	}

	/*
	--- End of myGetPromiseAddress function ---
	*/

	/*
	--- geoCoder object -----------------------------------------------------------------------------------------------

	-------------------------------------------------------------------------------------------------------------------
	*/

	return Object.seal (
		{
			getPromiseAddress : latLng => myGetPromiseAddress ( latLng )
		}
	);

}

export { newGeoCoder };

/*
--- End of GeoCoder.js file -------------------------------------------------------------------------------------------
*/