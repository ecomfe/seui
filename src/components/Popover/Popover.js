/**
 * @file Popover
 * @author leon <ludafa@outlook.com>
 */

/* global window */

import Layer from './Layer';
import {create} from '../../util/cx';
// import align from 'dom-align';
import Tether from 'tether';
import san, {DataTypes} from 'san';
import {throttle} from 'lodash';
import classnames from 'classnames';
import {register, clear, upgrade} from '../../managers/outside';

const cx = create('popover');
const INITIAL_POSITION_STYLE = '';

// 位置缩写与全称对应的map
const shortForPosition = {
    b: 'bottom',
    c: 'middle',
    t: 'top',
    l: 'left',
    r: 'right'
};

// 对弹出层的位置有交互的情况下做的一些限制
const defaultConstraints = [
    {
        to: 'scrollParent',
        attachment: 'together'
    },
    {
        to: 'window',
        attachment: 'together'
    }
];

export default class Popover extends Layer {

    static trimWhitespace = 'all';

    static template = `
        <div class="{{mainClassName}}" on-click="handleClick($event)" on-mouseout="handleMouseout($event)">
            <div
                class="{{boxClassName}}"
                s-ref="overlay"
                style="${INITIAL_POSITION_STYLE}"
                on-transitionend="transitionEnd">
                <slot />
            </div>
        </div>
    `;

    static computed = {
        mainClassName() {
            let closing = this.data.get('closing');
            let open = this.data.get('realOpen');
            let opening = this.data.get('opening');

            let className = cx(this)
                .addStates({
                    open: !closing && open,
                    closing,
                    opening
                })
                .build();

            return classnames(
                className
            );
        },

        boxClassName() {
            let overlayClass = this.data.get('overlayClass');
            return classnames(
                cx.getPartClassName('box'),
                overlayClass
            );
        }
    };

    static dataTypes = {
        open: DataTypes.bool,
        isClickAway: DataTypes.bool,
        anchorOrigin: DataTypes.oneOf(['tl', 'cl', 'bl', 'tc', 'cc', 'bc', 'tr', 'cr', 'br']),
        targetOrigin: DataTypes.oneOf(['tl', 'cl', 'bl', 'tc', 'cc', 'bc', 'tr', 'cr', 'br']),
        offsetX: DataTypes.number,
        offsetY: DataTypes.number,
        maxHeight: DataTypes.number,
        maxWidth: DataTypes.number,
        shadow: DataTypes.number,
        excludeSelf: DataTypes.bool
    };

    static messages = {
        'popover-hide'(arg) {
            let target = arg.target;
            this.data.remove('targetsArray', target.ref('overlay'));
        },
        'popover-show'(arg) {
            let target = arg.target;
            this.data.push('targetsArray', target.ref('overlay'));
        }
    };

    initData() {
        return {
            /**
             * outside行为是否不包含本身
             * @type {Boolean}
             */
            excludeSelf: true,

            /**
             * 是否展开浮层
             *
             * @type {boolean}
             */
            open: false,

            /**
             * 是否点击后关闭
             */
            isClickAway: true,

            /**
             * 锚点元素对齐角
             * @type {string}
             */
            anchorOrigin: 'tl',

            /**
             * 浮层元素对齐角
             *
             * @type {string}
             */
            targetOrigin: 'tl',

            /**
             * 浮层元素水平方向位移
             *
             * @type {number}
             */
            offsetX: 0,

            /**
             * 浮层元素垂直方向位移
             *
             * @type {number}
             */
            offsetY: 0,

            /**
             * 最大高度
             *
             * @type {?number}
             */
            maxHeight: null,

            /**
             * 最大宽度
             *
             * @type {?number}
             */
            maxWidth: null,

            /**
             * 阴影尝试
             *
             * @type {number}
             */
            shadow: 1,

            /**
             * 是否正在关闭
             *
             * @private
             * @type {boolean}
             */
            closing: false,

            /**
             * 是否允许出现滚动条
             *
             * @private
             * @type {boolean}
             */

            isScroll: true,

            /**
             * 触发的模式
             *
             * @private
             * @type {string}
             */

            mode: 'click',

            /**
             * 不被outside.js影响的dom元素数组
             * 
             */
            targetsArray: []

        };
    }

