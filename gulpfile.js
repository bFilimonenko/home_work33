const { src, dest, watch, task, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const cssnano = require("cssnano");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const csscomb = require("gulp-csscomb");
const autoprefixer = require("autoprefixer");
const del = require("del");
const svgmin = require("gulp-svgmin");
const jsmin = require("gulp-minify");
const mqpacker = require("css-mqpacker");
const sortCSSmq = require("sort-css-media-queries");

const PATH = {
  buildFolder: "./dist/",
  buildCssFolder: "./dist/css/",
  buildFonts: "./dist/fonts/",
  buildImages: "./dist/images/",
  buildIcons: "./dist/icons/",
  buildJS: "./dist/src/js/",
  scssRootFile: "./src/scss/style.scss",
  scssAllFiles: "./src/scss/**/*.scss",
  scssFolder: "./src/scss/",
  htmlFolder: "./",
  htmlAllFiles: "./*.html",
  jsFolder: "./src/js/",
  jsAllFiles: "./src/js/**/*.js",
  fontsAllFiles: "./fonts/**/*",
  iconsAllFiles: "./icons/**/*",
  imagesAllFiles: "./images/**/*"
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ["last 5 versions"],
    cascade: true
  }),
  mqpacker({ sort: sortCSSmq })
];

function compileScss() {
  return src(PATH.scssRootFile)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(csscomb())
    .pipe(dest(PATH.buildCssFolder))
    .pipe(browserSync.stream());
}

function compileScssDev() {
  const pluginsForDevMode = [...PLUGINS];
  pluginsForDevMode.splice(0, 1);

  return src(PATH.scssRootFile, { sourcemaps: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(pluginsForDevMode))
    .pipe(dest(PATH.buildCssFolder, { sourcemaps: true }))
    .pipe(browserSync.stream());
}

function compileScssMin() {
  const pluginsForMinify = [...PLUGINS, cssnano({ preset: "default" })];

  return src(PATH.scssRootFile)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss(pluginsForMinify))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(PATH.buildCssFolder));
}

function comb() {
  return src(PATH.scssAllFiles)
    .pipe(csscomb())
    .pipe(dest(PATH.scssFolder));
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: PATH.buildFolder
    }
  });
}

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssAllFiles, series(clearCss, compileScss, compileScssMin));
  watch(PATH.htmlAllFiles, series(copyIndex, sync));
  watch(PATH.jsAllFiles, series(copyJs, sync));
  watch(PATH.imagesAllFiles, series(clearImages, copyImages, sync));
  watch(PATH.iconsAllFiles, series(clearIcons, copyIcons, sync));
  watch(PATH.fontsAllFiles, series(clearFonts, copyFonts, sync));

}

function clearDist() {
  return del(`${PATH.buildFolder}*`);
}

function clearCss() {
  return del(`${PATH.buildCssFolder}*`);
}

function clearImages() {
  return del(`${PATH.buildImages}*`);
}

function clearFonts() {
  return del(`${PATH.buildFonts}*`);
}

function clearIcons() {
  return del(`${PATH.buildIcons}*`);
}

function copyIndex() {
  return src(PATH.htmlAllFiles)
    .pipe(dest(PATH.buildFolder));
}

function copyFonts() {
  return src(PATH.fontsAllFiles, { encoding: false })
    .pipe(dest(PATH.buildFonts));
}

function copyImages() {
  return src(PATH.imagesAllFiles, { encoding: false })
    .pipe(dest(PATH.buildImages));
}

function copyIcons() {
  return src(PATH.iconsAllFiles)
    .pipe(svgmin())
    .pipe(dest(PATH.buildIcons));
}

function copyJs() {
  return src(PATH.jsAllFiles)
    .pipe(jsmin({
      ext: {
        min: ".js"
      }
    }))
    .pipe(dest(PATH.buildJS));
}

task("dev", compileScssDev);
task("min", compileScssMin);
task("build", series(clearDist, compileScss, compileScssMin, copyIndex, copyFonts, copyImages, copyIcons, copyJs));
task("comb", comb);
task("watch", watchFiles);
