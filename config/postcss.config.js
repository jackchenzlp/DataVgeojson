/* **
 * 配置postCSS自动添加css的兼容前缀
 * 安装 npm i postcss-loader autoprefixer -D命令 
 * 导入自动添加前缀的插件以适应不同的浏览器
 * 在webpack.config.js 的module -> rules 数组中，修改css的 loader规则如下:
 * module: {rules: [{ test:/ \.css$/,use: ['style-loader', 'css-loader'，'postcss-loader'] }]}
 * */
const autoprefixer = require ('autoprefixer')
module.exports = {
plugins: [autoprefixer]//挂载插件
}
/* module.exports = {
    plugins: [require('autoprefixer')({
        overrideBrowserslist: [
            "defaults",
            "Android 4.1", 
            "Chrome>31", 
            "ff>31", 
            "ie>=8",
            "last 2 versions"
        ]
    })]
} */