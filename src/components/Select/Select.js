/**
 * @file Select
 * @author liuchaofan
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import Button from '../Button';
import Icon from '../Icon';
import Popover from '../Popover';
import Option from './Option';
import OptionGroup from './OptionGroup';
import classnames from 'classnames';
import {cloneDeep, extend} from 'lodash';
const cx = create('select');

export default class Select extends Component {
    static template = `
    <div class="{{computedClass}}">
        <ui-button
            class="${cx.getPartClassName('button')}"
            prop-ui="{{ui}}"
            disabled="{{disabled}}"
            on-click="handleClick($event)">
            <span class="${cx.getPartClassName('label')}">
                <slot name="label" var-label="label">{{label}}</slot>
            </span>
            <ui-icon class="${cx.getPartClassName('icon')}" name="{{iconName}}"></ui-icon>
        </ui-button>
        <ui-popover
            overlayClass="{{overlayClass}}"
            s-ref="popover"
            open="{=expanded=}"
            anchorOrigin="bl"
            targetOrigin="tl"
            targetsArray="{{targetsArray}}"
            excludeSelf="{{!interactive}}"
            constraints="{{constraints}}"
            getAnchor="{{getAnchor}}">
            <div prop-ui="{{ui}}" s-ref="box" class="${cx.getPartClassName('options')}"
                san-if="hasNoNamedSlots || options && options.length">
                <slot name="before"></slot>
                <ui-option namedSlots="{{{option: true}}}" s-if="clearable">
                    <template slot="option">{{placeholder}}</template>
                </ui-option>
                <ui-option-group options="{{realOptions}}"
                    prop-ui="{{ui}}"
                    namedSlots="{{namedSlots}}"
                    on-select="handleSelect($event)" value="{{value}}">
                    <slot></slot>
                    <template slot="option-label">
                        <slot name="option-label" var-option="option">{{option.label}}</slot>
                    </template>
                    <template slot="option">
                        <slot name="option" var-option="option"></slot>
                    </template>
                    <template slot="group-label">
                        <slot name="group-label" var-label="label"></slot>
                    </template>
                </ui-option-group>
            </div>
        </ui-popover>
    </div>
    `;

    static trimWhitespace = 'all';

    static dataTypes = {
        ui: DataTypes.string,
        expanded: DataTypes.bool,
        clearable: DataTypes.bool,
        disabled: DataTypes.bool,
        options: DataTypes.array
    };

    static components = {
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-popover': Popover,
        'ui-option': Option,
        'ui-option-group': OptionGroup
    };

    static messages = {
        'UI:select-option-inited'(arg) {
            let target = arg.target;
            target.selectInstance = this;
        },
        'UI:children-option-group'(arg) {
            let {value, box} = arg.value;

            if (value) {
                this.data.push('targetsArray', box);
                return;
            }
            this.data.remove('targetsArray', box);
        }
    };

    static computed = {
        computedClass() {
            let value = this.data.get('value');
            let expanded = this.data.get('expanded');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('empty')]: value === null},
                {[cx.getPartClassName('expanded')]: expanded}
            );
        },

        iconName() {
            let expanded = this.data.get('expanded');
            return `angle-${expanded ? 'up' : 'down'}-small`;
        },

        realOptions() {
            let options = this.data.get('options');
            let filter = this.data.get('filter');
            if (typeof filter !== 'function') {
                return options;
            }
            let filtered = cloneDeep(options);
            return filtered.filter(item => filter(item));
        },

        label() {
            let value = this.data.get('value');
            let placeholder = this.data.get('placeholder');
            let labelMap = this.data.get('labelMap');
            if (!labelMap) {
                return placeholder;
            }
            if (value === null || value === undefined) {
                return placeholder;
            }
            if (!labelMap[value]) {
                return placeholder;
            }

            return labelMap[value].label;
        },

        changePath() {
            let value = this.data.get('value');
            let labelMap = this.data.get('labelMap');
            if (!value || !labelMap) {
                return '';
            }
            if (labelMap[value]) {
                return labelMap[value].parent + '-' + labelMap[value].label;
            }
            return '';
        }
    };

    initData() {
        return {
            expanded: false,
            getAnchor: this.getAnchor.bind(this),
            placeholder: '请选择',
            constraints: [
                {
                    to: 'window',
                    attachment: 'together'
                }
            ],
            targetsArray: [],
            interactive: true
        };
    }

    inited() {
        const givenSlots = this.givenSlots || this.sourceSlots;
        let namedSlots = givenSlots && givenSlots.named;
        let noNamedSlots = givenSlots && givenSlots.noname;
        if (namedSlots && Object.keys(namedSlots).length) {
            let map = {};
            Object.keys(namedSlots).map(item => {
                map[item] = true;
                return item;
            });
            this.data.set('namedSlots', map);
        }
        if (noNamedSlots && noNamedSlots.length) {
            this.data.set('hasNoNamedSlots', true);
        }
        this.name = 'select';
        function generateLabelMap(options, map, parent = '') {
            options.map(item => {
                if (!item.options) {
                    map[item.value] = {label: item.label, parent};
                    return item;
                }
                generateLabelMap(item.options, map, parent ? parent + '-' + item.label : item.label);
                return item;
            });
        }
        let map = {};
        // 初始化一个label与value对应的map，方便之后选择的value可以找到label
        let options = this.data.get('options') || [];
        generateLabelMap(options, map);
        this.data.set('labelMap', map);
        // 如果options变化的话，重新生成这个map
        this.watch('options', val => {
            let map = {};
            generateLabelMap(val, map);
            this.data.set('labelMap', map);
        });
    }

    attached() {
        this.generateLabelMapFromSlot();
        this.dispatch('UI:form-item-added');
    }
    // 没有options属性的时候，需要从slot中获取labelMap值
    // 对于select组件，只要找到所有所属的第一层的optionGroup组件即可，然后调用optioGtoup上的方法
    generateLabelMapFromSlot() {
        let slotNodeArray = this.slot();
        let slotNode;
        if (slotNodeArray && slotNodeArray.length) {
            let map = {};
            slotNode = slotNodeArray[0];
            slotNode.children && slotNode.children.map(item => {
                if (item instanceof OptionGroup) {
                    extend(map, item.getOptionData());
                }
                else if (item.children && item.children.length) {
                    map = this.getSlotOptionData(item.children, map);
                }
                return item;
            });
            this.data.set('labelMap', map);
        }
    }
    // 针对slot()返回的节点是for, if, template或者其他有children属性的节点做一个兼容
    getSlotOptionData(children, map) {
        if (!children || !children.length) {
            return {};
        }
        children.map(item => {
            if (item instanceof OptionGroup) {
                extend(map, item.getOptionData());
            }
            else if (item.children && item.children) {
                map = this.getSlotOptionData(item.children, map);
            }
            return item;
        });
        return map;
    }

    handleClick() {
        let expanded = this.data.get('expanded');
        this.data.set('expanded', !expanded);
    }

    handleSelect($event) {
        this.data.set('expanded', false);
        this.data.set('value', $event);
        let labelMap = this.data.get('labelMap') || {};
        if (!labelMap[$event]) {
            this.generateLabelMapFromSlot();
        }
        this.fire('change', $event);
        this.dispatch('UI:form-item-interact', {fieldValue: $event, type: 'change'});
    }

    getAnchor() {
        return this.el;
    }
}
