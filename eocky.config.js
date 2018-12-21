/**
 * @file eocky 配置文件入口
 */
'use strict';

const path = require('path');
const pkgInfo = require('./package.json');

module.exports = {
    source: './_docs/src',
    output: './dist',
    htmlTemplate: path.join(__dirname, './_docs/template.html'),
    theme: './_docs/theme',
    themeConfig: {
        home: '/',
        name: pkgInfo.name,
        description: pkgInfo.description,
        navigation: [
            {title: '基础组件', link: '/components/Guide'}
        ]
    },
    devServerConfig: {
        quiet: false
    },
    webpackConfig(config) {
        config.resolve.alias = {
            'seui': path.resolve(__dirname, './src/components/')
        };
        config.watch = false;
        return config;
    },
    port: 8000,
    root: '/'
};
