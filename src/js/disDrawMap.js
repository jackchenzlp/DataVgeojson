//《leaflet.filelayer-dis.js》与《disDrawMap.js》共同完成

/* ***************************************************全局变量开始************************************************/

/**
 * @type {boolean}
 * @description marker图标显示与隐藏开关应用在地图缩放时
 */
let show = true;

/**
 * @type {boolean}
 * @description 点击draw图标时为true图完毕false作用是为查询其它图层坐标提供方便。默认false
 */
let drawok = false;

/**
 * @type {object}
 * @param  参数：数组
 * @description 添加文件数组到地图后并另存一份到GlobalMarkerArr此数组存有高亮动画highlight: "permanent",
 */
let GlobalMarkerObjArr = [];

/**
 * @type {object} circelMarker对象数组
 * @param  参数：数组
 * @description 每新创建一个circelMarker对象就保存在此数组中
 */
let GlobalLoadObjArr = [];

/**
 * @type {object} geojson格式的对象
 * @description 将geojson文件转化为标准geojson被merge函数所调用
 * @discription 每次添加一个点在Features下增加一个Feature
 */
let GlobalGeojsonObj = {
    type: 'FeatureCollection',
    features: []
};

/**
 * @type {object} geojson格式的对象
 * @description 将geojson文件转化为标准geojson被merge函数所调用
 * @discription 每次添加一个点在Features下增加一个Feature
 */
let GlobalEditor_DarwGeojsonObj = {
    type: 'FeatureCollection',
    features: []
};

/**
 * @type {munber}
 * @param 参数：自动计数
 * @discription 此计数为marker对象计数
 */
var count = 0;

/**
 * @type {number} 圆半径
 * @description geojson对circle是Point类型并没半径
 * @description 在pm:create事件中添加pm:markerdragstart事件
 * @discription layer.on 注册事件中调用 markerfncOn 方法
 */
var radius = 0;

/**
*  @type {boolean} 绘图状态开启与关闭
 * @description 在添加CircleMarker中的鼠标事件与绘图事件冲突
 * @description 增加开关防止冲突
 */
let darwState = false;

/**
 * @type {object}
 * @discription L.Control.fileLayerLoad 变量
 */
let control;//全局变量结束

/* ************************************************************************************************************************
                                                        地图基本配置开始
** ************************************************************************************************************************/
var GaoDeNormalm = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
    maxZoom: 32,
    minZoom: 3,
    attribution: "Map data &copy; 高德 contributors"
});
var GaoDeImgm = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
    maxZoom: 32,
    minZoom: 3,
    attribution: "Map data &copy; 高德影像 contributors"
});
var GaoDeImga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {
    maxZoom: 32,
    minZoom: 3
});
var GoogleNormalm = L.tileLayer.chinaProvider('Google.Normal.Map', {
    maxZoom: 32,
    minZoom: 3,
    attribution: "Map data &copy; 谷歌 contributors"
});
var GoogleImgm = L.tileLayer.chinaProvider('Google.Satellite.Map', {
    maxZoom: 32,
    minZoom: 3,
    attribution: "Map data &copy; 谷歌影像 contributors"
});
var GoogleImga = L.tileLayer.chinaProvider('Google.Satellite.Annotion', {
    maxZoom: 32,
    minZoom: 3
});

//高德地图
var GaoDeNormal = L.layerGroup([GaoDeNormalm]),
    GaoDeImage = L.layerGroup([GaoDeImgm, GaoDeImga]);

//谷歌地图
var GoogleNormal = L.layerGroup([GoogleNormalm]),
    GoogleImage = L.layerGroup([GoogleImgm, GoogleImga]);// 地图基本配置结束

//==================================================地图控件添加开始==========================================================
var map = L.map("map", {
    //是否应该在Canvas渲染器上呈现路径。 默认情况下，所有路径都在SVG渲染器中呈现
    //preferCanvas: false,
    //平移地图到其另一个领域时会被地图捕获到，并无缝地跳转到原始的领域以保证所有标注、矢量图层之类的覆盖物仍然可见。
    //worldCopyJump在子午线与反子午线（日期变更线）矢量图层之类的覆盖物仍然可见。
    worldCopyJump: true,
    cursor: false,//鼠标光标显示坐标
    center: [35.13, 104.2],//地图中心坐标,<中国大陆>
    zoom: 4,//放大级别4
    layers: [GaoDeNormal],//初始化高德地图
    zoomControl: true,//显示放大与缩小按钮
    contextmenu: true,//上下文菜单开启
    contextmenuWidth: 140,//上下文弹出框宽140PX
    contextmenuItems: [{ //鼠标右键菜单
        text: '添加Marker',
        callback: addMarker
    }, {
        text: '添加Cricel',
        callback: addCricel
    }]
});

//添加基本层在地图上以显示高德地图与谷歌地图
var baseLayers = {
    "<span style='color: gray'>高德地图</span>": GaoDeNormal,
    "<span style='color: gray'>高德影像</span>": GaoDeImage,
    "<span style='color: gray'>谷歌地图</span>": GoogleNormal,
    "<span style='color: gray'>谷歌影像</span>": GoogleImage
};

//地图控件右上角
var DrawFeatuerGroup = new L.featureGroup().addTo(map);
var FileFeatuerGroup = new L.featureGroup().addTo(map);
var Marker_L_FeatuerGroup = new L.featureGroup().addTo(map);
overlays = {
    "测绘点坐标层": FileFeatuerGroup,
    "绘图层": DrawFeatuerGroup,
    "图标层": Marker_L_FeatuerGroup
};

//添加纠偏参照物
var initMarker = L.marker([39.905530, 116.391305]).addTo(map).bindPopup('<p>纠偏参照物WGS84坐标下,天安门广场国旗所在位置</p>');

//将纠偏参照物Marker压入全局数组
GlobalMarkerObjArr.push(initMarker);
count = count++;

//将纠偏照物Marker压入图标层进行统一管理
Marker_L_FeatuerGroup.addLayer(initMarker);

//显示比例尺并放在右下角
L.control.scale({
    position: 'bottomright',
}).addTo(map);

//地图打印
L.control.browserPrint({ position: 'topleft', title: 'Print ...' }).addTo(map);

//添加文件夹图标并初始化
(function (window) {
    'use strict';
    function initMap() {
        var L = window.L;
        var style = {
            stroke: true,//路径是否描边。设置为false时，多边形和圆的边界将不可见。
            color: '#ff0000',//描边颜色。,
            weight: 1,//描边的像素级别的宽度
            opacity: 1.0,
            fillOpacity: 0.5,//填充透明度。
            fillColor: '#ff0000',//填充颜色         
            radius: 5,//半径
            clickable: false
        };
        L.Control.FileLayerLoad.LABEL = '<img class="icon" src="../img/folder.svg" alt="file icon"/>';
        control = L.Control.fileLayerLoad({
            fitBounds: true,//坐标边界显示
            flyTo: true,//为true则以飞越的方法显示否则直接显示边界（注：flyTo起作用fitBounds必须为TRUE)
            layerOptions: {
                style: function (geoJsonFeature) {
                    //如果geojson propreties为空就显示默认样式style
                    if (JSON.stringify(geoJsonFeature.properties) == "{}") {
                        return style;
                    }
                    //如果geojson propreties为不空但stroke没有值也显示默认样式style
                    //(注：stroke在leaflet中为路径是否描边。但在geojson.io网站中是填颜色。本例以geojson.io为主)
                    if (!geoJsonFeature.properties['stroke'] && JSON.stringify(geoJsonFeature.properties) !== "{}") {
                        return style;
                    }
                    //如果geojson propreties为不空并且stroke有值就逐个提取properties对象中的值                   
                    if (JSON.stringify(geoJsonFeature.properties) !== "{}" && geoJsonFeature.properties['stroke']) {
                        var weight;
                        var opacity;
                        var color;
                        var fillColor;
                        var fillOpacity;
                        //var markercolor;
                        if (geoJsonFeature.properties['stroke-width']) {
                            weight = geoJsonFeature.properties['stroke-width']
                        } if (geoJsonFeature.properties['stroke-opacity']) {
                            opacity = geoJsonFeature.properties['stroke-opacity']
                        } if (geoJsonFeature.properties['stroke']) {
                            color = geoJsonFeature.properties['stroke']
                        } if (geoJsonFeature.properties['fill']) {
                            fillColor = geoJsonFeature.properties['fill']
                        } if (geoJsonFeature.properties['fill-opacity']) {
                            fillOpacity = geoJsonFeature.properties['fill-opacity']
                        } /* if(geoJsonFeature.properties['marker-color']){                           
                            markercolor = geoJsonFeature.properties['marker-color']                           
                        } */
                        return {
                            weight: weight,
                            opacity: opacity,
                            color: color,
                            fillColor: fillColor,
                            fillOpacity: fillOpacity,
                        }
                    }
                },
                pointToLayer: function (feature, latlng) {
                    var styleForThisFeature = cricelStyle(feature);
                    var circleMarker = L.circleMarker(latlng, styleForThisFeature);
                    return circleMarker;
                },
                onEachFeature: (feature, layer) => {

                    //onEachFeature回调                        
                    if (onEachFeature) {
                        onEachFeature(feature, layer);
                    }
                },
            }
        });
        //将控件添加到地图
        control.addTo(map);
        //本地KML、GPX 、TCX、EXCEL数据加载事件 
        control.loader.on('data:loaded', function (e) {
            if (e.layer) {
                //本地加载文件(GeoJSON, KML, GPX,xlsx)到地图后获取Geojson格式的数组
                var gpsKmlGeojsonArr = this.options.GpsKmlGeojsonArr;
                //获取layer 对象数组
                var layerArr = this.options.layerArr;          
                var idArr = [];
                //循环获取层id值与name
                for (let i = 0; i < layerArr.length; i++) {
                    var layerObj = layerArr[i];        
                    //添加层对象到FileFeatuerGroup以便统一管理
                    FileFeatuerGroup.addLayer(layerObj);
                    layerObj.eachLayer(function (layer) {
                        //将layer压入数组以供删除层时使用
                        GlobalLoadObjArr.push(layer);
                        //获取geojson feature.properties.name
                        var name_id = layer.feature.properties.name;
                        //获取层ID值
                        var layer_id = layerObj.getLayerId(layer);
                        var id = { "name": name_id, "layerID": layer_id };
                        idArr.push(id);
                    });
                };
                //根据层name编号将层id赋值给feature.properties
                //此id值是删除与编辑的依据
                for (var i = 0; i < gpsKmlGeojsonArr.length; i++) {
                    var geojson = gpsKmlGeojsonArr[i];
                    for (var j = 0; j < geojson.features.length; j++) {
                        var feature = geojson.features[j];
                        if (feature.properties.name == idArr[j].name || feature.properties.name == idArr[j].layerID) {
                            //添加层ID到geojsonArr
                            feature.properties.id = idArr[j].layerID;
                        };
                    };
                };

                //高亮显示
                var showHighlight = false;
                addGeojsonArrToCodeMirror(gpsKmlGeojsonArr, showHighlight);
                
            } else {
                return;
            }

        });
    };

    window.addEventListener('load', function () {
        initMap();
    });

}(window));

