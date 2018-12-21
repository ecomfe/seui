/**
 * @file FormItem
 * @author wangbing11
 *         asd123freedom@gmail.com
 */

import san, {Component, DataTypes} from 'san';
import {create} from '../../util/index';
import Icon from '../Icon';
import classNames from 'classnames';
import AsyncValidator from 'async-validator';
const cx = create('form-item');
export default class extends Component {
    /* eslint-disable max-len */
    static template = `
        <div class="{{formItemClass}}" prop-ui="{{ui}}">
            <label
                s-if="label || hasLabelSlot"
                for="{{prop}}"
                class="${cx.getPartClassName('label')}">
                <slot name="label">{{label}}</slot>
            </label><!--
            --><slot></slot><!--
            --><div s-if="tip || hasTipSlot" class="${cx.getPartClassName('tip')}">
                <slot name="tip">{{tip}}</slot>
            </div><!--
            --><div class="${cx.getPartClassName('content')}">
               <div class="${cx.getPartClassName('content')}-{{contentObj.class}}">
                    <ui-icon
                        san-if="!!validateIcon && hasValidateIcon"
                        name="{{validateIcon.name}}"
                        spin="{{validateIcon.spin}}"
                    ></ui-icon><!--
                    --><template s-if="validateState === 'error'"><slot name="error"  var-text="contentObj.innerText">{{text}}</slot></template><!--
                    --><template s-if="validateState === 'validating'"><slot name="validating"  var-text="contentObj.innerText">{{text}}</slot></template><!--
                    --><template s-if="validateState === 'success'"><slot name="success" var-text="contentObj.innerText">{{text}}</slot></template>
                </div>
            </div>
        </div>
    `;
    /* eslint-enable max-len */

    static dataTypes = {
        // 是否必填
        require: DataTypes.bool,
        // label值
        label: DataTypes.string,
        // label宽度
        labelWidth: DataTypes.string,
        // 字段name
        prop: DataTypes.string,
        // 验证规则
        rules: DataTypes.array,
        // 错误信息
        error: DataTypes.string,
        // 提示信息
        helpText: DataTypes.string,
        // 标签位置
        labelPosition: DataTypes.oneOf(['', 'right', 'left', 'top'])
    };

    static components = {
        'ui-icon': Icon
    };

    static trimWhitespace = 'all';

    static messages = {
        'UI:form-item-interact'({value}) {
            let {fieldValue, type} = value;
            let map = this.data.get('interactiveRulesMap');
            // 没有指定triggers的事件被过滤，统一在submit的时候触发
            if (!map[type]) {
                return;
            }
            san.nextTick(() => {
                this.validate(fieldValue);
            });
        },
        'UI:form-item-added'(val) {
            this.innerTarget = val.target;
        }
    }

    static computed = {

        /**
         *  组件的class
         *
         * @return {string} 组件的class
         */
        formItemClass() {
            let validateState = this.data.get('validateState');
            let isRequired = this.data.get('isRequired');
            let label = this.data.get('label');
            let hasLabelSlot = this.data.get('hasLabelSlot');
            let tip = this.data.get('tip');
            let hasTipSlot = this.data.get('hasTipSlot');
            return classNames(
                cx(this).build(),
                // {[cx.getPartClassName(labelPosition)]: labelPosition === 'top' || labelPosition === 'right'},
                {['is-error']: validateState === 'error'},
                {['invalid']: validateState === 'error'},
                {[cx.getPartClassName('no-label')]: !label && !hasLabelSlot},
                {['no-tip']: !tip && !hasTipSlot},
                {['is-validating']: validateState === 'validating'},
                {['is-require']: isRequired},
            );
        },

        /**
         * label 元素的样式
         *
         * @return {string} label 元素的样式
         */
        labelStyle() {
            let labelPosition = this.data.get('computedLabelPosition');
            if (labelPosition === 'top') {
                return '';
            }
            let labelWidth = this.data.get('computedLabelWidth') || '120px';
            return 'width:' + labelWidth;
        },

        /**
         * content 元素的innerText 和 class 信息
         *
         * @return {Object} content 元素的innerText 和 class 信息
         */
        contentObj() {
            let validateState = this.data.get('validateState');
            let helpText = this.data.get('helpText');
            let validateMessage = this.data.get('validateMessage');
            let map = {
                error: {
                    'innerText': validateMessage,
                    'class': 'error'
                },
                validating: {
                    'innerText': '验证中...',
                    'class': 'error'
                },
                success: {
                    'innerText': helpText,
                    'class': 'help-text'
                }
            };
            return map[validateState];
        },

        /**
         * 验证信息图标的 name 和 spin（是否时针转动动画）
         *
         * @return {Object} 验证信息图标的 name 和 spin（是否时针转动动画）
         */
        validateIcon() {
            let validateState = this.data.get('validateState');
            let map = {
                error: {
                    name: 'exclamation-circle-o',
                    spin: false
                },
                validating: {
                    name: 'loading',
                    spin: true
                }
            };
            return map[validateState];
        },

        /**
         * content 元素的 style 信息
         *
         * @return {string} content 元素的 style 信息
         */
        formContentStyle() {
            let labelPosition = this.data.get('computedLabelPosition');
            if (labelPosition === 'top') {
                return '';
            }
            // let labelWidth = this.data.get('computedLabelWidth') || '0px';
            let labelWidth = '0px';
            return 'margin-left:' + labelWidth;
        },

        /**
         * 是否是必填项
         *
         * @return {boolean} 是否是必填项
         */
        isRequired() {
            let rules = this.data.get('mergedRules');
            let isRequired = false;
            if (rules && rules.length) {
                rules.every(rule => {
                    if (rule.required) {
                        isRequired = true;
                        return false;
                    }
                    return true;
                });
            }
            return isRequired;
        },

        /**
         * 组合后的验证规则
         *
         * @return {Object} 组合后的验证规则
         */
        mergedRules() {
            // 此处需要对rules 进行merge，如果有 require 属性且rules中没有，则需添加一条必填规则
            let require = this.data.get('require');
            let rules = this.data.get('rules') || [];
            let label = this.data.get('label') || '';
            let isRulesHasRequire = rules.some(item => item.required);
            if (require && !isRulesHasRequire) {
                // 插入的require规则的优先级为最高
                rules.splice(0, 0, {required: true, message: label + '必填'});
            }
            return rules;
        },
        interactiveRulesMap() {
            let map = {};
            let rules = this.data.get('rules');
            if (rules && rules.length) {
                rules.forEach(({triggers, name, message, value}) => {
                    if (!triggers) {
                        return;
                    }

                    triggers = triggers.split(',');
                    triggers.forEach(eventName => {
                        if (eventName === 'submit') {
                            return;
                        }

                        let item = {
                            value,
                            name,
                            message
                        };
                        if (map[eventName]) {
                            map[eventName].push(item);
                        }
                        else {
                            map[eventName] = [item];
                        }
                    });
                });
            }
            return map;
        }
    }

