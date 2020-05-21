"use strict"

var gulp = require("gulp"); // подключаем gulp
var sass = require("gulp-sass"); // подключаем gulp-sass
var plumber = require("gulp-plumber"); // подключаем gulp-plumber
var sourcemap = require("gulp-sourcemaps"); // подлючаем sourcemap
var rename = require("gulp-rename"); //
var svgstore = require("gulp-svgstore"); // Подключаем библиотеку для создания спрайтов
var postcss = require("gulp-postcss"); // подключаем gulp-postcss
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var autoprefixer = require("autoprefixer"); // подключаем autoprefixer
var csso = require("gulp-csso"); // подключаем минификатор csso
var imagemin = require("gulp-imagemin"); // подключаем imagemin (оптимизирует графику)
var webp = require("gulp-webp"); // подключаем gulp-webp
var del = require("del");
var server = require("browser-sync").create(); // подключаем browser-sync для создания сервера

gulp.task("images", function () { // создаем задачу images и запускаем функцию
  return gulp.src("source/img/**/*.{png,jpg,svg}") // начинаем искать файлы. В папке source есть папка img, на любой вложенности внутри нам требуются вот такие расширения файлов png, jpg, svg
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 7}), // оптимизация png 7 лвла = 160 прогонов. Вызывается командой npx gulp images
      imagemin.jpegtran({quality: 75, progressive: true}), // загружается файл целиком в прогрессивном режиме, то есть не полностью, видны лишь силуэты
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img")); // Все файлы в конечном итоге кладем в source/img
});

gulp.task("webp", function () { // Создаем задачу с названием webp. Функция будет делать следующее >
  return gulp.src("source/img/**/*.{png,jpg}") // в папке img и во всех вложенностях найдет все png, jpg и положит в source/img
    .pipe(webp({quality: 90})) // bут они из png, jpg превратятся в webp
    .pipe(gulp.dest("build/img")); // итоговые файлы будут webp
});

gulp.task("sprite", function() { // Создаем задачу sprite
  return gulp.src("source/img/icons/icon-*.svg") // Ищем все иконки в source/img/icon-*.svg - с любым дальше названием fb, vk. и т.д
    .pipe(svgstore({ // Добавляем обработчик иконок (прекращатор) в спрайт
      inlineSvg: true // Удалит все комментарии из svg
    }))
    .pipe(rename("sprite.svg")) // Все файлы, с помощью svgstore превратятся в один файл
    .pipe(gulp.dest("build/img/sprite")); // кладем в source/img
});

gulp.task("html", function () {
  return gulp.src("source/*.html") // найти все html файлы
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build")); // положить все файлы в source
});

gulp.task("css", function () { // создаем задачу с названием "css" и описываем функцию
  return gulp.src("source/sass/style.scss") // возвращает gulp, который найдет файл style.scss (главный препроцессорный файл, в котором сделали все импорты)
  .pipe(plumber()) // берет препроцессорные файлы, вешает все обработчики на эти файлы (начинает следить). Если происходит ошибка, он ругается в консолль, но при этом сборка не ломается
  .pipe(sourcemap.init()) // инициализирует файл (фиксирует состояние препроцессорного кода)
  .pipe(sass()) // передаем в sass,  sass перерабатывает scss файлы в css файл
  .pipe(postcss([ // css файл передаем в postcss и вызываем новую задачу, autoprefixer
    autoprefixer() // autoprefixer расставляет css - свойства с префиксами
  ]))
  .pipe(csso())
  .pipe(rename("style.min.css"))
  .pipe(sourcemap.write(".")) // появляется второе состояние (с префиксами)
  .pipe(gulp.dest("build/css")); // и передаем готовый (результирующий) css файл в папку css с префиксами
});

gulp.task("server", function() { // создаем задачу с названием server
  server.init({ // инициализация сервера (вызов сервера)
    server: "source/" // сервер будет следить за этой директорией, где будут лежать все файлы
  });

  gulp.watch("source/sass/**/*.{sass,scss}", gulp.series("css")); // будет искать в source'e файлы sass, scss и как только сделают изменения, будет выполняться задача css (возьми scss файлы, sourcemap'ы, автопрефиксеры и положи вот в такую - то папочку)
  gulp.watch("source/*.html").on("change", server.reload); // следит за изменениями всех html файлов, которые лежат в папке source. И как только они изменятся, перезагрузи сервер
});

gulp.task("copy", function () { // создаем задачу копирования
  return gulp.src([ // находим
    "source/fonts/**/*.{woff,woff2}", // все шрифты
    "source/img/**", // все картинки
    "source/js/**", // все js файлы
    "source/*.ico" // все иконки
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build")); // и переносим в папку build
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html"
));

gulp.task("start", gulp.series("css", "server")); // будет последовательно запускать задачу css, и после того, как эта задача выполнится (получится итоговый css файл со всеми префиксами и картой кода), запустится задача "сервер") То есть, мы говорим "выполняй сколько угодно задач последовательно".
