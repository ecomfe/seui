/**
 * @file Progress
 * @author sqliang(hfutsqliang@gmail.com)
 */

import {Component, DataTypes} from 'san';
import classnames from 'classnames';
import {clamp} from 'lodash';
import {create} from '../../util/cx';

import Icon from '../Icon/Base';
const cx = create('line');

const RADIUS_DEFAULT = 60;
const STROKE_DEFAULT = 4;

export default class Progress extends Component {
    static template = `
        <div class="{{wrapClasses}}" ui="{{ui}}">
            <div s-if="type === 'bar'" class="${cx.getPartClassName('outer')}">
                <div class="${cx.getPartClassName('inner')}">
                    <div class="${cx.getPartClassName('bg')}" style="{{bgStyle}}"></div>
                </div>
            </div>

            <svg
                s-if="type === 'circular'"
                class="${cx.getPartClassName('circle')}"
                viewBox="0 0 {{width}} {{width}}"
                width="{{width}}"
                height="{{width}}">
                <circle
                    class="${cx.getPartClassName('trail')}"
                    cx="{{halfWidth}}"
                    cy="{{halfWidth}}"
                    r="{{circleRadius}}"
                    fill="none"
                    stroke-width="{{circleStrokeWidth}}" />

                <circle
                    class="${cx.getPartClassName('meter')}"
                    cx="{{halfWidth}}"
                    cy="{{halfWidth}}"
                    r="{{circleRadius}}"
                    fill="none"
                    stroke-width="{{circleStrokeWidth}}"
                    stroke-dasharray="{{circleDasharray}}"
                    stroke-dashoffset="{{circleDashoffset}}"
                    stroke-linecap="{{strokeLinecap}}" />
            </svg>

            <span s-if="desc" class="${cx.getPartClassName('desc')}">
                <slot var-percent="{{percent}}" var-value="{{value}}" var-status="{{currentStatus}}">
                    <span s-if="isAlert">
                        <ui-icon name="{{statusIcon}}" scale="{{scale}}"></ui-icon>
                    </span>
                    <span s-elif="isSuccess">
                        <ui-icon name="{{statusIcon}}" scale="{{scale}}"></ui-icon>
                    </span>
                    <span s-else class="${cx.getPartClassName('desc-text')}">
                        {{valueText}}
                    </span>
                </slot>
            </span>
        </div>
    `;

    static dataTypes = {
        // 进度条类型。可选值为 bar / circular ，分别是柱状和环形
        type: DataTypes.oneOf(['bar', 'circular']),
        // 进度值
        value: DataTypes.number,
        // 最小值
        min: DataTypes.number,
        // 最大值
        max: DataTypes.number,
        // 百分比保留的小数位数
        decimalPlace: DataTypes.number,
        // 进度条状态
        status: DataTypes.oneOf(['normal', 'active', 'info', 'alert', 'success']),
        // 进度条/进度环线宽
        strokeWidth: DataTypes.number,
        // 是否显示文字提示
        desc: DataTypes.bool,
        // 进度环半径
        radius: DataTypes.number,
        // 进度环顶端的形状 (可选 square, round ,默认为square)
        strokeLinecap: DataTypes.oneOf(['square', 'round'])
    };

    static components = {
        'ui-icon': Icon
    };

    static computed = {
        wrapClasses() {
            const currentStatus = this.data.get('currentStatus');
            const desc = this.data.get('desc');
            const type = this.data.get('type');
            return classnames(
                cx(this).build(),
                cx.getPartClassName(currentStatus),
                {
                    [cx.getPartClassName('show-info')]: desc
                },
                cx.getPartClassName(type)
            );
        },

        bgStyle() {
            const percent = this.data.get('percent');
            const strokeWidth = this.data.get('strokeWidth');
            return {
                width: `${percent}%`,
                height: `${strokeWidth}px`
            };
        },

        halfStroke() {
            const strokeWidth = this.data.get('strokeWidth');
            return strokeWidth / 2;
        },

        halfWidth() {
            const radius = this.data.get('radius');
            const halfStroke = this.data.get('halfStroke');
            return `${Math.round((radius + halfStroke) * 100) / 100}`
        },

        width() {
            const halfWidth = this.data.get('halfWidth');
            return halfWidth * 2;
        },

        // 周长
        circumference() {
            const radius = this.data.get('radius');
            return 2 * Math.PI * radius;
        },

        circleRadius() {
            const radius = this.data.get('radius');
            return `${Math.round(radius * 100) / 100}`;
        },

        circleStrokeWidth() {
            const strokeWidth = this.data.get('strokeWidth');
            return `${Math.round(strokeWidth * 100) / 100}`;
        },

        circleDasharray() {
            const circumference = this.data.get('circumference');
            return `${Math.round(circumference * 100) / 100}`;
        },

        circleDashoffset() {
            const circumference = this.data.get('circumference');
            const ratio = this.data.get('ratio');
            return `${Math.round(circumference * (1 - ratio) * 100) / 100}`;
        },

        scale() {
            const type = this.data.get('type');
            const ui = this.data.get('ui');
            return type === 'bar' || ui === 'tiny' ? 1 : 3;
        },

        valueText() {
            const percent = this.data.get('percent');
            const decimalPlace = this.data.get('decimalPlace');

            return `${percent.toFixed(decimalPlace)} %`;
        },

        statusIcon() {
            const currentStatus = this.data.get('currentStatus');
            const type = this.data.get('type');
            const iconNameMap = {
                'bar-alert': 'cross-circle-o',
                'bar-success': 'check-circle-o',
                'circular-alert': 'cross',
                'circular-success': 'check'
            };
            return iconNameMap[`${type}-${currentStatus}`] || '';
        },

        realValue() {
            const value = this.data.get('value');
            const min = this.data.get('min');
            const max = this.data.get('max');
            return clamp(value, min, max);
        },

        ratio() {
            const realValue = this.data.get('realValue');
            const min = this.data.get('min');
            const max = this.data.get('max');
            return (realValue - min) / (max - min);
        },

        percent() {
            const ratio = this.data.get('ratio');
            return ratio * 100;
        },

        isAlert() {
            const currentStatus = this.data.get('currentStatus');
            return currentStatus === 'alert';
        },

        isSuccess() {
            const currentStatus = this.data.get('currentStatus');
            return currentStatus === 'success';
        }
    };

    initData() {
        return {
            type: 'bar',
            value: 0,
            min: 0,
            max: 1,
            decimalPlace: 0,
            status: 'normal',
            strokeWidth: STROKE_DEFAULT,
            desc: true,
            radius: RADIUS_DEFAULT,
            strokeLinecap: 'square'
        };
    }

    inited() {
        const ui = this.data.get('ui');
        if (ui === 'tiny') {
           this.data.set('strokeWidth', 2);
           this.data.set('radius', 13);
        }
    }

    attached() {
        const status = this.data.get('status');
        this.data.set('currentStatus', status);
        this.handleStatus();

        this.watch('percent', percent => {
            this.handleStatus(percent < 100);
        });
        this.watch('status', val => {
            this.data.set('currentStatus', val);
        });
    }

    handleStatus(isDown) {
        if (isDown) {
            const status = this.data.get('status');
            this.data.set('currentStatus', status);
        }
        else {
            const percent = this.data.get('percent');
            if (parseInt(percent, 10) === 100) {
                this.data.set('currentStatus', 'success');
            }
        }
    }
}
