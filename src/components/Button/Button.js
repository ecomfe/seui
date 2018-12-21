/**
 * @file Button
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {create} from '../../util/cx';
import {Component, DataTypes} from 'san';
import Icon from '../Icon/Base';

const cx = create('button');

export default class Button extends Component {

    static components = {
        'ui-icon': Icon
    };

    static template = `
        <button
            prop-ui="{{ui}}"
            on-click="click($event)"
            prop-type="{{type}}"
            class="{{computedClassName}}"
            disabled="{{disabled}}">
            <slot s-if="!loading"/>
            <template s-else>
                <slot name="loading">
                    <ui-icon fill-rule="evenodd" name="loading" spin></ui-icon>
                    <span class="${cx.getPartClassName('loading-text')}"><slot/></span>
                </slot>
            </template>
        </button>
    `;

    static computed = {
        computedClassName() {
            let disabled = this.data.get('disabled');
            let loading = this.data.get('loading');
            return cx(this).addStates({disabled, loading}).build();
        }
    };

    static dataTypes = {
        ui: DataTypes.string,
        disabled: DataTypes.bool,
        loading: DataTypes.bool
    };

    initData() {
        return {
            type: 'button',
            disabled: false,
            ui: ''
        };
    }

    attached() {}

    click(e) {
        if (!this.data.get('disabled')) {
            this.fire('click', e);
        }
    }
}
