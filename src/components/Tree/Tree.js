/**
 * @file Tree
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import Icon from '../Icon';
import TreeNode from './TreeNode';
import {create} from '../../util/cx';
import {remove, omit, isEqual} from 'lodash';

const cx = create('tree');
const TREE_NODE_SLOT_NAME = 'item';
const CHECKED_VALUE = {
    all: 1,
    mid: .5,
    none: 0
};
export default class Tree extends Component {
    static components = {
        'ui-icon': Icon,
        'ui-tree-node': TreeNode
    };

    static template = `
        <div class="{{computedClass}}">
            <template s-if="givenItemSlot">
                <ui-tree-node s-for="node, index in localDatasource"
                    data="{{node}}"
                    index="{{index}}"
                    key="{{key}}"
                    itemClick="{{itemClick}}"
                    checkable="{{checkable}}"
                    checkType="{{checkType}}">
                    <template slot="${TREE_NODE_SLOT_NAME}">
                        <slot name="${TREE_NODE_SLOT_NAME}" var-item="data" var-index="index"/>
                    </template>
                </ui-tree-node>
            </template>

            <template s-else>
                <ui-tree-node s-for="node, index in localDatasource"
                    data="{{node}}"
                    index="{{index}}"
                    key="{{key}}"
                    itemClick="{{itemClick}}"
                    checkable="{{checkable}}"
                    checkType="{{checkType}}">
                    <template slot="expand-icon">
                        <slot name="expand-icon" var-expanded="data.expanded">
                            <ui-icon name="{{data.icon | defaultExpandIcon(data.expanded)}}"/>
                        </slot>
                    </template>
                    <template slot="item-label">
                        <slot name="item-label" var-item="data" var-index="index">{{item.label}}</slot>
                    </template>
                </ui-tree-node>
            </template>
        </div>
    `;

    static computed = {
        computedClass() {
            return cx(this).build();
        }
    };

    static dataTypes = {
        datasource: DataTypes.array.isRequired, // 树节点数组
        key: DataTypes.string, // 设置了expands时，可以通过key指定判断expand的数据项
        autoExpandParent: DataTypes.bool, // 是否自动展开父节点
        defaultExpandAll: DataTypes.bool, // 默认是否展开所有节点
        expands: DataTypes.array, // 当前展开节点key值
        itemClick: DataTypes.string, // 是否在点击节点的时候展开或者收起节点
        checkable: DataTypes.bool, // 是否显示checkbox
        checkType: DataTypes.string,
        checkedKeys: DataTypes.array, // 当前选中节点key值,
        filterValue: DataTypes.string, // 过滤值
        filterMethod: DataTypes.func, // 过滤方法
        sortby: DataTypes.func // 节点排序方法
    };

    static filters = {
        defaultExpandIcon(icon, expanded) {
            return icon ? icon : `angle-${expanded ? 'down' : 'right'}-small`;
        }
    };

    initData() {
        return {
            datasource: [],
            key: 'value',
            expands: [],
            autoExpandParent: false,
            itemClick: 'none',
            checkType: 'checkbox',
            checkedKeys: [],
            filterValue: '',
            filterMethod: null
        };
    }

    inited() {
        this.checkGivenSlot();
        this.indexedNodes = {};
        this.parse();
    }

    checkGivenSlot() {
        // san < 3.7.0: giveSlots, san >= 3.7.0: sourceSlots
        const slots = this.givenSlots || this.sourceSlots;
        this.data.set('givenItemSlot', slots.named[TREE_NODE_SLOT_NAME]);
    }

    attached() {
        this.watch('datasource', data => {
            this.parse();
        });

        this.watch('expands', val => {
            if (!isEqual(val, this.localExpands)) {
                this.parse();
            }
        });

        this.watch('checkedKeys', val => {
            if (!isEqual(val, this.checkedKeys)) {
                this.parse();
            }
        });

        this.watch('filterValue', val => {
            this.filterNode(val);
        });
    }

    getTriggerNodeInfo(item) {
        const key = this.data.get('key');
        const keyVal = item[key];
        const nodeIndex = this.indexedNodes[keyVal];
        const indexArr = nodeIndex.match(/[(\d+)]/g);

        const parents = [];
        this.visitParent(nodeIndex, parentIndex => {
            parents.push(this.data.get(`localDatasource${parentIndex}`));
        });

        return {
            item,
            parents: parents.reverse(),
            index: +indexArr.pop(),
            depth: parents.length + 1,
            chains: nodeIndex
        };
    }

    static messages = {
        'UI:node-expand'({target, value}) {
            const {item, expanded} = value;
            const keyVal = item[this.data.get('key')];
            const nodeIndex = this.indexedNodes[keyVal];
            this.data.set(`localDatasource${nodeIndex}.expanded`, expanded);
            this.updateExpands(keyVal, expanded);
            this.fire(expanded ? 'expand' : 'collapse', this.getTriggerNodeInfo(item));
        },

        'UI:node-mousedown'({value}) {
            const item = value.item;
            this.fire('mousedown', this.getTriggerNodeInfo(item));
        },

        'UI:node-click'({value}) {
            const item = value.item;
            this.fire('click', this.getTriggerNodeInfo(item));
        },

        'UI:node-right-click'({value}) {
            const item = value.item;
            this.fire('right-click', this.getTriggerNodeInfo(item));
        },

        'UI:node-check'({value}) {
            const {checked, item} = value;
            const keyVal = item[this.data.get('key')];
            this.setChecked(keyVal, checked);
            this.fire('check', {item});
        }
    };

    parse() {
        const {
            datasource,
            key,
            sortby,
            defaultExpandAll,
            autoExpandParent,
            expands,
            checkable,
            checkedKeys
        } = this.data.get();

        let indexedNodes = [];

        const walk = (items, expands, checkedKeys, parentIndex) => {
            const localItems = sortby ? items.slice(0).sort(sortby) : items;

            return localItems.map((item, index) => {
                let localItem = omit(item, 'children');
                const keyVal = localItem[key];

                let expanded = defaultExpandAll || !!remove(expands, value => value === keyVal).length;
                let checked = !!remove(checkedKeys, value => value === keyVal).length ? 'all' : 'none';

                const itemIndex  = `${parentIndex}[${index}]`;
                indexedNodes[keyVal] = itemIndex;

                if (item.children && item.children.length) {
                    const children = walk(item.children, expands, checkedKeys, `${itemIndex}.children`);
                    localItem.children = children;

                    expanded = expanded || autoExpandParent && children.some(item => item.expanded);

                    if (checkable && checked === 'none') {
                        checked = this.checkedBubbledFromChildren(children);
                    }
                }
                else {
                    localItem.children = item.children;
                }

                localItem.expanded = expanded;
                if (checkable) {
                    localItem.checked = checked;
                }

                return localItem;
            });
        };

        const localDatasource = walk(datasource, expands.slice(0), checkedKeys.slice(0), '');
        this.data.set('localDatasource', localDatasource);
        this.indexedNodes = indexedNodes;
        this.localExpands = expands.slice(0);
        this.checkedKeys = checkedKeys.slice(0);
    }

    visitParent(nodeIndex, visitedFun) {
        const indexArr = nodeIndex.split('.').slice(0, -1);

        while (indexArr.length) {
            const parentIndex = indexArr.join('.');
            if (typeof visitedFun === 'function') {
                visitedFun(parentIndex);
            }
            indexArr.pop();
        }
    }

    visitChildren(node, visitedFun) {
        let nodeStack = [node];
        const key = this.data.get('key');

        while (nodeStack.length) {
            const curNode = nodeStack.pop();
            if (curNode.children) {
                curNode.children.forEach(item => {
                    nodeStack.push(item);
                    const keyVal = item[key];
                    const nodeIndex = this.indexedNodes[keyVal];
                    if (typeof visitedFun === 'function') {
                        visitedFun(nodeIndex, item);
                    }
                });
            }
        }
    }

    updateExpands(keyVal, expanded) {
        if (!expanded) {
            remove(this.localExpands, val => val === keyVal);
            this.data.remove('expands', keyVal);
        }
        else if (this.data.get('expands').indexOf(keyVal) < 0) {
            this.localExpands.push(keyVal);
            this.data.push('expands', keyVal);
        }
    }

    updateCheckedKeys(keyVal, checked) {
        const checkedKeys = this.data.get('checkedKeys');

        if (checked !== 'all') {
            remove(this.checkedKeys, keyVal);
            this.data.remove('checkedKeys', keyVal);
        }
        else if (checkedKeys.indexOf(keyVal) < 0) {
            this.checkedKeys.push(keyVal);
            this.data.push('checkedKeys', keyVal);
        }
    }

    updateChildrenCheck(node, status) {
        const key = this.data.get('key');
        this.visitChildren(node, (nodeIndex, item) => {
            this.data.set(`localDatasource${nodeIndex}.checked`, status);
            this.updateCheckedKeys(item[key], status);
        });
    }

    checkedBubbledFromChildren(children) {
        const childrenChecked = children.reduce((total, item) => total + CHECKED_VALUE[item.checked], 0);
        return childrenChecked === 0 ? 'none' : (childrenChecked === children.length ? 'all' : 'mid');
    }

    updateParentCheck(nodeIndex) {
        const key = this.data.get('key');
        this.visitParent(nodeIndex, parentIndex => {
            const parentNode = this.data.get(`localDatasource${parentIndex}`);
            const checked = this.checkedBubbledFromChildren(parentNode.children);
            this.data.set(`localDatasource${parentIndex}.checked`, checked);
            this.updateCheckedKeys(parentNode[key], checked);
        });
    }

    setChecked(keyVal, checked) {
        const nodeIndex = this.indexedNodes[keyVal];
        this.data.set(`localDatasource${nodeIndex}.checked`, checked);

        const node = this.data.get(`localDatasource${nodeIndex}`);

        this.updateCheckedKeys(keyVal, checked);
        this.updateChildrenCheck(node, checked);
        this.updateParentCheck(nodeIndex, checked);
    }

    // 过滤节点
    filterNode(value) {
        const {
            filterMethod,
            key
        } = this.data.get();

        const showNodes = [];
        if (typeof filterMethod === 'function') {
            Object.keys(this.indexedNodes).forEach((keyVal, index) => {
                const nodeIndex = this.indexedNodes[keyVal];
                const node = this.data.get(`localDatasource${nodeIndex}`);
                let hide = !filterMethod(value, node, index);
                this.data.set(`localDatasource${nodeIndex}.hide`, hide);

                if (!hide) {
                    showNodes.push(node);
                }
            });
        }

        showNodes.forEach(node => {
            this.updataBranchHideStatus(node, this.indexedNodes[node[key]]);
        });
    }

    updataBranchHideStatus(node, nodeIndex) {
        this.visitChildren(node, nodeIndex => {
            this.data.set(`localDatasource${nodeIndex}.hide`, false);
        });

        this.visitParent(nodeIndex, parentIndex => {
            this.data.set(`localDatasource${parentIndex}.hide`, false);
            this.data.set(`localDatasource${parentIndex}.expanded`, true);
        });
    }

    disposed() {
        this.indexedNodes = null;
        this.expands = null;
        this.checkedKeys = null;
    }
}
