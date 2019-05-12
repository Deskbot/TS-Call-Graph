TS-Call-Graph
=============

A program that creates interactable graphs of a TypeScript class.

The nodes and edges of the graph are laid out by applying forces between them using the JavaScript module `d3`.

Multi File Build
----------------

Build: `npm run build`

Run: Serve the files in `./out/multi-file` as part of a website

Single File Build
-----------------

Build: `npm run build-single`

Run: Open `./out/single-file/index.html`

Usage
-----

In the browser window, select a TypeScript file and a class name from that file. A graph of that class will be produced. The nodes are attributes and methods. The edges are from a method to an attribute/method it uses anywhere within the method defintion.

A method that calls itself appears with a small arrow ahead that appears to point to it from nowhere.

Nodes for public members of the class appear with no outline.

Nodes for protected members of the class have a light grey outline.

Nodes for private members of the class have a black outline.

Configuration
-------------

From playing with the numbers, I don't believe there are ideal parameters for laying out a graph of a class like this. The size of a class and how tangled the relationships are will affect what parameters are better.

I recommend modifying `ts/browser/draw.ts` to something that works for you.

I have left some commented out forces there too for pulling up / pushing down nodes depending on how many parents and children they have, which could also be useful.
