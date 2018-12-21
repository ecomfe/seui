/**
 * @file 表格
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';

const cx = create('table');

export default class Table extends Component {
    static template = `
        <div class="{{className}}">
            <div s-if="scrollableY" class="${cx.getPartClassName('fixed-header')}">
                <table>
                    <slot name="header"></slot>
                </table>
            </div>
            <div ref="main" class="${cx.getPartClassName('main')}">
                <table>
                    <slot name="col"></slot>
                    <slot name="header"></slot>
                    <slot></slot>
                    <slot name="footer"></slot>
                </table>
            </div>
        </div>
    `;

    static trimWhitespace = 'all';

    static messages = {
        'UI:tbody-inited'(e) {
            this.tbody = e.target;
            e.target.data.set('tableSelectable', this.data.get('selectable'));
        },
        'UI:thead-inited'(e) {
            this.thead = e.target;
            e.target.data.set('tableSelectable', this.data.get('selectable'));
        },
        'UI:table-select-head'(e) {
            let selected = [];
            let selectAll = e.value;
            this.tbody.eachItem((tr, index) => {
                let trDisabled = tr.data.get('disabled');
                if (!trDisabled) {
                    tr.data.set('selected', selectAll);
                    if (selectAll) {
                        selected.push(index);
                    }
                }
                else {
                    let trSelected = tr.data.get('selected');
                    if (trSelected) {
                        selected.push(index);
                    }
                }
            });

            this.fire('select', selected);
        },
        'UI:table-select-body'(e) {
            if (this.thead) {
                this.thead.updateSelectAllState(this.isAllSelected());
            }
            this.fire('select', e.value);
        }
    };

    static computed = {
        className() {
            let selectable = !!this.data.get('selectable');
            return cx(this).addStates({selectable}).build();
        }
    };

    static dataTypes = {
        selectable: DataTypes.oneOf([false, 'multi', 'single'])
    };

    initData() {
        return {
            // multi | single
            selectable: false
        };
    }

    attached() {

        // 当所有的行都初始化完成，我们算一下是不是所有的行都是被选中的

        let selectable = this.data.get('selectable');
        let ui = this.data.get('ui');
        if (ui) {
            this.el.setAttribute('ui', ui);
        }

        if (!selectable) {
            return;
        }

        if (this.thead) {
            this.thead.updateSelectAllState(this.isAllSelected());
        }

        this.watch('data', () => {
            this.thead.updateSelectAllState(this.isAllSelected());
        });

    }

    isAllSelected() {
        let rows = this.tbody.findChildTRs();
        let isAllSelected = true;
        let isSelected = false;
        for (let i = 0, len = rows.length; i < len; i++) {
            let row = rows[i];
            if (!row.data.get('selected')) {
                isAllSelected = false;
            }
            else {
                isSelected = true;
            }
        }
        return {isAllSelected, isSelected};
    }


    disposed() {
        this.tbody = this.thead = this.tfoot = null;
    }
}
