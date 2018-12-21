/**
 * @file RegionPicker
 * @author zhoumin09
 */
import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import {cloneDeep, pick} from 'lodash';
import Checkbox from '../Checkbox';
import Popover from '../Popover';
import RegionUnits from './RegionUnits';
const cx = create('region-picker');

export default class RegionPicker extends Component {
    static components = {
        'dux-checkbox': Checkbox,
        'dux-popover': Popover,
        'dux-units': RegionUnits
    };

    static template = `
        <div class="{{computedClass}}">
            <div san-for="section, si in localDatasource" class="${cx.getPartClassName('section')}">
                <div class="${cx.getPartClassName('section-title')}">
                    <dux-checkbox
                        readonly="{{readonly}}"
                        disabled="{{disabled || section.disabled}}"
                        checked="{=section.selected=}"
                        indeterminate="{=section.indeterminate=}"
                        on-change="toggleNode($event, section, !section.selected)">
                        <slot>{{section.label}}</slot>
                    </dux-checkbox>
                </div>

                <div san-if="section.children" class="${cx.getPartClassName('section-content')}">
                    <div san-for="branch, bi in section.children" class="${cx.getPartClassName('branch')}">
                        <div class="${cx.getPartClassName('branch-title')}">
                            <dux-checkbox
                                readonly="{{readonly}}"
                                disabled="{{disabled || branch.disabled}}"
                                checked="{=branch.selected=}"
                                indeterminate="{=branch.indeterminate=}"
                                on-change="toggleNode($event, branch, !branch.selected)">
                                <slot>{{branch.label}}</slot>
                            </dux-checkbox>
                        </div>

                        <div san-if="branch.children" class="${cx.getPartClassName('branch-content')}">
                            <div san-for="group, gi in branch.children" class="${cx.getPartClassName('group')}">

                                <div class="${cx.getPartClassName('group-title')}">
                                    <div class="title-wrp"
                                        on-mouseenter="toggleActive($event, group, true)">
                                        <dux-checkbox
                                            readonly="{{readonly}}"
                                            disabled="{{disabled || group.disabled}}"
                                            checked="{=group.selected=}"
                                            indeterminate="{=group.indeterminate=}"
                                            on-change="toggleNode($event, group, !group.selected)">
                                            <slot name="">{{group.label}}</slot>
                                        </dux-checkbox>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
            <dux-popover
                overlayClass="{{overlayClass}}"
                s-ref="group-content"
                open="{=open=}"
                isClickAway="{{false}}"
                anchorOrigin="bl"
                targetOrigin="tl"
                constraints="{{constraints}}"
                getAnchor="{{getAnchor}}"
                getTargets="{{getTargets}}"
                mode="{{mode}}"
                delay="{{delay}}">
                <div class="units-wrp">
                    <dux-units
                        readonly="{{readonly}}"
                        disabled="{{disabled}}"
                        currentGroup="{{currentGroup}}"
                        class="${cx.getPartClassName('units')}"
                        on-unitChange="handleUnitChange($event)">
                    </dux-units>
                </div>
            </dux-popover>
            <dux-popover
                overlayClass="{{overlayClass}}"
                s-ref="shadow-title"
                open="{=open=}"
                isClickAway="{{false}}"
                anchorOrigin="tl"
                targetOrigin="tl"
                getAnchor="{{getAnchor}}"
                getTargets="{{getTargets}}"
                mode="{{mode}}"
                delay="{{delay}}">
                    <div class="${cx.getPartClassName('group-shadow')}">
                        <dux-checkbox
                            readonly="{{readonly}}"
                            disabled="{{disabled || currentGroup.disabled}}"
                            checked="{=currentGroup.selected=}"
                            indeterminate="{=currentGroup.indeterminate=}"
                            on-change="toggleNode($event, currentGroup, !currentGroup.selected)">
                            <slot name="">{{currentGroup.label}}</slot>
                        </dux-checkbox>
                        <span class="count">({{currentGroup.solidCount}}/{{currentGroup.children.length}})</span>
                    </div>
            </dux-popover>
            </div>
        </div>
    `;

    static dataTypes = {
        datasource: DataTypes.array, // 可选数据源
        selected: DataTypes.array // 选中项
    };

    static trimWhitespace = 'all';

