/**
 * @file Searchbox
 * @author funa01
 */

import {Component, DataTypes} from 'san';
import {includes} from 'lodash';

import {create} from '../../util/cx';
import Input from '../Input';
import Button from '../Button';
import Icon from '../Icon';
import Popover from '../Popover';
import {Option} from '../Select';

const cx = create('searchbox');

export default class Searchbox extends Component {
    static components = {
        'ui-input': Input,
        'ui-button': Button,
        'ui-icon': Icon,
        'ui-popover': Popover,
        'ui-option': Option
    };

    static template = `
        <div class="{{computedClass}}" ui="{{ui}}">
            <div class="${cx.getPartClassName('input')}">
                <ui-input
                    s-ref="input"
                    ui="{{uiSize}}"
                    name="{{name}}"
                    placeholder="{{placeholder}}"
                    value="{=value=}"
                    readonly="{{readonly}}"
                    disabled="{{disabled}}"
                    autofocus="{{autofocus}}"
                    composition="{{composition}}"
                    selectOnFocus="{{selectOnFocus}}"
                    on-focus="handleFocus"
                    on-input="handleInput"
                    on-keyup-enter="search"></ui-input>

                <div class="${cx.getPartClassName('icons')}" s-ref="icons">
                    <ui-button
                        class="${cx.getPartClassName('button')}"
                        ui="link {{uiSize}}"
                        disabled="{{readonly || disabled}}"
                        on-click="clearValue"
                    ><ui-icon
                        class="{{clearIconClass}}"
                        name="cross-small"></ui-icon></ui-button>
                    <ui-button
                        class="${cx.getPartClassName('button')}"
                        ui="link"
                        disabled="{{readonly || disabled}}"
                        on-click="search"
                    ><ui-icon class="${cx.getPartClassName('search-icon')}"
                        name="search"></ui-icon></ui-button>
                    <ui-button
                        class="${cx.getPartClassName('search-button')}"
                        ui="primary {{uiSize}}"
                        readonly="{{readonly}}"
                        disabled="{{disabled}}"
                        on-click="search">搜索</ui-button>
                </div>
            </div>

            <ui-popover
                overlayClass="{{overlayClass}}"
                open="{=localExpanded=}"
                anchorOrigin="bl"
                targetOrigin="tl"
                getAnchor="{{getAnchor}}">
                <slot name="suggestions">
                    <div ui="{{ui}}" class="${cx.getPartClassName('suggestions')}">
                        <div s-for="suggestion, index in formattedSuggestions"
                            class="${cx.getPartClassName('suggestion-item')}"
                            on-click="handleSelectSuggestion(suggestion)">
                            {{suggestion.label}}
                        </div>
                    </div>
                </slot>
            </ui-popover>
        </div>
    `;

    static computed = {
        computedClass() {
            let disabled = this.data.get('disabled');
            let clearable = this.data.get('clearable');
            return cx(this)
                .addStates({
                    disabled,
                    clearable
                })
                .build();
        },

        clearIconClass() {
            let show = this.data.get('clearable') && this.data.get('value').length > 0;
            return cx(this)
                .setPart('clear-icon')
                .addStates({hide: !show})
                .build();
        },

        uiSize() {
            let ui = this.data.get('ui');
            if (ui.indexOf('large') > -1) {
                return 'large';
            }
            else if (ui.indexOf('small') > -1) {
                return 'small';
            }

            return '';
        },

        formattedSuggestions() {
            let suggestions = this.data.get('suggestions');
            return suggestions.map(suggestion => {
                if (typeof suggestion === 'string') {
                    return {
                        label: suggestion,
                        value: suggestion
                    };
                }
                return suggestion;
            });
        },

        suggestTriggers() {
            const suggestTrigger = this.data.get('suggestTrigger');
            if (Array.isArray(suggestTrigger)) {
                return suggestTrigger;
            }
            return [suggestTrigger];
        },

        localExpanded() {
            const expanded = this.data.get('expanded');
            const suggestions = this.data.get('suggestions');
            return expanded && suggestions && suggestions.length > 0;
        }
    };

    static dataTypes = {
        ui: DataTypes.string,
        name: DataTypes.string,
        value: DataTypes.string,
        placeholder: DataTypes.string,
        disabled: DataTypes.bool,
        readonly: DataTypes.bool,
        clearable: DataTypes.bool,
        autofocus: DataTypes.bool,
        composition: DataTypes.bool,
        selectOnFocus: DataTypes.bool,
        suggestions: DataTypes.array,
        valueProperty: DataTypes.string,
        replaceOnSelect: DataTypes.bool,
        suggestTrigger: DataTypes.oneOfType([
            DataTypes.oneOf(['focus', 'input', 'submit']),
            DataTypes.array
        ])
    };

    initData() {
        return {
            ui: '',
            value: '',
            disabled: false,
            readonly: false,
            clearable: false,
            autofocus: false,
            composition: true,
            selectOnFocus: false,
            suggestions: [],
            suggestTrigger: 'input',
            getAnchor: this.getAnchor.bind(this),
            valueProperty: 'value',
            replaceOnSelect: true
        };
    }

    attached() {
        this.setInputPaddingRight();
    }

    setInputPaddingRight() {
        let searchInput = this.ref('input').el.querySelector('input');
        searchInput.style.paddingRight = `${this.ref('icons').clientWidth}px`;
    }

    getAnchor() {
        return this.el;
    }

    clearValue() {
        this.data.set('value', '');
        const suggestTriggers = this.data.get('suggestTriggers');
        if (includes(suggestTriggers, 'focus') || includes(suggestTriggers, 'input')) {
            this.fire('suggest', '');
        }
        this.fire('clear', '');
    }

    handleFocus(event) {
        const suggestTriggers = this.data.get('suggestTriggers');
        this.allowSuggest(suggestTriggers, 'focus', event.target.value);
    }

    handleInput(e) {
        this.fire('input', e.target.value);
        const suggestTriggers = this.data.get('suggestTriggers');
        const triggerType = includes(suggestTriggers, 'focus') ? 'focus' : 'input';
        this.allowSuggest(suggestTriggers, triggerType, e.target.value);
    }

    search(event) {
        let value = event.type === 'keyup'
            ? event.target.value : this.data.get('value');
        this.fire('search', value);

        const suggestTriggers = this.data.get('suggestTriggers');
        const hadInputFocusTrigger = includes(suggestTriggers, 'focus') || includes(suggestTriggers, 'input');
        if (includes(suggestTriggers, 'submit')) {
            this.allowSuggest(suggestTriggers, 'submit', value);
        }
        else if (hadInputFocusTrigger) {
            this.disAllowSuggest();
        }
    }

    allowSuggest(suggestTriggers, triggerType, value) {
        if (includes(suggestTriggers, triggerType)) {
            this.data.set('expanded', true);
            this.fire('suggest', value);
        }
    }

    disAllowSuggest() {
        this.data.set('expanded', false);
        this.data.get('suggestions', []);
    }

    handleSelectSuggestion(suggestion) {
        let {
            replaceOnSelect,
            valueProperty
        } = this.data.get();

        if (replaceOnSelect) {
            this.data.set('value', suggestion[valueProperty]);
        }

        this.fire('select', suggestion);
    }
}