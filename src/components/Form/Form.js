/**
 * @file Form
 * @author wangbing11
 */
import {Component, DataTypes} from 'san';
import {create} from '../../util/index';
import classNames from 'classnames';
import {cloneDeep, pick} from 'lodash';
const cx = create('form');
export default class extends Component {
    static template = `
        <form on-submit="handleSubmit" on-reset="handleReset" class="{{computedClass}}" prop-ui="{{ui}}">
            <slot></slot>
        </form>
    `;

    static dataTypes = {
        // 标签位置，可以为 top, right, left
        // labelPosition: DataTypes.oneOf(['', 'right', 'left', 'top']),
        // 验证规则
        rules: DataTypes.object,
        // 标签宽度
        labelWidth: DataTypes.string,
        // 验证前的钩子函数
        // beforeValidate: DataTypes.function,
        // 验证后的钩子函数
        // afterValidate: DataTypes.function,
        // 禁用
        disabled: DataTypes.bool,
        // 只读
        readonly: DataTypes.bool
    };

    static messages = {
        'UI:form-add-field'(arg) {
            let fields = this.fields || [];
            if (arg.target) {
                fields.push(arg.target);
            }
            this.fields = fields;
        },
        'UI:form-remove-field'(arg) {
            let fields = this.fields || [];
            if (arg.target) {
                fields.splice(fields.indexOf(arg.target), 1);
            }
        }
    };

    static computed = {

        /**
         * 设置错误信息和错误状态
         *
         * @return {string} class 字符串
         */
        computedClass() {
            let inline = this.data.get('inline');
            let size = this.data.get('ui');
            return classNames(
                cx(this).build(),
                {[cx.getPartClassName('inline')]: inline},
                {[cx.getPartClassName(size)]: size === 'small' || size === 'large'}
            );
        }
    };

    initData() {
        return {
            labelPosition: 'left',
            beforeValidate: () => {},
            afterValidate: () => {}
        };
    }

    inited() {
        let formModel = this.data.get('formModel');
        if (formModel) {
            this.initFormModel = cloneDeep(formModel);
        }

        /*
        this.watch('labelPosition', labelPosition => {
            let fields = this.fields || [];
            fields.forEach(field => {
                field.setFormLabelPosition();
            });
        });
        */

        /*
        this.watch('labelWidth', labelWidth => {
            let fields = this.fields || [];
            fields.forEach(field => {
                field.setFormLabelWidth();
            });
        });
        */

        this.watch('rules', rules => {
            let fields = this.fields || [];
            fields.forEach(field => {
                field.setFormRules();
            });
        });
    }

    /**
     * 对整个表单进行数据验证
     *
     * @param {Function} callback 验证完成后的回调函数
     */
    validate(modelData) {
        let fields = this.fields || [];
        fields = fields.filter(item => {
            let innerTarget = item.innerTarget;
            return innerTarget && !innerTarget.data.get('disabled')
                || !item.data.get('disabled');
        });
        let propArray = fields.map(item => item.data.get('prop'));
        let formModel = modelData || this.data.get('formModel');
        formModel = formModel || {};
        let realData = pick(formModel, propArray);
        this.validateStatus = 'validating';

        return Promise.all([
            ...fields.map(field => {
                let prop = field.data.get('prop');
                let value = realData[prop];
                return new Promise(resolve => {
                    field.validate(value, errors => {
                        resolve(errors);
                    });
                });
            })
        ])
        .then(res => {
            this.validateStatus = 'validateEnd';
            res = res.filter(item => item !== '');
            if (res.length) {
                return res;
            }
            return true;
        });

    }

    /**
     * 对单个字段进行数据验证
     *
     * @param {string} prop 需要验证的字段名
     */
    validateField(prop) {
        let fields = this.fields || [];
        let formModel = this.data.get('formModel') || {};
        let field = fields.find(field => field.data.get('prop') === prop);
        let value = formModel[prop];

        return new Promise(resolve => {
            field.validate(value, errors => {
                resolve(errors);
            });
        });
    }

    // 重置整个表单
    resetFields() {
        if (this.validateStatus === 'validating') {
            return;
        }
        let fields = this.fields || [];
        if (this.initFormModel) {
            this.data.set('formModel', cloneDeep(this.initFormModel));
        }
        fields.forEach(field => {
            field.resetField();
        });
    }

    handleSubmit(e) {
        return new Promise(resolve => {
            let beforeValidate = this.data.get('beforeValidate');
            beforeValidate.bind(this);
            beforeValidate();
            resolve(beforeValidate());
        })
        .then(() => this.validate())
        .then(res => {
            let afterValidate = this.data.get('afterValidate');
            afterValidate.bind(this);
            afterValidate(res);
            if (res.length) {
                this.fire('invalid', res);
            }
            else {
                this.fire('submit', this.data.get('formModel'));
            }
        })
        .catch(e => {
            this.fire('invalid', e);
        });
    }

    submit() {
        this.handleSubmit();
    }

    handleReset() {
        this.resetFields();
    }
}
