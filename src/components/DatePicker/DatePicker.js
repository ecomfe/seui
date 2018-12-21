/**
 * @file DatePicker
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import Calendar from '../Calendar';
import Popover from '../Popover';
import moment from 'moment';
import {isNumber, omit} from 'lodash';
const cx = create('date-picker');

export default class DatePicker extends Component {
    static template = `
    <div class="{{computeClass}}" prop-ui="{{ui}}">
        <ui-button class="${cx.getPartClassName('button')}" s-ref="button" disabled="{{disabled || readonly}}"
            on-click="handleClick">
            <template s-if="range">
                <span class="${cx.getPartClassName('label')}">
                    <slot name="selected" s-if="formatted && formatted[0]">{{formatted[0]}}</slot>
                    <slot s-else name="placeholder-begin">{{placeholderBegin}}</slot>
                </span>
                <span class="${cx.getPartClassName('tilde')}">~</span>
                <span class="${cx.getPartClassName('label')}">
                    <slot name="selected" s-if="formatted && formatted[1]">{{formatted[1]}}</slot>
                    <slot s-else name="placeholder-end">{{placeholderEnd}}</slot>
                </span>
            </template>
            <div class="${cx.getPartClassName('label')}" s-if="!range">
                <span s-if="selected" name="selected">{{formatted}}</span>
                <span s-else name="placeholder">{{placeholder}}</span>
            </div>
            <ui-icon class="${cx.getPartClassName('icon')}" name="calendar"></ui-icon>
        </ui-button>
        <button s-if="clearable && selected" class="${cx.getPartClassName('clear')} dux-sr-only" on-click="handleClear">
            <ui-icon name="cross"></ui-icon>
        </button>
        <ui-popover
            overlayClass="{{overlayClass}}"
            s-ref="popover"
            open="{=expanded=}"
            anchorOrigin="bl"
            targetOrigin="tl"
            excludeSelf="{{false}}"
            constraints="{{constraints}}"
            getAnchor="{{getAnchor}}">
            <ui-calendar s-ref="calendar" class="${cx.getPartClassName('overlay')}"
                range="{{range}}"
                panel="{{panel}}"
                today="{{today}}"
                is-disabled="{{isDisabled}}"
                selected="{=selected=}"
                on-select="handleChange">
                <div class="${cx.getPartClassName('shortcuts')}"
                    slot="before"
                    s-if="range && shortcuts && shortcuts.length">
                  <button s-for="short in shortcuts" type="button"
                    class="{{short | getShortClass(selected)}}"
                    on-click="handleSelect(short)"
                    on-mouseenter="handleHoverShortcut(short)"
                    on-mouseleave="handleHoverShortcut()">{{short.label}}</button>
                </div>
            </ui-calendar>
        </ui-popover>
    </div>
    `;

    static trimWhitespace = 'all';

    static computed = {
        computeClass() {
            let selected = this.data.get('selected');
            let realInvalid = this.data.get('realInvalid');
            let range = this.data.get('range');
            let expanded = this.data.get('expanded');
            return classnames(
                cx(this).build(),
                {'dux-input-invalid': realInvalid},
                {[cx.getPartClassName('empty')]: !selected},
                {[cx.getPartClassName('range')]: range},
                {[cx.getPartClassName('expanded')]: expanded}
            );
        },
        formatted() {
            let selected = this.data.get('selected');
            let range = this.data.get('range');
            let format = this.data.get('format');
            if (range && selected && selected.length) {
                return selected.map(date => moment(date).format(format));
            }
            if (!selected) {
                return '';
            }
            return moment(selected).format(format);
        }
    };

    static components = {
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-calendar': Calendar,
        'ui-popover': Popover
    };

    static filters = {
        getShortClass(value, selected) {
            let shortcutSelected = false;
            if (selected && selected.length && selected[0] < selected[1]) {
                shortcutSelected = value.from - selected[0] === 0
                    && value.to - selected[1] === 0;
            }
            return classnames(
                cx.getPartClassName('shortcut'),
                {[cx.getPartClassName('shortcut-selected')]: shortcutSelected}
            );
        }
    }

    static dataTypes = {
        selected: DataTypes.oneOfType([
            DataTypes.array,
            DataTypes.instanceOf(Date)
        ]),
        disabled: DataTypes.bool,
        range: DataTypes.bool,
        clearable: DataTypes.bool,
        format: DataTypes.string
    };

    inited() {
        let shortcuts = this.data.get('shortcuts');
        shortcuts = shortcuts.map(({from = 0, to, label}) => {
            from = this.getDateByOffset(from);
            to = this.getDateByOffset(to);
            if (from > to) {
                return {
                    label,
                    from: to,
                    to: from
                };
            }
            return {
                label,
                from,
                to
            };
        });
        this.data.set('shortcuts', shortcuts);
    }

    initData() {
        return {
            shortcuts: [],
            shortcutsPosition: 'before',
            placeholder: '选择时间',
            placeholderBegin: '开始时间',
            placeholderEnd: '结束时间',
            getAnchor: this.getAnchor.bind(this),
            format: 'YYYY-MM-DD',
            constraints: [
                {
                    to: 'window',
                    attachment: 'together'
                }
            ],
            panel: 1,
            today: new Date()
        };
    }

    attached() {
        let ui = this.data.get('ui');
        if (ui) {
            this.el.setAttribute('ui', ui);
            this.ref('button').el.setAttribute('ui', ui);
        }
    }

    handleClick() {
        let expanded = this.data.get('expanded');
        let selected = this.data.get('selected');
        this.data.set('expanded', !expanded);
        if (!expanded && selected && selected.length) {
            this.ref('calendar').data.set('rangeSelected', selected.slice(0));
        }
    }

    getDateByOffset(offset) {
        offset = isNumber(offset) ? {days: offset} : offset;
        let startOf = offset.startOf || 'day';
        let base = moment().startOf(startOf);
        return base.add(omit(offset, 'startOf')).toDate();
    }

    handleSelect(selected) {
        this.data.set('selected', [selected.from, selected.to]);
        this.data.set('expanded', false);
        this.ref('calendar').data.set('rangeSelected', [selected.from, selected.to]);
    }

    handleHoverShortcut(selected) {
        if (selected) {
            this.ref('calendar').data.set('rangeSelected', [selected.from, selected.to]);
            return;
        }
        this.ref('calendar').data.set('rangeSelected', null);
    }

    handleClear() {
        this.data.set('selected', null);
        this.fire('select', null);
        this.data.set('expanded', false);
    }

    handleChange(e) {
        this.data.set('expanded', false);
        this.fire('select', e);
        this.dispatch('UI:form-item-interact', {fieldValue: e, type: 'change'});
    }

    getAnchor() {
        return this.el;
    }
}
