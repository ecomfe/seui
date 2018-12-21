/**
 * @file transfer
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import CandidatePanel from './CandidatePanel';
import SelectedPanel from './SelectedPanel';
import Icon from '../Icon';
import {cloneDeep, clone, uniq, difference, omit, isEqual} from 'lodash';
import {create} from '../../util/cx';
const cx = create('transfer');

export default class Transfer extends Component {
    static components = {
        'ui-candidate-panel': CandidatePanel,
        'ui-selected-panel': SelectedPanel,
        'ui-icon': Icon
    };

    static template = `
        <div class="{{computedClass}}">
            <ui-candidate-panel s-ref="candidatePanel"
                options="{{localDatasource}}"
                selected="{{selected}}"
                searchable="{{searchable}}"
                placeholder="{{candidatePlaceholder}}"
                filter="{{filter}}"
                on-select="handleSelect"
                disabled="{{disabled}}">
                <template slot="candidate-head">
                    <slot name="candidate-head">
                        <slot name="candidate-title">备选列表</slot>
                        <ui-button class="${cx.getPartClassName('select-all')}"
                            ui="link"
                            on-click="handleSelectAll"
                            disabled="{{disabled}}">全选</ui-button>
                    </slot>
                </template>
                <template slot="candidate-item">
                    <slot name="candidate-item" var-item="item" var-index="index">
                        <slot name="candidate-item-label" var-item="item" var-index="index">{{item.label}}</slot>
                        <span class="operate-icon">
                            <ui-icon name="{{item.checked|icon}}"/>
                        </span>
                    </slot>
                </template>
                <template slot="candidate-no-data">
                    <slot name="candidate-no-data"/>
                </template>
            </ui-candidate-panel>

            <ui-selected-panel
                showMode="{{selectedShowMode}}"
                options="{=selectedDatasource=}"
                searchable="{{searchable}}"
                placeholder="{{selectedPlaceholder}}"
                filter="{{filter}}"
                on-remove="handleRemove"
                disabled="{{disabled}}">
                <template slot="selected-head">
                    <slot name="selected-head">
                        <slot name="selected-title">已选列表</slot>
                        <ui-button class="${cx.getPartClassName('remove-all')}"
                            ui="link"
                            on-click="handleRemoveAll"
                            disabled="{{disabled}}">删除全部</ui-button>
                    </slot>
                </template>

                <template slot="selected-item">
                    <slot name="selected-item" var-item="item" var-index="index">
                        <slot name="selected-item-label" var-item="item" var-index="index">
                            <span s-if="selectedShowMode === 'tree'">{{item.label}}</span>
                            <template s-else>
                                <template s-for="opt, depth in item.items">
                                    <span>{{opt.label}}</span>
                                    <ui-icon s-if="depth < item.items.length - 1"
                                        class="${cx.getPartClassName('flat-items-separator')}"
                                        name="angle-right"/>
                                </template>
                            </template>
                        </slot>

                        <span class="operate-icon">
                            <ui-icon name="cross"/>
                        </span>
                    </slot>
                </template>

                <template slot="selected-no-data">
                    <slot name="selected-no-data">请从左侧选择</slot>
                </template>
            </ui-selected-panel>
        </div>
    `;

    static dataTypes = {
        datasource: DataTypes.array.isRequired,
        selected: DataTypes.array,
        selectedShowMode: DataTypes.oneOf(['tree', 'flat']),
        keys: DataTypes.oneOfType([DataTypes.string, DataTypes.func]),
        searchable: DataTypes.bool,
        candidatePlaceholder: DataTypes.string,
        selectedPlaceholder: DataTypes.string,
        filter: DataTypes.func,
        disabled: DataTypes.bool
    };

    initData() {
        return {
            localDatasource: [],
            selectedDatasource: [],
            selectedShowMode: 'tree',
            keys: 'value',
            selected: [],
            searchable: true,
            filter(type, keyword, item) {
                return item.label.indexOf(keyword) > -1;
            }
        };
    }

    static computed = {
        computedClass() {
            return cx(this)
                .addStates({disabled: this.data.get('disabled')})
                .build();
        },

        realKeys() {
            const keys = this.data.get('keys');
            if (typeof keys === 'string') {
                return item => item[keys];
            }

            return keys;
        }
    };

    static filters = {
        icon(checkState) {
            return checkState === 'all' ? 'check' : 'arrow-right';
        }
    };

    inited() {
        this.indexs = {};
        const selected = this.data.get('selected') || [];
        this.localSelected = selected.slice(0);

        this.cloneDatasource(this.data.get('datasource'));
        this.parseSelected(selected);

        this.watch('datasource', val => {
            this.cloneDatasource(val);
        });

        this.watch('selected', val => {
            if (!isEqual(val, this.localSelected)) {
                this.localSelected = val.slice(0);
                this.parseSelected(val);
            }
        });
    }

    cloneDatasource(datasource) {
        const realKeys = this.data.get('realKeys');

        const walk = (items, parentIndex) => {
            return items.map((item, index) => {
                let localItem = omit(item, 'children');
                const itemIndex = parentIndex
                    ? `${parentIndex}.children[${index}]` : `[${index}]`;
                this.indexs[realKeys(item)] = itemIndex;

                if (item.children) {
                    localItem.children = walk(item.children, itemIndex);
                }

                return localItem;
            });
        };

        this.data.set('localDatasource', walk(datasource));
    }

    parseSelected(selected = []) {
        selected.forEach(val => {
            const index = this.indexs[val];
            if (!index) {
                return;
            }

            const parentIndex = index.split('.');
            let parents = [];

            while (parentIndex.length) {
                parents.unshift(this.data.get(`localDatasource${parentIndex.join('.')}`));
                parentIndex.pop();
            }

            this.addSelectedItem({
                item: parents.pop(),
                parents
            });
        });
    }

    getLeaveKeys(item) {
        let leafKeys = [];
        let stack = [item];
        const realKeys = this.data.get('realKeys');

        while (stack.length) {
            const curNode = stack.pop();

            if (curNode.children) {
                curNode.children.forEach(item => {
                    stack.push(item);
                });
            }
            else {
                leafKeys.push(realKeys(curNode));
            }
        }

        return leafKeys;
    }

    updateSelected(keys, isDelete = 0) {
        const prevSelected = this.data.get('selected');
        const selected = isDelete === 1
            ? difference(prevSelected, keys) : uniq(prevSelected.concat(keys));

        this.localSelected = selected;
        this.data.set('selected', selected);
    }

    mergeTree(source, node, realKeys) {
        const {
            item,
            parents = []
        } = node;

        let itemArr = source;

        for (let index = 0; index < parents.length; index++) {
            let parentItem = parents[index];
            let matchItem = itemArr.filter(item => realKeys(item) === realKeys(parentItem))[0];

            if (!matchItem) {
                matchItem = {
                    ...parentItem,
                    children: []
                };
                itemArr.push(matchItem);
            }

            itemArr = matchItem.children;
        }

        itemArr.push(item);
    }

    addSelectedItem(selectedItems) {
        let {
            selectedDatasource,
            realKeys
        } = this.data.get();

        this.mergeTree(selectedDatasource, selectedItems, realKeys);
        this.data.set('selectedDatasource', clone(selectedDatasource));
    }

    handleSelect(args) {
        this.addSelectedItem(args);
        this.updateSelected(this.getLeaveKeys(args.item));
    }

    // 全选
    handleSelectAll() {
        const localDatasource = this.data.get('localDatasource');
        this.data.set('selectedDatasource', cloneDeep(localDatasource));

        const selectedLeaves = localDatasource.reduce((leaves, item) => {
            return leaves.concat(this.getLeaveKeys(item));
        }, []);

        this.updateSelected(selectedLeaves);
    }

    removeSelectedItem({chains, parents}) {
        let indexArr = chains.split('.');
        let i = parents.length - 1;
        // 删除当前节点，当父节点只有这一个孩子时需删除父节点
        do {
            const indexNum = indexArr.pop().match(/\d+/)[0];
            const itemPath = `${indexArr.join('.')}${indexArr.length ? '.children' : ''}`;
            this.data.removeAt(`selectedDatasource${itemPath}`, indexNum);
        } while (indexArr.length && parents[i--].children.length === 1);
    }

    handleRemove(args) {
        this.removeSelectedItem(args);
        this.updateSelected(this.getLeaveKeys(args.item), 1);
    }

    handleRemoveAll() {
        this.data.set('selectedDatasource', []);
        this.localSelected = [];
        this.data.set('selected', []);
    }

    disposed() {
        this.indexs = null;
        this.localSelected = null;
    }
}
