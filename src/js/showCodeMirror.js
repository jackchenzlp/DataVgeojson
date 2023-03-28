/**
 * @type {object} 全局对象变量
 * @param 参数：createGeojson函数的返回值
 * @discription CodeMirror返回值在bootstrap选项卡中为DrawGeojson标签内容
 */
let GlobalEditor_Geojson;

/**
 * @type {object} 全局CodeMirror对象变量
 * @discription CodeMirror被创建时的实例对象在bootstrap选项卡中为FileGeojson标签内CodeMirror对象
 */
let GlobalEditor_FileGeojson;

/**
 * @type {object} 全局对象变量
 * @discription CodeMirror返回值在bootstrap选项卡中为Help标签内容
 */
let GlobalEditor_Help;

/**
 * @type {boolean}全局变量默认true
 * @discription DarwGeojson选项卡开关
 * @discription 它决定保存文件是那一个选项卡中的内容被保存
 */
let GlobalTabShow_Geojson = true;

/**
 * @type {boolean}全局变量默认false
 * @discription FileGeojson选项卡开关
 * @discription 它决定保存文件是那一个选项卡中的内容被保存 
 */
let GlobalTabShow_FileGeojson = false;

/**
 * @type {boolean}全局变量
 * @discription Help选项卡开关
 * @discription 使用帮助文件
 */
let GlobalTabShow_help = false;

/**
 * @function 创建CodeMirror对象在html标签<id ="codeeditor-geojson">
 * @param 参数：无参数
 * @returns 返回CodeMirror对象
 */
function createGeojson() {
    let tab_content = document.getElementById("myTabjustifiedContent")
    var h = (tab_content.offsetHeight) * 0.9;    // 返回元素的总高度  
    var darwGeojson = CodeMirror(document.getElementById("codeeditor-geojson"), {
        mode: "javascript",//模式 
        theme: "idea",//主题样式
        tabSize: 5, // tab的空格个数
        lineNumbers: true, //是否显示行数
        autoRefresh: true, // 重点是这句，为true/还要引入codeMirror文件夹下的addon/display/autorefresh.js
        //lineWrapping: true, // 是否应滚动或换行以显示长行
        extraKeys: { Ctrl: 'autocomplete' },
        autocorrect: true,
        lineWiseCopyCut: true, // 在没有选择的情况下进行复制或剪切将复制或剪切有光标的整行。
        showCursorWhenSelecting: true, // 选择处于活动状态时是否应绘制光标
        maxHighlightLength: Infinity, // 显示长行的时候 这个值是不限制，如果要做限制的话，值是number类型
        matchBrackets: true, // 光标匹配括号
        smartIndent: true, // 智能缩进
        firstLineNumber: 1
    });
    darwGeojson.setSize('auto', h);
    return darwGeojson;
};

/**
 * @function 创建CodeMirror对象在html标签<id ="codeeditor-localjson">
 * @param 参数：无参数
 * @returns 返回CodeMirror对象
 */
function createFileGeojson() {
    let tab_content = document.getElementById("myTabjustifiedContent")
    var h = (tab_content.offsetHeight) * 0.9;    // 返回元素的总高度   
    var codeMirror_FileGeojson = CodeMirror(document.getElementById("codeeditor-localjson"), {
        mode: "javascript",
        theme: "idea",
        tabSize: 5,
        lineNumbers: true,
        autoRefresh: true, // 重点是这句，为true/还要引入codeMirror文件夹下的addon/display/autorefresh.js
        //lineWrapping: true, // 是否应滚动或换行以显示长行
        extraKeys: { Ctrl: 'autocomplete' },
        autocorrect: true,
        lineWiseCopyCut: true, // 在没有选择的情况下进行复制或剪切将复制或剪切有光标的整行。
        showCursorWhenSelecting: true, // 选择处于活动状态时是否应绘制光标
        maxHighlightLength: Infinity, // 显示长行的时候 这个值是不限制，如果要做限制的话，值是number类型
        matchBrackets: true, // 光标匹配括号
        smartIndent: true, // 智能缩进
        firstLineNumber: 1
    });
    codeMirror_FileGeojson.setSize('auto', h);
    return codeMirror_FileGeojson;
};

/**
 * @function 创建CodeMirror对象在html标签<id ="codeeditor-help">
 * @param 参数：无参数
 * @returns 返回CodeMirror对象
 */
