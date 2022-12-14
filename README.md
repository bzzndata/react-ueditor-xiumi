Fork [ygunoil/react-ueditor-xiumi](https://gitee.com/ygunoil/react-ueditor-xiumi/)

# Fork 后的主要改动点
1. 上传音视频弹窗，关闭弹窗后再次打开，清空上一次上传或填写的内容。
2. 将音视频的参数汉化。
3. 在弹框中上传完音视频后，自动添加链接，避免用户忘记点击“添加”按钮
4. 上传音频弹窗中去掉参数：poster、name、author
5. 上传视频弹窗中，高度宽度之前只能填像素值，不能填百分比，现将数字框改为文本框以支持百分比。另外，宽度默认设置为 100%
6. 上传音视频弹窗中，“直接上传”之前是任意文件都可以选，改为上传音频就只能选择音频相关的文件（如：mp3、wav 等），视频就只能选择视频相关的文件（如：mp4、avi 等）
7. 上传音视频弹窗中，预览音视频之前是预览输入框中链接对应的资源，改为预览最后一个“添加”到列表的资源
8. 上传音视频过程中，有 loading 动画代替进度百分比
9. 增加 maxAudioMB 和 maxVideoMB 属性，分别限制最大可上传音视频的兆字节数
10. 增加 autoplayHidden 属性，隐藏音视频参数的自动播放字段。主要为了避免在在编辑器中设置了“自动播放”，但在 iOS 微信中又被禁止自动播放，且初始时视频界面中央的播放按钮也不显示，对用户造成困惑
11. 对 video 默认增加 playsinline webkit-playsinline 属性，避免在 iOS 中播放视频时始终是全屏播放

### 下载
```
  npm:    npm i @bzzndata/react-ueditor-xiumi -S
  yarn:   yarn add @bzzndata/react-ueditor-xiumi
```

### 使用
#### 引入 Ueditor 文件夹

拷贝该项目 `vendor` 目录下的 ueditor（经过修改）到你的项目下

#### 使用组件
```
import ReactUeditor from '@bzzndata/react-ueditor-xiumi'

<ReactUeditor
  config={{zIndex: 1001}}
  onChange={this.updateEditorContent}
  plugins={['uploadImage', 'insertCode']}
  uploadImage={this.uploadImage}
  ueditorPath={`${window.YOUR_PATH}/ueditor`}"
  value="Hello World!"
/>
```

Property             | Description                                  | Type   | Must
:------------------- | :------------------------------------------- | :----- | :------
config               | 在实例化时传入配置参数                           | obj   | no
getRef               | 获取 ueditor 实例                             | func  | no
multipleImagesUpload | 支持多文件上传，默认为 false                     | bool  | no
onChange             | 编辑器内容改变事件                               | func  | no
onReady              | ueditor 加载完成事件                            | func  | no
plugins              | 需要使用的插件                                  | array | no
progress             | 上传进度                                       | num   | no
ueditorPath          | ueditor 文件夹路径（建议使用绝对路径，或上传到 CDN）| string | yes
uploadAudio          | 音频上传回调                                    | func  | no
uploadImage          | 图片上传回调                                    | func  | no
uploadVideo          | 视频上传回调                                    | func  | no
value                | 初始化值                                       | string | no

plugins 现支持：
- 图片上传 uploadImage
- 视频上传 uploadVideo
- 音频上传 uploadAudio
- 插入代码 insertCode

#### 配置
ueditor 主要通过ueditor.config.js 文件来配置，在存在多个编辑器示例而配置有所差异的场景下，可将部分参数传入到 config 属性中，具体配置可参考 (ueditor 配置说明)[http://fex.baidu.com/ueditor/#start-config]


#### 获取实时更新数据
通过 onChange 可获取实时更新的数据，其返回 string 类型（也可以通过 getRef 方法获取 ueditor 实例，直接获取编辑器内容，详情见后面的示例）

```
updateEditorContent = content => {
  // 此处勿通过 setState 更新 value，若用于提交表单场景，可将 content 赋值于一变量，在提交时从变量中获取最后结果即可，如：
  // this.result = content
}
```

#### 图片上传
ueditor 的图片上传功能与后端耦合性很大，在前后端分离大行其道的今天，并不是很适合，因此我们新增了图片上传的回调的接口。

```
<ReactUeditor
  ...
  uploadImage={this.uploadImage}
/>

// uploadImage 必须返回一个 promise
uploadImage = e => {
  return new Promise(function(resolve, reject) {
    let file = e.target.files[0]

    // 在这里将你的图片上传到服务器，在上传成功的回调中执行
    resolve(imgUrl)
  })
}
```
视频上传和音频上传与图片上传的方法一致

#### 直接操作 ueditor 实例
react-ueditor 提供的接口并不多，并不能满足大部分开发者的需求，因此我们也提供让开发者获取 ueditor 实例的接口，供开发者直接操作 ueditor 对象，例如获取编辑器内容:

```
<ReactUeditor
  getRef={this.getUeditor}
  ...
/>

// 该方法在 ReactUeditor 被渲染后会自动执行
getUeditor = ref => {
  this.ueditor = ref
}

// getContent 为 ueditor 的内部方法
getEditorContent = () => {
  console.log(this.ueditor.getContent())
}
```

### 贡献
如果你希望为这个项目贡献代码，需要了解以下情况：

- 执行 `yarn run start` 会启动开发服务器，此时会在浏览器中展示 ReactUeditor 的真实效果

- example.js, index.html, dist/ 都只是为了展示 ReactUeditor 的真实效果，主要代码在 ReactUeditor/ 中

- 需要修改 ueditor 源码时，直接修改 ueditor 目录下的文件，修改完执行：`cd ueditor` 和 `yarn run grunt` 命令，此时会重新生成 ueditor 构建成功的文件到 vendor/ueditor
