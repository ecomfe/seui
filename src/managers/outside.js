/**
 * @file 控制hover或者click outside行为(相关逻辑参考veui中的outside指令)
 * @author liuchaofan
 */

/**
 * 判断两个元素是否存在父子关系。
 * IE9 的 SVGSVGElement 上没有 contains 方法，做下 hack 。
 *
 * @param {Element} parentElem 父元素
 * @param {Element} childElem 子元素
 * @return {boolean}
 */
import {uniqueId, remove, assign} from 'lodash';

function contains(parentElem, childElem) {
    return parentElem.contains
        ? parentElem.contains(childElem)
        : document.body.contains.call(parentElem, childElem);
}

const SPECIAL_EVENT_MAP = {
    hover: 'mouseout'
};

let handlerBindings = {};

const TRIGGER_TYPES = ['click', 'hover'];

/**
 * 获得一个outside行为的key值，方便之后的管理
 * @param  {string} type hover or click
 * @return {string}
 */

function getBindingKey(type) {
    return `__dux_${type}_outside__`;
}

/**
 * 初始化管理outside行为的对象以及事件
 * @param  {string} type hover or click
 */

function initBindingType(type) {
    let key = getBindingKey(type);
    let event = SPECIAL_EVENT_MAP[type] || type;
    document.addEventListener(event, e => {
        handlerBindings[type].forEach(item => {
            item.el[key] && item.el[key].handler(e);
        });
    }, true);
}

/**
 * 对Popover组件当中传入的targetsFunction, targetsArray做处理
 * 以期得到最终的includeTargets
 * @param {Function} targetsFunction 返回目标值的函数
 * @param {Array} targetArray 目标值数组
 * @type {Array}
 */

function getInputTargets(targetsFunction, targetsArray) {
    let realTargets = [];
    if (targetsFunction && typeof targetsFunction === 'function') {
        realTargets = targetsFunction();
    }
    if (Object.prototype.toString.call(realTargets) !== '[object Array]') {
        realTargets = [targetsFunction()];
    }
    realTargets = realTargets.concat(targetsArray);
    return realTargets;
}

/**
 * 判断 element 在 DOM 树结构上是否被包含在 elements 里面
 *
 * @param {Element} element 待判断的元素
 * @param {Array.<Element>} elements 元素范围
 */

function isElementIn(element, elements) {
    return elements.some(elm => contains(elm, element));
}

/**
 * 清除一个dom元素下面处理挂载的属性
 * @param  {element} el dom节点
 */

export function clear(el) {
    TRIGGER_TYPES.forEach(type => {
        let key = getBindingKey(type);
        if (el[key]) {
            remove(handlerBindings[type], item => item.el[key].id === el[key].id);
            if (type === 'hover') {
                clearTimeout(el[key].timer);
            }
            el[key] = null;
        }
    });
}

/**
 * [generate description]
 * @param {Function} handler 处理函数
 * @param {Element} el      popover的element
 * @param {string} trigger 触发的方式
 * @param {Array} targets 触发的element
 * @param {boolean} excludeSelf 是否包含popover的element，是的话不包含，否的话包含
 * @param {number} delay hover触发时候的延迟选项
 * @return {Function}
 */

function generate({handler, trigger, el, targetsFunction, targetsArray, excludeSelf, delay}) {
    if (trigger !== 'hover') {
        return function (e) {
            let realTargets = [];
            realTargets = getInputTargets(targetsFunction, targetsArray);
            if (!realTargets[0]) {
                return;
            }

            // 非移动触发的受控模式下，直接判断元素包含情况
            let includeTargets = [...(excludeSelf ? [] : [el]), ...realTargets];
            if (e.type === trigger && e.target && !isElementIn(e.target, includeTargets)) {
                handler(e);
            }
        };
    }
    if (!delay) {
        // 如果没有设置 delay 参数，只要检查到鼠标移到 includeTargets 外面去了，就同步触发 outside handler 。
        return function (e) {
            let realTargets = [];
            realTargets = getInputTargets(targetsFunction, targetsArray);
            if (!realTargets[0]) {
                return;
            }
            let includeTargets = [...(excludeSelf ? [] : [el]), ...realTargets];
            // 从 includeTargets 区域移到外面去了，果断触发 handler
            // console.log(e.target, e.relatedTarget, includeTargets);
            if (isElementIn(e.target, includeTargets) && !isElementIn(e.relatedTarget, includeTargets)) {
                handler(e);
            }
        };
    }

    let hoverDelayData = {
        state: 'ready' // 'ready' | 'out' | 'in'
    };

    let bindingKey = getBindingKey('hover');
    // 如果设置了 delay ，在鼠标移出 includeTargets 之后设个计时器，并且标明已经移出去了（ `out` ）。
    // 如果鼠标在计时器计时结束之前，移回了 includeTargets ，就把标记改为 `in` 。
    // 如果鼠标在计时器计时结束时，还没有移回 includeTargets 内，对应的标记位还会是 `out` ，此时就可以触发 outside handler 了。
    return function (e) {
        let realTargets = [];
        realTargets = getInputTargets(targetsFunction, targetsArray);
        if (!realTargets[0]) {
            return;
        }
        let includeTargets = [...(excludeSelf ? [] : [el]), ...realTargets];
        let isTargetIn = isElementIn(e.target, includeTargets);
        let isRelatedTargetIn = isElementIn(e.relatedTarget, includeTargets);
        if (isTargetIn && !isRelatedTargetIn) {
            hoverDelayData.state = 'out';
            el[bindingKey].timer = setTimeout(() => {
                if (hoverDelayData.state === 'out') {
                    handler(e);
                }
            }, delay);
        }
        else if (!isTargetIn && isRelatedTargetIn) {
            hoverDelayData.state = 'in';
        }
    };
}

/**
 * 解析需要绑定的参数
 * @param  {Object} binding 包含el的绑定参数
 * @return {Object}
 */

function parseBinding(binding) {
    let {el, trigger} = binding;
    let key = getBindingKey(trigger);
    el[key] = {
        id: uniqueId('dux-outside-'),
        handler: generate(binding)
    };
    return binding;
}

export function register(type = 'hover', binding) {
    binding = parseBinding(binding);
    let bindings = handlerBindings[type];
    if (!bindings) {
        handlerBindings[type] = [binding];
        initBindingType(type);
        return;
    }
    bindings.push(binding);
}

export function upgrade(el, type, option) {
    let bindings = handlerBindings[type];
    bindings.map(item => {
        if (item.el === el) {
            let key = getBindingKey(item.trigger);
            item = assign(item, option);
            el[key].handler = generate(item);
        }
        return item;
    });
}
