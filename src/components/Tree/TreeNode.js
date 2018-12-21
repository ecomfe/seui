/**
 * @file TreeNode
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import Checkbox from '../Checkbox';
import {create} from '../../util/cx';
import {cloneDeep} from 'lodash';

const cx = create('tree-node');
const TAG_NAME = 'ui-tree-node';
const TREE_NODE_SLOT_NAME = 'item';

export default class TreeNode extends Component {
    static components = {
        'ui-checkbox': Checkbox,
        [TAG_NAME]: 'self'
    };

    static template = `
        <div class="{{computedClass}}">

            <div class="${cx.getPartClassName('content')}"
                on-contextmenu="handleContextMenu($event, data)"
                on-click="handleNodeClick($event, data)">
                <slot name="${TREE_NODE_SLOT_NAME}" var-data="data" var-index="index">
                    <span s-if="data.children.length"
                        class="{{compoutedSwitcherClass}}"
                        on-click="handleExpandIconClick($event, data)">
                        <slot name="expand-icon" var-data="data" var-index="index"/>
                    </span>

                    <ui-checkbox s-if="checkable && checkType === 'checkbox'"
                        class="${cx.getPartClassName('checkbox')}"
                        value="{{data.label}}"
                        checked="{{data.checked === 'all'}}"
                        indeterminate="{{data.checked === 'mid'}}"
                        disabled="{{data.disabled}}"
                        on-change="handleNodeCheck($event, data)"/>

                    <div class="${cx.getPartClassName('label')}">
                        <slot name="item-label" var-data="data" var-index="index"/>
                    </div>
                </slot>
            </div>

            <div s-if="data.childRendered"
                class="${cx.getPartClassName('children')}">
                <template s-if="givenItemSlot">
                    <ui-tree-node
                        s-for="child, index in data.children"
                        index="{{index}}"
                        checkable="{{checkable}}"
                        checkType="{{checkType}}"
                        data="{{child}}"
                        itemClick="{{itemClick}}">
                        <template slot="${TREE_NODE_SLOT_NAME}">
                            <slot name="${TREE_NODE_SLOT_NAME}" var-data="data" var-index="index"/>
                        </template>
                    </ui-tree-node>
                </template>

                <template s-else>
                    <ui-tree-node
                        s-for="child, index in data.children"
                        index="{{index}}"
                        checkable="{{checkable}}"
                        checkType="{{checkType}}"
                        data="{{child}}"
                        itemClick="{{itemClick}}">
                        <template slot="expand-icon">
                            <slot name="expand-icon" var-data="data" var-index="index"/>
                        </template>
                        <template slot="item-label">
                            <slot name="item-label" var-data="data" var-index="index"/>
                        </template>
                    </ui-tree-node>
                </template>
            </div>

        </div>
    `;

    static computed = {
        computedClass() {
            let expanded = this.data.get('data.expanded');
            let hide = this.data.get('data.hide');
            return cx(this)
                .addStates(
                    {
                        expanded,
                        hide
                    }
                )
                .build();
        },

        compoutedSwitcherClass() {
            let expanded = this.data.get('data.expanded');
            return cx(this)
                .setPart('switcher')
                .addStates({open: expanded})
                .build();
        }
    };

    static dataTypes = {
        data: DataTypes.object,
        checkable: DataTypes.bool,
        checkType: DataTypes.string,
        itemClick: DataTypes.string // 是否在点击节点的时候展开或者收起节点
    };

    initData() {
        return {
            data: {},
            checkable: false,
            itemClick: 'none'
        };
    }

    inited() {
        this.checkGivenSlot();
        this.initChildNodeRenderValue();
    }

    checkGivenSlot() {
        // san < 3.7.0: giveSlots, san >= 3.7.0: sourceSlots
        const slots = this.givenSlots || this.sourceSlots;
        this.data.set('givenItemSlot', slots.named[TREE_NODE_SLOT_NAME]);
    }

    attached() {
        this.watch('data.expanded', val => {
            if (val) {
                this.data.set('data.childRendered', true);
            }
        });
    }

    // 子节点是否已渲染过
    initChildNodeRenderValue() {
        if (this.data.get('data.expanded')) {
            this.data.set('data.childRendered', true);
        }
    }

    updateExpandStatus(data) {
        if (data.children && data.children.length) {
            const expanded = !data.expanded;
            this.dispatch('UI:node-expand', {
                item: data,
                expanded
            });
        }
    }

    handleExpandIconClick(event, data) {
        event.stopPropagation();
        this.updateExpandStatus(data);
    }

    handleContextMenu(event, item) {
        this.dispatch('UI:node-right-click', {event, item});
    }

    handleNodeClick(event, item) {
        if (this.data.get('itemClick') === 'toggle') {
            this.updateExpandStatus(item);
        }

        this.dispatch('UI:node-click', {event, item});
    }

    handleNodeCheck(e, item) {
        let checked = e.target.checked ? 'all' : 'none';
        this.dispatch('UI:node-check', {checked, item});
    }
}