//显示地图与影像图标控件
L.control.layers(baseLayers, overlays).addTo(map);

//地图添加标签（Map Title此标签在地图底部靠左用来显示图层,中心坐标,鼠标坐标）
var title = new L.Control({ position: 'bottomleft' });
title.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

title.update = function () {
    var scale = map.getZoom();
    //获取中心坐标
    var center = latlngFixedCoordinate(map.getCenter());
    //获取鼠标坐标(此处为初始化故用地图中心坐标替代鼠标坐标)
    var mouse = latlngFixedCoordinate(map.getCenter());
    title.update = function () {
        this._div.innerHTML = '<div class="leaflet-control-attribution leaflet-control">' +
            '当前层:' + scale + ' ' + '|' + ' ' + '中心坐标: ' + center + '|' + 'latlng:' + mouse + '</div>'
    };

};
title.addTo(map);

// 添加 Leaflet-Geoman 控件选项到地图左侧 
map.pm.addControls({
    position: 'topleft',
    drawCircle: true, //画圆开
    cutPolygon: false, //剪切关
    rotateMode: false //旋转关
});//添加控件END

//==================================================地图画图事件开始==========================================================   

//多边型绘图模式使能捕获功能
map.pm.enableDraw('Polygon', {
    snappable: true,
    snapDistance: 20,
    //pathOptions: { color: 'green' }//绘图颜色
});

//为不同的绘制模式设置选项，也将应用于工具栏中的按钮
/* map.pm.enableDraw('Line', {
    pathOptions: { color: 'red' }
}); */

//或者使用如下
//map.pm.setGlobalOptions({pathOptions:{color:'red'}});
//绘图模式失能
map.pm.disableDraw();

//创建绘图
map.on('pm:create', (e) => {
    var layer = e.layer;
    var layerType = e.shape;
    //添加到绘图层  
    DrawFeatuerGroup.addLayer(layer);
    //为画圆添加半径事件
    if (e.layer && e.layer instanceof L.Circle) {
        e.layer.on('pm:markerdragstart', markerfncOn)
    }
    //设置层属性
    setLayerProperties(layer, layerType);
    //将新创建的对象显示到CodeMirror
    showDrawToMirror(layer);
    //get layer geojson Properties属性
    var json = getLayerAttrbuter(layer);
    if (json !== null) {
        //绑定Popup
        bindPopupDraw(layer);
    };
    //监听与编辑事件相关的事件
    layer.on('pm:edit', (e) => {
        var layer = e.layer;
        var layerType = e.shape;
        setLayerProperties(layer, layerType);
        updataGlobalEditorDarwGeojsonObj(layer, layerType);
        var geojson = JSON.stringify(GlobalEditor_DarwGeojsonObj, null, 4);
        showGeojsonStrToMirror(geojson);
    });
    layer.on('pm:remove', function (x) {
        //删除图层
        deleteDrawLayer(layer);
    });


});
//防止绘制钮结的多边型
map.pm.setGlobalOptions({
    //allowSelfIntersection: false
});
//获取圆半径
var circleLayer = null;
const markerfncOn = (e) => {
    circleLayer = e.layer;
    layerType = e.layerType;
    const { markerEvent } = e;
    markerEvent.target.on('drag', () => {
        radius = circleLayer.getRadius().toFixed(2);
    });
};

//绘图开始事件
map.on('pm:drawstart', (e) => {
    //画圆时显示半径
    if (map.pm.Draw.Circle._hintMarker && e.shape === "Circle") {
        map.pm.Draw.Circle._hintMarker.on('move', getCircleDrawRadius);
    };
    darwState = true;
});

//绘图结束事件
map.on('pm:drawend', (e) => {
    //画圆半径结束
    if (map.pm.Draw.Circle._hintMarker) {
        map.pm.Draw.Circle._hintMarker.off('move', getCircleDrawRadius);
    };
    darwState = false;
});//地图画图事件结束

//=============================鼠标与键盘事件注册开始========================================

//鼠标停止后显示或地图托动结束后的事件
map.on('moveend', function (e) {
    let scale = e.target.getZoom();
    //获取中心坐标
    var center = latlngFixedCoordinate(map.getCenter());
    //获取鼠标坐标
    var mouse = latlngFixedCoordinate(map.getCenter(e.latlng));
    title.update = function () {
        this._div.innerHTML = '<div class="leaflet-control-attribution leaflet-control" style="margin-bottom: 0px;">' +
            '当前层:' + scale + ' ' + '|' + ' ' + '中心坐标: ' + center + '|' + '纬度' + '|' + '经度:' + mouse + '</div>'
    };
    title.addTo(map);
});

//注册放大缩小事件
map.on('zoomend', (e) => {

    //获取缩放级别
    let scale = e.target.getZoom();
    //获取中心坐标
    var center = latlngFixedCoordinate(map.getCenter());
    //获取鼠标(10位)坐标
    var mouse = latlngFixedCoordinate(map.getCenter(e.latlng));
    title.update = function () {
        this._div.innerHTML = '<div class="leaflet-control-attribution leaflet-control">' +
            '当前层:' + scale + ' ' + '|' + ' ' + '中心坐标: ' + center + '|' + '纬度' + '|' + '经度:' + mouse + '</div>'
        //放大缩小时重新定义地图中心这将防止子午线与日期变更线，矢量图层之类的覆盖物仍然可见。    
        map.panTo(map.wrapLatLng(map.getCenter()), { animate: false });
    };
    title.addTo(map);
    if (GlobalMarkerObjArr.length > 0) {
        //显示与删除marker
        if (scale > 19 && show == true) {
            //循环GlobalMarkerObjArr数组中保存的marker并在Map中删除      
            GlobalMarkerObjArr.forEach((item, index) => {
                map.removeLayer(item);
            });
            //在L.FeatuerGroup中清空
            Marker_L_FeatuerGroup.clearLayers();
            //显示Marker关
            show = false;

        } else if (scale < 19 && show == false) {
            GlobalMarkerObjArr.forEach((item, index) => {
                map.addLayer(item);
                Marker_L_FeatuerGroup.addLayer(item);
            });
            show = true;
        }
    }

});

//获取鼠标坐标
map.on('mousemove', function (e) {
    //获取缩放级别
    let scale = e.target.getZoom();
    //获取中心坐标
    var center = latlngFixedCoordinate(map.getCenter());
    //获取鼠标坐标
    var mouse = latlngFixedCoordinate(e.latlng);
    title.update = function () {
        this._div.innerHTML = '<div class="leaflet-control-attribution leaflet-control">' +
            '当前层:' + scale + ' ' + '|' + ' ' + '中心坐标: ' + center + '|' + '纬度' + '|' + '经度:' + mouse + '</div>'
    };
    title.addTo(map);

});


//===========================================生成GEOJSON方法开始=================================
/**
 * @function 将坐标属性选项装填到const=feature框架中
 * @param {Array} coordinates 坐标
 * @param {object} properties 要素属性
 * @param {object} options 选项
 * @returns 返回带有坐标属性feature对象
 */
function pointToFeature(coordinates, properties, options) {
    return feature(
        {
            type: "Point",
            coordinates: coordinates
        },
        properties,
        options

    );
};

/**
 * @function 封装成为feature格式框架
 * @param {object} geometry 
 * @param {object} properties 
 * @param {object} options 
 * @returns 返回feature格式的对象
 */
const feature = function (geometry, properties, options) {
    var feat = { type: "Feature" };
    feat.properties = properties || {};
    feat.geometry = geometry;
    return feat;
};

/**
 * @function 封装成为标准geojson
 * @param {object} features 参数：features集合
 * @returns 返回带有FeatureCollection的geojson格式对象
 */
function featureCollection(features) {
    var fc = { type: "FeatureCollection" };
    fc.features = features;
    return fc;
};//生成GEOJSON函数

//===========================================鼠标右键上下文菜单开始========================================
/* 手动添加圆点从10000开始计数以区别文件加载的点坐标注意此nameID被添加后被方法changeGeojsonID()更改层id后
geojson-feature.properties-name将失去其意义用户可随意修改其内容  */
/**
 * @function 上下文菜单添加一个Marker
 * @param {object} e 
 * @description 回调函数
 */
