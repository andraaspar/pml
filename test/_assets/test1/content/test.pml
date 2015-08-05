«◄•►»
◄!DOCTYPE•
	◄@html•►
	«◄@PUBLIC•►
			◄@•-//W3C//DTD HTML 4.01//EN►
		◄@•http://www.w3.org/TR/html4/strict.dtd►»
►
◄html•
	◄@lang•en►
	◄head•
		◄meta•
			◄@charset•UTF-8►
		►
		◄title•PML 
test►
		◄!--•[if IE 8]>
<script>
	var isIe8 = true;
</script>
<![endif]►
		◄script•
			window.onload = function() {
				console.log('<Java&Script> here ~ howdy?');
			};
		►
		◄style•
			.main-title
			{
				color: gray;
			}
		►
	►
	◄«solid-»body•
		◄div►
		◄h1•
			«◄@class•«main-title»►»
			◄abbr•
				◄@title•HyperText Markup Language►
				◄•HTML►
			►
			◄• output test
►◄small•(Árvíztűrő tükörfúrógép)►►
		►
		◄p•The HTML source:►
		◄pre•
			◄code•<table border="1">
	<tr>
		<td>Cell 1</td><td>Cell 2</td><td>Cell 3</td>
	</tr>
	<tr>
		<td>Cell 4</td><td>Cell 5</td><td>Cell 6</td>
	</tr>
</table>►
		►►►»◄div
		◄p•This would« quite
probably» render as:►
		◄table•
			◄@border•1►
			◄tr•
				◄td•Cell 1►
				◄td•Cell 2►
				◄td•Cell 3►
			►
			◄tr•
				◄td•Cell 4►
				◄td•Cell 5►
				◄td•Cell 6►
			►
		►
		◄h3•The advantages of «◄i•»PML«►» over straight HTML►
		◄ul•
			◄li•No escape sequences.►
			◄li•◄•Use any character as delimiters (no need for ►◄code•<>►◄•).►►
			◄li•No writing tag names twice.►
			◄li•Tidier, easier to read source.►
			◄li•Writing about HTML tags, or PML tags, is super easy.►
			◄li•◄•No need to type ►◄code•<br/>►◄• tags.►►
			◄li•HTML compression.►
			◄li•Nested comments.►
			◄li•Comment anywhere.►
		►
		◄h3•The disadvantages of PML over straight HTML►
		◄ul•
			◄li•
				Having to use unnamed tags for ◄i•unstyled►
				 text is inconvenient (
				◄code•[~foo ][b~bar][~ baz]►		).
			►
			◄li•No tool support for checking HTML validity at editing time.►
			◄li•Files are larger when abusing obscure Unicode characters in UTF-8.►
		«foo