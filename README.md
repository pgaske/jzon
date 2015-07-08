# jzon
JZON is JSON Zipped Object Notation.  This can be used as a json compressor and decompressor best suited to compress large json object arrays that you use statically in your projects.

Future direction is to add a C# implementation so your server can talk compressed format; or send the format only once and send future updates as the compressed data.

Usage:

    // Lots of objects that are reasonably similar.
    var data = [{ person: 'Fred' }, { person: 'Mary' }, { person: 'John' }, { person: 'Mark' }];
    
    // Compressed object... z.f is the format, z.c is the compressed data.
    var z = JZON.compress(data);
    
    // Unzip the data.
    var u = JZON.uncompress(z);
    
    // Should be the same.
    console.log(JSON.stringify(data) === JSON.stringify(u));
