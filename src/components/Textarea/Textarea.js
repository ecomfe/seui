/**
 * @file Textarea
 */

import {Component, DataTypes} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';

const cx = create('textarea');

// TODO:
// 1. disabled, readonly属性名字跟veui不一致，为realDisabled 和 realReadonly

export default class Textarea extends Component {

    static template = `
        <div class="{{computedClassName}}" prop-ui="{{ui}}">
            <div
                s-if="lineNumber"
                s-ref="measurer"
                class="${cx.getPartClassName('measurer')}">
                <div
                    class="${cx.getPartClassName('measurer-line')}"
                    s-for="line, index in lines">
                    <div
                        class="${cx.getPartClassName('measurer-line-number')}"
                        style="width: {{lineNumberWidth}}px">
                        {{index + 1}}
                    </div>
                    <div
                        class="${cx.getPartClassName('measurer-line-content')}"
                        aria-hidde="true">
                        {{line}}
                    </div>
                </div>
            </div>
            <textarea
                s-ref="input"
                class="${cx.getPartClassName('input')}"
                value="{= value =}"
                style="{{textareaStyles}}"
                placeholder="{{placeholder}}"
                rows="{{normalizedRows}}"
                autofocus="{{autofocus}}"
                disabled="{{realDisabled}}"
                readonly="{{realReadonly}}"
                on-click="handleClick($event)"
                on-keyup="handleKeyup($event)"
                on-keypress="handleKeypress($event)"
                on-keydown="handleKeydown($event)"
                on-focus="handleFocus($event)"
                on-blur="handleBlur($event)"
                on-input="handleInput($event)"
                on-scroll="syncScroll($event)"
                on-change="handleChange($event)">
            </textarea>
        </div>
    `;

    static computed = {
        computedClassName() {
            let focused = this.data.get('focused');
            let normalizedRows = this.data.get('normalizedRows');
            let realReadonly = this.data.get('realReadonly');
            let realDisabled = this.data.get('realDisabled');
            return classnames(
                cx(this).build(),
                {[cx.getPartClassName('focused')]: focused},
                {[cx.getPartClassName('rows')]: normalizedRows > 0},
                {[cx.getPartClassName('readonly')]: realReadonly},
                {[cx.getPartClassName('disabled')]: realDisabled}
            );
        },
        normalizedRows() {
            let rows = Number(this.data.get('rows'));
            return isNaN(rows) ? null : rows;
        },
        lines() {
            return this.data.get('value').split('\n').map(line => line || `\u200b${line}`);
        },
        digits() {
            const log10 = Math.log10 || function (x) {
                return Math.log(x) * Math.LOG10E;
            };
            return Math.floor(log10(this.data.get('lines').length)) + 1;
        },
        lineNumberWidth() {
            return this.data.get('digits') * 8 + 12;
        },
        textareaStyles() {
            let lineNumber = this.data.get('lineNumber');
            let lineNumberWidth = this.data.get('lineNumberWidth');
            let autoresize = this.data.get('autoresize');
            let height = this.data.get('height');
            let styles = [];
            if (lineNumber) {
                styles.push(`width: calc(100% - ${lineNumberWidth}px)`);
            }
            if (autoresize && height) {
                styles.push(`height: ${height}px`);
            }
            return styles.join(';');
        }
    };

    static dataTypes = {
        ui: DataTypes.string,
        placeholder: DataTypes.string,
        value: DataTypes.string,
        lineNumber: DataTypes.bool,
        rows: DataTypes.oneOfType([DataTypes.number, DataTypes.string]),
        autofocus: DataTypes.bool,
        selectOnFocus: DataTypes.bool,
        composition: DataTypes.bool,
        resizable: DataTypes.bool,
        autoresize: DataTypes.bool
    };

    initData() {
        return {
            focused: false,
            height: 0
        };
    }

    attached() {
        this.watch('value', val => {
            this.syncHeight();
        });
        this.syncHeight();
    }

    syncHeight() {
        if (this.data.get('autoresize')) {
            this.data.set('height', 0);
            this.nextTick(() => {
                this.data.set('height', this.ref('input').scrollHeight);
            });
        }
    }

    handleClick(e) {
        this.fire('click', e);
    }

    handleKeyup(e) {
        if (e.code === 'Enter' || e.key === 'Enter' || e.keyCode === 13) {
            this.fire('keyup-enter', e);
        }
        this.fire('keyup', e);
    }

    handleKeypress(e) {
        this.fire('keypress', e);
    }

    handleKeydown(e) {
        this.fire('keydown', e);
    }

    handleFocus(e) {
        this.data.set('focused', true);
        this.fire('focus', e);
    }

    handleBlur(e) {
        this.data.set('focused', false);
        this.fire('blur', e);
        this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'blur'});
    }

    handleInput(e) {
        this.fire('input', e);
        this.syncScroll();
    }

    handleChange(e) {
        this.fire('change', e.target.value, e);
        this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'change'});
    }

    syncScroll() {
        let input = this.ref('input');
        let measurer = this.ref('measurer');
        if (input && measurer) {
            this.nextTick(() => {
                measurer.scrollTop = input.scrollTop;
            });
        }
    }

    focus() {
        this.ref('input').focus();
    }

    activate() {
        this.ref('input').focus();
    }
}