function addMarker(e) {
    if (!show) {
        alert("图层大于19层不准添加Marker,请缩小图层至18层以上在添加")
        return;
    }
    //获取当前鼠标下的坐标
    var latlng = getCoordinate_latlng(e);

    var marker = new L.Marker(latlng, {
        draggable: true,

    });
    map.addLayer(marker);
    marker.bindPopup(popupMarker).on("popupopen", (e) => {
        markerPopupEvent(latlng, marker);
    });
    GlobalMarkerObjArr.push(marker);
    Marker_L_FeatuerGroup.addLayer(marker);
    //托动结束Marker
    marker.on("dragend", function (e) {
        updateLatLng(marker);
    });
    //托动Marker
    marker.on('drag', function (e) {
        marker.openPopup();
        updateLatLng(marker);
    });
    marker.on('click', function (e) {
        marker.openPopup();
        updateLatLng(marker);
    });


};

/**
 * 此nameID为添加addCricel方法调用
 * 原因是circleMarker只有添加到图层后才能获取层id
 */
var nameID = 10000;
/**
 * @function 上下文菜单添加一个圆点
 * @param {event} e 鼠标移动事件
 * @description 为map添加点坐标以圆点的样式显示,并显示到CodeMirror
 */
function addCricel(e) {
    var geolayer;
    var lnglat = [];
    var geojsonArr = [];
    var coordinate = getCoordinate_lnglat(e);
    var properties = { name: `${nameID++}`, id: 0 };
    var Feature = pointToFeature(coordinate, properties);
    lnglat.push(Feature);
    var geofeatures = featureCollection(lnglat);
    if (typeof geofeatures === 'string') {
        //如果生成的geojson为字符中就转换成对象以便下一步的操作
        geofeatures = JSON.parse(geofeatures);
    };
    geojsonArr.push(geofeatures);
    //mouseup-mousedown 开关
    var drag = false;
    //生成一个geoJson层对象
    geolayer = new L.geoJson(geofeatures, {
        pointToLayer: function (feature, latlng) {
            //添加点坐标样式style
            var styleForThisFeature = cricelStyle(feature);
            //创建一个circleMarker时将值赋值给变量fillColor
            var circleMarker = L.circleMarker(latlng, styleForThisFeature);
            function trackMouse(e) {
                circleMarker.setLatLng(e.latlng);
                updateGeojsonLatLng(circleMarker);
            };
            //为circleMarker添加事件响应
            circleMarker.on('mousedown', (e) => {
                if (!darwState) {
                    map.dragging.disable();
                    circleMarker.openPopup();
                    trackMouse(e);
                    map.dragging.disable();
                    //托动
                    map.on('mousemove', (e) => {
                        trackMouse(e);
                        drag = true;
                    });
                }
            });
            circleMarker.on('mouseup', (e) => {
                if (!darwState) {
                    map.dragging.enable();
                    map.removeEventListener('mousemove');
                    trackMouse(e);
                    if (drag) {
                        //删除数组保存的旧数据保存新的数据
                        updataGlobalLoadObjArr(circleMarker);
                        //圆点被被移动了之后GlobalLoadObjArr数据会再次保存
                        GlobalLoadObjArr.push(circleMarker);
                        //更新GlobalGeojsonObj中的坐标
                        var result = updataGlobalGeojsonObj(circleMarker)
                        //在codeMirror上显示
                        if (GlobalEditor_FileGeojson) {
                            GlobalEditor_FileGeojson.setValue(result);
                        };
                    };
                    drag = false;
                }
            });
            //保存circleMarker到全局变量GlobalLoadObjArr
            GlobalLoadObjArr.push(circleMarker);
            return circleMarker;
        },
        onEachFeature: (feature, layer) => {
            if (onEachFeature) {
                onEachFeature(feature, layer);
            };
        }
    });

    if (geolayer.getLayers().length === 0) {
        throw new Error('GeoJSON has no valid layers.');

    };
    geolayer.addTo(map);
    FileFeatuerGroup.addLayer(geolayer);
    //更改geojson-feature.properties-id的值
    geojsonArr = changeGeojsonID(geojsonArr, geolayer)
    //高亮显示关
    var showHighlight = false;
    //添加点geojson到Mirror
    addGeojsonArrToCodeMirror(geojsonArr, showHighlight);
};

/**
 * @function 更改arr 数组中geojson对象中的id值
 * @param {Array} arr 参数：数组
 * @param {object} geolayer 参数：L.geoJson 对象
 * @description 此方法是把layer id值添加到geojson对象的方法
 * @description 注意:layer id值只有在addTo(map)后才会产生
 * @description 注意:nameID值是在添加一个点时产生它的值是查询所在feature的唯一方法
 * @return 返回更新后的数组
 */
function changeGeojsonID(arr, geolayer) {
    var name_id;
    var layer_id;
    //添加层id到geojson中去
    if (arr.length > 0) {
        geolayer.eachLayer(function (layer) {
            name_id = layer.feature.properties.name;
            //获取层ID值
            layer_id = geolayer.getLayerId(layer);
        });
        for (var i = 0; i < arr.length; i++) {
            var geojson = arr[i];
            for (var j = 0; j < geojson.features.length; j++) {
                var feature = geojson.features[i];
                if (feature.properties.name == name_id) {
                    //添加层ID到geojsonArr
                    feature.properties.id = layer_id;
                };
            };
        };
    };
    return arr;
};

/**
 * @function 更新弹出窗口Marker-popup坐标
 * @param {object} marker 
 * @param {boolean} reverse 
 */
function updateLatLng(marker, reverse) {
    if (reverse) {
        marker.setLatLng([marker.getLatLng().lat, marker.getLatLng().lng]);
        map.panTo([marker.getLatLng().lat, marker.getLatLng().lng]);
    } else {
        var markerID = getlayerID(marker)
        $('.marker-id').val(markerID.toString());
        $('.marker-lat').val(marker.getLatLng().lat.toFixed(10));
        $('.marker-lng').val(marker.getLatLng().lng.toFixed(10));
        marker.setLatLng([marker.getLatLng().lat, marker.getLatLng().lng]);
        //map.panTo([marker.getLatLng().lat,marker.getLatLng().lng]);    
        $(".removeMarker").on("click", e => {
            e.preventDefault();
            removeMarker(marker);
        });
        $(".cancelMarker").on("click", e => {
            e.preventDefault();
            map.closePopup();
        });

    };
};

/**
 * @function 更新弹出窗口Circel-popup坐标
 * @param {object} circleMarker 圆点marker
 * @param {boolean} reverse  
 */
function updateGeojsonLatLng(circleMarker, reverse) {
    if (reverse) {
        circleMarker.setLatLng([circleMarker.getLatLng().lat, circleMarker.getLatLng().lng]);
        map.panTo([circleMarker.getLatLng().lat, circleMarker.getLatLng().lng]);
    } else {
        var circleMarker_id = getlayerID(circleMarker);
        $('.circleMarker-id').val(circleMarker_id.toString());
        $('.circleMarker-lat').val(circleMarker.getLatLng().lat.toFixed(10));
        $('.circleMarker-lng').val(circleMarker.getLatLng().lng.toFixed(10));
        circleMarker.setLatLng([circleMarker.getLatLng().lat.toFixed(10), circleMarker.getLatLng().lng.toFixed(10)]);
        $(".removeCircleMarker").on("click", e => {
            e.preventDefault();
            deleteLoadLayer(circleMarker);
        });
        $(".cancelCircleMarker").on("click", e => {
            e.preventDefault();
            map.closePopup();
        });
    };
};

/**
 * 
 * @param {object} layer 参数：Marker
 * @returns 返回 layer ID
 */
function getlayerID(layer) {
    var marker_id;
    $.each(map._layers, function (ml) {
        if (map._layers[ml] === layer) {
            marker_id = L.stamp(map._layers[ml]);
        };
    });
    return marker_id;
};

/**
 * @function 更新全局变量GlobalLoadObjArr
 * @param {object} 参数 circelMarker对象
 * @description 移动circelMarker对象时GlobalLoadObjArr数组会删除旧的数据
 * @description 删除circelMarker对象时GlobalLoadObjArr数组会删除旧的数据
 * @description 此方法在创建circleMarker的移动事件结束后也就是鼠标抬起动与删除事件中调用
 */
function updataGlobalLoadObjArr(circleMarker) {
    var circelMarker_id;
    GlobalLoadObjArr.forEach((item, index) => {
        if (item._leaflet_id == circleMarker._leaflet_id) {
            circelMarker_id = item._leaflet_id;
        };
        //数组中删除  
        GlobalLoadObjArr = GlobalLoadObjArr.filter((item) => item._leaflet_id !== circelMarker_id);
    });

};

/**
 * @function 更新全局变量GlobalGeojsonObj对象坐标
 * @param {object} 参数 circelMarker对象
 * @description 移动circelMarker对象时GlobalGeojsonObj会对坐标进行更新
 * @description GlobalGeojsonObj对象保存着geojson格式的数据
 * @return 返回格式化好的geojson字符串
 */
function updataGlobalGeojsonObj(circleMarker) {
    if (GlobalGeojsonObj.features.length > 0) {
        var circleMarker_id = getlayerID(circleMarker);
        for (var i = 0; i < GlobalGeojsonObj.features.length; i++) {
            var geojson = GlobalGeojsonObj.features[i];
            if (geojson.properties.id == circleMarker_id) {
                var coords = [circleMarker.getLatLng().lng.toFixed(10) * 1, circleMarker.getLatLng().lat.toFixed(10) * 1];
                geojson.geometry.coordinates = coords;
            };
        };
    };
    var result = JSON.stringify(GlobalGeojsonObj, null, 4);
    return result;
};

/**
 * @function 删除Marker
 * @param {object} 参数 marker 
 * @desription 删除一个marker并更新GlobalMarkerObjArr数组
 */
