/**
 * @file 备选
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import Searchbox from '../Searchbox';
import Tree from '../Tree';
import Button from '../Button';
import {create} from '../../util/cx';
const cx = create('candidate-panel');

export default class CandidatePanel extends Component {
    static components = {
        'ui-searchbox': Searchbox,
        'ui-tree': Tree,
        'ui-button': Button
    };

    static template = `
        <div class="{{computedClass}}">
            <div class="${cx.getPartClassName('head')}">
                <slot name="candidate-head" />
            </div>

            <div class="${cx.getPartClassName('content')}">
                <ui-searchbox
                    s-if="searchable"
                    ui="small"
                    placeholder="{{placeholder}}"
                    on-search="search"
                    on-clear="search"/>
                <div class="${cx.getPartClassName('content-main')}">
                    <ui-tree s-ref="candidateTree"
                        datasource="{{options}}"
                        checkable
                        checkType="click"
                        checkedKeys="{{selected}}"
                        filterValue="{{filterValue}}"
                        filterMethod="{{realFilter}}"
                        on-click="handleSelect">
                        <template slot="item-label">
                            <div class="${cx.getPartClassName('item')}"
                                checked="{{item.checked}}">
                                <slot name="candidate-item" var-item="item" var-index="index"/>
                            </div>
                        </template>
                    </ui-tree>
                    <div s-if="!options.length"
                        class="${cx.getPartClassName('no-data')}">
                        <slot name="candidate-no-data"/>
                    </div>

                </div>
            </div>

        </div>
    `;

    static dataTypes = {
        options: DataTypes.array,
        disabled: DataTypes.bool
    };

    static computed = {
        computedClass() {
            return cx(this).build();
        },

        realFilter() {
            const filter = this.data.get('filter');
            const options = this.data.get('options');
            return (keyword, item, index) => filter('candidate', keyword, item, index, options);
        }
    };

    initData() {
        return {
            disabled: false,
            options: []
        };
    }

    handleSelect(args) {
        if (this.data.get('disabled')) {
            return;
        }

        this.fire('select', args);
    }

    search(value) {
        this.data.set('filterValue', value);
        this.fire('search', value);
    }
}