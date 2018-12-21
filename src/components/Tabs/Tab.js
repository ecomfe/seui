/**
 * @file component Tab in Tabs
 * @author sqliang(hfutsqliang@gmail.com)
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';

import {
    TABS_ITEM_INITED,
    TABS_ITEM_DETACHED
} from './constant';

const cx = create('tab');

export default class Tab extends Component {
    static template = `
        <div class="{{wrapClass}}">
            <div>
                <slot></slot>
            </div>
        </div>
    `;

    static dataTypes = {
        // 标签项名字
        label: DataTypes.string,
        // 标签项值
        value: DataTypes.string,
        // 标签项不可选
        disabled: DataTypes.bool
    };

    static computed = {
        wrapClass() {
            const show = this.data.get('show');
            return cx(this).addStates({hidden: !show}).build();
        }
    };

    initData() {
        return {
            label: '',
            show: true,
            disabled: false
        };
    }

    inited() {
        this.dispatch(TABS_ITEM_INITED);
    }

    detached() {
        this.dispatch(TABS_ITEM_DETACHED);
    }
}
