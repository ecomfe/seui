/**
 * @file build
 * @author ielgnaw(wuji0223@gmail.com)
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const babelHelpers = require('gulp-babel-external-helpers');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const NpmImportPlugin = require('less-plugin-npm-import');
const LessAutoprefix = require('less-plugin-autoprefix');
const filter = require('gulp-filter');

gulp.task('babel', function () {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(babelHelpers('babelHelpers.js', 'umd'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('less-compile', function () {
    return gulp.src('./src/**/*.less')
        .pipe(less({
            paths: [],
            plugins: [
                new NpmImportPlugin({prefix: '~'}),
                new LessAutoprefix({browsers: [
                    'iOS >= 7',
                    'Android >= 4.0',
                    'ExplorerMobile >= 10',
                    'ie >= 9'
                ]})
            ]
        }))
        .pipe(filter(['**', '!src/style/*']))
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('es'));
});

gulp.task('less-source', () => {
    return gulp.src('src/**/*.less')
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('es'));
});

gulp.task('icon', () => {
    return gulp.src('src/assets/**')
        .pipe(gulp.dest('lib/assets'))
        .pipe(gulp.dest('es/assets'));
});

gulp.task('es6Module', () => {
    return gulp.src('src/**/*.js').pipe(gulp.dest('es'));
});


gulp.task('build', [
    'babel', 'less-compile', 'icon', 'less-source',
    'es6Module'
]);

gulp.task('clean', () => {
    return gulp.src('lib', {read: false}).pipe(clean());
});

gulp.task('rebuild', ['clean', 'build']);