function removeMarker(marker) {
    var markerID;
    GlobalMarkerObjArr.forEach((item, index) => {
        if (item == marker) {
            markerID = item._leaflet_id;
            map.removeLayer(item);
        };
        //数组中删除  
        GlobalMarkerObjArr = GlobalMarkerObjArr.filter((item) => item._leaflet_id !== markerID);

    });

};

/**
 *  @function 上下文菜单添加圆点样式style
 * @param {object} feature 
 * @returns 返回圆点样式对象style 
 */
function cricelStyle(feature) {
    return {
        stroke: true,//路径是否描边。设置为false时，多边形和圆的边界将不可见。
        color: '#ff0000',//描边颜色。,
        weight: 1,//描边的像素级别的宽度
        opacity: 1.0,
        fillOpacity: 0.5,//填充透明度。
        fillColor: '#ff0000',//填充颜色         
        radius: 5,//半径
        clickable: false,
        riseOnHover: true,
        draggable: true //可手动
    };
};

/**
 * @function 删除圆点
 * @param {object} geolayer geojson层 
 * @desription 此方法被addCricel()的删除事件调用
 * @desription circleMarker被删除后GlobalLoadObjArr数组会被更新
 * @desription circleMarker被删除后GlobalGeojsonObj.features数组会被更新
 * 
 */
function deleteLoadLayer(layer) {
    var layer_id;
    if (GlobalLoadObjArr.length > 0) {
        GlobalLoadObjArr.forEach((item, index) => {
            if (item._leaflet_id == layer._leaflet_id) {             
                layer_id = item._leaflet_id;
                map.removeLayer(item);
            };
            //数组中删除  
            GlobalLoadObjArr = GlobalLoadObjArr.filter((item) => item._leaflet_id !== layer_id);
            GlobalGeojsonObj.features = GlobalGeojsonObj.features.filter((item) => item.properties.id !== layer_id);

        });
    };
    var result = JSON.stringify(GlobalGeojsonObj, null, 4);
    //在codeMirror上显示
    if (GlobalEditor_FileGeojson) {
        GlobalEditor_FileGeojson.setValue(result);
    }
    map.closePopup();
};//上下文菜单结束

//=========================================弹出窗口内各按钮方法开始========================================

/**
 * @function popup弹出窗口添加一行表格
 */
function addRow() {
    //原来的行数比如：此处获得表格的行数是5，则每一行对应的index是0~4，所以下面在insertRow时，使用的是表格的当前行数
    var currentRows = document.getElementById("tablePop").rows.length;
    var insertTr = document.getElementById("tablePop").insertRow(currentRows);

    var insertTd = insertTr.insertCell(0);
    insertTd.setAttribute("class", "m-0 p-0");
    insertTd.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="">';

    insertTd = insertTr.insertCell(1);
    insertTd.setAttribute("class", "m-0 p-0");
    insertTd.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="">';
};

/**
 * @function 添加Properties属性
 * @description 为弹出框中Properties按钮添加geojson-Properties属性单元格
 */
function addRowProperties() {
    //原来的行数比如：此处获得表格的行数是5，则每一行对应的index是0~4，所以下面在insertRow时，使用的是表格的当前行数
    var currentRows = document.getElementById("tablePop").rows.length;
    //第一行
    var insertTr_1 = document.getElementById("tablePop").insertRow(currentRows);
    var insertTd_1 = insertTr_1.insertCell(0);
    insertTd_1.setAttribute("class", "m-0 p-0");
    insertTd_1.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="stroke">';
    insertTd_1 = insertTr_1.insertCell(1);
    insertTd_1.setAttribute("class", "m-0 p-0");
    //添加颜色按钮
    insertTd_1.innerHTML = '<input type="color" id="color-stroke" class ="form-control m-0 p-0 mt-1" style="width: 100%; height: 10px" value="#ffffff">';
    //第二行
    var insertTr_2 = document.getElementById("tablePop").insertRow(currentRows + 1);
    var insertTd_2 = insertTr_2.insertCell(0);
    insertTd_2.setAttribute("class", "m-0 p-0");
    insertTd_2.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="stroke-width">';

    insertTd_2 = insertTr_2.insertCell(1);
    insertTd_2.setAttribute("class", "m-0 p-0");
    insertTd_2.innerHTML = '<input id="stroke-width" class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="2">';
    //第三行
    var insertTr_3 = document.getElementById("tablePop").insertRow(currentRows + 2);
    var insertTd_3 = insertTr_3.insertCell(0);
    insertTd_3.setAttribute("class", "m-0 p-0");
    insertTd_3.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="stroke-opacity">';

    insertTd_3 = insertTr_3.insertCell(1);
    insertTd_3.setAttribute("class", "m-0 p-0");
    insertTd_3.innerHTML = '<input id="stroke-opacity" class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="1">';
    //第四行insertTd_4
    var insertTr_4 = document.getElementById("tablePop").insertRow(currentRows + 3);
    var insertTd_4 = insertTr_4.insertCell(0);
    insertTd_4.setAttribute("class", "m-0 p-0");
    insertTd_4.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="fill">';
    insertTd_4 = insertTr_4.insertCell(1);
    insertTd_4.setAttribute("class", "m-0 p-0");
    //添加颜色按钮
    insertTd_4.innerHTML = '<input type="color" id="color-fill" class ="form-control m-0 p-0 mt-1" style="width: 100%; height: 10px" value="#ffffff">';
    //第五行insertTd_4
    var insertTr_5 = document.getElementById("tablePop").insertRow(currentRows + 4);
    var insertTd_5 = insertTr_5.insertCell(0);
    insertTd_5.setAttribute("class", "m-0 p-0");
    insertTd_5.innerHTML = '<input  class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="fill-opacity">';
    insertTd_5 = insertTr_5.insertCell(1);
    insertTd_5.setAttribute("class", "m-0 p-0");
    //添加颜色按钮
    insertTd_5.innerHTML = '<input id="fill-opacity" class ="form-control m-0 p-0" type="text" style="font-size: 12px;" value="1">';


};

/**
 * @function 添加Markerpopup对象事件
 * @param {object} latlng 坐标json对象
 * @param {object} marker 图层对象
 */
function markerPopupEvent(latlng, layer) {
    var marker_id = getlayerID(layer);
    $('.marker-id').val(marker_id.toString());
    $('.marker-lat').val(latlng.lat.toFixed(10));
    $('.marker-lng').val(latlng.lng.toFixed(10));
    $(".removeMarker").on("click", e => {
        e.preventDefault();
        removeMarker(layer);
    });
    $(".cancelMarker").on("click", e => {
        e.preventDefault();
        map.closePopup();
    });


};

/**
 * @function 添加Circlerpopup对象事件
 * @param {object} feature 坐标json对象
 * @param {object} layer 图层对象
 */
function popupEvent(feature, layer) {
    if (feature.geometry.type === 'Point') {
        $('tr.Polygon').hide();
        $('tr.LineString').hide();
    }
    if (feature.geometry.type === 'Polygon') {
        $('tr.Point').hide();
        $('tr.LineString').hide();
    }
    if (feature.geometry.type === 'LineString') {
        $('tr.Point').hide();
        $('tr.Polygon').hide();
    }

    var geolayer_id = getlayerID(layer);
    //添加一行
    $("#addRow").on("click", e => {
        e.preventDefault();
        addRow();
    });
    //添加geojson-Properties
    $("#addProperties").on("click", e => {
        e.preventDefault();
        addRowProperties(); //添加标签
        popupStyleCangeEvent(layer); //添加标签事件
        document.getElementById("addProperties").style.display = "none";//隐藏
    });
    $("#remove").on("click", e => {
        e.preventDefault();
        deleteLoadLayer(layer);
    });
    $("#cancel").on("click", e => {
        e.preventDefault();
        map.closePopup();
    });
    layer_id = getlayerID(layer);
    $("#save").on("click", e => {
        e.preventDefault();
        //弹出框popup->Table->id
        var tableId = "tablePop";
        var result;
        var tableArr = getTableValue(tableId);
        if (GlobalGeojsonObj.features.length > 0) {
            for (var i = 0; i < GlobalGeojsonObj.features.length; i++) {
                var geojson = GlobalGeojsonObj.features[i];
                if (geojson.properties.id == layer_id) {
                    var propertiesObj = geojson.properties
                    tableArr.forEach((item, index) => {
                        //将属性值添加到propertiesObj               
                        propertiesObj[item.name] = item.val
                    });
                    geojson.properties = propertiesObj
                };
                result = JSON.stringify(GlobalGeojsonObj, null, 4);
                addGeojsonObjToCodeMirror(result);
                map.closePopup();
            };

        };
    });
    //选项卡绑定点击事件（Navs and tabs）
    $("#properties button").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
        var idValue = e.target.id;
        switch (idValue) {
            case "properties-tab":
                //启用保存按钮(save)
                $("#save").prop('disabled', false)
                break;
            case "Info-tab":
                $('.circleMarker-id').val(geolayer_id.toString());
                if (feature.geometry.type === 'Point') {
                    $('.circleMarker-lat').val(layer.getLatLng().lat);
                    $('.circleMarker-lng').val(layer.getLatLng().lng);
                }
                if (feature.geometry.type === 'Polygon') {
                    var json = getLayerAttrbuter(layer);
                    if (json.area) {
                        $('.Polygon-Meters').val(json.area.toString());
                        $('.Polygon-Kilometers').val((json.area / 1000000).toFixed(2).toString());
                    }

                }
                if (feature.geometry.type === 'LineString') {
                    var json = getLayerAttrbuter(layer);
                    if (json.distance) {
                        $('.LineString-Meter').val(json.distance.toString());
                        $('.LineString-Kilometer').val((json.distance / 1000).toFixed(2).toString());
                    }

                }
                //禁用保存按钮(save)
                $("#save").prop('disabled', true)
                break;
        };
    });

    /* 这是解决mouseup与mousedown时popup弹出窗口不显示的方法
    var lng = feature.geometry.coordinates[0]方法不能改变mouseup时的状态现改为
    layer.getLatLng().lat */
    (function () {
        $('.circleMarker-id').val(geolayer_id.toString());
        if (feature.geometry.type === 'Point') {
            $('.circleMarker-lat').val(layer.getLatLng().lat);
            $('.circleMarker-lng').val(layer.getLatLng().lng);
        };
        if (feature.geometry.type === 'Polygon') {
            var json = getLayerAttrbuter(layer);
            if (json.area) {
                $('.Polygon-Meters').val(json.area.toString());
                $('.Polygon-Kilometers').val((json.area / 1000000).toFixed(2).toString());
            }
        }
        if (feature.geometry.type === 'LineString') {
            var json = getLayerAttrbuter(layer);
            if (json.distance) {
                $('.LineString-Meter').val(json.distance.toString());
                $('.LineString-Kilometer').val((json.distance / 1000).toFixed(2).toString());
            }

        }
    }());
};

