//npm run dev运行这个命令会执行如下：
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

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
            index:path.join(__dirname, '../src/index.js'),
            bootstrap5: path.join(__dirname, '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'),
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
             // 打包时，把 dist 目录下的文件内容先清除
             new CleanWebpackPlugin()
        ],
        mode: 'production',//development production
        module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
            { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
            { test: / \.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
            {
                test: /\.html$/,//打包html中的图片
                loader: 'html-loader',
                options:{
                    esModule:false
                }
            },
            {
                test: /\.(jpg|png|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        // 如果图片太大再转成base64, 会让图片的体积增大 30% ，得不偿失。
                        options: {
                            esModule:false,
                            // 图片超过 10k ,就不转成 base 文件，当图片小于 10k ，就转成 base 文件。
                            limit: 20 * 1024,
                            // 配置图片打包后在dist中的文件名, name: '[name].[ext]' 我们希望打包后的图片文件名和没打包前的图片名是一样的。
                            name: '[name].[ext]',
                            // 配置静态资源的引用路径。publicPath是打包后的 css 引用打包后的 图片的路径。意思是说css引用的的图片需要先回到上级，然后在 images 下寻找图片
                            //publicPath: "../img/",
                            // 配置打包后的图片 dist 下的 images 文件夹下面。
                            outputPath: "imgs"
                        }
                    }
                ]
            },
            { test: /\.(eot|svg|ttf|woff|woff2)$/, use: [ 'file-loader']},//bootstrap字体
            /* {
                test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                },
            }, */

                //{ test: /\.js$/, use: 'babe-loader ', exclude: /node_modules/ }
            ]
        }
    }
];




