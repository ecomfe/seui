/**
 * @file Dropdown
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import Popover from '../Popover';
import Option from '../Select/Option';
import OptionGroup from '../Select/OptionGroup';
import {cloneDeep} from 'lodash';
const cx = create('dropdown');

export default class Dropdown extends Component {
    static template = `
        <div s-ref="main" class="{{computedClass}}" prop-ui="{{ui}}">
            <ui-button class="${cx.getPartClassName('button')}"
                disabled="{{disabled}}"
                prop-ui="{{ui}}"
                on-click="handleClick"
                s-ref="button"
                on-mouseenter="handleMouseEnter"
                >
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
                        namedSlots="{{namedSlots}}">
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
    `

    static components = {
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-popover': Popover,
        'ui-option': Option,
        'ui-option-group': OptionGroup
    }

    static dataTypes = {
        ui: DataTypes.string,
        expanded: DataTypes.bool
    };

    static computed = {
        computedClass() {
            let expanded = this.data.get('expaned');
            return classnames(
                cx(this).build(),
                {
                    [cx.getPartClassName('expaned')]: expanded
                }
            );
        },

        iconName() {
            let expanded = this.data.get('expanded');
            return expanded ? 'angle-up-small' : 'angle-down-small';
        },

        realOptions() {
            let options = this.data.get('options');
            let filter = this.data.get('filter');
            if (typeof filter !== 'function') {
                return options;
            }
            let filtered = cloneDeep(options);
            return filtered.filter(item => filter(item));
        }
    }

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

    static filters = {
        getOptionClass(value) {
            return classnames(
                cx.getPartClassName('option'),
                {
                    [cx.getPartClassName('option-disabled')]: !!value.disabled
                }
            );
        }
    }

    initData() {
        return {
            expanded: false,
            getAnchor: this.getAnchor.bind(this),
            constraints: [
                {
                    to: 'window',
                    attachment: 'together'
                }
            ],
            targetsArray: [],
            interactive: true,
            trigger: 'click'
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
    }

    handleClick() {
        this.toggle('click');
    }

    handleMouseEnter() {
        this.toggle('hover');
    }

    toggle(mode) {
        let trigger = this.data.get('trigger');
        let expanded = this.data.get('expanded');
        if (trigger !== mode) {
            return;
        }
        if (trigger === 'click') {
            this.data.set('expanded', true);
        }
        if (trigger === 'hover') {
            this.data.set('expanded', !expanded);
        }
    }

    handleOptionClick(event, index) {
        event.stopPropagation();
        let value = this.data.get(`options[${index}]`);
        this.fire('click', value);
    }

    getAnchor() {
        return this.el;
    }

    handleSelect($event) {
        this.data.set('expanded', false);
        this.fire('click', $event);
    }
}
