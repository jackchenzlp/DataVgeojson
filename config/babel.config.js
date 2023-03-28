/* 
 * 处理js 文件中的高级语法 babel
 * 安装: npm i babel-loader @babel/core @babel/runtime -D
 * 安装插件: npm i @babel/preset-env @babel/plugin-transform-runtime @babel/plugin-proposal-class-properties -D
 * 创建babel配置文件 babel.config.js 并初始化基本配置如下:
 * module.exports = {
 * presets: [" @babel/preset-env' ],
 * plugins: [ '@babe1/plugin-transform-runtime'，'@babel/plugin-proposal-tclass-properties']
 * }
 * 在 webpack.config.js 的module -> rules 数组中，添加loader 规则如下;
 * exclude为排除项，表示 babel-loader 不需要处理node_modules 中的js 文件
 * { test: /\.js$/,use: 'babe-loader ',exclude: /node_modules/ }
 */

module.exports = {
    //智能预设：可以编译ES6的语法
    presets: ['@babel/preset-env'],
    plugins: [ '@babe1/plugin-transform-runtime','@babel/plugin-proposal-tclass-properties']
}