/**
 * @file Checkbox
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/index';
import Icon from '../Icon';
import classNames from 'classnames';
const cx = create('checkbox');
const icons = {
    indeterminate: 'minus-small',
    checked: 'check-small'
};

export default class Checkbox extends Component {
    static template = `
    <label class="{{computedClass}}" prop-ui="{{ui}}">
        <input
            type="checkbox"
            value="1"
            checked="{{localChecked}}"
            disabled="{{disabled || readonly}}"
            readonly="{{readonly}}"
            on-change="handleChange($event)"
        />
        <span class="${cx.getPartClassName('box')}">
            <ui-icon
                san-if="isShowIcon"
                class="${cx.getPartClassName('icon')}"
                name="{{iconName}}"></ui-icon>
        </span>
        <span class="${cx.getPartClassName('label')}">
            <slot></slot>
        </span>
    </label>
    `;

    static trimWhitespace = 'all';

    static dataTypes = {
        name: DataTypes.string,
        readonly: DataTypes.bool,
        disabled: DataTypes.bool,
        ui: DataTypes.string,
        falseValue: DataTypes.string,
        trueValue: DataTypes.string
    };

    static components = {
        'ui-icon': Icon
    };

    static computed = {

        /**
         * 是否展示"勾选" "不确定"效果图标
         *
         * @return {boolean} 是否展示
         */
        isShowIcon() {
            let indeterminate = this.data.get('indeterminate');
            let isChecked = this.data.get('isChecked');
            return indeterminate || isChecked;
        },

        /**
         * 展示"勾选" "不确定"效果图标的名称
         *
         * @return {string} 图标的名称
         */
        iconName() {
            let indeterminate = this.data.get('indeterminate');
            return icons[indeterminate ? 'indeterminate' : 'checked'];
        },

        /**
         * label 元素的 class
         *
         * @return {string} class
         */
        computedClass() {
            let readonly = this.data.get('readonly');
            let disabled = this.data.get('disabled') || readonly;
            let size = this.data.get('ui');
            return classNames(
                cx(this).addStates({disabled}).build()
            );
        },

        /**
         * 是否设置了 trueValue 或者 falseValue
         *
         * @return {boolean} 是否
         */
        isCustomValue() {
            let falseValue = this.data.get('falseValue');
            let trueValue = this.data.get('trueValue');
            return !!falseValue || !!trueValue;
        },

        /**
         * 是否选中状态
         *
         * @return {boolean} 是否选中
         */
        isChecked() {
            let checked = this.data.get('checked');
            let isCustomValue = this.data.get('isCustomValue');
            if (!isCustomValue) {
                return checked;
            }
            let trueValue = this.data.get('trueValue');
            return checked === trueValue;
        },

        /**
         * input 元素对应的 checked 值（此处根据 san 文档中 表单部分进行更改）
         *
         * @return {boolean} 是否选中
         */
        localChecked() {
            let isChecked = this.data.get('isChecked');
            return isChecked ? ['1'] : [];
        }
    };

    initData() {
        return {
            indeterminate: false,
            checked: false,
            disabled: false
        };
    }

    attached() {
        this.dispatch('UI:form-item-added');
    }

    /**
     * 类型为 checkbox input 的元素的原生 change 事件
     *
     * @param {Object} e 原生 change 事件对象
     */
    handleChange(e) {
        let checked = e.target.checked;
        let isCustomValue = this.data.get('isCustomValue');
        if (isCustomValue) {
            checked = this.booleanToCustomValue(checked);
        }

        // 如果父元素是 checkboxGroup，indeterminate 值由父元素决定
        if (!(this.data.get('checkboxType') === 'all')) {
            this.data.set('indeterminate', false);
            this.data.set('checked', checked);
        }
        this.fire('change', e);
        this.dispatch('UI:form-item-interact', {fieldValue: checked, type: 'change'});
    }

    /**
     * 将自定义的 trueValue 或者 falseValue 转为 boolean 类型
     *
     * @param {string} checked 需要转换的值
     * @return {boolean} 是否选中
     */
    customValueToBoolean(checked) {
        let trueValue = this.data.get('trueValue');
        return checked === trueValue;
    }

    /**
     * 将boolean 类型的值转为自定义的 trueValue 或者 falseValue 值
     *
     * @param {boolean} checked 需要转换的值
     * @return {string} 转换后的 trueValue 或者 falseValue 值
     */
    booleanToCustomValue(checked) {
        let falseValue = this.data.get('falseValue');
        let trueValue = this.data.get('trueValue');
        return checked ? trueValue : falseValue;
    }
}
