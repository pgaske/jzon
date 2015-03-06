# jzon
JZON is JSON Zipped Object Notation.  This can be used as a json compressor and decompressor best suited to compress large json object arrays that you use statically in your projects.

Usage:

// Lots of objects that are reasonably similar.

var data = [{ person: 'Fred' }, { person: 'Mary' }, { person: 'John' }, { person: 'Mark' }];

// Zipped object... z.f is the format, z.z is the zipped data.

var c = JZON.compress(data);

// Unzip the data.

var u = JZON.uncompress(z);

// Should be the same.

console.log(JSON.stringify(data) === JSON.stringify(reData));
