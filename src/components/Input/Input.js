/**
 * @file Input
 * @author wangbing11
 *         liuchaofan
 */

import {Component} from 'san';
import {create} from '../../util/cx';
import classnames from 'classnames';
import Icon from '../Icon/';
const cx = create('input');


export default class Input extends Component {
    static template = `
        <div class="{{computedClass}}" prop-ui="{{ui}}">
            <template s-if="namedSlots.before">
                <div class="${cx.getPartClassName('before')}"></div>
            </template>
            <label class="${cx.getPartClassName('main')}">
                <span 
                    class="${cx.getPartClassName('placeholder')} {{placeholderShown ? '' : 'hidden'}}"
                    s-if="type !== 'hidden'">{{placeholder}}</span>
                <input
                    s-ref="input"
                    type="{{type}}"
                    class="${cx.getPartClassName('input')}"
                    disabled="{{disabled}}"
                    maxlength="{{maxlength}}"
                    readonly="{{readonly}}"
                    name="{{name}}"
                    selectOnFocus="{{selectOnFocus}}"
                    autocomplete="{{autocomplete}}"
                    composition="{{composition}}"
                    clearable="{{clearable}}"
                    value="{=value=}"
                    number="{{number}}"
                    autofocus="{{autofocus}}"
                    on-keyup="handleKeyup($event)"
                    on-keypress="handleKeypress($event)"
                    on-keydown="handleKeydown($event)"
                    on-focus="handleFocus($event)"
                    on-blur="handleBlur($event)"
                    on-input="handleInput($event)"
                    on-change="handleChange($event)"
                    on-compositionupdate="handleComposition"
                    on-compositionend="handleCompositionEnd"
                    />
            </label>
            <span
                s-if="clearable"
                class="${cx.getPartClassName('clear')} {{!editable || placeholderShown? 'hidden' : ''}}">
                <button type="button"
                    aria-label="清除"
                    class="${cx.getPartClassName('clear-button')}"
                    on-click="clear"
                    ><ui-icon name="{{'cross-small'}}"/></button>
            </span>
            <template s-if="namedSlots.after">
                <div class="${cx.getPartClassName('after')}"><slot name="after"/></div>
            </template>
        </div>
    `;

    static components = {
        'ui-icon': Icon
    };

    static trimWhitespace = 'all';

    static computed = {
        computedClass() {
            let focused = this.data.get('focused');
            let type = this.data.get('type');
            let autofill = this.data.get('autofill');
            let realReadonly = this.data.get('readonly');
            let realdisabled = this.data.get('disabled');
            return classnames(
                {
                    [cx(this).build()]: true,
                    [cx.getPartClassName('focused')]: focused,
                    [cx.getPartClassName('hidden')]: type === 'hidden',
                    [cx.getPartClassName('autofill')]: autofill,
                    'dux-readonly': realReadonly,
                    'dux-disabled': realdisabled
                }
            );
        },

        editable() {
            let readonly = this.data.get('readonly');
            let disabled = this.data.get('disabled');
            return !disabled && !readonly;
        },

        inputAttrs() {
            let selectOnFocus = this.data.get('selectOnFocus');
            let composition = this.data.get('composition');
            let clearable = this.data.get('clearable');

            return {
                selectOnFocus,
                composition,
                clearable
            };
        },

        placeholderShown() {
            // compositionValue 不会是数字 0
            let value = this.data.get('value');
            let compositionValue = this.data.get('compositionValue');
            return !compositionValue && (value == null || value === '');
        }
    };

    initData() {
        return {
            selectOnFocus: false,
            composition: false,
            clearable: false,
            focused: false,
            value: '',
            compositionValue: null,
            autofill: false,
            type: 'text',
            autocomplete: false
        };
    }

    inited() {
        const givenSlots = this.givenSlots || this.sourceSlots;
        let namedSlots = givenSlots && givenSlots.named;
        if (namedSlots && Object.keys(namedSlots).length) {
            let map = {};
            Object.keys(namedSlots).map(item => {
                map[item] = true;
                return item;
            });
            this.data.set('namedSlots', map);
        }
    }

    attached() {
        this.dispatch('UI:form-item-added');
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
        let type = this.data.get('type');
        let selectOnFocus = this.data.get('selectOnFocus');
        if (type !== 'hidden' && selectOnFocus) {
            e.target.select();
        }
        this.fire('focus', e);
    }
    handleBlur(e) {
        this.fire('blur', e);
        this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'blur'});
    }
    handleInput(e) {
        try {
            this.data.set('autofill', !!this.el.querySelector(':-webkit-autofill'));
        }
        catch (e) {
            console.error(e);
        }
        // 这里对齐veui，分2种情况
        // 1. 感知输入法，触发原生 input 事件就必须向上继续抛出
        // 2. 不感知输入法，在没有输入法状态的值的情况下需要向上抛出
        //
        // compositionupdate -> compositionend -> input
        let {composition, compositionValue} = this.data.get();
        if (composition || !compositionValue) {
            this.fire('input', e);
            this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'input'});
        }
    }
    handleChange(e) {
        this.fire('change', e);
        this.dispatch('UI:form-item-interact', {fieldValue: e.target.value, type: 'change'});
    }
    handleComposition($event) {
        this.data.set('compositionValue', $event.data);
    }
    handleCompositionEnd() {
        this.data.set('compositionValue', '');
    }
    active() {
        let editable = this.data.get('editable');
        if (editable) {
            this.ref('input').focus();
        }
    }
    focus() {
        this.ref('input').focus();
    }
    clear(e) {
        e.stopPropagation();
        this.data.set('value', '');
        this.data.set('compositionValue', '');
        this.focus();
        this.fire('input', '');
        this.dispatch('UI:form-item-interact', {fieldValue: '', type: 'input'});
    }
}
