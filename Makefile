all:
	tsc
	browserify out/main.js -o public/script.js
	em++ -std=c++11 -O2 -o public/lib.js src/lib/Complex.cpp src/lib/lib.cpp