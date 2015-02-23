# jzon
JZON is JSON Zipped Object Notation.  This could be used as a json compressor and decompressor; though this is probably best used to compress large json objects that you use statically in your projects.

Usage:

// Lots of objects that are reasonably similar.

var data = [{ person: 'Fred' }, { person: 'Mary' }, { person: 'John' }, { person: 'Mark' }];

// Zipped object... z.f is the format, z.z is the zipped data.

var z = jzon.zip(data);

// Unzip the data.

var reData = jzon.unzip(z);

// Should be the same.

console.log(JSON.stringify(data) === JSON.stringify(reData));