/**
 * @function 为popup添加input标签更改事件
 * @param {object} layer
 * @desription  当鼠标按下Add properties 时动态添加事件
 * @desription  Input标签更改内容会更新到layer.option选项中
 * @desription  popupStyleCangeEvent 加载时会读取layer.option选项中内容并显示到标签中
 * 
 */
function popupStyleCangeEvent(layer) {
    var att_button = getActiveLi('properties');
    var att_div = getActiveDiv('myproperties');
    if (att_button == 'properties-tab' && att_div == 'properties-justified') {
        //获取层先项
        var style = layer.options;
        if (style) {
            //层选项中存储着circleMarker各属性值
            $("#color-stroke").val(style.color);
            $("#color-fill").val(style.fillColor);
            $("#stroke-width").val(style.weight);
            $("#stroke-opacity").val(style.opacity);
            $("#fill-opacity").val(style.fillOpacity);
        }

        $("#color-stroke").on("input", e => {
            e.preventDefault();
            const btnStroke = document.getElementById('color-stroke');
            var colorStroke = btnStroke.value;
            //更新层style的属性值 
            layer.setStyle({ color: colorStroke })
        });
        $("#color-fill").on("input", e => {
            e.preventDefault();
            const btnfill = document.getElementById('color-fill');
            var fillColor = btnfill.value;
            //更新层style的属性值 
            layer.setStyle({ fillColor: fillColor })
        });
        $("#stroke-width").on("input", e => {
            e.preventDefault();
            const strokeWidth = document.getElementById('stroke-width');
            var weight = strokeWidth.value;
            //更新层style的属性值 
            layer.setStyle({ weight: weight })
        });
        $("#stroke-opacity").on("input", e => {
            e.preventDefault();
            const strokeOpacity = document.getElementById('stroke-opacity');
            opacity = strokeOpacity.value;
            //更新层style的属性值 
            layer.setStyle({ opacity: opacity })
        });
        $("#fill-opacity").on("input", e => {
            e.preventDefault();
            const fillOpacity = document.getElementById('fill-opacity');
            var opacity = fillOpacity.value;
            //更新层style的属性值 
            layer.setStyle({ fillOpacity: opacity })
        });
    }

};

//=========================================坐标转换开始================================
/**
 * @function 获取10位数中心坐标
 * @param {object} coordinate 参数：坐标对象
 * @returns {Array} 返回坐标数组
 */
function latlngFixedCoordinate(coordinate) {
    //latlng.wrap().lng此方法可以反回正常的值而不会出现大于180度的情况
    return "[" + coordinate.lat.toFixed(10) + "," + coordinate.wrap().lng.toFixed(10) + "]";
};

/**
 * @function 获取鼠标坐标纬度在前经度在后（小数点后10）
 * @param {event} e 鼠标指针移动事件
 * @returns Array 返回坐标json
 * @description 坐标转json
 */
function getCoordinate_latlng(e) {
    var latlng = {};
    var lat = e.latlng.lat.toFixed(10);
    var lng = e.latlng.wrap().lng.toFixed(10);
    if (typeof lat == "string" || typeof lng == "string") {
        //转换为数值类型
        var latNum = lat * 1;
        var lngNum = lng * 1;
        latlng = { "lat": latNum, "lng": lngNum };

    } else {
        latlng = { "lat": latNum, "lng": lngNum };
    }
    return latlng;
};

/**
 * @function 获取鼠标坐标经度在前纬度在后（小数点后10）
 * @param {event} e 鼠标指针移动事件
 * @returns {Array} 返回坐标数组
 * @description 字符串转数值数组
 */
function getCoordinate_lnglat(e) {
    var lnglat = [];
    var lat = e.latlng.lat.toFixed(10);
    var lng = e.latlng.wrap().lng.toFixed(10);
    if (typeof lat == "string" || typeof lng == "string") {
        var latNum = lat * 1;
        var lngNum = lng * 1;
        lnglat = [lngNum, latNum];

    } else {
        lnglat = [lng, lat];
    }
    return lnglat;
};
//=========================================坐标转换结束================================
/**
 * @function 获取Table单元格Input的值
 * @param {string} 参数 tableId 
 * @returns 返回数组
 * @desription 说明：参数为Table的id值
 */
function getTableValue(tableId) {
    var tableArr = [];
    var name;
    var val;
    var obj = document.getElementById(tableId);
    //循环Table行数  
    for (var i = 0; i < obj.rows.length; i++) {
        if (obj.rows[i].cells[0].childNodes[0].value) {
            name = obj.rows[i].cells[0].childNodes[0].value
        }
        if (obj.rows[i].cells[1].childNodes[0].value) {
            val = obj.rows[i].cells[1].childNodes[0].value;
        }
        if (name && val) {
            var cellVal = { "name": name, "val": val };
            tableArr.push(cellVal);
        }
    }

    return tableArr;
};

/**
 * @function  保存GeoJSON文件到本地
 * @param {string} jsonData 参数：jsonData格式数据
 */
function geojsonExport(jsonData) {
    let nodata = '{"type":"FeatureCollection","features":[]}';
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData);
    let datenow = new Date().getTime();
    let datenowstr = datenow.toString();
    let exportFileDefaultName = 'export_' + datenowstr + '.geojson';
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    if (jsonData == nodata) {
        alert('No features are drawn');
    } else {
        linkElement.click();
    };
};

/**
 * @function 获取excel文件中第0个坐标添加动态marker到图层并高亮显示 
 * @param {array} latlngArr 参数：坐标数组
 * @returns 返回marker
 */
function addToHighlightMarker(latlngArr) {
    var x_circles = latlngArr[0];
    var y_circles = latlngArr[1];
    count = count + 1;
    var _marker = L.marker([x_circles, y_circles], {
        //添加高亮动画
        highlight: "permanent",
        fillOpacity: 0.3,//填充透明度。
    })
        .bindPopup('测绘点' + count.toString())
        .addTo(map);
    return _marker
};

/**
 * @function 获取geojson的第0个坐标
 * @param {string} features 
 * @returns 返回坐标数组
 */
function getGeometryLatlng(features) {
    var firstCordinateArr = [];
    for (var i = 0; i < features.length; i++) {

        if (features[i].geometry.type == 'MultiPolygon') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates[0][0]);
        } else if (features[i].geometry.type == 'Polygon') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates[0][0]);
        } else if (features[i].geometry.type == 'MultiPoint') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates[0]);
        } else if (features[i].geometry.type == 'Point') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates);
        } else if (features[i].geometry.type == 'LineString') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates[0]);
        } else if (features[i].geometry.type == 'MultiLineString') {
            var coordinates = features[i].geometry.coordinates;
            firstCordinateArr.push(coordinates[0]);
        }
    }
    return firstCordinateArr;
};

/**
 * @function 将任何 GeoJSON 对象规范化为 GeoJSON FeatureCollection。
 * @param {Array} inputs 
 * @returns 返回标准geojson数组
 * 
 */
function mergefile(inputs) {
    for (var i = 0; i < inputs.length; i++) {
        var normalized = normalize(inputs[i]);
        for (var j = 0; j < normalized.features.length; j++) {
            GlobalGeojsonObj.features.push(normalized.features[j]);
        };
    };

    return GlobalGeojsonObj;

};

//重新封闭成为标准geojson所用参数
var types = {
    Point: 'geometry',
    MultiPoint: 'geometry',
    LineString: 'geometry',
    MultiLineString: 'geometry',
    Polygon: 'geometry',
    MultiPolygon: 'geometry',
    GeometryCollection: 'geometry',
    Feature: 'feature',
    FeatureCollection: 'featurecollection'
};

/**
 * @method 封装成标准geojson
 * @param {object} gj geojson data
 * @returns {object} 返回标准 geojson data
 * @description 将GeoJSON 要素规范化为FeatureCollection
 */
function normalize(gj) {
    if (!gj || !gj.type) return null;
    var type = types[gj.type];
    if (!type) return null;
    if (type === 'geometry') {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: gj
            }]
        };
    } else if (type === 'feature') {
        return {
            type: 'FeatureCollection',
            features: [gj]
        };
    } else if (type === 'featurecollection') {
        return gj;
    }
};

/**
 * @function 在codeMirror中显示geojson数据
 * @param {Array} GeojsonArr 参数：geojson格式数组
 * @description 本地生成的geojson数据封装成为标准geojson后显示在CodeMirror中
 * @description 接收一个geojson格式的数组
 */
