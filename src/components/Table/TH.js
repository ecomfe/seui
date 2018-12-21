/**
 * @file 表格 - th
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';

const cx = create('table');

export default class TH extends Component {

    static template = `
        <th class="{{computedClass}}"><slot></slot></th>
    `;

    static trimWhitespace = 'all';

    static computed = {
        computedClass() {
            let field = this.data.get('field');
            if (field && field.align) {
                return cx.getPartClassName('column-' + field.align);
            }
            return '';
        }
    }

    static dataTypes = {
        colspan: DataTypes.number,
        rowspan: DataTypes.number
    };

    attached() {
        if (this.data.get('colspan')) {
            this.el.setAttribute('colspan', this.data.get('colspan'));
        }
        if (this.data.get('rowspan')) {
            this.el.setAttribute('rowspan', this.data.get('rowspan'));
        }
    }
}
