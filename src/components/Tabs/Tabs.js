/**
 * @file Tabs
 * @author sqliang(hfutsqliang@gmail.com)
 */
import san, {Component, DataTypes} from 'san';
import classnames from 'classnames';
import {create} from '../../util/cx';
import Button from '../Button';
import Icon from '../Icon';
import {findIndex} from 'lodash';
import {
    TABS_ITEM_INITED,
    TABS_ITEM_DETACHED
} from './constant';


const cx = create('tabs');

export default class Tabs extends Component {
    static components = {
        'ui-button': Button,
        'ui-icon': Icon
    };

    static template = `
        <div class="{{wrapClasses}}" ui="{{ui}}">

            <div class="${cx.getPartClassName('bar')}">

                <div class="${cx.getPartClassName('nav-scroll')}" s-ref="nav">
                    <div class="${cx.getPartClassName('nav')}">
                        <!--<div class="{{barClasses}}" style="{{barStyle}}"></div>-->
                        <div
                            s-for="item, index in navList"
                            class="{{index | tabClasses(item, value)}}">
                            <label class="${cx.getPartClassName('tab-label')}"
                                on-click="handleChange(index)">{{item.label}}</label>
                            <button s-if="item.removable"
                                type="button"
                                class="${cx.getPartClassName('tab-remove')}"
                                on-click="removeTabItem(index, item)">
                                <ui-icon name="cross-small"></ui-icon>
                            </button>
                        </div>
                    </div>
                    <div class="${cx.getPartClassName('nav-extra')}" s-if="showSlot">
                        <slot name="extra"></slot>
                    </div>
                </div>

                <div s-if="navOverflow">
                    <div s-ref="scroller" class="${cx.getPartClassName('scroller')}">
                        <ui-button ui="round tiny"
                            class="${cx.getPartClassName('scroller-left')}"
                            on-click="scroll('left')"><ui-icon name="angle-left"></ui-icon></ui-button>
                        <ui-button ui="round tiny"
                            class="${cx.getPartClassName('scroller-right')}"
                            on-click="scroll('right')"><ui-icon name="angle-right"></ui-icon></ui-button>
                    </div>
                </div>

            </div>

            <div class="{{contentClasses}}" style="{{contentStyle}}">
                <slot></slot>
            </div>

        </div>
    `;

    static dataTypes = {
        // 当前值
        value: DataTypes.string.isRequired,
        ui: DataTypes.string,
        // 样式类型
        type: DataTypes.oneOf(['line', 'card']),
        // 是否使用动画
        animated: DataTypes.bool
    };

    initData() {
        return {
            ui: 'default',
            type: 'line',
            animated: true,
            navList: [],
            barWidth: 0,
            barOffset: 0,
            showSlot: true
        };
    }
    static messages = {
        [TABS_ITEM_INITED](e) {
            let item = e.target;
            this.items.push(item);
            const curVal = this.data.get('value');
            const animated = this.data.get('animated');
            const curItemVal = item.data.get('value');
            item.data.set('show', curItemVal === curVal || animated);
            this.data.push('navList', this.getTabProperty(item));
        },
        [TABS_ITEM_DETACHED](e) {
            let tabComponent = e.target;
            this.items = this.items.filter(item => item !== e.target);
            let tabData = this.getTabProperty(tabComponent);
            let index = findIndex(this.data.get('navList'),
                ({label, value}) => label === tabData.label && value === tabData.value);
            this.data.removeAt('navList', index);
        }
    };
    static filters = {
        tabClasses(index, item, tabsValue) {
            return cx(this)
                .setPart('tab')
                .addStates({
                    disabled: item.disabled,
                    active: item.value === tabsValue && !item.disabled
                })
                .build();
        }
    };

    static computed = {
        contentClasses() {
            let animated = this.data.get('animated');
            return classnames(
                cx.getPartClassName('content'),
                {
                    [cx.getPartClassName('content-animated')]: animated
                }
            );
        },
        contentStyle() {
            let navList = this.data.get('navList');
            let index = navList.findIndex(nav => nav.value === this.data.get('value'));
            let trsX = index === 0 ? '0%' : `-${index}00%`;
            let style = {};
            if (index > -1) {
                style.transform = `translateX(${trsX}) translateZ(0px)`;
            }
            return style;
        },
        // 暂时没有用到
        barStyle() {
            let barWidth = this.data.get('barWidth');
            let type = this.data.get('type');
            let animated = this.data.get('animated');
            let barOffset = this.data.get('barOffset');
            let style = {
                display: 'none',
                width: `${barWidth}px`
            };
            if (type === 'line') {
                style.display = 'block';
            }
            if (animated) {
                style.transform = `translate3d(${barOffset}px, 0px, 0px)`;
            }
            else {
                style.left = `${barOffset}px`;
            }
            return style;
        },
        // 暂时没有用到
        barClasses() {
            let animated = this.data.get('animated');
            return classnames(
                cx.getPartClassName('ink-bar'),
                {
                    [cx.getPartClassName('ink-bar-animated')]: animated
                }
            );
        },
        wrapClasses() {
            let type = this.data.get('type');
            let animated = this.data.get('animated');
            return classnames(
                cx(this).build(),
                {
                    [cx.getPartClassName('card')]: type === 'card',
                    [cx.getPartClassName('no-animation')]: !animated
                }
            );
        }
    };
    inited() {
        this.items = [];
    }
    attached() {
        let extraNum = 0;
        // =========trick san 3.3.0====
        const slotChildren = this.slotChildren || this.slotChilds || [];
        slotChildren.forEach(child => {
            if (child.name === 'extra') {
                extraNum++;
            }
        });
        if (extraNum === 0) {
            this.data.set('showSlot', false);
        }
        // 监听 Tabs value值 更新Tab项内容
        this.watch('value', val => {
            this.items.forEach(item => {
                let disabled = item.data.get('disabled');
                if (!disabled) {
                    const curItemVal = item.data.get('value');
                    const animated = this.data.get('animated');
                    item.data.set('show', curItemVal === val || animated);
                }
            });
        });
    }
    updated() {
        this.checkNavOverflow();
    }
    getTabProperty(tabComponent) {
        let {
            value,
            label,
            disabled,
            removable
        } = tabComponent.data.get();

        return {value,
            label,
            disabled,
            removable
        };
    }
    checkNavOverflow() {
        if (this.data.get('type') === 'line') {
            let navElement = this.ref('nav');
            if (navElement) {
                let navOverflow
                    = navElement.firstElementChild.clientWidth > navElement.clientWidth;
                this.data.set('navOverflow', navOverflow);
                navOverflow && san.nextTick(() => {
                    let scrollerEle = this.ref('scroller');
                    navElement.style.marginRight = `${scrollerEle.clientWidth}px`;
                });
            }
        }
    }
    scroll(direction) {
        this.ref('nav').scrollLeft += direction === 'right' ? 100 : -100;
    }
    handleChange(index) {
        const nav = this.data.get(`navList[${index}]`);
        if (nav.disabled) {
            return;
        }
        this.data.set('value', nav.value);
        this.fire('change', nav);
    }

    removeTabItem(index, item) {
        this.fire('remove', {
            index,
            data: item
        });
    }
    disposed() {
        this.items = null;
    }
}


