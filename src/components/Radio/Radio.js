/**
 * @file Radio
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
const COMPONENT_CLASSNAME = 'radio';
const cx = create(COMPONENT_CLASSNAME);

export default class Checkbox extends Component {
    static template = `
        <label class="{{computedClass}}" prop-ui="{{ui}}">
            <input
                s-ref="box"
                name="{{name}}"
                checked="{{localChecked}}"
                disabled="{{disabled}}"
                readonly="{{readonly}}"
                type="radio"
                on-change="handleChange($event)">
            <span class="dux-radio-box"></span>
            <span class="dux-radio-label"><slot></slot></span>
        </label>
    `;

    static dataTypes = {
        name: DataTypes.string,
        value: DataTypes.string,
        readonly: DataTypes.bool,
        disabled: DataTypes.bool,
        falseValue: DataTypes.string,
        trueValue: DataTypes.string
    };

    static computed = {
        computedClass() {
            let readonly = this.data.get('readonly');
            let disabled = this.data.get('disabled');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('disabled')]: readonly || disabled}
            );
        },
        isCustomValue() {
            let falseValue = this.data.get('falseValue');
            let trueValue = this.data.get('trueValue');
            return !!falseValue || !!trueValue;
        },
        localChecked() {
            let checked = this.data.get('checked');
            let isCustomValue = this.data.get('isCustomValue');
            if (!isCustomValue) {
                return checked;
            }
            let trueValue = this.data.get('trueValue') || true;
            return checked === trueValue;
        }
    };

    initData() {
        return {
            disabled: false,
            readonly: false
        };
    }

    attached() {
        this.dispatch('UI:form-item-added');
        let checked = this.data.get('checked');
        this.setInputValue(checked);
        this.watch('checked', val => {
            this.setInputValue(val);
        });
    }

    handleChange(e) {
        let readonly = this.data.get('readonly');
        let disabled = this.data.get('disabled');
        if (readonly || disabled) {
            this.setInputValue(false);
            return;
        }
        let checked = e.target.checked;
        let isCustomValue = this.data.get('isCustomValue');
        if (isCustomValue) {
            checked = this.booleanToCustomValue(checked);
        }
        this.data.set('checked', checked);
        this.fire('change', e);
        this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'change'});
    }

    /**
     * 将 value 值同步给 input 元素
     *
     * @param {boolean} checked 是否选中
     */
    setInputValue(checked) {
        let isCustomValue = this.data.get('isCustomValue');
        if (isCustomValue) {
            checked = this.customValueToBoolean(checked);
        }
        let elInput = this.el.getElementsByTagName('input')[0];
        elInput.checked = checked;
    }

    customValueToBoolean(checked) {
        let trueValue = this.data.get('trueValue') || true;
        return checked === trueValue;
    }

    booleanToCustomValue(checked) {
        let falseValue = this.data.get('falseValue') || false;
        let trueValue = this.data.get('trueValue') || true;
        return checked ? trueValue : falseValue;
    }
}
