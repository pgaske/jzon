/*
** Version 0.2
**
** Changes:
** 		0.2
** 		Previous version was not encoding arrays containing objects correctly.  Revamped the encoder to
**		handle objects of very different shapes.  Additionally, the difference between arrays and objects
**		is now stored in the encoder output.
** 
*/
var JZON = JZON || (function () {
	var OBJECT_FORMAT_SLOT = 0,
		ARRAY_FORMAT_SLOT = 1,
		INVALID_SLOT = -1;

	// Is thing an array?
	function isArray(thing) {
		return toString.call(thing) === '[object Array]';
	}

	// Is thing an object?
	function isObject(thing) {
		return thing != null && !isArray(thing) && typeof thing === 'object';
	}

	// Extracts the format of the suppled object.
	function _extractFormat(data, format) {
		if (isArray(data)) {
			format = format || Array(2);

			for (var i = 0; i < data.length; i += 1) {
				var n = isObject(data[i]) ? OBJECT_FORMAT_SLOT : isArray(data[i]) ? ARRAY_FORMAT_SLOT : INVALID_SLOT;

				if (n !== INVALID_SLOT) {
					format[n] = _extractFormat(data[i], format[n]);
				}
			}
		}
		
		else if (isObject(data)) {
			format = format || {};

			for (var name in data) {
				if (!data.hasOwnProperty(name)) {
					continue;
				}

				if (isArray(data[name])) {
					format[name + '['] = _extractFormat(data[name], format[name + '[']);
				} else if (isObject(data[name])) {
					format[name + '{'] = _extractFormat(data[name], format[name + '{']);
				} else {
					format[name] = null;
				}
			}
		}

		return format;
	}

	function typeMatch(data, format) {
		if (isArray(data)) {
			return isArray(format);
		}

		if (isObject(data)) {
			return isObject(format);
		}

		return format === undefined;
	}

	function _compressData(data, format) {
		if (!typeMatch(data, format)) {
			throw new Error('Data does not match format.');
		}

		var result = [];

		if (isArray(format)) {
			for (var i = 0; i < data.length; i += 1) {
				var d = data[i];
				if (isObject(d)) {
					result.push({ '%': _compressData(d, format[OBJECT_FORMAT_SLOT]) })
				} else {
					result.push(_compressData(d, isArray(d) ? format[ARRAY_FORMAT_SLOT] : undefined));
				}
			}
		} else if (isObject(format)) {
			for (var name in format) {
				if (/\[$/.test(name)) {
					var dname = name.substr(0, name.length - 1);
					result.push(_compressData(data[dname], format[name]));
				} else if (/\{$/.test(name)) {
					var dname = name.substr(0, name.length - 1);
					result.push({ '%': data.hasOwnProperty(dname) ? _compressData(data[dname], format[name]) : null });
				} else {
					result.push(data.hasOwnProperty(name) ? data[name] : null)
				}
			}
		} else {
			result = data;
		}

		return result;
	}

	function _compress(data) {
		var format = _extractFormat(data),
			compressed = _compressData(data, format);

		return { f: format, c: compressed };
	}

	function _uncompressData(format, compressed) {
		var result = isArray(format) ? [] : isObject(format) ? {} : compressed;

		if (isArray(format)) {
			for (var i = 0; i < compressed.length; i++) {
				var c = compressed[i];
				result.push(_uncompressData(isArray(c) ? format[ARRAY_FORMAT_SLOT] : isObject(c) ? format[OBJECT_FORMAT_SLOT] : undefined, c));
			}
		} else if (isObject(format)) {
			var i = 0;
			var c = compressed['%'];

			for (var name in format) {
				if (c !== null) {
					if (/\[$/.test(name)) {
						result[name.substr(0, name.length - 1)] = _uncompressData(format[name], c[i]);
					} else if (/\{$/.test(name)) {
						if (c[i] && c[i]['%']) {
							result[name.substr(0, name.length - 1)] = _uncompressData(format[name], c[i]);
						}
					} else {
						if (c[i] != null) {
							result[name] = c[i];
						}
					}
					i += 1;
				}
			}
		}

		return result;
	}

	function _uncompress(compressed) {
		return _uncompressData(compressed.f, compressed.c);
	}

	// The api.
	return {
		compress: _compress,

		uncompress: _uncompress
	};
}());
