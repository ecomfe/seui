/**
 * @file Option-Group
 * @author liuchaofan
 */

import {Component, DataTypes} from 'san';
import Option from './Option';
import Icon from '../Icon';
import Popover from '../Popover';
import classnames from 'classnames';
import {create} from '../../util/cx';
import {pull, extend} from 'lodash';

const cx = create('option-group');

const groupContent = `
    <template s-if="options">
        <template s-for="option, index in options">
            <ui-option s-if="!option.options"
                option="{{option}}"
                prop-ui="{{ui}}"
                namedSlots="{{namedSlots}}"
                selected="{{option.value !== undefined ? option.value === value : false}}"
                value="{{value}}">
                <slot slot="option" name="option" var-option="option"></slot>
                <template slot="label">
                    <slot name="option-label" var-option="option" var-value="value"></slot>
                </template>
            </ui-option>
            <ui-option-group
                s-else
                prop-ui="{{ui}}"
                namedSlots="{{namedSlots}}"
                label="{{option.label}}"
                options="{{option.options}}"
                position="{{position || option.position}}"
                value="{{value}}">
                <template slot="option-label">
                    <slot name="option-label" var-option="option">{{option.label}}</slot>
                </template>
                <template slot="option">
                    <slot name="option" var-option="option"></slot>
                </template>
            </ui-option-group>
        </template>
    </template>
    <template s-else>
        <slot></slot>
    </template>
`;

export default class OptionGroup extends Component {
    static template = `
        <div class="{{computedClass}}">
            <template s-if="label">
                <div s-ref="button" s-if="!canPopOut" class="${cx.getPartClassName('label')}">
                    <span class="dux-option-label"><slot name="group-label" var-label="label">{{label}}</slot></span>
                </div>
                <button s-ref="button"
                    s-else
                    class="${cx.getPartClassName('label')} ${cx.getPartClassName('button')}"
                    on-click="openCascade"
                    on-keydown="openCascadeByKey">
                    <span class="dux-option-label"><slot name="group-label" var-label="label">{{label}}</slot></span>
                    <ui-icon class="${cx.getPartClassName('expandable')}" name="{{icons.expandable}}"/>
                </button>
            </template>
            <template s-if="!canPopOut">
                ${groupContent}
            </template>
            <template s-else>
                <ui-popover
                    overlayClass="{{overlayClass}}"
                    s-ref="popover"
                    open="{=cascade=}"
                    anchorOrigin="tr"
                    targetOrigin="tl"
                    targetsArray="{{targetsArray}}"
                    class="${cx.getPartClassName('box')}"
                    excludeSelf="{{false}}"
                    constraints="{{constraints}}"
                    getAnchor="{{getAnchor}}">
                    <div s-ref="box" class="${cx.getPartClassName('options')}"
                        tabindex="-1"
                        prop-ui="{{ui}}">
                        ${groupContent}
                    </div>
                </ui-popover>
            </template>
        </div>
    `
    static components = {
        'ui-option': Option,
        'ui-option-group': 'self',
        'ui-icon': Icon,
        'ui-popover': Popover
    };

    static trimWhitespace = 'all';

    static computed = {
        computedClass() {
            let label = this.data.get('label');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('unlabelled')]: !label}
            );
        },
        canPopOut() {
            let position = this.data.get('position');
            return position === 'popup';
        }
    }

    static messages = {
        'UI:children-option-group'(arg) {
            let {value, box} = arg.value;

            if (value) {
                this.data.push('targetsArray', box);
            }
            else {
                this.data.remove('targetsArray', box);
            }
            this.dispatch('UI:children-option-group', arg.value);
        },
        'UI:select-option-click'(arg) {
            if (this.data.get('cascade')) {
                this.data.set('cascade', false);
            }
            this.dispatch('UI:select-option-click');
        }
    }

    initData() {
        return {
            slotType: 'option',
            getAnchor: this.getAnchor.bind(this),
            constraints: [
                {
                    to: 'window',
                    attachment: 'together'
                }
            ],
            icons: {
                expandable: 'angle-right-small'
            },
            targetsArray: []
        };
    }

    inited() {
        this.name = 'option-group';
    }

    attached() {
        this.watch('cascade', value => {
            let box = this.ref('box');
            if (box && !this.cascadeBox) {
                this.cascadeBox = box;
            }
            box = this.cascadeBox;
            if (!box) {
                return;
            }
            this.dispatch('UI:children-option-group', {value, box});
        });
        this.getOptionData();
    }

    openCascade(e) {
        this.data.set('cascade', true);
    }

    // 获取option上的value值与label值
    getOptionData(parent = '') {
        let slotNodeArray = this.slot();
        let label = this.data.get('label');
        let slotNode;
        if (slotNodeArray && slotNodeArray.length) {
            let map = {};
            slotNode = slotNodeArray[0];
            parent = parent ? parent + '-' + label : label;
            slotNode.children && slotNode.children.map(item => {
                this.processSlotNode(item, map, parent);
                return item;
            });
            return map;
        }
        return {};
    }

    // 处理slot中的node
    processSlotNode(node, map, parent = '') {
        // 如果是option节点，直接获取信息
        if (node instanceof Option) {
            let {label, value} = node.data.get();
            map[value] = {label, parent};
        }
        // 如果是optionGrouop节点，递归调用
        else if (node instanceof this.constructor) {
            extend(map, node.getOptionData(parent));
        }
        // 如果是for, if, template这样的没有实际意义的节点，获取children递归调用
        else if (node.children && node.children.length) {
            this.getSlotOptionData(node.children, map, parent);
        }
    }

    // 针对slot()返回的节点是for, if, template或者其他有children属性的节点做一个兼容
    getSlotOptionData(children, map, parent = '') {
        if (!children || !children.length) {
            return;
        }
        children.map(item => {
            this.processSlotNode(item, map, parent);
            return item;
        });
    }

    openCascadeByKey(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.data.set('cascade', true);
            e.stopPropagation();
            e.preventDefault();
        }
    }
    getAnchor() {
        return this.ref('button');
    }
}