function showFileCodeMirror(GeojsonArr) {
    let geojsonObj = {}; //geojson对象变量
    //如果 GeojsonArr数组有数据                
    if (GeojsonArr.length > 0) {
        for (let i = 0; i < GeojsonArr.length; i++) {
            let geojson = GeojsonArr[i];
            if (typeof geojson === 'string') {
                geojsonObj = JSON.parse(geojson);
            } else {
                geojsonObj = geojson;
            }
            //重新封装成为标准geojson，不管加载多少文件都会在这里合并成为一个标准的Geojson文件
            var normalizeGeojson = mergefile(geojsonObj.features);
            var convertStr = JSON.stringify(normalizeGeojson);
            var result = JSON.stringify(JSON.parse(convertStr), null, 4);
            //在codeMirror上显示
            if (GlobalEditor_FileGeojson) {
                GlobalEditor_FileGeojson.setValue(result);

            };

        };

    };
};

/**
 * @function 高亮显示Marker图标
 * @param {Array} GeojsonArr 参数：geojson格式数组
 * @description 获取GeojsonArr数组中features中下coordinates的坐标并高亮显示 
 * @description 接收一个geojson格式的数组
 */
function showHighlightMarker(GeojsonArr) {
    let geojsonObj = {};
    let geojson = {};
    var coordinateArr = [];
    //获取geojson经纬度                 
    if (GeojsonArr.length > 0) {
        for (let i = 0; i < GeojsonArr.length; i++) {
            geojson = GeojsonArr[i];
            if (typeof geojson === 'string') {
                geojsonObj = JSON.parse(geojson);
            } else {
                geojsonObj = geojson;
            }
            //获取geojson第一个坐标
            coordinateArr = getGeometryLatlng(geojsonObj.features);
            for (let j = 0; j < coordinateArr.length; j++) {
                var coordArr = coordinateArr[j];
                var lng = coordArr[0];
                var lat = coordArr[1];
                var latlng = [];
                if (typeof lng === "number") {
                    latlng = [lat, lng];
                    //将数据添加到地图，并压入数组 
                    var marker = addToHighlightMarker(latlng);
                    GlobalMarkerObjArr.push(marker);
                } else if (typeof lng === "objcet") {
                    var x = lat[0];
                    var y = lat[1];
                    if (typeof x === "number" && typeof y === "number") {
                        latlng = [x, y];
                        //将数据添加到地图，并压入数组 
                        var marker = addToHighlightMarker(latlng);
                        GlobalMarkerObjArr.push(marker);
                    }
                    if (typeof x === "objcet" && typeof y === "objcet") {
                        let xx = x[0];
                        let yy = x[1];
                        latlng = [xx, yy];
                        //将数据添加到地图，并压入数组 
                        var marker = addToHighlightMarker(latlng);
                        GlobalMarkerObjArr.push(marker);
                    };

                };
            };

        };

    };
};

/**
 * 
 * @param {string} ulID 参数：ui标签id
 * @returns 返回button活动标签id
 */
function getActiveLi(ulID) {
    var uiID = document.getElementById(ulID);
    var list_li = uiID.getElementsByTagName('li');
    for (let i = 0; i < list_li.length; i++) {
        var buttonAtt = list_li[i].children[0];
        var attStr = buttonAtt.getAttribute('class');
        if (attStr.indexOf("active")) {
            return buttonAtt.getAttribute('id');
        };
    };
};

/**
 * 
 * @param {string} divID 参数：div标签id
 * @returns 返回div活动标签id
 */
function getActiveDiv(divID) {
    var uiID = document.getElementById(divID);
    var list_li = uiID.getElementsByTagName('div');
    for (let i = 0; i < list_li.length; i++) {
        var buttonAtt = list_li[i];
        var attStr = buttonAtt.getAttribute('class');
        if (attStr.indexOf("active")) {
            return buttonAtt.getAttribute('id');
        };
    };

};

/**
 * @function geojson组事件
 * @param {object} feature 
 * @param {object} layer 
 */
function onEachFeature(feature, layer) {
    var fillColor;
    layer.on({
        mouseover: function (e) {//鼠标移入事件
            //鼠标移入时先保存当前的填充色
            fillColor = layer.options.fillColor;
            if (fillColor != '#7cffff') {
                e.target.setStyle({ fillColor: '#7cffff' });
            }
        },
        mouseout: function (e) {//鼠标移出事件
            //获取当前层选项中的填充色 
            color = layer.options.fillColor;
            if (color == '#7cffff') {
                e.target.setStyle({ fillColor: fillColor });
            } else {
                e.target.setStyle({ fillColor: color });
            }
        }

    });
    if (feature.properties) {
        if (feature.geometry.type === 'Point') {
            layer.bindPopup(popupFile).on("popupopen", (e) => {
                popupEvent(feature, layer);
            });
        };
        if (feature.geometry.type === 'LineString') {

            layer.bindPopup(popupFile).on("popupopen", (e) => {
                popupEvent(feature, layer);
            });
        };
        if (feature.geometry.type === 'Polygon') {

            layer.bindPopup(popupFile).on("popupopen", (e) => {
                popupEvent(feature, layer);
            });
        };
    };

    /* if (feature.properties.name) {
           layer.bindTooltip('<b>新增点:</b>' + feature.properties.name);
       } else if (feature.properties.id) {
           layer.bindTooltip('<b>新增点:</b>' + feature.properties.id);
       } */

};

/**
 * @function 添加geojson格式数组并显示在CodeMirror
 * @param {Array} GeojsonArr 参数：数组
 * @param {boolean} showHighlight 参数：布尔
 * @description 本例中本地各种格式文件
 */
function addGeojsonArrToCodeMirror(GeojsonArr, showHighlight) {
    //获取li下button活动标签id
    var att_button = getActiveLi('myTabjustified');
    var att_div = getActiveDiv('myTabjustifiedContent');
    if (att_button !== 'json-tab' && att_div !== 'json-justified') {
        $('#json-tab').tab('show');
        var json_praent = document.getElementById("codeeditor-localjson");
        var json_cildren = json_praent.children[0];
        //如果json_cildren不存在就初始化
        if (!json_cildren) {
            //创建CodeMirror对象在html标签<id ="codeeditor-localjson">

            GlobalEditor_FileGeojson = createFileGeojson();
            var id = "codeeditor-localjson";
            var fileGeojson = AddInitGeojson(GlobalEditor_FileGeojson, id);

        };
        //查询HTML->codeeditor-geojson子节点是否存在
        var geojson_praent = document.getElementById("json-justified");
        var geojson_cildren = geojson_praent.children[0];
        if (geojson_cildren) {
            //本地加载文件(GeoJSON, KML, GPX,xlsx)或由鼠标右键生成的geojson数组在CodeMirror显示并高亮   
            showFileCodeMirror(GeojsonArr);
            if (showHighlight) {
                showHighlightMarker(GeojsonArr);
            };

        };
        //本地加载文件(GeoJSON, KML, GPX,xlsx)时删除codeeditor-geojson下的子标签
        var geojson_praent = document.getElementById("codeeditor-geojson");
        var geojson_cildren = geojson_praent.children[0];
        //如果存在就删除
        if (geojson_cildren) {
            document.getElementById("codeeditor-geojson").innerHTML = "";
        };
        GlobalTabShow_Geojson = false; //DrawGeojson标签开与关标志
        GlobalTabShow_FileGeojson = true; //FileGeojson标签开与关标志
        GlobalTabShow_help = false; //help标签开与关标志
    }

};

/**
 * 添加geojson格式数组并显示在CodeMirror
 * @param {objeq} Geojsonobj Geojson对象
 * @description 将Geojson格式的对象添加到CoedMirror
 */
function addGeojsonObjToCodeMirror(Geojsonobj) {
    //获取li下button活动标签id
    var att_button = getActiveLi('myTabjustified');
    var att_div = getActiveDiv('myTabjustifiedContent');
    if (att_button !== 'json-tab' && att_div !== 'json-justified') {
        $('#json-tab').tab('show');
        var json_praent = document.getElementById("codeeditor-localjson");
        var json_cildren = json_praent.children[0];
        //如果json_cildren不存在就初始化     
        if (!json_cildren) {
            //创建CodeMirror对象在html标签<id ="codeeditor-localjson">
            GlobalEditor_FileGeojson = createFileGeojson();
            var id = "codeeditor-localjson";
            var fileGeojson = AddInitGeojson(GlobalEditor_FileGeojson, id);

        };
        //查询HTML->codeeditor-geojson子节点是否存在
        var geojson_praent = document.getElementById("json-justified");
        var geojson_cildren = geojson_praent.children[0];
        if (geojson_cildren) {
            //在codeMirror上显示
            if (GlobalEditor_FileGeojson) {
                GlobalEditor_FileGeojson.setValue(Geojsonobj);
            };

        };
        //本地加载文件(GeoJSON, KML, GPX,xlsx)时删除codeeditor-geojson下的子标签
        var geojson_praent = document.getElementById("codeeditor-geojson");
        var geojson_cildren = geojson_praent.children[0];
        //如果存在就删除
        if (geojson_cildren) {
            document.getElementById("codeeditor-geojson").innerHTML = "";
        };
        GlobalTabShow_Geojson = false; //DrawGeojson标签开与关标志
        GlobalTabShow_FileGeojson = true; //FileGeojson标签开与关标志
        GlobalTabShow_help = false; //help标签开与关标志
    }

};

/* ******************************************************************************************
                                        darw-geoman方法开始
* 注意L.CircleMarker的半径是以像素为单位的，主要是在缩放图层大小时CircleMarker会自动适应大小
* 它将在每次缩放时调整大小。这就是为什么它的大小以像素为单位指定的原因。相反，Circle 会随着地
* 图缩放而缩放，就像地图要素一样。这就是为什么它的大小以米为单位指定的原因
** ******************************************************************************************/
/**
 * @function 获取层geojson显示到CodeMirror
 * @param {object} 参数 layer
 * @description 获取HTML标签id=codeeditor-geojson的对象
 * @description 如果对象存在就将标准化的geojson显示到CodeMirror
 * @description 如果对象不存在就创建一个CodeMirror并将将标准化的geojson显示到CodeMirror
 * @returns 操作结束返回
 */