    inited() {
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.transitionEnd = throttle(
            this.transitionEnd.bind(this),
            1000,
            {trailing: false}
        );
    }

    attached() {
        super.attached();
        this.watch('open', this.updateStatus);
        let getTargets = this.data.get('getTargets');
        let getAnchor = this.data.get('getAnchor');
        let mode = this.data.get('mode');
        san.nextTick(() => {
            register(mode, {
                el: this.el.firstElementChild,
                handler: this.hide.bind(this),
                trigger: mode,
                targetsFunction: getTargets || getAnchor,
                targetsArray: this.data.get('targetsArray'),
                delay: this.data.get('delay') || 0,
                excludeSelf: this.data.get('excludeSelf') || false
            });
        });
        if (this.data.get('open')) {
            this.show();
        }
        this.watch('targetsArray', val => {
            upgrade(this.el.firstElementChild, mode, {targetsArray: val});
        });
    }

    updateStatus(open) {
        if (open) {
            this.show();
            return;
        }
        this.hide();
    }

    getContent() {
        return this.el.firstElementChild;
    }

    show() {
        let {
            getAnchor,
            targetOrigin,
            anchorOrigin,
            matchAnchorWidth,
            maxHeight,
            maxWidth,
            isScroll
        } = this.data.get();

        let anchor = typeof getAnchor === 'function' && getAnchor();

        if (!anchor) {
            return;
        }

        let content = this.getContent();

        if (matchAnchorWidth) {
            content.style.width = `${anchor.offsetWidth}px`;
        }

        // 这里要把 closing 清理掉，要不然在快速点击时有残留；
        if (this.data.get('closing')) {
            this.data.set('closing', false);
        }

        if (isScroll) {
            content.style.maxHeight = maxHeight == null ? 'auto' : `${maxHeight}px`;
            content.style.overflowY = maxHeight == null ? 'visible' : 'auto';
            content.style.maxWidth = maxWidth == null ? 'auto' : `${maxWidth}px`;
            // https://stackoverflow.com/questions/6421966/css-overflow-x-visible-and-overflow-y-hidden-causing-scrollbar-issue
            // 当overflow-x和overflow-y两者取值不一样，比如一个是visible另一个是auto时，visile就会被set to auto。即overflow的值是根据-x,-y是否相同计算的
            content.style.overflowX = maxWidth == null ? 'visible' : `${maxWidth}px`;
        }
        else {
            content.style.overflow = 'visible';
        }

        let options = {
            element: this.el.firstElementChild,
            target: anchor,
            attachment: targetOrigin.split('').map(item => shortForPosition[item]).join(' '),
            targetAttachment: anchorOrigin.split('').map(item => shortForPosition[item]).join(' '),
            constraints: this.data.get('constraints') || defaultConstraints
        };

        if (this.tether) {
            this.tether.setOptions(options);
        }
        else {
            this.tether = new Tether(options);
        }
        this.dispatch('popover-show');
        this.data.set('realOpen', true);
        this.data.set('opening', true);
        san.nextTick(() => {
            this.tether.position();
            this.data.set('opening', false);
        });

        // 滚出视野关闭处理
        // @TODO

    }

    hide(e) {
        if (!this.data.get('isClickAway') && this.data.get('mode') === 'click') {
            return;
        }
        this.dispatch('popover-hide');
        this.fire('popover-hide');
        this.data.set('open', false);
        this.data.set('realOpen', false);
        this.data.set('closing', false);
        this.fire('close-complete');
    }

    detached() {
        clear(this.el.firstElementChild);
        this.tether && this.tether.destroy();
        this.tether = null;
        super.detached();
    }

    handleClick(e) {
        e.stopPropagation();
    }

    handleMouseout(e) {
        e.stopPropagation();
    }

    transitionEnd() {
        if (this.data.get('open')) {
            this.fire('open-complete');
            return;
        }
        this.data.set('closing', false);
        this.data.set('open', false);
        let content = this.getContent();
        content.style.top = '-9999px';
        content.style.left = '-9999px';
        this.fire('close-complete');
    }
}
