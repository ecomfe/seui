/**
 * @file 表格 - thead
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 */

import san from 'san';

export default class THead extends san.Component {

    static template = `
        <thead><slot></slot></thead>
    `;

    static trimWhitespace = 'all';

    static messages = {
        'UI:tr-inited'(e) {
            let tr = e.target;
            tr.data.set('pos', 'thead');
            tr.data.set('tableSelectable', this.data.get('tableSelectable'));
            this.tr = tr;
        }
    };

    inited() {
        this.dispatch('UI:thead-inited');
    }

    disposed() {
        this.tr = null;
    }

    updateSelectAllState({isAllSelected, isSelected}) {
        if (this.tr && isAllSelected) {
            this.tr.data.set('selected', isAllSelected);
            this.tr.data.set('indeterminate', false);
        }
        if (this.tr && !isAllSelected && isSelected) {
            this.tr.data.set('selected', false);
            this.tr.data.set('indeterminate', true);
        }
        if (this.tr && !isAllSelected && !isSelected) {
            this.tr.data.set('selected', false);
            this.tr.data.set('indeterminate', false);
        }
    }
}
