<p align="center">
    <img width="200" src="./uprpc-web/src/assets/yay.jpg">
</p>
<h1 align="center">UpGrpc</h1>
<p align="center">最简单易用的gRPC客户端工具。</p>
<p align="center"><b>UpRpc</b>为开发者提供最简单和最高效的gRPC开发过程体验，旨在解决gRPC接口调试过程中遇到的问题，方便开发者定位问题。
</p>

[English](./README.md) | 简体中文

## ✨ 特性

- 支持gRPC的4种请求/响应模式：基本、客户端数据流、服务器端数据流以及双向数据流
- 支持请求和响应Metadata编解码
- 支持多个proto文件导入
- 支持多Tab操作
- 支持自定义配置持久化

## 📦 安装
支持Windows、Macos和Linux.

可以从[发布页面](https://github.com/www3com/uprpc/releases)下载可执行文件安装。

另外，包管理器也可以使用
#### macOS/Homebrew
```
brew install --cask uprpc
```

#### Windows/Chocolatey
```
choco install uprpc
```

### 从源码构建:
```
git clone https://github.com/www3com/uprpc.git
cd uprpc

yarn install && ./node_modules/.bin/electron-rebuild
npm run package
```
The installer will be located in the `release` folder.

## 预览
<p align="center">
    <img width="200" src="./uprpc-web/src/assets/yay.jpg">
</p>

## 贡献者
<div style="display: flex; align-items: center; padding: 10px">
<a href="https://github.com/www3com" style="display: flex; align-items: center; margin-right: 10px"><img width="30" height="30" src="https://avatars.githubusercontent.com/u/16772347?v=4">Jason Wang</a>
<a href="https://github.com/deific" style="display: flex; align-items: center;"><img width="30" height="30" src="https://avatars.githubusercontent.com/u/5832092?v=4">Jason Wang</a>
</div>

## 技术栈
- nodejs
- react
- ant design
- grpc
