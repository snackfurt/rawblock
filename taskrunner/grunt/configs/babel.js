module.exports = {
    options: {
        presets: ['es2015-loose', 'es2016', 'es2017'],
        plugins: [
            'transform-es2015-modules-umd',
            ['transform-runtime', {
                polyfill: false,
            }],
        ],
    },
    dist: {
        files: [
            {
                expand: true,
                cwd: 'components/',
                src: ['**/*.js', '!*-tests.js', '!*-tests.js'],
                dest: 'es5/components/',
            },
            {
                expand: true,
                cwd: '',
                src: ['$.js', 'crucial.js', 'main.js'],
                dest: 'es5/',
            },
            {
                expand: true,
                cwd: 'rb_$/',
                src: ['*.js'],
                dest: 'es5/rb_$/',
            },
            {
                expand: true,
                cwd: 'utils/',
                src: ['**/*.js', '!*-tests.js', '!*-tests.js'],
                dest: 'es5/utils/',
            }
        ]
    }
};