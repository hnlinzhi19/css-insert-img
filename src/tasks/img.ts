import * as path from 'path';
import {
  workspace,
  window,
  Position,
} from 'vscode';
import {template} from 'lodash';

// types没有的模块
const clipboardy = require('clipboardy');
const globby = require('globby');
const jimp = require('jimp');
// 默认配置
const defaults = {
  imgPath: 'src/**/*.{png,jpg,gif,webp}',
  tpl: 'width: ${width}px;height: ${height}px;background:url(${src}) no-repeat top center;background-size: 100%;'
};
// 默认

/**
 * 替换目录
 */
export const resolvePath = (str: string): string => {
  return path.join(workspace.rootPath || __dirname, str);
};
/**
 * 获取配置
 */
export const getConfig = (str: string): any => {
  return workspace.getConfiguration('imgstyle').get(str);
};
/**
 * 插入样式
 */
export const imgInsert = () => {
  readImgs();
  // writeInText(renderString());
};
/**
 * 读取所有图片路径
 */
export const readImgs = async () => {
  const imgPath: string[] = getConfig('path') || defaults.imgPath;
  const filterPath: string[] = imgPath.map((v: string) => resolvePath(v));
  // 读取到所有的图片路径
  const imgsArray: any = await globby(filterPath);
  // 转换为pick配置项
  const quickPickArray = imgsArray.map((v: string) => {
    return {
      label: path.parse(v).base,
      description: path.relative(workspace.rootPath || __dirname, v),
      src: v,
    };
  });
  // 打开vscode的选择器
  const action = await window.showQuickPick(quickPickArray);
  if (typeof action === 'object') {
    readImg(action);
  }
};
/**
 * 读取图片
 */
export const readImg = async (action = {
  src: ''
}) => {
  if (!action.src) {
    return;
  }
  const imgInfo = await jimp.read(action.src);
  // console.log('imgInfo', imgInfo.bitmap.width);
  const {
    width,
    height
  } = imgInfo.bitmap;
  writeInText(renderString(width, height, action.src));
};
/**
 * 渲染字符串
 */
export const renderString = (width: number, height: number, src: string): string => {
  // 拼接字符串
  const tpl: string = (getConfig('tpl') || defaults.tpl).replace(/;/g, ';\n\t').replace(/\n\t$/, '');
  const compiled: Function = template(tpl);
  const {
    activeTextEditor
  } = window;
  let relativeSrc:string = '';
  // 如果打开了编辑文本了
  if (activeTextEditor) {
    relativeSrc = path.relative(path.parse(activeTextEditor.document.uri.path).dir,path.parse(src).dir);
  } else {
    relativeSrc = path.relative(workspace.rootPath || process.cwd(),path.parse(src).dir);
  } 
  relativeSrc += `/${path.parse(src).base}`;
  // 因为没有./的相对路径，所以自己加上去了
  if (/^[^\.]+/.test(relativeSrc)) {
    relativeSrc = `./${relativeSrc}`;
  }
  
  const compiledString: string = compiled({
    width,
    height,
    src: relativeSrc
  });
  return compiledString;
};
/**
 * 插入内容进入文本或者复制到粘贴板
 * @param compiledString 
 */
export const writeInText = (compiledString: string): void => {
  // 插入字符串逻辑
  const {
    activeTextEditor
  } = window;
  // 插入到当前光标所在编辑框
  if (activeTextEditor) {
    activeTextEditor.edit((editBuilder) => {
      var position = new Position(activeTextEditor.selection.active.line, activeTextEditor.selection.active.character);
      editBuilder.insert(position, compiledString);
    });
  } else {
    // 复制到粘贴板
    clipboardy.write(compiledString);
  }
};