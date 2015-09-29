var startTiles = [['p', 's', 't', 'a'], ['a', 't', 'c', 'a'], ['e', 'h', 'd', 'b'], ['m', 'e', 'e', 'r']];
console.log(startTiles);

function copy(o) {
	var out, v, key;
	out = Array.isArray(o) ? [] : {};
	for (key in o) {
		v = o[key];
		out[key] = (typeof v === "object") ? copy(v) : v;
	}
	return out;
}

function FindPath(x, y, path, level, searchTiles) {
	var tiles = copy(searchTiles);

	if (tiles[y][x] == 0) { return; }
	path += tiles[y][x];
	if (path.length == 5) {
		if (path.indexOf('a') > -1 || path.indexOf('e') > -1 || path.indexOf('i') > -1 || path.indexOf('o') > -1 || path.indexOf('u') > -1 || path.indexOf('y') > -1){
			console.log(path);
		}
	}
	tiles[y][x] = 0;

	for (var row = y - 1; row <= y + 1; row++) {
		if (row < 0 || row > 3) { continue; }
		for (var col = x - 1; col <= x + 1; col++) {
			if (col < 0 || col > 3) { continue; }
			if (row == y && col == x) { continue; }
			//path += '[' + x + ',' + y + ']~';
			if (path.length != 5) {
				FindPath(col, row, path, ++level, tiles);
			}
		}
	}

}

FindPath(2, 2, '', 1, startTiles);