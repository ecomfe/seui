/**
 * @file 表格
 * @author errorrik<errorrik@gmail.com>
 * @author jinzhubaofu <leonlu@outlook.com>
 * @author asd123freedom <asd123freedom@gmail.com>
 */

import {DataTypes} from 'san';

import Table from './Table';
import THead from './THead';
import TBody from './TBody';
import TR from './TR';
import TD from './TD';
import TH from './TH';
import TFoot from './TFoot';
import {create} from '../../util/cx';
import {normalizeLength} from '../../util';
import {extend} from 'lodash';

const cx = create('table');

export default class ConfigurableTable extends Table {

    static components = {
        'ui-tr': TR,
        'ui-th': TH,
        'ui-td': TD,
        'ui-tbody': TBody,
        'ui-thead': THead,
        'ui-tfoot': TFoot
    };

    static messages = Table.messages;

    static filters = {
        renderField(field, item) {
            if (typeof field.content === 'function') {
                return field.content.call(this, item);
            }
            else if (field.prop) {
                return item[field.prop];
            }

            return '';
        }
    };

    // static template = `
    //     <table class="{{className}}" on-select="handleSelect($event)">
    //         <ui-thead>
    //             <ui-tr>
    //                 <ui-th san-for="field in realFields" field="{{field}}" colspan="{{field.colspan || 0}}">
    //                     <div class="${cx.getPartClassName('cell')}">{{field.title}}</div>
    //                 </ui-th>
    //             </ui-tr>
    //         </ui-thead>
    //         <ui-tbody>
    //             <ui-tr san-for="item in data" selected="{=item.selected=}" disabled="{{item.disabled}}">
    //                 <ui-td san-for="field in fields"><slot name="td" var-item="item" var-field="field">{{field | renderField(item)}}</slot></ui-td>
    //             </ui-tr>
    //         </ui-tbody>
    //         <ui-foot s-if="hasFoot">
    //             <ui-tr>
    //                 <ui-td san-for="field in fields"><slot name="foot" var-item="item" var-field="field">{{field | renderField(item)}}</slot></ui-td>
    //             </ui-tr>
    //         </ui-foot>
    //     </table>
    // `;
    static template = `
        <div class="{{className}}">
            <div s-if="scrollableY" class="${cx.getPartClassName('fixed-header')}">
                <table>
                    <ui-thead>
                        <ui-tr>
                            <ui-th san-for="field in realFields" field="{{field}}" colspan="{{field.colspan || 0}}">
                                <div class="${cx.getPartClassName('cell')}">{{field.title}}</div>
                            </ui-th>
                        </ui-tr>
                    </ui-thead>
                </table>
            </div>
            <div ref="main" class="${cx.getPartClassName('main')}" style="{{computedStyle}}">
                <table>
                    <slot name="col"></slot>
                    <ui-thead s-if="!scrollableY">
                        <ui-tr>
                            <ui-th san-for="field in realFields" field="{{field}}" colspan="{{field.colspan || 0}}">
                                <div class="${cx.getPartClassName('cell')}">{{field.title}}</div>
                            </ui-th>
                        </ui-tr>
                    </ui-thead>
                    <col-group>
                        <col s-for="field in realFields"/>
                    </col-group>
                    <ui-tbody>
                        <ui-tr san-for="item in data" selected="{=item.selected=}" disabled="{{item.disabled}}">
                            <ui-td san-for="field in fields"><slot name="td" var-item="item" var-field="field">{{field | renderField(item)}}</slot></ui-td>
                        </ui-tr>
                    </ui-tbody>
                    <ui-foot s-if="!scrollableY && hasFoot">
                        <ui-tr>
                            <ui-td san-for="field in fields"><slot name="foot" var-item="item" var-field="field">{{field | renderField(item)}}</slot></ui-td>
                        </ui-tr>
                     </ui-foot>
                </table>
            </div>
            <div s-if="scrollableY" class="${cx.getPartClassName('fixed-footer')}">
                <table>
                    <ui-foot s-if="hasFoot">
                        <slot></slot>
                    </ui-foot>
                </table>
            </div>
        </div>
    `

    static dataTypes = {
        ...Table.dataTypes,
        fields: DataTypes.arrayOf(DataTypes.shape({
            prop: DataTypes.string,
            title: DataTypes.string,
            content: DataTypes.func
        })),
        data: DataTypes.array
    };

    static computed = extend({}, Table.computed, {
        computedStyle() {
            let scroll = this.data.get('scroll');
            scroll = normalizeLength(scroll);
            if (scroll) {
                return `max-height: ${scroll}`;
            }
            return '';
        },
        scrollableY() {
            let scroll = this.data.get('scroll');
            return !!scroll;
        },
        realFields() {
            let fields = this.data.get('fields');
            let dict = {};
            fields = fields.reduce((res, cur) => {
                if (!dict[cur.title]) {
                    dict[cur.title] = 1;
                    res.push(cur);
                }
                return res;
            }, []);
            return fields;
        }
    });

    static trimWhitespace = 'all';

    handleSelect(e) {
        this.fire('select', e);
    }
}
