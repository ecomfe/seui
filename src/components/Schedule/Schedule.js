/**
 * @file Schedule
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import san, {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import Button from '../Button';
import Dropdown from '../Dropdown';
import Checkbox from '../Checkbox';
import Tooltip from '../Tooltip';
import {find, cloneDeep, mapValues, isEqual, debounce} from 'lodash';
import {merge} from '../../util/range';
const cx = create('schedule');

function compare(a, b) {
    return a - b;
}

export default class Schedule extends Component {
    static template = `
        <div class="{{computedClass}}">
            <div class="${cx.getPartClassName('header')}">
                <div class="${cx.getPartClassName('shortcuts')}" s-if="shortcuts && shortcuts.length">
                    <button s-if="shortcutsDisplay === 'expand'" type="button"
                        s-for="item, index in shortcuts" on-click="selectShortcut(index)"
                        class="{{index | getExpandShortCutClass(shortcutChecked)}}">
                        {{item.label}}</button>
                    <ui-dropdown s-else ui="link" label="默认时段"
                        on-click="selectShortcut"
                        options="{{shortcutOptions}}">
                    </ui-dropdown>
                </div>
                <div class="${cx.getPartClassName('legend')}">
                    <span s-for="item, index in statuses"
                        class="{{index | getLengendClass}}">{{item.label}}</span>
                </div>
                <!--slot name="header">
                    <slot name="shortcuts" s-if="shortcuts && shortcuts.length">
                        <div class="${cx.getPartClassName('shortcuts')}">
                            <button s-if="shortcutsDisplay === 'expand'" type="button"
                                s-for="item, index in shortcuts" on-click="selectShortcut(index)"
                                class="{{index | getExpandShortCutClass}}">
                                {{item.label}}</button>
                            <ui-dropdown s-else ui="link" label="默认时段"
                                on-click="selectShortcut"
                                options="{{shortcutOptions}}">
                            </ui-dropdown>
                        </div>
                    </slot>
                </slot>
                <slot name="legend">
                    <div class="${cx.getPartClassName('legend')}">
                        <span s-for="item, index in statuses"
                            class="{{index | getLengendClass}}">{{item.label}}</span>
                    </div>
                </slot-->
            </div>
            <div class="${cx.getPartClassName('body')}">
                <div class="${cx.getPartClassName('head-hour')}">
                    <div class="${cx.getPartClassName('head-hour-item')}" s-for="i in HOUR_PIECE">
                        {{((i - 1) * 2) + ':00'}}
                    </div>
                </div>
                <div class="${cx.getPartClassName('head-day')}">
                    <div class="${cx.getPartClassName('head-day-item')}" s-for="i in WEEK_LENGTH">
                        <ui-checkbox ui="small"
                            checked="{{dayChecked[i - 1].checked}}"
                            on-change="toggleDay($event, week[i - 1])"
                            indeterminate="{{dayChecked[i - 1].indeterminate}}">
                            {{dayNames[i - 1]}}
                        </ui-checkbox>
                    </div>
                </div>
                <div class="${cx.getPartClassName('detail')}">
                    <table class="${cx.getPartClassName('table')} ${cx.getPartClassName('table-interaction')}">
                        <colgroup>
                            <col s-for="i in HOURS"/>
                        </colgroup>
                        <tr s-for="day, i in realHourlyStates">
                            <td s-for="hour, j in day" class="{{hour | getHourSelectedClass}}">
                                <button type="button"
                                    disabled="{{hour.isDisabled}}"
                                    class="{{hour | getHourButtonClass(i, j)}}"
                                    on-mousedown="handleMousedown(i, j)"
                                    on-mouseenter="handleHover($event, i, j)"
                                    on-mouseup="pick"></button>
                            </td>
                        </tr>
                    </table>
                    <table class="${cx.getPartClassName('table')} ${cx.getPartClassName('table-selected')}">
                        <colgroup>
                            <col s-for="i in HOURS"/>
                        </colgroup>
                        <tr s-for="day, i in secondHourlyStates">
                            <td s-for="hour, j in day"
                                prop-colspan="{{hour | getHourColSpan}}">
                                {{hour | getHourTd}}
                            </td>
                        </tr>
                    </table>
                    <ui-tooltip mode="hover"
                        ui="small"
                        target="{=tooltipTarget=}"
                        anchorOrigin="right"
                        interactive="{{false}}"
                        delay="{{0}}"
                        open="{{tooltipOpen}}">
                        {{currentLabel}}
                    </ui-tooltip>
                </div>
            </div>
        </div>
    `;


    initData() {
        let HOUR_PIECE = [];
        for (let i = 1; i <= 13; i++) {
            HOUR_PIECE.push(i);
        }
        let WEEK_LENGTH = [];
        for (let i = 1; i <= 7; i++) {
            WEEK_LENGTH.push(i);
        }
        let HOURS = [];
        for (let i = 1; i <= 24; i++) {
            HOURS.push(i);
        }
        let dayNames = [
            '一', '二', '三', '四', '五', '六', '日'
        ];
        return {
            HOURS,
            week: [1, 2, 3, 4, 5, 6, 0],
            HOUR_PIECE,
            WEEK_LENGTH,
            dayNames,
            selected: [],
            disabledDate() {
                return false;
            }
        };
    }

    static messages = {
        'popover-hide'() {
            this.data.set('tooltipOpen', false);
        }
    }

    static components = {
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-checkbox': Checkbox,
        'ui-tooltip': Tooltip,
        'ui-dropdown': Dropdown
    }

    static filters = {
        getLengendClass(value) {
            let name = this.data.get('statuses')[value].name;
            return classnames(
                cx.getPartClassName('legend-item'),
                cx.getPartClassName('legend-' + name)
            );
        },
        getHourSelectedClass(value) {
            let selected = value.isSelected;
            return classnames(
                {[cx.getPartClassName('selected')]: !!selected}
            );
        },
        getHourColSpan(value) {
            let hour = value;
            return hour.isStart && hour.span > 1 ? hour.span : false;
        },
        getHourButtonClass(value, i, j) {
            let hour = value;
            return hour.isSelected ? cx.getPartClassName('selected') : '';
        },
        getHourTd(value) {
            return value.isWhole
                ? '全天'
                : value.isStart && value.span > 2
                    ? `${value.start}:00-${value.end + 1}:00`
                    : '';
        },
        getExpandShortCutClass(value, shortcutChecked) {
            return classnames(
                cx.getPartClassName('shortcut'),
                {[cx.getPartClassName('shortcut-selected')]: shortcutChecked[value]}
            );
        }
    };

    static computed = {
        computedClass() {
            return cx(this).build();
        },
        dayChecked() {
            let week = this.data.get('week');
            let selected = this.data.get('selected');
            return week.map(day => {
                let selectedDay = selected[day];
                let firstRange = selectedDay ? selectedDay[0] : undefined;
                return {
                    checked: !!firstRange,
                    indeterminate: firstRange && (firstRange[0] !== 0 || firstRange[1] !== 23)
                };
            });
        },

        pickingSelected() {
            let pickingStart = this.data.get('pickingStart');
            let pickingEnd = this.data.get('pickingEnd');
            let selected = this.data.get('selected');
            let week = this.data.get('week');
            if (!pickingStart || !pickingEnd) {
                return null;
            }
            let dayRange = [pickingStart.dayIndex, pickingEnd.dayIndex].sort(compare);
            let hourRange = [pickingStart.hourIndex, pickingEnd.hourIndex].sort(compare);
            let days = week.slice(0).splice(dayRange[0], dayRange[1] - dayRange[0] + 1);
            return days.reduce((selected, day) => {
                let daySelected = selected[day];
                if (!daySelected) {
                    selected[day] = [hourRange];
                }
                else {
                    selected[day] = merge(daySelected, hourRange);
                }
                return selected;

            }, cloneDeep(selected) || {});
        },

        currentLabel() {
            let current = this.data.get('current');
            if (!current) {
                return null;
            }
            return `${current.hour}:00–${current.hour + 1}:00`;
        },

        shortcutChecked() {
            let realShortcuts = this.data.get('realShortcuts');
            let selected = this.data.get('selected');
            return realShortcuts.map(shortcut => isEqual(shortcut.selected, selected));
        },

        secondHourlyStates() {
            let hourState = this.data.get('realHourlyStates');
            return hourState.map(days => days.filter(item => {
                let hour = item;
                return !hour.isSelected || hour.isStart;
            }));
        },

        realShortcuts() {
            let shortcuts = this.data.get('shortcuts');
            return shortcuts.map(({label, selected}) => {
                return {
                    label,
                    selected: mapValues(selected, day => day === true ? [[0, 23]] : day)
                };
            });
        },

        realHourlyStates() {
            let week = this.data.get('week');
            let selected = this.data.get('selected');
            let pickingSelected = this.data.get('pickingSelected');
            let disabledDate = this.data.get('disabledDate');
            let HOURS = this.data.get('HOURS');
            selected = pickingSelected || selected;
            return week.reduce((days, day) => {
                days.push(HOURS.slice(0)
                    .map((e, i) => i)
                    .map(hour => {
                        return {
                            hour,
                            day
                        };
                    })
                    .map(value => {
                        let {hour, day} = value;
                        let daySelectState = selected ? selected[day] : null;
                        if (!daySelectState || !daySelectState.length) {
                            return {
                                isSelected: false
                            };
                        }
                        let range = find(daySelectState, ([start, end]) => hour >= start && hour <= end);
                        return {
                            isSelected: !!range,
                            isDisabled: disabledDate(day, hour),
                            ...range
                                ? {
                                    isStart: hour === range[0],
                                    span: range[1] - range[0] + 1,
                                    start: range[0],
                                    end: range[1],
                                    isWhole: range[0] === 0 && range[1] === 23
                                }
                                : {}
                        };
                    })
                );
                return days;
            }, []);
        }
    };

    attached() {
        this.showTip = e => {
            this.data.set('tooltipOpen', true);
            this.data.set('tooltipTarget', e.target);
        };
    }

    startPicking(dayIndex, hourIndex) {
        this.data.set('pickingStart', {dayIndex, hourIndex});
        this.data.set('pickingEnd', {dayIndex, hourIndex});
    }

    handleMousedown(dayIndex, hourIndex) {
        this.startPicking(dayIndex, hourIndex);
        this.updateCurrent(dayIndex, hourIndex);
    }

    handleHover(e, dayIndex, hourIndex) {
        this.markEnd(dayIndex, hourIndex);
        this.updateCurrent(dayIndex, hourIndex);
        this.showTip(e);
    }

    /**
     * 用来更新当前需要显示tooltip上的内容
     * @param  {number} dayIndex  星期
     * @param  {number} hourIndex 消失
     */

    updateCurrent(dayIndex, hourIndex) {
        let week = this.data.get('week');
        let current = {
            day: week[dayIndex],
            hour: hourIndex
        };
        this.data.set('current', current);
    }

    markEnd(dayIndex, hourIndex) {
        let pickingStart = this.data.get('pickingStart');
        if (!pickingStart) {
            return;
        }
        if (this.pickingStart && typeof dayIndex === 'undefined') {
            this.pickingStart = null;
            return;
        }
        let pickingEnd = {
            dayIndex, hourIndex
        };
        this.data.set('pickingEnd', pickingEnd);
    }

    pick() {
        let {pickingStart, pickingSelected} = this.data.get();
        if (pickingStart) {
            this.data.set('selected', pickingSelected);
            this.data.set('pickingStart', null);
            this.data.set('pickingEnd', null);
        }
        this.fire('select');
    }

    mergeRange(days, range) {
        return days.reduce((selected, day) => {
            let daySelected = selected[day];
            if (!daySelected) {
                selected[day] = [range];
            }
            else {
                selected[day] = merge(daySelected, range);
            }

            if (!selected[day] || !selected[day].length) {
                this.$delete(selected, day);
            }

            return selected;
        }, cloneDeep(this.localSelected) || {});
    }

    detached() {
    }

    toggleDay(e, day) {
        if (e.target.checked) {
            this.data.set(`selected[${day}]`, [[0, 23]]);
            return;
        }
        this.data.set(`selected[${day}]`, undefined);
    }

    selectShortcut(index) {
        let realShortcuts = this.data.get('realShortcuts');
        this.data.set('selected', realShortcuts[index].selected);
    }
}
