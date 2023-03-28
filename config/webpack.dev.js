//npm run dev运行这个命令会执行如下：
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
//const MiniCssExtractPlugin = require("mini-css-extract-plugin").default;
const htmlIndexPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, '../src/index.html'),
    inject: 'body',//将打包的javaScript打包到body底部
    filename: 'index.html'
})
const htmlHelpPlugin = new HtmlWebpackPlugin({
    template: path.join(__dirname, '../src/help.html'),
    inject: false,//不将打包的js文件加入html
    filename: 'help.html'
})


/* var webpack = require('webpack');
var PACKAGE = require('../package.json');
var banner = '\n ' + PACKAGE.name + ' - v' + PACKAGE.version + ' (' + PACKAGE.homepage + ') ' +
    '\n ' + PACKAGE.description + '\n ' +
    '\n ' + PACKAGE.license +
    '\n (c) ' + new Date().getFullYear() + '  ' + PACKAGE.author + '\n';

var pluginFiles = ['../src/main/disDrawMap.js','../src/main/showCodeMirror.js'];
 */
module.exports = [
    {
        entry: {
            index: path.join(__dirname, '../src/index.js'),
            bootstrap5: path.join(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'),
            leaflet: path.join(__dirname, '../node_modules/leaflet/dist/leaflet.js'),
            //disDrawMap: path.join(__dirname, '../src/js/disDrawMap.js'),
            //showCodeMirror: path.join(__dirname, '../src/js/showCodeMirror.js')

        },
        output: {
            path: path.join(__dirname, '../dist'),//输出文件路径
            filename: 'js/[name].js'//输入出文件的名称
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"

            }),
            htmlIndexPlugin,
            htmlHelpPlugin,
            new MiniCssExtractPlugin({//将css打包成为一个单独文件
                filename: "css/[name].css"
            }),

        ],
        mode: 'development',//development production
        module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: / \.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            /* {
                test: /\.html$/,//打包html中的图片
                loader: 'html-withimg-loader'
            }, */
            {
                test: /\.html$/,//打包html中的图片
                loader: 'html-loader',
                options:{
                    esModule:false
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        // 超过指定大小的图片参与打包，否则转为base64编码，单位是字节
                        limit: 1024 * 4, // 超过6kb大小的图片参与打包
                        // 将打包的图片统一放到img目录下，名称为：图片名称+8位hash码+图片后缀
                        name: '[name].[hash:4].[ext]',
                        // url-loader默认使用的是es6模块化，html-loader采用的是commonjs模块化
                        esModule: false,// 这边关闭es6模块化，统一使用commonjs模块化
                        outputPath: 'img/'
                    }
                }]

            },


            { test: /\.(eot|svg|ttf|woff|woff2)$/, use: ['file-loader'] },//bootstrap字体
            {
                /* test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                }, */

            },

                //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
            ]
        }
    }
];