function createHelp() {
    //这里高度固定死了596.7px  
    var help = document.getElementById("codeeditor-help")
    help.innerHTML = `<div calss ="help" style="width:100%;height:596.7px;">
    <iframe style="width:100%;height:100%;" name="iframe1" src="help.html"></iframe>
    </div>`
    return help;
};

/**
 * @function 初始化CodeMirror对象在html标签<id ="codeeditor-geojson">
 * @param 参数：无参数
 * 
 * @discription 在bootstrap选项卡(Tab)初始化并赋值给全局对象变量GlobalEditor_Geojson
 */
(function init() {
    GlobalEditor_Geojson = createGeojson();
    //添加初始化Geojson
    var id = "codeeditor-geojson"
    var result = AddInitGeojson(GlobalEditor_Geojson, id);
    //GlobalEditor_DarwObjArr.push(result)
})();

/**
 * @function 添加初始化geojson数据在codeMirror
 * @param {object} codeMirror_Geojson codeMirror对象变量
 * @param {string} html标签id
 * @return {object} 返回geojson data
 * @discription 查询id节点是否存在如果存在就添加初始化geojson  
 */
function AddInitGeojson(GlobalEditor_Geojson, id) {
    var result;
    var geojson_praent = document.getElementById(id);
    var geojson_cildren = geojson_praent.children[0];
    if (geojson_cildren) {
        var geojsonTxt = '{"type":"FeatureCollection","features":[]}';
        result = JSON.stringify(JSON.parse(geojsonTxt), null, 4);
        GlobalEditor_Geojson.setValue(result);
    }
    return result;
};

/**
 * @function 添加初始化geojson数据在codeMirror
 * @param {object} codeMirror_Geojson codeMirror对象变量
 * @param {string} html标签id
 * @return {object} 返回geojson data
 * @discription 查询id节点是否存在如果存在就添加初始化geojson  
 */
function AddInitFileGeojson(GlobalEditor_FileGeojson, id) {
    var result;
    var geojson_praent = document.getElementById(id);
    var geojson_cildren = geojson_praent.children[0]
    if (geojson_cildren) {
        var geojsonTxt = '{"type":"FeatureCollection","features":[]}';
        result = JSON.stringify(JSON.parse(geojsonTxt), null, 4);
        GlobalEditor_FileGeojson.setValue(result);
    }
    return result
};
/** 
 * @function 转换geojson对象为字符串
 * @param {object} geojson 
 * @returns 返回字符串
 */
