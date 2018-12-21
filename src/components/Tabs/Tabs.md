## Tabs组件说明:

### 简介
Tabs即选项卡切换组件,用于平级区域大块内容的展现与隐藏

### Tabs props

|属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
|value | string | 第一项tab的name | 当前tab面板的name，可以使用 {=value=}来双向绑定 |
|type | string | line | 基本样式类型,可选值为 line、mini、card|
|animated|boolean|true| 切换是否使用CSS3动画|

### Tabs events
|事件名 | 说明 |
|---|---|
|on-change | tab被点击时触发 |
|on-remove | tab被删除时触发 |


### Tabs slot
|插槽名 | 说明 |
|---|---|
|extra | tabs右侧附加内容 |


### Tabs.Tab props
|属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
|value | string | - | 标识当前Tab项,与Tabs的value属性对应 |
|type | string | line | 基本样式类型,可选值为 line、card|
|label|string|空| 选项卡投显示文字|
|disabled|boolean|false|是否禁用该选项卡|
