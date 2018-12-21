/**
 * @file Option
 * @author liuchaofan
 */

import {Component, DataTypes} from 'san';
import Icon from '../Icon';
import classnames from 'classnames';
import {create} from '../../util/cx';

const cx = create('option');

export default class Option extends Component {

    static template = `
        <button type="button" class="{{computedClass}}" prop-ui="{{ui}}" on-click="select($event)">
            <template s-if="namedSlots['option-label'] || namedSlots['label']">
                <span class="${cx.getPartClassName('label')}">
                    <slot name="label" var-option="option">{{option.label}}</slot>
                </span>
                <ui-icon s-if="selected" class="{{iconClass}}" name="check"></ui-icon>
            </template>
            <template s-elif="namedSlots['option']">
                <slot name="option" var-option="option"></slot>
            </template>
            <template s-else>
                <span class="${cx.getPartClassName('label')}">
                    {{option.label}}
                </span>
                <ui-icon s-if="selected" class="{{iconClass}}" name="check"></ui-icon>
            </template>
        </button>
    `;

    static components = {
        'ui-icon': Icon
    };

    static trimWhitespace = 'all';

    static dataTypes = {
        disabled: DataTypes.bool,
        selected: DataTypes.bool,
        inputlabel: DataTypes.oneOfType([DataTypes.number, DataTypes.string])
    };

    initData() {
        return {
            hasLabelSlot: false,
            hasOptionSlot: false
        };
    }

    static computed = {
        computedClass() {
            let disabled = this.data.get('disabled');
            let selected = this.data.get('selected');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('disabled')]: disabled},
                {[cx.getPartClassName('selected')]: selected}
            );
        },

        iconClass() {
            let selected = this.data.get('selected');
            return classnames(
                {'state-show': selected},
                cx.getPartClassName('checkmark')
            );
        }
    };

    inited() {
        const givenSlots = this.givenSlots || this.sourceSlots;
        let namedSlots = givenSlots && givenSlots.named;
        let option = this.data.get('option');
        if (option) {
            this.data.set('value', option.value);
            this.data.set('label', option.label);
        }

        if (namedSlots && Object.keys(namedSlots).length) {
            // this.data.set('namedSlots', namedSlots);
        }
        this.dispatch('UI:select-option-inited');
    }

    attached() {
        this.watch('selected', val => this.data.set('option.selected', !!val));
        let option = this.data.get('option');
        if (!option) {
            let {value, label} = this.data.get();
            this.data.set('option', {value, label});
        }
        this.data.set('hasOptionSlot', !!this.slot('option').filter(item => item.el && item.el.nodeType !== 8).length);
        this.data.set('hasLabelSlot', !!this.slot('label').filter(item => item.el && item.el.nodeType !== 8).length);
    }

    select(event) {
        event.stopPropagation();
        let {disabled, option} = this.data.get();
        if (!disabled) {
            this.selectInstance.handleSelect(option.value);
            this.dispatch('UI:select-option-click');
        }
    }
}