function convertGeojsonObjToString(geojson){
    var geojsonObj;
    if (typeof geojson === 'object') {
        geojsonObj = JSON.stringify(geojson);
    } else {
        geojsonObj = geojson;
    }
    var result = JSON.stringify(JSON.parse(geojsonObj), null, 4);
    return result;
}
//选项卡点击事件（Navs and tabs）
//$(".nav-tabs button").click(function (e) {
$("#myTabjustified button").click(function (e) {
    e.preventDefault();
    $(this).tab("show");
    var idValue = e.target.id;
    switch (idValue) {
        case "geojson-tab":
            var json_praent = document.getElementById("codeeditor-localjson");
            var json_cildren = json_praent.children[0]
            if (json_cildren) {
                document.getElementById("codeeditor-localjson").innerHTML = "";
                GlobalTabShow_FileGeojson = false;
            }
            var help_praent = document.getElementById("codeeditor-help");
            var help_cildren = help_praent.children[0]
            if (help_cildren) {
                document.getElementById("codeeditor-help").innerHTML = "";
                GlobalTabShow_help = false;
            }
            if (GlobalEditor_DarwGeojsonObj) {
                var geojson_praent = document.getElementById("codeeditor-geojson");
                var geojson_cildren = geojson_praent.children[0]
                if (geojson_cildren) {
                    //如果codeeditor-geojson的子标签存在就不创建子标签                
                    var result = convertGeojsonObjToString(GlobalEditor_DarwGeojsonObj);
                    GlobalEditor_Geojson.setValue(result);
                    GlobalTabShow_Geojson = true;
                }else{
                    //如果codeeditor-geojson的子标签不存在就创建子标签
                    GlobalEditor_Geojson = createGeojson();           
                    var result = convertGeojsonObjToString(GlobalEditor_DarwGeojsonObj);
                    GlobalEditor_Geojson.setValue(result);
                    GlobalTabShow_Geojson = true;
                }
               
            } else {
                GlobalEditor_Geojson = createGeojson();
                var geojsonValue = GlobalEditor_Geojson.getValue();
                if (geojsonValue.length == 0) {
                    var id = "codeeditor-geojson"
                    AddInitGeojson(GlobalEditor_Geojson, id);
                    GlobalEditor_Geojson.refresh();
                }
                GlobalTabShow_Geojson = true;
            }

            break;
        case "json-tab":
            var geojson_praent = document.getElementById("codeeditor-geojson");
            var geojson_cildren = geojson_praent.children[0]
            if (geojson_cildren) {
                document.getElementById("codeeditor-geojson").innerHTML = "";
                GlobalTabShow_Geojson = false;
            }
            var help_praent = document.getElementById("codeeditor-help");
            var help_cildren = help_praent.children[0]
            if (help_cildren) {
                document.getElementById("codeeditor-help").innerHTML = "";
                GlobalTabShow_help = false;
            }
            //获取disDrawMap.js中的全局变量对象
            if (GlobalGeojsonObj) {
                var localjson_praent = document.getElementById("codeeditor-localjson");
                var localjson_cildren = localjson_praent.children[0]
                if (localjson_cildren) {
                    //如果geojson_praent的子标签存在就不创建标签
                    var result = convertGeojsonObjToString(GlobalGeojsonObj);
                    GlobalEditor_FileGeojson.setValue(result);
                    GlobalTabShow_FileGeojson = true;
                } else {
                    //如果geojson_praent的子标签不存在就创建标签                
                    GlobalEditor_FileGeojson = createFileGeojson();
                    var result = convertGeojsonObjToString(GlobalGeojsonObj);
                    GlobalEditor_FileGeojson.setValue(result);
                    GlobalTabShow_FileGeojson = true;
                }

            } else {
                GlobalEditor_FileGeojson = createFileGeojson();
                var jsonValue = GlobalEditor_FileGeojson.getValue();
                if (jsonValue.length == 0) {
                    var id = "codeeditor-localjson";
                    var fileGeojson = AddInitFileGeojson(GlobalEditor_FileGeojson, id);
                    GlobalEditor_FileGeojson.refresh();
                }
                GlobalTabShow_FileGeojson = true;
            }
            break;
        case "help-tab":
            var geojson_praent = document.getElementById("codeeditor-geojson");
            var geojson_cildren = geojson_praent.children[0]
            if (geojson_cildren) {
                document.getElementById("codeeditor-geojson").innerHTML = "";
                GlobalTabShow_Geojson = false;
            }
            var json_praent = document.getElementById("codeeditor-localjson");
            var json_cildren = json_praent.children[0]
            if (json_cildren) {
                document.getElementById("codeeditor-localjson").innerHTML = "";
                GlobalTabShow_FileGeojson = false;
            }
            var help_praent = document.getElementById("codeeditor-help");
            var help_cildren = help_praent.children[0]
            if (help_cildren) {
                //如果codeeditor-help子标签存在就跳出循环
                break;
            }else{
                //如果codeeditor-help子标签不存在就创建子标签
                createHelp();
                GlobalTabShow_help = true;
            }
            break;
        default:

    }
});

//show.bs.tab此事件在选项卡显示时激发，但在显示新选项卡之前。使用event.target以及event.relatedTarget分别针对活动选项卡和上一个活动选项卡（如果可用）
//为选项卡添加事件如果选中选项卡（show.bs.tab）则边框为#fd8900
$(".nav-tabs").on("show.bs.tab", function (e) {
    $(e.target).css('outline', '1px solid #fd8900');
}).on("hide.bs.tab", function (e) {
    $(e.target).css('outline', 'none');
});

//注册保存事件
let btn_geojson = document.querySelector('.btnJson')
btn_geojson.addEventListener("click", function (e) {
    e.preventDefault();
    if (GlobalTabShow_Geojson == true) {
        var editor_geovalue = GlobalEditor_Geojson.getValue();
        if (editor_geovalue.length > 0) {
            //geojsonExport为全局方法在disDrawMap.js中      
            geojsonExport(editor_geovalue);
        } else {
            alert("文本框为空");
        }

    } else if (GlobalTabShow_FileGeojson == true) {
        var editor_jsonvalue = GlobalEditor_FileGeojson.getValue();
        if (editor_jsonvalue.length > 0) {
            geojsonExport(editor_jsonvalue);
        } else {
            alert("文本框为空");
        }
    } else if (GlobalTabShow_help == true) {
        //如果是帮助文件
        return;

    }

});


