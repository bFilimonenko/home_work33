// Завдання: Ваше завдання полягає у створенні проєкту, який використовує Gulp для автоматизації рутинних задач
// розробки. Ваш конфігураційний файл Gulp повинен мінімально підтримувати наступні можливості:

//Робота з препроцесором SCSS: Компіляція файлів SCSS у CSS, забезпечуючи більш гнучкий та ефективний процес
// створення стилів.
//    gulp-sass

//Оновлення сторінки в реальному часі: Автоматичне оновлення веб-сторінки у браузері при зміні коду, що покращує
// зручність розробки.
//    browser-sync

//Вендорні префікси: Автоматичне додавання вендорних префіксів до CSS властивостей, забезпечуючи кращу
// сумісність з різними браузерами. autoprefixer

//Стайлінг кінцевого та базового коду: Покращення читабельності CSS коду через форматування та оптимізацію
// структури. gulp-csscomb

//Мінімізація стилів: Зменшення розміру CSS файлів через видалення зайвих пробілів, коментарів тощо, що сприяє
// швидшому завантаженню сторінки.
//    cssnano

// Імпорт необхідних функцій і плагінів з Gulp та інших бібліотек
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

// Об'єкт із шляхами до файлів проєкту для легкого доступу та управління
const PATH = {
  scssRootFile: "./src/scss/style.scss", // Основний SCSS файл
  scssAllFiles: "./src/scss/**/*.scss", // Всі SCSS файли для спостереження
  scssFolder: "./src/scss/", // Папка з SCSS файлами
  buildCssFolder: "./dist/css/", // Папка для скомпільованих CSS файлів
  htmlFolder: "./", // Папка для HTML файлів
  htmlAllFiles: "./*.html", // Всі HTML файли для спостереження
  jsFolder: "./src/js/", // Папка з JS файлами
  jsAllFiles: "./src/js/**/*.js", // Всі JS файли для спостереження
  fontsAllFiles: "./fonts/**/*",
  iconsAllFiles: "./icons/**/*",
  imagesAllFiles: "./images/**/*",
  buildFolder: "./dist/",
  buildFonts: "./dist/fonts/",
  buildImages: "./dist/images/",
  buildIcons: "./dist/icons/",
  buildJS: "./dist/src/js/"
};

// Масив плагінів PostCSS для використання у задачах
const PLUGINS = [
  autoprefixer({ // Автоматично додає вендорні префікси до CSS
    overrideBrowserslist: ["last 5 versions"],
    cascade: true
  }),
  mqpacker({ sort: sortCSSmq }) // Групує та сортує медіа-запити
];

// Функція для компіляції SCSS у CSS
function compileScss() {
  return src(PATH.scssRootFile) // Вихідний файл
    .pipe(sass().on("error", sass.logError)) // Компіляція SASS у CSS із обробкою помилок
    .pipe(postcss(PLUGINS)) // Застосування плагінів PostCSS
    .pipe(csscomb()) // Форматування CSS коду
    .pipe(dest(PATH.buildCssFolder)) // Зберігання результату у вказану папку
    .pipe(browserSync.stream()); // Оновлення потоку BrowserSync для гарячого перезавантаження
}

// Функція для розробницької компіляції SCSS у CSS із source maps
function compileScssDev() {
  const pluginsForDevMode = [...PLUGINS]; // Копіювання масиву плагінів

  pluginsForDevMode.splice(0, 1); // Видалення autoprefixer з масиву плагінів для розробки

  return src(PATH.scssRootFile, { sourcemaps: true }) // Включення source maps
    .pipe(sass().on("error", sass.logError)) // Компіляція SASS у CSS із обробкою помилок
    .pipe(postcss(pluginsForDevMode)) // Застосування плагінів PostCSS без autoprefixer
    .pipe(dest(PATH.buildCssFolder, { sourcemaps: true })) // Зберігання результату з source maps
    .pipe(browserSync.stream()); // Оновлення потоку BrowserSync
}

// Функція для компіляції та мініфікації SCSS у CSS
function compileScssMin() {
  const pluginsForMinify = [...PLUGINS, cssnano({ preset: "default" })]; // Додавання cssnano для мініфікації

  return src(PATH.scssRootFile)
    .pipe(sass().on("error", sass.logError)) // Компіляція SASS у CSS із обробкою помилок
    .pipe(postcss(pluginsForMinify)) // Застосування плагінів PostCSS включно із мініфікацією
    .pipe(rename({ suffix: ".min" })) // Додавання суфіксу .min до імені файлу
    .pipe(dest(PATH.buildCssFolder)); // Зберігання мініфікованого файлу
}

// Функція для форматування SCSS файлів за допомогою csscomb
function comb() {
  return src(PATH.scssAllFiles) // Всі SCSS файли для обробки
    .pipe(csscomb()) // Застосування csscomb для форматування
    .pipe(dest(PATH.scssFolder)); // Зберігання відформатованих файлів
}

// Функція для ініціалізації BrowserSync
function syncInit() {
  browserSync.init({ // Налаштування сервера
    server: {
      baseDir: "./dist" // Базова директорія для сервера
    }
  });
}

// Асинхронна функція для оновлення BrowserSync
async function sync() {
  browserSync.reload();
}

// Функція для спостереження за змінами у файлах
function watchFiles() {
  syncInit(); // Ініціалізація BrowserSync
  watch(PATH.scssAllFiles, series(clearCss, compileScss, compileScssMin)); // Спостереження за SCSS файлами
  watch(PATH.htmlAllFiles, series(copyIndex, sync)); // Спостереження за HTML файлами
  watch(PATH.jsAllFiles, series(copyJs, sync)); // Спостереження за JS файлами
  watch(PATH.imagesAllFiles, series(clearImages, copyImages, sync));
  watch(PATH.iconsAllFiles, series(clearIcons, copyIcons, sync));
  watch(PATH.fontsAllFiles, series(clearFonts, copyFonts, sync));

}

// Видалення файлів з діст
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
  return src(PATH.fontsAllFiles)
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

// Реєстрація задач Gulp
task("dev", compileScssDev);
task("min", compileScssMin);
task("build", series(clearDist, compileScss, compileScssMin, copyIndex, copyFonts, copyImages, copyIcons, copyJs));
task("comb", comb);
task("watch", watchFiles);
