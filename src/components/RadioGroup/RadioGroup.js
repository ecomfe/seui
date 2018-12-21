/**
 * @file RadioGroup
 * @author wangbing11
 */

import {Component, DataTypes} from 'san';
import Radio from '../Radio';

export default class RadioGroup extends Component {
    static template = `
    <div class="dux-radio-group">
        <ui-radio
            san-for="item, index in items"
            prop-ui="{{ui}}"
            name="{{name}}"
            key="{{index}}"
            disabled="{{item.disabled}}"
            checked="{{item.value === value)}}"
            on-change="handleChange($event, item.value)">
                <slot var-item="item">{{item.label}}</slot>
        </ui-radio>
    </div>
    `;

    static dataTypes = {
        name: DataTypes.string,
        items: DataTypes.array,
        ui: DataTypes.oneOf(['small', 'large', 'default'])
    };

    static components = {
        'ui-radio': Radio
    };

    // 阻止Radio dispatch的event到formItem
    static messages = {
        'UI:form-item-interact'(arg) {}
    };

    attached() {
        this.dispatch('UI:form-item-added');
    }

    handleChange(e, itemValue) {
        let checked = e.target.checked;
        this.updateValue(itemValue, checked);
        this.dispatch('UI:form-item-interact', {fieldValue: checked, type: 'change'});
    }

    updateValue(itemValue, checked) {
        if (checked) {
            this.data.set('value', itemValue);
            this.fire('change', itemValue);
        }
    }
}
