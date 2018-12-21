/**
 * @file InputNumber
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import {debounce as lodashDebounce} from 'lodash';
import Icon from '../Icon';
import Button from '../Button';
const cxInputNumber = create('input-number');
const addNum = function (num1, num2) {
    let sq1;
    let sq2;
    let m;
    try {
        sq1 = num1.toString().split('.')[1].length;
    }
    catch (e) {
        sq1 = 0;
    }
    try {
        sq2 = num2.toString().split('.')[1].length;
    }
    catch (e) {
        sq2 = 0;
    }
    m = Math.pow(10, Math.max(sq1, sq2));
    return (Math.round(num1 * m) + Math.round(num2 * m)) / m;
};

const Icons = {
    increase: 'chevron-up',
    decrease: 'chevron-down'
};

export default class extends Component {
    static template = `
        <div class="{{computedClasses}}" prop-ui="{{ui}}">
            <div class="dux-input-number-handle-wrap
                    {{disabled ? 'disabled' : ''}}">
                <ui-button
                    disabled="{{disabled || readonly || upDisabled}}"
                    on-click="handleUpClick"
                    class="${cxInputNumber.getPartClassName('step-up')}">
                    <ui-icon name="angle-up-small"></ui-icon>
                </ui-button>
                <ui-button
                    disabled="{{disabled || readonly || downDisabled}}"
                    on-click="handleDownClick"
                    class="${cxInputNumber.getPartClassName('step-down')}">
                    <ui-icon name="angle-down-small"></ui-icon>
                </ui-button>
            </div>
            <div
                class="dux-input-number-input-wrap" prop-ui="{{ui}}">
                <slot name="before"/>
                <input
                    placeholder="{{placeholder}}"
                    disabled="{{disabled}}"
                    maxlength="{{maxlength}}"
                    readonly="{{readonly}}"
                    name="{{name}}"
                    value="{=localValue=}"
                    number="{{number}}"
                    autofocus="{{autofocus}}"
                    select-on-focus="{{selectOnFocus}}"
                    autocomplete="{{autocomplete}}"
                    on-keyup="handleKeyup($event)"
                    on-keypress="handleKeypress($event)"
                    on-keydown="handleKeydown($event)"
                    on-focus="handleFocus($event)"
                    on-blur="handleBlur($event)"
                    on-input="debounceHandleInput($event)"
                    on-change="handleChange($event)"
                    />
                <slot name="after"/>
            </div>
        </div>
    `;

    static dataTypes = {
        name: DataTypes.string,
        disabled: DataTypes.bool,
        step: DataTypes.number,
        editable: DataTypes.bool,
        decimalPlace: DataTypes.number,
        defaultControls: DataTypes.bool,
        min: DataTypes.number,
        max: DataTypes.number,
        debounce: DataTypes.number
    };

    static components = {
        'ui-icon': Icon,
        'ui-button': Button
    };

    static computed = {
        computedClasses() {
            let disabled = this.data.get('disabled');
            let focused = this.data.get('focused');
            let invalid = this.data.get('invalid');
            let readonly = this.data.get('readonly');
            return classnames(
                cxInputNumber(this).addStates({disabled, readonly}).build(),
                {
                    'dux-input-invalid': invalid,
                    [cxInputNumber.getPartClassName('input-focus')]: focused
                }
            );
        }
    };

    initData() {
        return {
            min: -Infinity,
            max: Infinity,
            step: 1,
            disabled: false,
            defaultControls: true,
            value: 0,
            debounce: 500,
            autocomplete: false
        };
    }

    inited() {
        let value = this.data.get('value');
        this.valueToValide(value);

        this.watch('value', val => {
            this.valueToValide(val);
        });
    }

    handleInput(e) {
        this.valueToValide(e.target.value);
        this.fire('input', e);
        this.dispatch('UI:form-item-interact', {fieldValue: this.data.get('value'), type: 'input'});
    }
    handleChange(e) {
        this.nextTick(() => {
            let value = this.data.get('value');
            this.fire('change', value);
        });
    }

    handleDownClick() {
        let disabled = this.data.get('downDisabled');
        if (disabled) {
            return;
        }
        this.changeStep('decrease');
    }

    handleUpClick() {
        let disabled = this.data.get('upDisabled');
        if (disabled) {
            return;
        }
        this.changeStep('increase');
    }

    changeStep(type) {
        let step = this.data.get('step');
        let value = this.data.get('value');
        if (type === 'increase') {
            value = addNum(value, step);
        }
        else if (type === 'decrease') {
            value = addNum(value, -step);
        }
        this.data.set('value', value);
        this.dispatch('UI:form-item-interact', {fieldValue: value, type: 'change'});
    }
    setLocalValue() {
        let value = this.data.get('value');
        this.data.set('localValue', value + '');
    }

    valueToValide(value) {
        if (value === '') {
            this.data.set('value', '');
            this.setLocalValue();
            return;
        }
        let newVal = Number(value);
        let max = this.data.get('max');
        let min = this.data.get('min');
        let disabled = this.data.get('disabled');
        let decimalPlace = this.data.get('decimalPlace');
        if (isNaN(newVal)) {
            newVal = 0;
        }

        // 上下限控制
        if (newVal <= min) {
            newVal = min;
            this.data.set('downDisabled', true);
        }
        else {
            this.data.set('downDisabled', false);
        }

        if (newVal >= max) {
            newVal = max;
            this.data.set('upDisabled', true);
        }
        else {
            this.data.set('upDisabled', false);
        }

        // disabled控制
        if (disabled) {
            this.data.set('downDisabled', true);
            this.data.set('upDisabled', true);
        }

        // 校正精度
        if (decimalPlace !== undefined) {
            newVal = newVal.toFixed(parseInt(decimalPlace, 10));
        }
        else {
            newVal = newVal.toFixed(0);
        }
        this.data.set('value', +newVal);
        this.setLocalValue();
    }

    debounceHandleInput = lodashDebounce(
        this.handleInput,
        this.data.get('debounce')
    )

    handleKeypress(e) {
        this.fire('keypress', e);
    }
    handleKeydown(e) {
        this.fire('keydown', e);
    }
    handleFocus(e) {
        this.data.set('focused', true);
        this.fire('focus', e);
    }
    handleBlur(e) {
        this.data.set('focused', false);
        this.valueToValide(e.target.value);
        this.fire('blur', e);
        this.dispatch('UI:form-item-interact', {fieldValue: this.data.get('value'), type: 'blur'});
    }
    handleKeyup(e) {
        if (e.code === 'Enter' || e.key === 'Enter' || e.keyCode === 13) {
            this.fire('keyup-enter', e);
        }
        this.fire('keyup', e);
    }
}