    inited() {

        /**
         * 当前正在进行的验证的计数，不对外暴露
         * 考虑在异步验证中，比如CheckboxGroup，用户很快的点击了三个选项，
         * 从而触发了三次验证，该计数是在每个验证触发时加一，在每个验证的回调
         * 函数执行后减一，当计数为零时表示所有验证已经结束。
         */
        this.validatingNum = 0;
        let error = this.data.get('error');

        this.setFormLabelPosition();
        this.setFormLabelWidth();
        this.setFormRules();

        if (error) {
            this.setError(error);
        }
        this.watch('error', error => {
            this.setError(error);
        });

        this.watch('labelPosition', labelPosition => {
            this.setFormLabelPosition();
        });

        this.watch('labelWidth', labelWidth => {
            this.setFormLabelWidth();
        });

        this.watch('rules', rules => {
            this.setFormRules();
        });

        this.watch('disabeld', val => {
            this.innerTarget && this.innerTarget.data.set('disabled', val);
        });
    }

    initData() {
        return {
            // 是否必须
            required: false,
            // 验证规则
            rules: [],
            // 验证提示信息
            validateMessage: '',
            // 验证状态:空字符串 error success validating
            validateState: 'success',
            // 验证状态为空字符串时展示提示信息
            helpText: '',
            // 标签位置
            labelPosition: '',
            // 是否显示提示信息的图标
            hasValidateIcon: true
        };
    }

    attached() {
        this.dispatch('UI:form-add-field');
        const givenSlots = this.givenSlots || this.sourceSlots;
        this.givenSlots.named = givenSlots.named || {};
        this.data.set('hasLabelSlot', !!givenSlots.named.label);
        this.data.set('hasTipSlot', !!givenSlots.named.tip);
        let disabled = this.data.get('disabled');
        this.innerTarget && this.innerTarget.data.set('disabled', disabled);
    }

    detached() {
        this.dispatch('UI:form-remove-field');
    }

    /**
     * 进行数据验证
     *
     * @param {any} value 需要验证的值
     * @param {Function} callback 验证成功后的回调函数
     * @return {boolean} 如果不需要验证，直接返回 true
     */
    validate(value, callback = function () {}) {
        let rules = this.data.get('mergedRules');
        let prop = this.data.get('prop');
        if (!prop || !rules || rules.length === 0) {
            callback('');
            return true;
        }

        this.data.set('validateState', 'validating');
        this.validatingNum++;

        let descriptor = {};
        descriptor[prop] = rules;
        let validator = new AsyncValidator(descriptor);
        let model = {};
        model[prop] = value || '';
        validator.validate(model, {firstFields: true}, (errors, fields) => {
            this.validatingNum--;
            if (this.validatingNum === 0) {
                this.data.set('validateState', !errors ? 'success' : 'error');
                this.data.set('validateMessage', errors ? errors[0].message : '');
                callback(errors ? errors[0].message : '');
            }
        });
    }

    // 在表单重置时，重置 formItem 的状态
    resetField() {
        this.data.set('validateMessage', '');
        this.data.set('validateState', 'success');
    }

    // 同步 form 组件上的  labelPosition 属性到 form-item 上
    setFormLabelPosition() {
        let parentComponent = this.parentComponent;
        let formLabelPosition = parentComponent.data.get('labelPosition');
        let labelPosition = this.data.get('labelPosition');
        this.data.set('computedLabelPosition', labelPosition || formLabelPosition);
    }

    // 同步 form 组件上的  labelPosition 属性到 form-item 上
    setFormLabelWidth() {
        let parentComponent = this.parentComponent;
        let formLabelWidth = parentComponent.data.get('labelWidth');
        let labelWidth = this.data.get('labelWidth');
        this.data.set('computedLabelWidth', labelWidth || formLabelWidth);
    }

    // 同步 form 组件上的 rules 规则到 form-item 上
    setFormRules() {
        let parentComponent = this.parentComponent;
        let prop = this.data.get('prop');
        let rules = this.data.get('rules');
        let formRules = parentComponent.data.get('rules');
        if (prop && formRules && formRules[prop]) {
            this.data.set('rules', rules.concat(formRules[prop]));
        }
    }

    /**
     * 设置错误信息和错误状态
     *
     * @param {string} error 错误信息
     */
    setError(error) {
        this.data.set('validateMessage', error);
        this.data.set('validateState', 'error');
    }
}