    static computed = {
        computedClass() {
            return classnames(
                cx(this).build()
            );
        },
        selectedMap() {
            let localSelected = this.data.get('localSelected');
            return localSelected.reduce((result, current) => {
                result[current] = true;
                return result;
            }, {});
        },
        localSelected() {
            let selected = this.data.get('selected');
            return selected ? selected : [];
        },
        localDatasource() {
            return cloneDeep(this.data.get('datasource'));
        }
    };

    static messages = {
        'popover-hide'() {
            this.data.set('open', false);
        }
    }

    initData() {
        return {
            localDatasource: [],
            includeIndeterminate: false,
            mode: 'hover',
            delay: 0,
            getAnchor: () => this.getAnchor(),
            getTargets: () => this.getTargets(),
            constraints: [{
                to: '',
                attachment: ''
            }]
        };
    }

    attached() {
        // change is triggered by toggleNode after user interaction
        // reset the flag and do nothing because UI is already updated
        this.watch('selected', val => {
            let fromUI = this.data.get('fromUI');
            if (fromUI) {
                this.data.set('fromUI', false);
                return;
            }
            this.data.set('localSelected', val);
            this.init();
        });

        this.init();
    }

    /**
     * init localDatasource
     */

    init() {
        let localDatasource = this.data.get('localDatasource');
        let newDatasource = cloneDeep(localDatasource);
        let selectedMap = this.data.get('selectedMap');
        let self = this;
        this.walk(newDatasource, {
            enter({node, parent}) {
                node.selected = false;
                node.solidCount = 0; // indeterminately selected child count
                node.softCount = 0; // deteminately selected child count
                node.indeterminate = false;
                node.parent = parent;
            },
            exit({node, parent}) {
                if (!node.id && !(node.children && node.children.length)) {
                    // invalid node
                    throw new Error('invalid region tree node');
                }
                // get select state for self
                if (node.id) {
                    // check select state from `selected`
                    node.selected = !!selectedMap[node.id];
                }
                // infer state from children
                self.updateNode(node);
            }
        });
        this.data.set('localDatasource', newDatasource);
    }

    walk(source, {enter, exit}, parent) {
        if (Array.isArray(source)) {
            source.forEach(node => this.walk(node, {enter, exit}));
            return;
        }
        let children = source.children;
        if (typeof enter === 'function') {
            enter({node: source, parent});
        }
        if (Array.isArray(children)) {
            children.forEach(node => this.walk(node, {enter, exit}, source));
        }
        if (typeof exit === 'function') {
            exit({node: source, parent});
        }
    }

    /**
     * update node: children && parent
     * @param {Object} node current node
     * @param {Object} prev selected and indeterminate
     */

    updateNode(node, prev) {
        let softDiff = 0;
        let solidDiff = 0;
        if (node.children && node.children.length) {
            // node is selected as long as any child is selected
            // node is indeterminate if some but not all children are selected
            let selected = node.softCount > 0;
            node.selected = selected;
            // if not all children are determinately selected,
            // the parent is in indeterminate state
            let indeterminate = node.softCount !== 0 && node.solidCount !== node.children.length;
            if (prev) {
                if (prev.selected !== selected) {
                    softDiff = selected ? 1 : -1;
                }
                if (prev.indeterminate !== indeterminate) {
                    // [-] -> [ ] =>  0
                    // [ ] -> [-] =>  0
                    // [-] -> [*] =>  1
                    // [*] -> [-] => -1
                    if (prev.selected && indeterminate) {
                        solidDiff = -1;
                    }
                    else if (prev.indeterminate && selected) {
                        solidDiff = 1;
                    }
                }
                else {
                    // [ ] -> [*] =>  1
                    // [*] -> [ ] => -1
                    solidDiff = softDiff;
                }
            }
            node.indeterminate = indeterminate;
        }
        else if (prev) {
            softDiff = solidDiff = prev.selected ? -1 : 1;
        }
        // update parent status
        let parent = node.parent;
        if (!parent) {
            return;
        }
        // only do increase while initializing, do both while updating
        if (!prev) {
            if (node.selected) {
                parent.softCount++;
                if (!node.indeterminate) {
                    parent.solidCount++;
                }
            }
        }
        else {
            parent.softCount += softDiff;
            parent.solidCount += solidDiff;
        }
    }