function showDrawToMirror(layer) {
    var geojson_praent = document.getElementById("codeeditor-geojson");
    var geojson_cildren = geojson_praent.children[0];
    if (geojson_cildren) {
        var geojsonStr = getLayerGeojsonConvertStr(layer);
        showGeojsonStrToMirror(geojsonStr);
    } else if (!geojson_cildren) {
        $('#geojson-tab').tab('show');
        //如果子节点不存在就创建一个子节点
        GlobalEditor_Geojson = createGeojson();
        var geojsonStr = getLayerGeojsonConvertStr(layer);
        showGeojsonStrToMirror(geojsonStr);
    } else {
        return;
    }
};

/**
 * @function 获取层geojson数据转换成字符串
 * @param {object} 参数 layer 
 * @descripiton 获取层geojson-festure重新封装成为标准geojson对象
 * @descripiton 将标准geojson转换成为字符串
 */
function getLayerGeojsonConvertStr(layer) {
    //获取层(layer)geojson-feature
    var geojson = getLayerGeojson(layer);
    var result = JSON.stringify(geojson, null, 4);
    //geojson开以下开关决定着HTML class="btn标签保存的是那个标签的内容到本地磁盘
    GlobalTabShow_Geojson = true;
    GlobalTabShow_FileGeojson = false;
    GlobalTabShow_help = false;
    return result;
};

/**
 * @function 获取层geojson数据
 * @param {object} 参数 layer
 * @description 获取层feature中的数据 
 * @returns 返回一个带有FeatureCollection的标准geojson
 */
function getLayerGeojson(layer) {
    var geojsonObj;
    var geojson = layer.toGeoJSON(10, false);
    if (typeof geojson === 'string') {
        geojsonObj = JSON.parse(geojson);
    } else {
        geojsonObj = geojson;
    }
    var id = getlayerID(layer);
    //添加层ID到geojson
    geojsonObj.properties.id = id;
    //重新封装成为标准geojson，不管加载多少文件都会在这里合并成为一个标准的Geojson文件
    var normalizeGeojson = mergeDraw(geojsonObj);
    return normalizeGeojson;
};

/**
 * @function geojson字符串显示到CodeMirror
 * @param {string} 参数 geojson字符串
 */
function showGeojsonStrToMirror(geojson) {
    GlobalEditor_Geojson.refresh();
    GlobalEditor_Geojson.setValue(geojson);

};

/**
 * @function 将GeoJSON对象重新打包成为标准geojson
 * @param {object} 参数 geojson对象
 * @descripton 标准geojson保存在全局对象变量GlobalEditor_DarwGeojsonObj
 * @descripton GlobalEditor_DarwGeojsonObj保存着所有绘图层geojson格式的对象
 * @returns 返回标准geojson对象
 */
function mergeDraw(inputs) {
    var normalized = normalize(inputs);
    for (var j = 0; j < normalized.features.length; j++) {
        GlobalEditor_DarwGeojsonObj.features.push(normalized.features[j]);
    };
    return GlobalEditor_DarwGeojsonObj;
};

/**
 * @function 删除绘图图层
 * @param {object} 参数 layer 
 * @desirption 删除绘图线段同时过虑GlobalEditor_DarwGeojsonObj.features
 */
function deleteDrawLayer(layer) {
    var layer_id = layer._leaflet_id;
    map.eachLayer(item => {
        if (item._leaflet_id === layer_id) {
            map.removeLayer(item);
        };
    });
    //过滤不等于layer_id所有item
    GlobalEditor_DarwGeojsonObj.features = GlobalEditor_DarwGeojsonObj.features.filter((item) => item.properties.id !== layer_id);
    var result = JSON.stringify(GlobalEditor_DarwGeojsonObj, null, 4);
    //在codeMirror上显示
    if (GlobalEditor_Geojson) {
        GlobalEditor_Geojson.setValue(result);
    };

};

//获取画圆半径
const getCircleDrawRadius = () => {
    //设置绘圆工具提示半径
    var radius = map.pm.Draw.Circle._layer.getRadius().toFixed(2);
    if (radius > 1000) {
        var r = (radius / 1000).toString();
        map.pm.Draw.Circle._hintMarker._tooltip.setContent("当前半径: " + r + "公里");
    } else {
        var r = radius.toString();
        map.pm.Draw.Circle._hintMarker._tooltip.setContent("当前半径: " + r + "米");
    }
};


/**
 * @function 对层对象属性赋值
 * @param {object} 参数 layer 
 * @description 作用对创建对象与更新对象时及时更新
 */
function setLayerProperties(layer, layerType) {
    var feature = layer.feature = layer.feature || {};
    feature.type = feature.type || "Feature";
    var properties = feature.properties = feature.properties || {};
    var geometrys = feature.geometry = feature.geometrys || {};
    var json = getLayerAttrbuter(layer);
    if (json != null) {
        j = jsonDataConvert(json);
        if (j.layetID) { properties.id = j.layetID; };
        if (j.radius) { properties.radius = j.radius; };
        if (j.area) { properties.area = j.area; };
        if (j.distance) { properties.distance = j.distance; }
    }
    geometrys.type = layerType;

};


/**
 * @function 更新绘图对象GlobalEditor_DarwGeojsonObj
 * @param {object} 参数 layer
 * @param {object} 参数 layerType
 * @description GlobalEditor_DarwGeojsonObj存储着所有绘图geojson对象
 * @description 当绘图被编辑时(Edit)GlobalEditor_DarwGeojsonObj会被更新
 * @returns 返回GlobalEditor_DarwGeojsonObj
 */
function updataGlobalEditorDarwGeojsonObj(layer, layerType) {
    if (GlobalEditor_DarwGeojsonObj.features.length > 0) {
        var layer_id = getlayerID(layer);
        for (var i = 0; i < GlobalEditor_DarwGeojsonObj.features.length; i++) {
            var geojson = GlobalEditor_DarwGeojsonObj.features[i];
            if (geojson.properties.id == layer_id) {
                //先更新层Feature属性
                setLayerProperties(layer, layerType);
                //再获取
                var geojsonobj = layer.toGeoJSON(10, false);
                GlobalEditor_DarwGeojsonObj.features[i] = geojsonobj;
            };
        };
    };

    return GlobalEditor_DarwGeojsonObj;
};

/**
 * @function 根据小数的数量截断值math.pow(底数x,指数y)
 * @param {number} num 参数：数字
 * @param {number} len 参数：长度
 * @returns 返回格式化好的小数
 */
function round(num, len) {
    return Math.round(num * (Math.pow(10, len))) / (Math.pow(10, len));
};

/**
 * @function 获取层属性打包成为json对象
 * @param {object} 参数：layer 
 * @desription 获取坐标，面积，半径，距离，层id等参数打包成为json
 * @returns 返回json对象
 */
var getLayerAttrbuter = function (layer) {

    var latlng;
    var id = 0;
    //var radius = 0;
    var area = 0;
    var distance = 0;
    var json;
    if (layer instanceof L.Marker) {//工具栏Marker     
        latlng = layer.getLatLng();
        lat = round(latlng.lat, 10);
        lng = round(latlng.lng, 10);
        id = getlayerID(layer);
        json = { "layetID": id, "radius": 0, "area": 0, "lat": lat, "lng": lng, "distance": distance };
        return json;
    } else if (layer instanceof L.Circle) {//工具栏带半径画圆与不带半径画圆       
        latlng = layer.getLatLng();
        lat = round(latlng.lat, 10);
        lng = round(latlng.lng, 10);
        id = getlayerID(layer);
        if (radius === 0) {
            radius = map.pm.Draw.Circle._layer.getRadius().toFixed(2);
        }
        area = (Math.PI * radius * radius).toFixed(2);
        json = { "layetID": id, "radius": radius, "area": area, "lat": lat, "lng": lng, "distance": 0 };
        return json;
    } else if (layer instanceof L.CircleMarker) {
        latlng = layer.getLatLng();
        lat = round(latlng.lat, 10);
        lng = round(latlng.lng, 10);
        id = getlayerID(layer);
        json = { "layetID": id, "radius": 0, "area": 0, "lat": lat, "lng": lng, "distance": 0 };
        return json;
    }
    else if (layer instanceof L.Polygon) {//工具栏矩形与多边形     
        id = getlayerID(layer);
        area = (turf.area(layer.toGeoJSON(10, false))).toFixed(2);
        json = { "layetID": id, "radius": 0, "area": area, "lat": 0, "lng": 0, "distance": 0 };
        return json;

    } else if (layer instanceof L.Polyline) {//工具栏线段
        var latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs();
        if (latlngs.length < 2) {
            distance = 0;
        } else {
            for (var i = 0; i < latlngs.length - 1; i++) {
                distance += latlngs[i].distanceTo(latlngs[i + 1]);
            }
            id = getlayerID(layer);
            distance = round(distance, 2);
            json = { "layetID": id, "radius": 0, "area": area, "lat": 0, "lng": 0, "distance": distance };
            return json;
        }
    } else {
        return null;
    };
};

/**
 * @function json数据转换
 * @param {object} json 
 * @returns 返回json数据 
 */
