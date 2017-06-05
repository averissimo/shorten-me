gulp = require 'gulp'
del = require 'del'
zip  = require 'gulp-zip'

packageFiles = [
  'src/**/*',
  '_locales/**/*',
  'icons/*',
  'options/**/*',
  'LICENSE',
  'manifest.json',
  'README'
]

gulp.task 'clean', ->
  del(['dist/archive.zip'])

gulp.task 'package', ['clean'], ->
    gulp.src packageFiles, { base: './' }
      .pipe(zip('archive.zip'))
      .pipe(gulp.dest('dist'))


gulp.task('default', ['package']);
