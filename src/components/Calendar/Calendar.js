/**
 * @file Calendar
 * @author liuchaofan <asd123freedom@gmail.com>
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon';
import moment from 'moment';
const cx = create('calendar');

export default class Calendar extends Component {
    static template = `
        <div class="{{computedClass}}">
            <slot name="before"></slot>
            <div class="{{panelItem|getPanelClass}}" s-for="panelItem, index in panels">
                <div class="${cx.getPartClassName('head')}">
                    <button type="button" class="${cx.getPartClassName('prev')}"
                        s-if="index === 0 || panelItem.view !== 'days'"
                        on-click="step(false, panelItem.view)"
                        disabled="{{disabled || readonly}}">
                        <ui-icon name="angle-left"/>
                    </button>
                    <button class="${cx.getPartClassName('select')}"
                        s-if="panelItem.view === 'days'"
                        on-click="setView(index, 'years')"
                        disabled="{{disabled || readonly}}">
                        <b>{{ panelItem.year }}</b>
                        年
                        <ui-icon name="angle-down-small"/>
                    </button>
                    <button class="${cx.getPartClassName('select')}"
                        s-if="panelItem.view === 'days'"
                        on-click="setView(index, 'months')"
                        disabled="{{disabled || readonly}}">
                        <b>{{ panelItem.month + 1 }}</b>
                        月
                        <ui-icon name="angle-down-small"/>
                    </button>
                    <span s-if="panelItem.view === 'months'" class="${cx.getPartClassName('label')}">
                        <b>{{panelItem.year}}</b>
                        年
                    </span>
                    <span s-if="panelItem.view === 'years'" class="${cx.getPartClassName('label')}">
                        <b>{{panelItem.year | getStartOfDecade}}–{{panelItem.year | getEndOfDecade}}</b>
                        年
                    </span>
                    <button s-if="index === panels.length - 1 || panelItem.view !== 'days'"
                        class="${cx.getPartClassName('next')}"
                        on-click="step(true, panelItem.view)"
                        disabled="{{disabled || readonly}}">
                        <ui-icon name="angle-right"></ui-icon>
                    </button>
                </div>
                <div class="{{bodyClass}}">
                    <table>
                        <thead s-if="panelItem.view === 'days'">
                            <tr>
                                <th s-for="dayName in dayNames">{{dayName}}</th>
                            </tr>
                        </thead>
                        <tbody s-if="panelItem.view === 'days'">
                            <tr s-for="week, index in panelItem.weeks">
                                <td
                                    s-for="day in week"
                                    class="{{day | getDateClass(panelItem)}}">
                                <button
                                    s-if="fillMonth && panel === 1 || day.month === panelItem.month"
                                    on-click="selectDay(day)"
                                    on-mouseenter="markEnd($event, day)"
                                    disabled="{{disabled || readonly || day.isDisabled}}">
                                    {{day.date}}
                                </button>
                                </td>
                            </tr>
                        </tbody>
                        <tbody s-if="panelItem.view === 'months'">
                            <tr s-for="i in monthRow">
                                <td s-for="j in monthCol" class="{{j | getMonthClass(i, panelItem)}}">
                                <button on-click="selectMonth(0, (i - 1) * 4 + j)">{{ (i - 1) * 4 + j }} 月</button>
                                </td>
                            </tr>
                        </tbody>
                        <tbody s-if="panelItem.view === 'years'">
                            <tr s-for="i in yearRow">
                                <td s-for="j in yearCol" class="{{j | getYearClass(i, panelItem)}}">
                                <button s-if="(i - 1) * 4 + j - 1 < 10"
                                    on-click="selectYear(0, panelItem.year, i, j)">
                                    {{ panelItem.year | getYearOfDecade(i, j) }}
                                </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <slot name="after"></slot>
        </div>
    `;

    static computed = {
        computedClass() {
            return cx(this).build();
        },

        panelClass() {
            return classnames(
                cx.getPartClassName('panel')
            );
        },

        bodyClass() {
            let multiple = this.data.get('multiple');
            let range = this.data.get('range');
            return classnames(
                cx.getPartClassName('body'),
                {[cx.getPartClassName('multiple-range')]: multiple && range}
            );
        },

        panels() {
            let panelNum = this.data.get('panel');
            let selected = this.data.get('selected');
            let today = this.data.get('today');
            let range = this.data.get('range');
            let multiple = this.data.get('multiple');
            let isDisabled = this.data.get('isDisabled');
            let panels = [];
            for (let i = 0; i < panelNum; i++) {
                let year = this.data.get('year');
                let month = (this.data.get('month') + i) % 12;
                // 处理跨年的情况
                year = year + Math.floor((month + i) / 12);
                let tempDate = moment().year(year).month(month);
                let beginDayOfMonth = moment(tempDate).startOf('month');
                let endDayOfMonth = moment(tempDate).endOf('month');
                let start = moment(beginDayOfMonth).startOf('week');
                let daysInMonth = endDayOfMonth.date() - beginDayOfMonth.date() + 1;
                let offset = beginDayOfMonth.day();
                let weekcount = Math.ceil((offset + daysInMonth) / 7);
                let rangeSelected = this.data.get('rangeSelected');

                let weeks = [];
                for (let i = 0; i < weekcount; i++) {
                    weeks[i] = [];
                    for (let j = 0; j < 7; j++) {
                        weeks[i].push({
                            date: start.date(),
                            month: start.month(),
                            year: start.year()
                        });
                        weeks[i][j].isToday = start.isSame(today, 'd');
                        weeks[i][j].isDisabled = isDisabled ? isDisabled(start.unix()) : false;
                        if (!range) {
                            if (!selected) {
                                weeks[i][j].isSelected = false;
                            }
                            else if (!multiple) {
                                weeks[i][j].isSelected = start.isSame(selected, 'd');
                            }
                            else {
                                weeks[i][j].isSelected = selected.some(item => start.isSame(item, 'd'));
                            }
                            weeks[i][j].isRange = false;
                        }
                        else if (!rangeSelected) {
                            weeks[i][j].isSelected = false;
                        }
                        else {
                            weeks[i][j].isSelected = start.isSame(rangeSelected[0], 'd')
                                || start.isSame(rangeSelected[1], 'd');
                            if (!rangeSelected[1]) {
                                weeks[i][j].isRange = false;
                            }
                            else {
                                weeks[i][j].isRange = (start.toDate() - rangeSelected[0])
                                    * (start.toDate() - rangeSelected[1]) < 0;
                            }
                            weeks[i][j].isRangeStart = start.isSame(rangeSelected[0]);
                            weeks[i][j].isRangeEnd = start.isSame(rangeSelected[1]);
                        }
                        start.add(1, 'd');
                    }
                }

                panels.push({weeks, year, month, view: 'days'});
            }
            return panels;
        }
    };

    static dataTypes = {
        selected: DataTypes.oneOfType([
            DataTypes.array,
            DataTypes.instanceOf(Date)
        ]),
        disabled: DataTypes.bool,
        range: DataTypes.bool
    };

    static filters = {
        getPanelClass(val) {
            let panelClass = cx.getPartClassName('panel');
            let suffixClass = cx.getPartClassName(val.view);
            return panelClass + ' ' + suffixClass;
        },

        getDateClass(day, panel) {
            let dateClass = this.data.get('dateClass') || ''; // TODO 能够自定义天的样式
            return classnames(
                dateClass,
                {
                    [cx.getPartClassName('day')]: day.month === panel.month,
                    [cx.getPartClassName('aux')]: day.month !== panel.month,
                    [cx.getPartClassName('today')]: day.isToday,
                    [cx.getPartClassName('selected')]: day.isSelected,
                    [cx.getPartClassName('in-range')]: day.isRange,
                    [cx.getPartClassName('range-start')]: day.isRangeStart,
                    [cx.getPartClassName('range-end')]: day.isRangeEnd
                }
            );
        },

        getMonthClass(j, i, panel) {
            let month = (i - 1) * 4 + j - 1;
            let today = this.data.get('today');
            let selected = this.data.get('selected');
            let range = this.data.get('range');
            return classnames({
                [cx.getPartClassName('today')]: month === today.getMonth() && panel.year === today.getFullYear(),
                [cx.getPartClassName('selected')]: (selected && !range)
                    ? (month === selected.getMonth() && panel.year === selected.getFullYear()) : false
            });
        },

        getYearClass(j, i, panel) {
            let year = panel.year - panel.year % 10 + (i - 1) * 4 + j - 1;
            let today = this.data.get('today');
            let selected = this.data.get('selected');
            let range = this.data.get('range');
            return classnames({
                [cx.getPartClassName('today')]: year === today.getFullYear(),
                [cx.getPartClassName('selected')]: (selected && !range)
                    ? year === selected.getFullYear() : false
            });
        },

        getStartOfDecade(year) {
            return year - year % 10;
        },

        getEndOfDecade(year) {
            return year - year % 10 + 9;
        },

        getYearOfDecade(year, i, j) {
            return year - year % 10 + (i - 1) * 4 + j - 1;
        }
    };

    static components = {
        'ui-icon': Icon
    };

    inited() {
        if (this.data.get('range')) {
            this.data.set('panel', 2);
        }
    }

    initData() {
        const dayNames = [
            '日', '一', '二', '三', '四', '五', '六'
        ];

        const monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];

        let today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();
        return {
            fillMonth: true,
            panel: 1,
            weekStart: 0,
            today,
            year,
            month,
            len: 0,
            dayNames,
            monthNames,
            monthRow: [1, 2, 3],
            monthCol: [1, 2, 3, 4],
            yearRow: [1, 2, 3],
            yearCol: [1, 2, 3, 4]
        };
    }

    attached() {
        this.watch('month', val => {
            let year = this.data.get('year');
            this.fire('viewChange', {
                year,
                month: val
            });
        });
    }

    handleInputSelected() {

    }

    setView(pIndex, name) {
        this.data.set(`panels[${pIndex}].view`, name);
    }

    selectMonth(pIndex, month) {
        this.data.set(`panels[${pIndex}].month`, month - 1);
        this.data.set('month', month - 1);
        this.setView(0, 'days');
    }

    selectYear(pIndex, year, i, j) {
        year = year - year % 10 + (i - 1) * 4 + j - 1;
        this.data.set('year', year);
        this.setView(0, 'days');
    }

    step(isNext, view) {
        let sign = isNext ? 1 : -1;
        let month = this.data.get('month');
        let year = this.data.get('year');
        let newMonth;
        switch (view) {
            case 'days':
                newMonth = month + sign;
                if (newMonth === -1 || newMonth === 12) {
                    year += sign;
                }
                month = (newMonth + 12) % 12;
                break;
            case 'months':
                year += sign;
                break;
            case 'years':
                year += sign * 10;
                break;
        }
        this.data.set('month', month);
        this.data.set('year', year);
    }

    selectDay(day) {
        let {date, month, year} = day;
        let range = this.data.get('range');
        let picking = this.data.get('picking');
        let selected = new Date(year, month, date);
        let fillMonth = this.data.get('fillMonth');
        let panelNum = this.data.get('panel');
        let multiple = this.data.get('multiple');
        let selectedResult = this.data.get('selected');
        if (fillMonth && panelNum === 1) {
            this.data.set('year', year);
            this.data.set('month', month);
        }
        if (!range) {
            if (!multiple) {
                this.data.set('selected', selected);
                this.fire('select', selected);
                return;
            }

            if (!selectedResult) {
                this.data.set('selected', [selected]);
            }
            else {
                this.data.push('selected', selected);
            }
            this.fire('select', this.data.get('selected'));
            return;

        }
        if (!picking) {
            picking = [selected, 0];
            this.fire('select-start', picking);
            this.data.set('picking', picking);
            this.data.set('rangeSelected', picking.slice(0));
            return;
        }
        picking[1] = selected;
        picking = picking.sort((d1, d2) => d1 - d2);
        this.data.set('rangeSelected', picking);
        this.data.set('selected', picking);
        this.data.set('picking', null);
        this.fire('select', picking);
    }

    markEnd($event, day) {
        let {range, picking} = this.data.get();
        if (range && picking) {
            let marked = day ? new Date(day.year, day.month, day.date) : null;
            if (!picking[1] || !moment(marked).isSame(picking[1], 'd')) {
                this.data.set('picking[1]', marked);
                picking = this.data.get('picking');
                picking.sort((d1, d2) => d1 - d2);
                this.data.set('rangeSelected', picking.slice(0));
            }
            this.fire('selectprogress', picking);
        }
    }

    isSelected(day) {
        let {selected, picking, range, multiple} = this.data.get();
        if (!range && !multiple) {
            return day.isSame(selected, 'd');
        }
        if (!range && multiple) {
            return selected.some(item => item.isSame(day, 'd'));
        }
        return day.isSame(picking[0], 'd') || day.isSame(picking[1], 'd');
    }
}