    /**
     * mouseenter and open the popover
     * @param {Object} Event e
     * @param {Object} node current node
     * @param {Boolean} show open status
     */

    toggleActive(e, node, show) {
        node.active = show;
        if (show) {
            let target = e.target;
            // e.target needs to be a inline-block dom, so we choose its parentNode to be de target(parentNode display in block)
            target = target && target.parentNode;
            this.data.set('target', target);
            this.data.set('open', node.children && node.active);
            this.data.set('currentGroup', node);
            this.updateOriginNode(node);
        }
        else {
            throw new Error('open fail');
        }
    }

    /**
     * currentGroup have changed, update origin in localDatasource
     * @param {Object} Event e
     * @param {Object} node current node
     * @param {Boolean} show open status
     */

    updateOriginNode(node, prevParent = {}) {
        // iterate parent and update datasource
        let parent = node;
        let localDatasource = this.data.get('localDatasource');
        while (parent) {
            prevParent = parent;
            parent = parent.parent;
        }

        this.updateParent(prevParent, localDatasource);
    }

    /**
     * updateParent
     * @param {Object} prevParent pre parent
     */

    updateParent(prevParent, localDatasource) {
        let newDatasource = cloneDeep(localDatasource);
        if (prevParent !== {}) {
            // find the index of prevParent in localDatasource, and update corresponding item
            localDatasource.map((item, index) => {
                if (item.id === prevParent.id) {
                    newDatasource[index] = prevParent;
                }
                return item;
            });
        }
        this.data.set('localDatasource', newDatasource);
    }

    /**
     * toggle node
     * @param {Object} Event e
     * @param {Object} node current node
     * @param {Boolean} checked open status
     */

    toggleNode(e, node, checked) {
        // get current node and toggle its select status
        node.checked = checked;
        let {selected, indeterminate} = node;

        this.walk(node, {
            exit({node}) {
                let hasChildren = node.children && node.children.length;
                node.indeterminate = false;
                node.selected = checked;
                if (hasChildren) {
                    node.softCount = node.solidCount = checked ? node.children.length : 0;
                }
            }
        });

        let localDatasource = this.data.get('localDatasource');

        // inform ancesters and change ancesters
        let parent = node;
        let prev = {selected, indeterminate};
        // save root parent of each array item
        let prevParent = {};
        while (parent) {
            prevParent = parent;
            this.updateNode(parent, prev);
            parent = parent.parent;
            prev = pick(parent, 'selected', 'indeterminate');
        }

        // update localDatasource
        this.updateParent(prevParent, localDatasource);

        // update currentGroup
        this.setCurrentGroup(node);

        // collect selected result
        this.collectResult(node, localDatasource);

        // fire on-change event
        this.fire('change', {
            e,
            node,
            checked
        });
    }

    /**
     * set currentGroup
     * @param {Object} node
     */

    setCurrentGroup(node) {
        if (!(node.children && node.children.length > 0)) {
            node = node.parent;
        }
        this.data.set('currentGroup', Object.assign({}, node));
    }

    /**
     * collect select result and dispatch output
     * @param {Object} node node
     * @param {Object} newDatasource cloned localDatasource
     */

    collectResult(node, localDatasource) {
        let newDatasource = cloneDeep(localDatasource);
        let output = [];
        let includeIndeterminate = this.data.get('includeIndeterminate');
        this.walk(newDatasource, {
            enter({node}) {
                if (!node.id || !node.selected) {
                    return;
                }

                if (includeIndeterminate || !node.indeterminate) {
                    output.push(node.id);
                }
            }
        });
        this.data.set('fromUI', true);
        this.data.set('selected', output);
        this.dispatch('MESSAGE-OUTPUT', output);
    }

    /**
     * handleUnitChange
     * @param {Object} params {e, unit, selected}
     */

    handleUnitChange(params) {
        let {e, unit} = params;
        let checked = params.selected;
        unit.active = checked;
        this.toggleNode(e, unit, checked);
    }

    getAnchor() {
        return this.data.get('target') || '';
    }

    getTargets() {
        return [
            this.data.get('target'),
            this.ref('shadow-title').el.firstElementChild,
            this.ref('group-content').el.firstElementChild
        ];
    }
}
