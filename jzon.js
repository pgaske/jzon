var jzon = jzon || (function (){
	function isArray(thing) {
		return toString.call(thing) === '[object Array]';
	}

	function isObject(thing) {
		return thing != null && typeof thing === 'object';
	}

	function extract(data, format) {
		if (isArray(data)) {
			for (var i = 0; i < data.length; i++) {
				extract(data[i], format);
			}
		} else if (isObject(data)) {
			for (var name in data) {
				if (data.hasOwnProperty(name)) {
					var key = name + (isArray(data[name]) ? "[]" : "");
					format[key] = format[key] || {};
					extract(data[name], format[key]);
				}
			}
		}

		return format;
	}

	function encode(format) {
		var names = [];

		for (name in format) {
			names.push(name);
		}

		var result = [];

		for (var i = 0; i < names.length; i++) {
			result.push(names[i]);
			if (/\[\]$/.test(names[i])) {
				result.push(encode(format[names[i]]));
			}
		}

		return result;
	}

	function extractFormat(data) {
		var format = extract(data, {});
		return encode(format);
	}

	function zip(data, format) {
		var result = [];

		if (isArray(data)) {
			data.forEach(function (v) {
				result.push(zip(v, format));
			});
		} else if (isObject(data)) {
			for (var i = 0; i < format.length; i += 1) {
				var key = format[i];

				if (/\[\]$/.test(key)) {
					key = key.substring(0, key.length - 2);
					if (data.hasOwnProperty(key)) {
						result.push(zip(data[key], format[i + 1]));
						// skip the array definition
						i += 1;
					} else {
						result.push(undefined);
					}
				} else {
					if (data.hasOwnProperty(key)) {
						result.push(data[key]);
					} else {
						result.push(undefined);
					}
				}
			}
		}

		return result;
	}

	function unzip(format, zipped) {
		// These must be arrays.
		if (!isArray(zipped) || !isArray(format)) {
			return null;
		}

		if (isArray(zipped[0])) {
			// Array of objects.
			var result = [];

			zipped.forEach(function (v) {
				result.push(unzip(format, v));
			});

			return result;
		} else {
			// Just one object.
			var result = {};

			for (var f = 0, z = 0; f < format.length; f += 1, z += 1) {
				var name = format[f];

				if (/\[\]$/.test(name)) {
					name = name.substring(0, name.length - 2);
					// Sub object.
					if (zipped[z] !== null && zipped[z] !== undefined) {
						result[name] = unzip(format[f + 1], zipped[z]);
					}
					f += 1;
				} else {
					// Property.
					if (zipped[z] !== null && zipped[z] !== undefined) {
						result[name] = zipped[z];
					}
				}
			}

			return result;
		}
	}

	return {
		zip: function (data) {
			var format = extractFormat(data);

			return {
				f: format,
				z: zip(data, format)
			};
		},

		unzip: function (zip) {
			return unzip(zip.f, zip.z);
		},

		manualUnzip: unzip
	};
}());
