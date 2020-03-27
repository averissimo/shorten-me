gulp = require 'gulp'
del = require 'del'
zip  = require 'gulp-zip'

packageFiles = [
  'src/**/*',
  '_locales/**/*',
  'icons/*.png',
  'options/**/*',
  'LICENSE',
  'manifest.json',
  'README.md'
]

manifest = require('./manifest.json')

outFile = "shorten_me-#{manifest.version}.zip"

gulp.task 'clean', ->
  del(['dist/' + outFile])

gulp.task 'package', gulp.series(['clean', ()->
    gulp.src packageFiles, { base: './' }
      .pipe(zip(outFile))
      .pipe(gulp.dest('dist'))
])

gulp.task('default', gulp.series(['package']));
