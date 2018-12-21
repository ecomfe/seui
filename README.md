# seui

*Baidu Enterprise UI for San.js.*

> 组件库在开发过程中相关功能的实现参考了[veui](https://github.com/ecomfe/veui)

## 使用指南

1. 通过 npm 安装

    ```sh
    $ npm i seui
    ```

2. 在代码中引入

    ```js
    // 引入需要的组件
    import {Button, DatePicker} from 'seui';

    // 引入全部样式
    import 'seui/lib/all.css';
    ```

    或者希望只引入需要的组件，可以这么做：

    ```js
    import Button from 'seui/lib/components/Button';
    import 'seui/lib/common.css';
    import 'seui/lib/components/Button/index.css';
    ```
    `seui/lib`下的组件与`seui/es`下的组件的区别在于后者没有经过babel的转换

## 开发指南

### 开发

```sh
$ npm run dev
```

### 构建

```sh
$ npm i build
```