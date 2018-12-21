/**
 * @file 表格 - tr
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 */

import san, {DataTypes} from 'san';
import TD from './TD';
import TH from './TH';
import Checkbox from '../Checkbox';
// import Radio from '../Radio';
import {create} from '../../util/cx';

const cx = create('table');

export default class TR extends san.Component {
    static components = {
        'dux-td': TD,
        'dux-th': TH,
        'dux-checkbox': Checkbox
    };

    static trimWhitespace = 'all';

    static template = `
        <tr class="{{selected && pos === 'tbody' ? '${cx.getPartClassName('selected-row')}' : ''}}">
            <dux-td
                san-if="tableSelectable === 'multiple'">
                <div class="${cx.getPartClassName('cell')} {{indeterminate ? 'test': ''}}">
                    <dux-checkbox
                        s-if="disabled"
                        trueValue="ON"
                        falseValue="OFF"
                        checked="{{checked}}"
                        disabled/>
                    <dux-checkbox
                        s-else
                        trueValue="ON"
                        checked="{{checked}}"
                        indeterminate="{{indeterminate}}"
                        on-change="select($event)"/>
                </div>
            </dux-td>
            <!--dux-td
                san-if="tableSelectable === 'single'">
                <div class="${cx.getPartClassName('cell')}">
                    <dux-radio
                        s-if="tableSelectable && pos === 'tbody'"
                        checked="{{checked}}"
                        value="ON"
                        on-change="select($event)" />
                </div>
            </dux-td-->
            <slot></slot>
        </tr>
    `;

    static computed = {
        checked() {
            let selected = this.data.get('selected');
            let tableSelectable = this.data.get('selectMode');
            switch (tableSelectable) {
                case 'single':
                    return selected ? 'ON' : '';
                case 'multiple':
                    return selected ? 'ON' : 'OFF';
            }
        }
    };

    static dataTypes = {
        selected: DataTypes.bool,
        pos: DataTypes.oneOf(['tbody', 'thead', 'tfoot'])
    };

    initData() {
        return {
            pos: 'tbody',
            selected: false,
            indeterminate: false
        };
    }

    inited() {
        this.dispatch('UI:tr-inited');
    }

    /**
     * 选中
     *
     * @note 这里把数据变化丢给 table，table 会更新 tr 的 selected 值
     * @param  {Array<string>} event input的change事件参数
     */
    select(event) {

        let {selected, pos} = this.data.get();
        let nextSelected = event.target.checked;
        if (selected === nextSelected) {
            return;
        }

        this.data.set('selected', nextSelected, {silent: true});

        this.dispatch(
            `UI:table-select-${pos === 'tbody' ? 'item' : 'head'}`,
            nextSelected
        );

    }


}
