/**
 * @file CheckboxGroup
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import Checkbox from '../Checkbox';
import {create} from '../../util/index';
import {uniq, pull, isEmpty} from 'lodash';
const cx = create('checkbox-group');

export default class CheckboxGroup extends Component {
    static template = `
    <div class="${cx.getPartClassName()}" prop-ui="{{ui}}">
        <div class="${cx.getPartClassName('items')}">
            <ui-checkbox
                san-for="item, index in items"
                ui="{{ui}}"
                name="{{name}}"
                key="{{index}}"
                trueValue="{{item.value}}"
                disabled="{{item.disabled}}"
                checked="{{item.value | indexOf(value)}}"
                on-change="handleChange($event, item.value)"
            >
                <slot var-item="item" var-index="index">{{ item.label }}</slot>
            </ui-checkbox>
        </div>
    </div>
    `;

    static dataTypes = {
        name: DataTypes.string,
        value: DataTypes.array,
        items: DataTypes.array,
        ui: DataTypes.oneOf(['small', 'large', 'default'])
    };

    static components = {
        'ui-checkbox': Checkbox
    };

    static filters = {
        indexOf(itemValue, value) {
            return itemValue && value.indexOf(itemValue) !== -1 ? itemValue : false;
        }
    };

    // 阻止CheckBox dispatch的event到formItem
    static messages = {
        'UI:form-item-interact'(arg) {}
    };

    static computed = {

        /**
         * 包含所有选项 value 的数组，等于全选
         *
         * @return {Array} 包含所有选项 value 的数组
         */
        allValues() {
            let items = this.data.get('items') || [];
            return items.map(item => item.value);
        },

        /**
         * 包含除了禁用项目外的所有其它选项的 value 的数组，等于有禁用项下的全选
         *
         * @return {Array} 包含除了禁用项目外的所有其它选项的 value 的数组
         */
        enableValues() {
            let items = this.data.get('items') || [];
            return items.filter(item => !item.disabled).map(item => item.value);
        },

        /**
         * 全选状态值是否全等于 true, 是否全选
         *
         * @return {string} 全选: all; 部分: part; 空: empty
         */
        allState() {
            let values = this.data.get('value') || [];
            let allValues = this.data.get('allValues');
            if (isEmpty(values)) {
                return 'empty';
            }
            return allValues.every(value => values.includes(value)) ? 'all' : 'part';
        },

        /**
         * 全选状态值是否全等于 true, 是否全选
         *
         * @return {string} 全选: all; 部分: part; 空: empty
         */
        localIsAll() {
            let allState = this.data.get('allState');
            return allState === 'all';
        },

        /**
         * 全选状态值是否全等于 part， 是否为部分选中
         *
         * @return {boolean} 是否为部分选中
         */
        indeterminate() {
            let allState = this.data.get('allState');
            return allState === 'part';
        }
    };

    initData() {
        return {
            showAll: false,
            value: []
        };
    }

    attached() {
        this.dispatch('UI:form-item-added');
    }

    /**
     * 全选状态值是否全等于 true, 是否全选
     *
     * @param {Object}  e 类型为 checkbox input 的元素的原生 change 事件对象
     * @param {string}  itemValue 操作选项对应的选中 value 值
     */
    handleChange(e, itemValue) {
        let checked = e.target.checked;
        this.updateValue(itemValue, checked);
    }

    /**
     * 更新数据 value
     *
     * @param {string} itemValue 操作选项对应的选中 value 值
     * @param {boolean} checked 是否选中
     */
    updateValue(itemValue, checked) {
        let value = this.data.get('value') || [];
        value = value.slice();
        if (checked) {
            value.push(itemValue);
        }
        else {
            value.splice(value.indexOf(itemValue), 1);
        }
        this.data.set('value', value.slice());
        this.fire('change', value);
        this.dispatch('UI:form-item-interact', {fieldValue: value, type: 'change'});
    }

    /**
     * 在全选时，将非禁用的项都添加到 value 中，然后返回
     *
     * @return {Array}  返回的 value 值
     */
    pushEnableValues() {
        let value = this.data.get('value') || [];
        let enableValues = this.data.get('enableValues') || [];
        return uniq(value.concat(enableValues));
    }

    /**
     * 在全选时，将非禁用的项都从value中去除，然后返回
     *
     * @return {Array}  返回的 value 值
     */
    romoveEnableValues() {
        let value = this.data.get('value') || [];
        let enableValues = this.data.get('enableValues') || [];
        return pull(value, ...enableValues).slice();
    }
}
