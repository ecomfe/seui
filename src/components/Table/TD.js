/**
 * @file 表格 - td
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 */

import {Component, DataTypes} from 'san';

export default class TD extends Component {

    static template = `
        <td><slot></slot></td>
    `;

    static trimWhitespace = 'all';

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