function jsonDataConvert(json) {
    var lat;
    var lng;
    var id = "";
    var radius = "";
    var area = "";
    var distance = "";
    if (json) {
        if (json.layetID) {
            id = json.layetID;
        } else {
            id = "0";
        } if (json.radius) {
            if (json.radius > 1000) {
                radius = (json.radius / 1000).toFixed(2) + "km";
            } else {
                radius = (json.radius / 1).toFixed(2) + "m";
            }
        } else {
            radius = "0";
        } if (json.area) {
            if (json.area > 1000000) {
                area = (json.area / 1000000).toFixed(2) + "km2";
            } else {
                area = (json.area / 1).toFixed(2) + "m2";
            }
        } else {
            area = "0";
        } if (json.distance) {
            if (json.distance > 1000) {
                distance = (json.distance / 1000).toFixed(2) + "km";
            } else {
                distance = (json.distance / 1).toFixed(2) + "m";
            }
        } else {
            distance = "0";
        }
        if (json.lat && json.lng) {
            lat = json.lat;
            lng = json.lng;
        } else {
            lat = "0";
            lng = "0";
        }
        var j = { "layetID": id, "radius": radius, "area": area, "lat": lat, "lng": lng, "distance": distance };

        return j;
    }
};

/**
 * @function 绑定popup并为表格赋值
 * @param {object} layer 
 */
function bindPopupDraw(layer) {
    //绑定popup
    layer.bindPopup(popupDraw).on("popupopen", () => {
        var json = getLayerAttrbuter(layer)
        var j;
        if (json) {
            j = jsonDataConvert(json)
            $('#layer_id').val(j.layetID.toString());
            if (j.radius) {
                var td = document.getElementById("radius");
                if (td) {
                    $('#radius').val(j.radius.toString());
                }
            } if (j.area) {
                var td = document.getElementById("area");
                if (td) {
                    $('#area').val(j.area.toString());
                }

            } if (j.distance) {
                var td = document.getElementById("distance");
                if (td) {
                    $('#distance').val(j.distance.toString());
                }
            } if (j.lat && j.lng) {
                var td_lat = document.getElementById("draw-lat");
                var td_lng = document.getElementById("draw-lng");
                if (td_lat && td_lng) {
                    $('#draw-lat').val(j.lat.toString());
                    $('#draw-lng').val(j.lng.toString());
                }
            }
        }
    });
};

function updataDrawPopup(layer) {
    var json = getLayerAttrbuter(layer)
    var j;
    if (json) {
        j = jsonDataConvert(json)
        $('#layer_id').val(j.layetID.toString());
        if (j.radius) {
            var td = document.getElementById("radius");
            if (td) {
                $('#radius').val(j.radius.toString());
            }
        } if (j.area) {
            var td = document.getElementById("area");
            if (td) {
                $('#area').val(j.area.toString());
            }

        } if (j.distance) {
            var td = document.getElementById("distance");
            if (td) {
                $('#distance').val(j.distance.toString());
            }
        } if (j.lat && j.lng) {
            var td_lat = document.getElementById("draw-lat");
            var td_lng = document.getElementById("draw-lng");
            if (td_lat && td_lng) {
                $('#draw-lat').val(j.lat.toString());
                $('#draw-lng').val(j.lng.toString());
            }
        }
    }
}

/**
 * @function 删除draw-Popup表格中的一行标签
 * @param {document} td 要删除行tr的子标签
 * @description 删除表格draw-table中的一行
 */
function deleteRow(td) {
    var i = td.parentNode.parentNode.rowIndex;
    document.getElementById("draw-table").deleteRow(i);
};

/* ***********************************************************************************
                                POPUP-HTML开始
**************************************************************************************/

//popup 鼠标右键上下文弹窗
var popupFile = `  
<div class="card " style="width: 100%; height: vh">
<div class="card-body  m-2 p-0">
    <ul class="nav nav-tabs d-flex mt-2" id="properties" role="tablist">
        <li class="nav-item flex-fill" role="presentation">
            <button class="nav-link w-100 " id="properties-tab" data-bs-toggle="tab"
                data-bs-target="#properties-justified" type="button" role="tab" aria-controls="properties"
                aria-selected="true">properties</button>
        </li>
        <li class="nav-item flex-fill" role="presentation">
            <button class="nav-link w-100 active" id="Info-tab" data-bs-toggle="tab" data-bs-target="#Info-justified"
                type="button" role="tab" aria-controls="Info" aria-selected="false">Info</button>
        </li>

    </ul>
    <div class="tab-content mt-2" id="myproperties" style="width: 100%; height:85%;">
        <div class="tab-pane fade" id="properties-justified" name="properties-justified"
            role="tabpanel" aria-labelledby="properties-tab">
            <div class="col-lg-12 " style="width: 100%; height: vh;">
                <table class="table table-bordered border-primary mt-2 table-responsive" id="tablePop">
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0"><input class="form-control m-0 p-0" type="text"  style="font-size: 12px;" value=""></td>
                        <td class="m-0 p-0"><input class="form-control m-0 p-0" type="text"  style="font-size: 12px;" value=""></td>
                    </tr>
                </table>

                <div class="row m-1 p-0">
                    <div class="col-sm-5 m-0 p-0">
                        <a id="addRow" href="#"> Add row</a>
                    </div>
                    <div class="col-sm-7 m-0 p-0">
                        <a id="addProperties" href="#" class="float-end">Add properties</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="tab-pane fade show active" id="Info-justified" name="Info-justified" role="tabpanel"
            aria-labelledby="Info-tab">
            <div class="col-lg-12 " style="width: 100%; height: vh;">
                <table class="table  table-bordered border-primary mt-3 " id="InfoPop">
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="layer_id"></td>
                        <td class="m-0 p-0" ><input  class="circleMarker-id form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0 Point">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text"   style="font-size: 12px;" value="Latitude"></td>
                        <td class="m-0 p-0"><input  class="circleMarker-lat form-control m-0 p-0 " type="text" style="font-size: 12px;" value=""></td>                       
                    </tr>
                    <tr class="m-0 p-0 Point">              
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text"   style="font-size: 12px;" value="Longitude"></td>
                        <td class="m-0 p-0"><input class="circleMarker-lng form-control m-0 p-0" type="text" style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0 Polygon">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text"   style="font-size: 12px;" value="平方米"></td>
                        <td class="m-0 p-0"><input  class="Polygon-Meters form-control m-0 p-0 " type="text" style="font-size: 12px;" value=""></td>                       
                    </tr>
                    <tr class="m-0 p-0 Polygon">              
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text"  style="font-size: 12px;" value="平方公里"></td>
                        <td class="m-0 p-0"><input class="Polygon-Kilometers form-control m-0 p-0" type="text" style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0 LineString">              
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text"   style="font-size: 12px;" value="米"></td>
                        <td class="m-0 p-0"><input class="LineString-Meter form-control m-0 p-0" type="text" style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0 LineString">              
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text"  style="font-size: 12px;" value="公里"></td>
                        <td class="m-0 p-0"><input class="LineString-Kilometer form-control m-0 p-0" type="text" style="font-size: 12px;" value=""></td>
                    </tr>
                </table>
            </div>
        </div>
       <div id ="popup"></div>
    </div>
</div>

<div style="width: 200px; height:1px;border:none;border-top:1px solid gray;"></div>

<div class="row col-sm-12  m-0 p-0 mt-1">
    <div class="col-sm-12  m-0 p-0">
        <button type="button" id="save" class="saveCircleMarker btn btn-primary btn-sm" disabled="disabled">Save</button>
        <button type="button" id="cancel" class="cancelCircleMarker btn btn-secondary btn-sm ">Cancel</button>
        <button type="button" id="remove" class="removeCircleMarker float-end btn btn-primary btn-sm">Delete</button>
    </div>
</div>

</div>`;

//Marker popup 鼠标右键上下文弹窗
var popupMarker = ` 
<div class="card " style="width: 100%; height: vh">
        <div class="card-body  m-2 p-0">
            <div class="col-lg-12 " style="width: 100%; height: vh;">
                <table class="table table-bordered border-primary mt-3 table-responsive" id="InfoMarker">
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="layer_id"></td>
                        <td class="m-0 p-0"><input  class="marker-id form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="Latitude"></td>
                        <td class="m-0 p-0"><input  class="marker-lat form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text" 
                                style="font-size: 12px;" value="Longitude"></td>
                        <td class="m-0 p-0"><input  class="marker-lng form-control m-0 p-0" type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                </table>
            </div>
        </div>
        <div style="width: 200px; height:1px;border:none;border-top:1px solid gray;"></div>

        <div class="row col-sm-12  m-0 p-0 mt-1">
            <div class="col-sm-12  m-0 p-0">
                <button type="button"  class="cancelMarker btn btn-secondary btn-sm ">Cancel</button>
                <button type="button"  class="removeMarker float-end btn btn-primary btn-sm">Delete</button>
            </div>
        </div>

    </div> 
`;

//draw-geoman popup 绘图弹窗
var popupDraw = ` 
<div class="card " style="width: 100%; height: vh">
        <div class="card-body  m-2 p-0">
            <div class="col-lg-12 " style="width: 100%; height: vh;">
                <table class="table table-bordered border-primary mt-3 table-responsive" id="draw-table">
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="layer_id"></td>
                        <td class="m-0 p-0"><input id="layer_id" class="layer_id form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0" id ="tr-radius">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="radius"></td>
                        <td class="m-0 p-0"><input id="radius" class="radius form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="area"></td>
                        <td class="m-0 p-0"><input id="area" class="area form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="distance"></td>
                        <td class="m-0 p-0"><input id="distance" class="distance form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left " type="text" 
                                style="font-size: 12px;" value="Latitude"></td>
                        <td class="m-0 p-0"><input id="draw-lat" class="draw-lat form-control m-0 p-0 " type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                    <tr class="m-0 p-0">
                        <td class="m-0 p-0" style="width:40%;"><input class="form-control m-0 p-0 text-left" type="text" 
                                style="font-size: 12px;" value="Longitude"></td>
                        <td class="m-0 p-0"><input id ="draw-lng" class="draw-lng form-control m-0 p-0" type="text" 
                                style="font-size: 12px;" value=""></td>
                    </tr>
                </table>
            </div>
        </div>
        <div style="width: 200px; height:1px;border:none;border-top:1px solid gray;"></div>
    </div> 
`;



