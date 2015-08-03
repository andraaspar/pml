

module pml {
	export class Linter {
		
		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;
		
		private warnings: string[];
		private errors: string[];
		
		constructor() {
			
		}
		
		lint(src: string): void {
			this.warnings = [];
			this.errors = [];
			
			this.readDelimiters(src);
			this.checkDelimiters();
			this.checkStructure(src);
		}
		
		protected readDelimiters(src: string): void {
			this.commentStart = src.slice(0, 1);
			this.tagStart = src.slice(1, 2);
			this.valueDelimiter = src.slice(2, 3);
			this.tagEnd = src.slice(3, 4);
			this.commentEnd = src.slice(4, 5);
		}
		
		protected checkDelimiters(): void {
			var delimiters = [this.commentStart, this.tagStart, this.valueDelimiter, this.tagEnd, this.commentEnd];
			var names = ['Comment start', 'Tag start', 'Value', 'Tag end', 'Comment end'];
			for (var i = 0, n = delimiters.length; i < n; i++) {
				this.checkDelimiter(delimiters[i], names[i]);
				var i2 = illa.ArrayUtil.indexOf(delimiters, delimiters[i], i + 1);
				if (i2 > -1) {
					this.errors.push(names[i] + ' delimiter clashes with ' + names[i2] + ' delimiter.');
				}
			}
		}
		
		protected checkDelimiter(char: string, name: string): void {
			var invalidDelimitersRE = /[\s\r\n]/;
			if (!char) {
				this.warnings.push(name + ' delimiter is missing.');
			}
			if (invalidDelimitersRE.test(char)) {
				this.warnings.push(name + ' delimiter is a whitespace or line break character.');
			}
		}
		
		protected checkStructure(src: string): void {
			var whiteSpaceRE = /\s/;
			var lines = src.split(/\r\n|\n|\r/g);
			var level = 0;
			var commentLevel = 0;
			var isKey = false;
			var isIgnored = true;
			for (var i = 0, n = lines.length; i < n; i++) {
				var line = lines[i];
				var warnedAboutDataLoss = false;
				
				for (var j = 0, o = line.length; j < o; j++) {
					
					var char = line.charAt(j);
					if (commentLevel > 0) {
						
					} else if (level > 0) {
						
					} else {
						if (char == this.commentStart) {
							commentLevel++;
						} else if (char == this.tagStart) {
							level++;
						} else if (!warnedAboutDataLoss && !whiteSpaceRE.test(char)) {
							this.warnings.push((i + 1) + ':' + (j + 1) +': Non whitespace characters will be ignored.');
							warnedAboutDataLoss = true;
						}
					}
				}
			}
		}
	}
}