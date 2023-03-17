/*
 * ******加载本地文件(GeoJSON, KML, GPX,xlsx)到地图。********
 *对原Leaflet.FileLayer进行了修改增加了EXCEL.xlsx内容。
 *原文件地址：https://github.com/makinacorpus/Leaflet.FileLayer
 *本地加载文件(GeoJSON, KML, GPX,xlsx)到地图。
 *使用HTML5文件API.
 *依懒文件：
 *  1、尼古拉·库楚莫夫的read-excel-file
 *     原文件地址：https://gitlab.com/catamphetamine/read-excel-file#json
 *  2、将 KML 和 GPX 转换为 GeoJSON。要求Mapbox的egojson.js在全局范围内
 *     原文件地址：https://github.com/mapbox/togeojson
 *  3、此例是点文件转换为geojson格式后调用_loadGeoJSON方法加载到地图中《leaflet.filelayer-dis.js》与《disDrawMap.js》共同完成
 */

(function (factory, window) {
    // 定义一个依赖于“leaflet”的AMD模块'
    if (typeof define === 'function' && define.amd && window.toGeoJSON && window.readXlsxFile) {
        define(['leaflet'], function (L) {

            factory(L, window.toGeoJSON, window.readXlsxFile);
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = function (root, L, toGeoJSON) {
            if (L === undefined) {
                if (typeof window !== 'undefined') {
                    L = require('leaflet');
                } else {
                    L = require('leaflet')(root);
                }
            }
            if (toGeoJSON === undefined) {
                if (typeof window !== 'undefined') {
                    toGeoJSON = require('togeojson');
                } else {
                    toGeoJSON = require('togeojson')(root);
                }
            }
            factory(L, toGeoJSON);
            return L;
        };
    } else if (typeof window !== 'undefined' && window.L && window.toGeoJSON && window.readXlsxFile) {
        factory(window.L, window.toGeoJSON, window.readXlsxFile);
    }
}(function fileLoaderFactory(L, toGeoJSON, readXlsxFile) {
    var FileLoader = L.Layer.extend({
        options: {
            layer: L.geoJson,
            MultiPoint: true,
            layerOptions: {},
            fileSizeLimit: 1024,
            GpsKmlGeojsonArr: [], //存储geojson格式的数据
            layerArr: [] //存储L.geoJson layer数据
        },
        initialize: function (map, options) {
            this._map = map;
            L.Util.setOptions(this, options);
            this._parsers = {
                geojson: this._loadGeoJSON,
                json: this._loadGeoJSON,
                gpx: this._convertToGeoJSON,
                kml: this._convertToGeoJSON,
                xlsx: this._excelPointGeojson,
            };
        },
        load: function (file, ext) {
            var parser, reader;
            //检查文件名是否存在
            if (this._isParameterMissing(file, 'file')) {
                return false;
            }
            //检查文件大小
            if (!this._isFileSizeOk(file.size)) {
                return false;
            }
            //获取文件扩展名
            parser = this._getParser(file.name, ext);
            if (!parser) {
                return false;
            }
            //使用HTML5文件API读取所选文件
            reader = new FileReader();
            reader.onload = L.Util.bind(function (e) {
                var layer;
                var that = this;
                var coordinates = [];
                try {
                    if (parser.ext != 'xlsx') {
                        that.fire('data:loading', { filename: file.name, format: parser.ext });
                        layer = parser.processor.call(that, e.target.result, parser.ext);
                        that.fire('data:loaded', {
                            layer: layer,
                            filename: file.name,
                            format: parser.ext
                        });
                    } else {
                        that.fire('data:loading', { filename: file.name, format: parser.ext });
                        readXlsxFile(file).then(function (data) {
                            coordinates = getGpsPoint(data);
                            if (coordinates.length > 0) {
                                layer = parser.processor.call(that, coordinates);
                                that.fire('data:loaded', {
                                    layer: layer,
                                    filename: file.name,
                                    format: parser.ext
                                });
                            }
                        }), function (error) {
                            console.error(error)
                            // alert("Error while parsing Excel file. See console output for the error stack trace.")
                        };

                    }
                } catch (err) {
                    this.fire('data:error', { error: err });
                }
            }, this);
            //测试技巧:测试不传递真实文件，而是一个带文件的对象。测试设置为true。读取器无法读取该对象，跳过它即可。
            if (!file.testing) {
                reader.readAsText(file);
            }
            //我们返回它以简化测试
            return reader;
        },
        loadMultiple: function (files, ext) {
            var readers = [];
            if (files[0]) {
                files = Array.prototype.slice.apply(files);
                while (files.length > 0) {
                    //shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值
                    readers.push(this.load(files.shift(), ext));
                }
            }
            //返回第一个读取器(如果没有文件则为false)它也用于后续加载
            return readers;
        },
        loadData: function (data, name, ext) {
            var parser;
            var layer;

            // Check required parameters
            if ((this._isParameterMissing(data, 'data'))
              || (this._isParameterMissing(name, 'name'))) {
                return;
            }

            // Check file size
            if (!this._isFileSizeOk(data.length)) {
                return;
            }

            // Get parser for this data type
            parser = this._getParser(name, ext);
            if (!parser) {
                return;
            }

            // Process data
            try {
                this.fire('data:loading', { filename: name, format: parser.ext });
                layer = parser.processor.call(this, data, parser.ext);
                this.fire('data:loaded', {
                    layer: layer,
                    filename: name,
                    format: parser.ext
                });
            } catch (err) {
                this.fire('data:error', { error: err });
            }
        },
        //参数信息：如果参数等于undefined 返回true else 返回false
        _isParameterMissing: function (v, vname) {
            if (typeof v === 'undefined') {
                this.fire('data:error', {
                    error: new Error('Missing parameter: ' + vname)
                });
                return true;
            }
            return false;
        },
        //获取文件名与扩展名
        _getParser: function (name, ext) {
            var parser;
            ext = ext || name.split('.').pop();
            parser = this._parsers[ext];
            if (!parser) {
                this.fire('data:error', {
                    error: new Error('Unsupported file type (' + ext + ')')
                });
                return undefined;
            }
            return {
                processor: parser,
                ext: ext
            };
        },
        _isFileSizeOk: function (size) {
            var fileSize = (size / 1024).toFixed(4);
            if (fileSize > this.options.fileSizeLimit) {
                this.fire('data:error', {
                    error: new Error(
                        'File size exceeds limit (' +
                        fileSize + ' > ' +
                        this.options.fileSizeLimit + 'kb)'
                    )
                });
                return false;
            }
            return true;
        },
        //加载GeoJSON数据
        _loadGeoJSON: function _loadGeoJSON(content) {
            var layer;
            //如果content为字符串就转换为对象
            if (typeof content === 'string') {
                content = JSON.parse(content);
            }
            //将转换后的geojson存入this.options.GpsKmlGeojsonArr数组
            this.options.GpsKmlGeojsonArr = [];
            this.options.GpsKmlGeojsonArr.push(content);
            layer = this.options.layer(content, this.options.layerOptions);
            this.options.layerArr.push(layer);
            
            if (layer.getLayers().length === 0) {
                throw new Error('GeoJSON has no valid layers.');
            }
            if (this.options.addToMap) {
                //this.options.layerArr.push(layer);              
                layer.addTo(this._map);
            }
            return layer;
        },
        //将 KML、GPX 和 TCX 转换为 GeoJSON。
        _convertToGeoJSON: function _convertToGeoJSON(content, format) {
            var geojson;
            //格式为'gpx'或'kml'      
            if (typeof content === 'string') {
                content = (new window.DOMParser()).parseFromString(content, 'text/xml');
            }
            geojson = toGeoJSON[format](content);

            return this._loadGeoJSON(geojson);
        },
        //将EXCLE点坐标转换为Geojson
        _excelPointGeojson: function _excelPointGeojson(excelConvertArr) {
            //excle点坐标会生成两种格式的Geojson一种是point格式一种是multipoint          
            if (this.options.MultiPoint) {
                if (excelConvertArr.length > 0) {
                    var lnglat = [];
                    for (let i = 0; i < excelConvertArr.length; i++) {
                        //excel文件数据格式纬度在前而Geojson格式是经度在前这里进行转换
                        //转换坐标为数值型
                        var x = excelConvertArr[i][0]*1;
                        var y = excelConvertArr[i][1]*1;
                        var coordinate = [y, x];
                        lnglat.push(coordinate);
                    }
                    if (this.options.addToMap) {
                        if (lnglat.length > 0) {
                            var geojsonArr = [];
                            var pointToFeature = this._MultiPointToFeature(lnglat)
                            geojsonArr.push(pointToFeature)
                            var geojsonPoint = this._featureCollection(geojsonArr);
                        }
                    }
                    return this._loadGeoJSON(geojsonPoint);
                }
            } else {
                if (excelConvertArr.length > 0) {
                    var lnglat = [];
                    for (let i = 0; i < excelConvertArr.length; i++) {
                        //excel文件数据格式纬度在前而Geojson格式是经度在前这里进行转换
                        //转换坐标为数值型
                        var x = excelConvertArr[i][0]*1;
                        var y = excelConvertArr[i][1]*1;
                        var coordinate = [y, x];
                        var properties = { name: `${i}` }
                        var pointToFeature = this._pointToFeature(coordinate, properties)
                        lnglat.push(pointToFeature);
                    }
                    if (this.options.addToMap) {
                        if (lnglat.length > 0) {
                            var geojsonPoint = this._featureCollection(lnglat);
                            return this._loadGeoJSON(geojsonPoint);
                        }
                    }

                }
            }
        },
        //为要素添加点坐标      
        _pointToFeature: function _pointToFeature(coordinates, properties, options) {
            return this._feature(
                {
                    type: "Point",
                    coordinates: coordinates
                },
                properties,
                options

            );
        },
        _MultiPointToFeature: function _MultiPointToFeature(coordinates, properties, options) {
            return this._feature(
                {
                    type: "MultiPoint",
                    coordinates: coordinates
                },
                properties,
                options

            );
        },
        _feature: function _feature(geometry, properties, options) {
            var feat = { type: "Feature" };
            feat.properties = properties || {};
            feat.geometry = geometry;
            return feat;
        },
        //要素集合
        _featureCollection: function _featureCollection(features) {
            var fc = { type: "FeatureCollection" };
            fc.features = features;
            return fc;
        }
    });
    //提取EXCEL文件坐标
    const getGpsPoint = function (data) {
        var newXYArr = [];
        for (var i = 0; i < data.length; i++) {
            var Arr = data[i]
            for (var j = 0; j < Arr.length; j++) {
                newXYArr[i] = Arr.filter((_, j) => {
                    return j !== 0;
                });

            }
        }
        return newXYArr;
    };
    var FileLayerLoad = L.Control.extend({
        statics: {
            TITLE: 'Load local file (GPX, KML, GeoJSON,XLSX)',
            LABEL: '&#8965;'
        },
        options: {
            position: 'topleft', //打开文件图标在顶靠左
            fitBounds: true,   //显示边界
            flyTo: true,       //飞行方式
            addToMap: true, //添加到地图开关开
            fileSizeLimit: 1024,
            MultiPoint: false //点文件生geojson方法如为false点的生成为point 如果为TRUE 生成为multipoint
        },
        initialize: function (options) {
            L.Util.setOptions(this, options);
            this.loader = null;
        },
        onAdd: function (map) {
            this.loader = L.FileLayer.fileLoader(map, this.options);
            this.loader.on('data:loaded', function (e) {
                //加载后适合边界.加载文件后有二种方式进入合适边界的设置
                //1、是直接进入this.options.flyTo=true
                //2、是飞入方法程序默认为this.options.fitBounds=true           
                if (this.options.fitBounds) {
                    if (this.options.flyTo) {
                        window.setTimeout(function () {
                            if (e.layer) {
                                //缩放到合适大小
                                var scale = this.map.getZoom();
                                if (scale > 18) {
                                    //如果缩放级别大于18则缩小到15否则高亮显示不起作用
                                    this.map.setZoom(15);
                                }
                                var bounds = e.layer.getBounds();
                                var zoom = map.getBoundsZoom(bounds);
                                var swPoint = map.project(bounds.getSouthWest(), zoom);
                                var nePoint = map.project(bounds.getNorthEast(), zoom);
                                var center = map.unproject(swPoint.add(nePoint).divideBy(2), zoom);
                                map.flyTo(center, zoom);
                            } else if (e.featureGroup) {
                                //缩放到合适大小
                                var bounds = e.featureGroup.getBounds();
                                var zoom = map.getBoundsZoom(bounds);
                                var swPoint = map.project(bounds.getSouthWest(), zoom);
                                var nePoint = map.project(bounds.getNorthEast(), zoom);
                                var center = map.unproject(swPoint.add(nePoint).divideBy(2), zoom);
                                map.flyTo(center, zoom);
                            }
                        }, 500);
                    } else {
                        window.setTimeout(function () {
                            if (e.layer) {
                                //geojson进入layer层
                                map.fitBounds(e.layer.getBounds());
                                //map.flyToBounds(fitBounds(e.layer.getBounds()))
                            } else if (e.featureGroup) {
                                //点坐标进入featureGroup层
                                map.fitBounds(e.featureGroup.getBounds());
                            }

                        }, 500);
                    }
                }

            }, this);
            //初始化拖放
            this._initDragAndDrop(map);
            //初始化映射控件
            return this._initContainer();
        },
        //文件托动
        _initDragAndDrop: function (map) {
            var callbackName;
            var thisLoader = this.loader;
            var dropbox = map._container;

            var callbacks = {
                dragenter: function () {
                    map.scrollWheelZoom.disable();
                },
                dragleave: function () {
                    map.scrollWheelZoom.enable();
                },
                dragover: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                },
                drop: function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    thisLoader.loadMultiple(e.dataTransfer.files);
                    map.scrollWheelZoom.enable();
                }
            };
            for (callbackName in callbacks) {
                if (callbacks.hasOwnProperty(callbackName)) {
                    dropbox.addEventListener(callbackName, callbacks[callbackName], false);
                }
            }
        },
        //添加div元素,元素属性leaflet-control-filelayer leaflet-control-zoom
        //添加div元素事件，并返回这个元素（container）
        _initContainer: function () {
            var thisLoader = this.loader;

            // Create a button, and bind click on hidden file input
            //创建一个按钮，并绑定单击隐藏文件输入
            var fileInput;
            var zoomName = 'leaflet-control-filelayer leaflet-control-zoom';
            var barName = 'leaflet-bar';
            var partName = barName + '-part';
            var container = L.DomUtil.create('div', zoomName + ' ' + barName);
            var link = L.DomUtil.create('a', zoomName + '-in ' + partName, container);
            link.innerHTML = L.Control.FileLayerLoad.LABEL;
            link.href = '#';
            link.title = L.Control.FileLayerLoad.TITLE;

            // Create an invisible file input
            //创建一个不可见的file input
            fileInput = L.DomUtil.create('input', 'hidden', container);
            fileInput.type = 'file';
            fileInput.multiple = 'multiple';
            if (!this.options.formats) {
                fileInput.accept = '.gpx,.kml,.json,.geojson,.xlsx';
            } else {
                fileInput.accept = this.options.formats.join(',');
            }
            fileInput.style.display = 'none';
            // Load on file change
            fileInput.addEventListener('change', function (e) {
                thisLoader.loadMultiple(this.files);
                this.value = '';
            }, false);

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(link, 'click', function (e) {
                fileInput.click();
                e.preventDefault();
            });
            return container;
        }
    });
    L.FileLayer = {};
    L.FileLayer.FileLoader = FileLoader;
    L.FileLayer.fileLoader = function (map, options) {
        return new L.FileLayer.FileLoader(map, options);
    };
    L.Control.FileLayerLoad = FileLayerLoad;
    L.Control.fileLayerLoad = function (options) {
        return new L.Control.FileLayerLoad(options);
    };
}, window));

