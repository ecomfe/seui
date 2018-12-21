/**
 * @file Switch
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
const COMPONENT_CLASSNAME = 'switch';
const cx = create(COMPONENT_CLASSNAME);


// TODO:
// 1. veui的checked是boolean类型，seui没有类型限制类型
// 2. veui暴露了 update:checked 和 input 事件， seui没有这两个事件
// 3. seui change事件暴露的参数跟veui没有对齐

export default class extends Component {
    static template = `
        <label class="{{computedClass}}" prop-ui="{{ui}}">
            <input
                type="checkbox"
                disabled="{{disabled || readonly}}"
                readonly="{{readonly}}"
                on-change="handleChange($event)"/>
            <div class="dux-switch-switcher">
                <div class="dux-switch-button"></div>
                </div>
            <template>
                <div class="dux-switch-label"><slot/></div>
            </template>
        </label>
    `;

    static dataTypes = {
        name: DataTypes.string,
        value: DataTypes.array,
        readonly: DataTypes.bool,
        disabled: DataTypes.bool,
        ui: DataTypes.string,
        falseValue: DataTypes.string,
        trueValue: DataTypes.string
    };

    static computed = {
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
        },
        computedClass() {
            let localChecked = this.data.get('localChecked');
            let readonly = this.data.get('readonly');
            let disabled = this.data.get('disabled');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('on')]: !!localChecked},
                {[cx.getPartClassName('disabled')]: disabled},
                {[cx.getPartClassName('readonly')]: readonly}
            );
        }
    };

    initData() {
        return {
            checked: false
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
