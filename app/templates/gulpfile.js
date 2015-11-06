// generated on <%= date %> using <%= pkg %> <%= version %>

var del = require('del'),
	es = require('event-stream'),
	gulp = require('gulp'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	fs = require('fs');
	exec = require('child_process').exec
	$ = gulpLoadPlugins(),
	browserSync = require('browser-sync');


var reload = browserSync.reload;
var sizes = [];
var regexp = /^[0-9]+x[0-9]+(_.*)?$/;

// Directories
var deliveryDir = 'delivery',
	distDir = 'dist',
	tmpDir = '.tmp',
	srcDir = 'src';


var onError = function(error, stdout, stderr) { 
	console.error(error) 
	console.log(stdout) 
}


gulp.task('clean', del.bind(null, [tmpDir, distDir, deliveryDir]));


gulp.task('sizes', function(callback) {
	fs.readdir(srcDir, function(err, items) {
	    for (var i=0; i<items.length; i++) {
	        if (items[i].match(regexp) && sizes.indexOf(items[i]) === -1) {
	        	sizes.push(items[i]);
	        }
	        if (i === items.length - 1 && callback) {
			  	callback();
			}
	    }
	});
});


gulp.task('default', ['clean', 'sizes'], function() {
  	
	var distPath = './' + distDir;
	fs.stat(distPath, function(err, stats) {
		if(err == null) {
	        // console.log(distDir + ' exists');
	    } else if(err.code == 'ENOENT') {
	        fs.mkdir('./' + distDir);
	    } else {
	        console.log('Some other error: ', err.code);
	    }
	});
	
	var deliveryPath = './' + deliveryDir;
	fs.stat(deliveryPath, function(err, stats) {
		if(err == null) {
	        // console.log(distDir + ' exists');
	    } else if(err.code == 'ENOENT') {
	        fs.mkdir('./' + deliveryDir);
	    } else {
	        console.log('Some other error: ', err.code);
	    }
	});

	gulp.start('dist');

});
  
gulp.task('images', function() {
	var streams = [];

	for (var i = 0; i < sizes.length; i++) {
		var stream = gulp.src(srcDir + '/' + sizes[i] + '/images/*')
			.pipe($.if($.if.isFile, $.cache($.imagemin({
				progressive: true,
				interlaced: true,
				// don't remove IDs from SVGs, they are often used
				// as hooks for embedding and styling
				svgoPlugins: [{cleanupIDs: false}]
			}))
			.on('error', function (err) {
				console.log(err);
				this.end();
			})))
			.pipe(gulp.dest(distDir + '/' + sizes[i] + '/images'));

		streams.push(stream);
	}
	
	return es.concat(streams);
});
  
gulp.task('styles', ['sizes'], function(callback) {
	var streams = [];
	for (var i = 0; i < sizes.length; i++) {
		<% if (includeSass) { %>
		var stream = gulp.src(srcDir + '/' + sizes[i] + '/styles/*.scss')
			.pipe($.plumber())
			.pipe($.sourcemaps.init())
			.pipe($.sass.sync({
				outputStyle: 'expanded',
				precision: 10,
				includePaths: ['.']
			}).on('error', $.sass.logError))
		    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
		    .pipe($.sourcemaps.write())
		    .pipe(gulp.dest(tmpDir + '/' + sizes[i] + '/styles'))
		    .pipe($.reload({stream: true}));

		<% } else { %>
		var stream = gulp.src(srcDir + '/' + sizes[i] + '/styles/*.css')
		    // .pipe($.sourcemaps.init())
		    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
		    // .pipe($.sourcemaps.write())
		    .pipe(gulp.dest(tmpDir + '/' + sizes[i] + '/styles'))
		    // .pipe($.reload({stream: true}));
		<% } %>

		streams.push(stream);
	}
	return es.concat(streams)

});

gulp.task('html', ['styles'], function() {
	var streams = [];

	for (var i = 0; i < sizes.length; i++) {
		var assets = $.useref.assets({searchPath: [tmpDir + '/' + sizes[i], srcDir + '/' + sizes[i], '.']});
		stream = gulp.src(srcDir + '/' + sizes[i] + '/*.html')
			.pipe(assets)
			.pipe($.if('*.js', $.uglify()))
			.pipe($.if('*.js', $.stripDebug()))
			.pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
			.pipe(assets.restore())
			.pipe($.useref())
			.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
			.pipe(gulp.dest(distDir + '/' + sizes[i]));
		
		streams.push(stream);
	}
	return es.concat(streams);

});


gulp.task('extras', function() {
	var streams = [];

	for (var i = 0; i < sizes.length; i++) {
		stream = gulp.src([
			srcDir + '/' + sizes[i] + '/*.*',
			'!' + srcDir + '/' + sizes[i] + '/*.html'
		], {
			dot: true
		}).pipe(gulp.dest(distDir + '/' + sizes[i]));

		streams.push(stream);
	}
	return es.concat(streams);	
});


gulp.task('serve', ['styles'], function() {
	browserSync({
		notify: false,
		port: 9000,
		startPath : sizes.length > 0 ? sizes[0] : null,
		server: {
			baseDir: [tmpDir, srcDir],
			routes: {
				// '/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		srcDir + '/**/*.html',
		srcDir + '/**/*.js',
		srcDir + '/**/*'
		// '.tmp/fonts/**/*'
	]).on('change', reload);

	gulp.watch(srcDir + '/**/*.scss', ['styles']);
	// gulp.watch('app/fonts/**/*', ['fonts']);
	// gulp.watch('bower.json', ['wiredep', 'fonts']);
});


gulp.task('dist', ['images', 'html', 'extras'], function() {
	
    for (var i = 0; i < sizes.length; i++) {
    	var src = sizes[i];
    	var dest = deliveryDir + '/' + sizes[i] + '.zip';
        var cmd = [
        	'cd',
        	distDir,
        	'&&',
        	'zip', 
        	'-r', __dirname + '/' + dest, 
        	src, 
        	'-x', '"*.DS_Store"'
        ];
    	// console.log(cmd.join(' '))
    	// console.log($.size({title: 'build', gzip: true}))
    	// console.log('Zip ' + sizes[i] + ' => ' + sizes[i] + '.zip');
		exec(cmd.join(' '), function(error, stdout, stderr) { 
			// console.error(error) 
			// console.log('---') 
			// console.log(stdout) 
		});
    };
  	
});
 