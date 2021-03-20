//system plagins
let { src, dest } = require("gulp");
let fs = require('fs');
let gulp = require("gulp");
let del = require("del");
let plumber = require("gulp-plumber");
let browsersync = require("browser-sync").create();
let rename = require("gulp-rename");
let newer = require("gulp-newer");
//HTML plagins
let fileinclude = require("gulp-file-include");
//CSS plagins
let autoprefixer = require("gulp-autoprefixer");
let cssbeautify = require("gulp-cssbeautify");
let removeComments = require("gulp-strip-css-comments");
let group_media = require("gulp-group-css-media-queries");
let sass = require("gulp-sass");
let cssnano = require("gulp-cssnano");
//JS plagins
let rigger = require("gulp-rigger");
let uglify = require("gulp-uglify");
//IMG plagins
let imagemin = require("gulp-imagemin");
let svgSprite = require("gulp-svg-sprite");
//fonts
let ttf2woff2 = require("gulp-ttf2woff2");
let ttf2woff = require("gulp-ttf2woff");
let fonter = require("gulp-fonter");
//Path
let project_name = require("path").basename(__dirname);
let src_folder = "src";

let path = {
	build: {
		html: project_name + "/",
		js: project_name + "/js/",
		css: project_name + "/css/",
		images: project_name + "/img/",
		fonts: project_name + "/fonts/",
		videos: project_name + "/videos/"
	},
	src: {
		favicon: src_folder + "/img/favicon.{jpg,png,svg,gif,ico,webp}",
		html: [src_folder + "/*.html", "!" + src_folder + "/_*.html"],
		js: [src_folder + "/js/app.js", src_folder + "/js/vendors.js"],
		css: src_folder + "/scss/style.scss",
		images: [src_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}", "!**/favicon.*"],
		fonts: src_folder + "/fonts/*.ttf",
		videos: src_folder + "/videos/*.*"
	},
	watch: {
		html: src_folder + "/**/*.html",
		js: src_folder + "/**/*.js",
		css: src_folder + "/scss/**/*.scss",
		images: src_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
	},
	clean: "./" + project_name + "/"
};
//Browes
function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./" + project_name + "/"
		},
		notify: false,
		port: 3000,
	});
}
//HTML 
function html() {
	return src(path.src.html, { base: "src/" })
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}
//CSS 
function css() {
	return src(path.src.css, { base: "src/scss/" })
		.pipe(plumber())
		.pipe(sass({
			outputStyle: "expanded"
		}))
		.pipe(group_media())
		.pipe(
			autoprefixer({
				rowserslist: ["last 5 versions"],
				cascade: true,
			})
		)
		.pipe(cssbeautify())
		.pipe(dest(path.build.css))
		.pipe(
			cssnano({
				zindex: false,
				discardComments: {
					removeAll: true,
				},
			})
		)
		.pipe(
			rename({
				suffix: ".min",
				extname: ".css",
		})
		)
		.pipe(removeComments())
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}
//JS
function js() {
	return src(path.src.js, {})
		.pipe(plumber())
		.pipe(rigger())
		.pipe(gulp.dest(path.build.js))
		.pipe(uglify(/* options */))
		.pipe(
			rename({
				suffix: ".min",
				extname: ".js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}
//IMG
function images() {
	return src(path.src.images)
		.pipe(newer(path.build.images))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.images))
		.pipe(browsersync.stream());
}
//Favicon create
function favicon() {
	return src(path.src.favicon)
		.pipe(plumber())
		.pipe(
			rename({
				extname: ".ico"
			})
		)
		.pipe(dest(path.build.html))
}
//Sprite create
function sprite() {
  return src('./' + src_folder + '/img/**/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg", //sprite file name
            example: true,
          },
        },
      })
    )
    .pipe(dest(path.build.images));
}
//Video
function videos() {
	return src(path.src.videos)
		.pipe(plumber())
		.pipe(dest(path.build.videos))
}
//Fonts
function fonts_otf() {
	return src('./' + src_folder + '/fonts/*.otf')
		.pipe(plumber())
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(gulp.dest('./' + src_folder + +'/fonts/'));
}
function fonts() {
	src(path.src.fonts)
		.pipe(plumber())
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
		.pipe(browsersync.stream());
}
function fontstyle() {
	let file_content = fs.readFileSync(src_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(src_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(src_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}
function cb() { }
//Clear path
function clean() {
	return del(path.clean);
}
//Wathc to Files
function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.images], images);
}
//Run command
let build = gulp.series(clean, fonts_otf, gulp.parallel(html, css, js, favicon, images, videos), fonts, gulp.parallel(fontstyle));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.videos = videos;
exports.favicon = favicon;
exports.fonts_otf = fonts_otf;
exports.fontstyle = fontstyle;
exports.fonts = fonts;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;