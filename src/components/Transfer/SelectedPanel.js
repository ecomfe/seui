/**
 * @file 已选
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import Searchbox from '../Searchbox';
import Tree from '../Tree';
import Button from '../Button';
import classnames from 'classnames';
import {create} from '../../util/cx';
const cx = create('selected-panel');

export default class SelectedPanel extends Component {
    static components = {
        'ui-searchbox': Searchbox,
        'ui-tree': Tree,
        'ui-button': Button
    };

    static template = `
        <div class="{{computedClass}}">
            <div class="${cx.getPartClassName('head')}">
                <slot name="selected-head"/>
            </div>

            <div class="${cx.getPartClassName('content')}">
                <ui-searchbox
                    s-if="searchable"
                    class="${cx.getPartClassName('flat-search-box')}"
                    ui="small"
                    placeholder="{{placeholder}}"
                    on-search="search"
                    on-clear="search"/>
                <div class="${cx.getPartClassName('content-main')}">
                    <ui-tree s-if="showMode === 'tree'"
                        s-ref="tree"
                        datasource="{{options}}"
                        checkable
                        checkType="click"
                        filterValue="{{filterValue}}"
                        filterMethod="{{realFilter}}"
                        on-click="handleRemove">
                        <template slot="item-label">
                            <div class="${cx.getPartClassName('item')}"
                                checked="{{item.checked}}">
                                <slot name="selected-item" var-item="item" var-index="index"/>
                            </div>
                        </template>
                    </ui-tree>

                    <ul s-else
                        class="${cx.getPartClassName('flat-items')}">
                        <li s-for="option, index in flatOptions"
                            class="{{option|hidden}}"
                            on-click="handleRemove(option, 'flat')">
                            <slot name="selected-item" var-item="option" var-index="index"/>
                        </li>
                    </ul>

                    <div s-if="!options.length"
                        class="${cx.getPartClassName('no-data')}">
                        <slot name="selected-no-data"/>
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
            return classnames(
                cx(this).build(),
                cx.getPartClassName(this.data.get('showMode'))
            );
        },

        realFilter() {
            const filter = this.data.get('filter');
            const options = this.data.get('options');
            return (keyword, item, index) => filter('candidate', keyword, item, index, options);
        },

        flatOptions() {
            const options = this.data.get('options');

            const flatOptions = [];
            const stack = [{
                item: {children: options}
            }];

            while (stack.length) {
                const option = stack.pop();
                const {item, items, chains} = option;

                if (item.children instanceof Array) {
                    item.children.forEach((item, index) => {
                        stack.push({
                            item,
                            items: items ? items.concat(item) : [item],
                            chains: chains ? `${chains}.children[${index}]` : `[${index}]`
                        });
                    });
                }
                else {
                    flatOptions.unshift(option);
                }
            }

            return flatOptions;
        }
    };

    static filters = {
        hidden(option) {
            return cx(this)
                .setPart('flat-item')
                .addStates({hide: option.hidden})
                .build();
        }
    }

    initData() {
        return {
            disabled: false,
            options: [],
            selected: []
        };
    }

    handleRemove(args, type) {
        if (type === 'flat') {
            const {
                items,
                ...left
            } = args;
            args = {
                ...left,
                parents: items.slice(0, -1)
            };
        }

        this.fire('remove', args);
    }

    search(value) {
        this.data.set('filterValue', value);
        if (this.data.get('showMode') !== 'tree') {
            let options = this.data.get('options');
            options.forEach((opt, index) => {
                let hidden = opt.label.indexOf(value) < 0;
                this.data.set(`options[${index}].hidden`, hidden);
            });
        }

        this.fire('search', value);
    }
}