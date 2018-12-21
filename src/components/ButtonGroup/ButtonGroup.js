/**
 * @file ButtonGroup
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {create} from '../../util/cx';
import {Component, DataTypes} from 'san';
import classnames from 'classnames';
import Button from '../Button/Button';

const cx = create('button-group');

export default class ButtonGroup extends Component {
    static template = `
        <div class="{{computedClass}}" prop-ui="{{ui}}">
            <ui-button
                prop-ui="{{ui}}"
                s-for="item, index in items"
                disabled="{{disabled || item.disabled}}"
                on-click="handleClick(item, index)">
                <slot var-item="item" var-index="index">{{item.label}}</slot>
            </ui-button>
        </div>
    `;

    static components = {
        'ui-button': Button
    };

    static dataTypes = {
        items: DataTypes.array,
        disabled: DataTypes.bool
    };

    static computed = {
        computedClass() {
            let disabled = this.data.get('disabled');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('disabled')]: disabled}
            );
        }
    };

    attached() {}

    handleClick(item, index) {
        if (item.value) {
            this.fire(item.value, item, index);
        }
        this.fire('click', {item, index});
    }
}