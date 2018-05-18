## 功能说明
- 快速计算好图片尺寸并根据模板返回图片的尺寸、相对路径值
- 支持配置模板
- 支持路径过滤


## 配置模板
模板生成参考使用的 [loadash.template](https://github.com/lodash/lodash)
```
<!-- 目前只支持width,height,src -->
    "imgstyle.tpl": "width: ${width}px;height: ${height}px;background-image:url(${src});"  
```

## 配置过滤路径
具体npm模块用的是[globby](https://github.com/sindresorhus/globby) 数组配置参考
```
<!-- opthon -->
    "imgstyle.path": ["test/**/*.{png,jpg,gif,webp}"]
```

## 核心的获取图片信息
具体npm模块用的是[jimp](https://github.com/oliver-moran/jimp) 一个十分不错的图片处理库


