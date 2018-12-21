/**
 * @file RegionPicker
 * @author zhoumin09
 */
import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Checkbox from '../Checkbox';

const cx = create('region-picker');

export default class RegionUnits extends Component {
    static components = {
        'dux-checkbox': Checkbox
    };

    static template = `
        <div>
            <slot name="options">
                <div san-for="unitRow in formatUnits" class="${cx.getPartClassName('row')}">
                    <div san-for="unit in unitRow" class="${cx.getPartClassName('unit')}">
                        <dux-checkbox
                            readonly="{{readonly}}"
                            disabled="{{disabled || unit.disabled}}"
                            class="${cx.getPartClassName('unit-item')}"
                            checked="{=unit.selected=}"
                            indeterminate="{=unit.indeterminate=}"
                            on-change="toggleParentNode($event, unit, !unit.selected)">
                            <slot name="">{{unit.label}}</slot>
                        </dux-checkbox>
                    </div>
                </div>
            </slot>
        </div>
    `;

    static computed = {
        computedClass() {
            return classnames(
                cx(this).build()
            );
        },
        formatUnits() {
            let currentGroup = this.data.get('currentGroup');
            let units;
            if (!currentGroup) {
                return;
            }
            // 有children，取其children;没有children，取parent的children
            if (currentGroup.children && currentGroup.children.length > 0) {
                units = currentGroup.children;
            }
            else {
                units = currentGroup.parent ? currentGroup.parent.children : [];
            }

            let formatUnits = [];
            for (let i = 0; i < units.length; i = i + 3) {
                let unit = units.slice(i, i + 3);
                formatUnits.push(unit);
            }
            return formatUnits;
        }
    };

    initData() {
        return {
            units: []
        };
    }

    toggleParentNode(e, unit, selected) {
        let params = {
            e, unit, selected
        };
        this.fire('unitChange', params);
    }
}
