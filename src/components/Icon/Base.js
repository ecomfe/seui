/**
 * @file BaseIcon inspired by https://github.com/Justineo/vue-awesome
 * @author liuchaofan
 */

import {Component, DataTypes} from 'san';
import classnames from 'classnames';
import getIcon from './config';
import {create} from '../../util/cx';

const cx = create('icon');

export default class BaseIcon extends Component {
    static template = `
        <svg version="1.1" class="{{computedClass}}"
            role="{{label ? 'img' : 'presentation'}}"
            aria-label="label" width="{{width}}" height="{{height}}"
            viewBox="{{box}}"
            prop-style="{{computedStyle}}">
            <slot name="icon">
                <path s-if="icon && icon.paths" s-for="path in icon.paths" d="{{path.d}}"/>
                <polygon s-if="icon && icon.polygons" s-for="polygon in icon.polygons"
                    points="{{polygon.points}}"/>
                <g s-if="icon && icon.raw" s-html="icon.raw"></g>
            </slot>
        </svg>
    `

    static dataTypes = {
        name: DataTypes.string,
        scale: DataTypes.number,
        inverse: DataTypes.bool,
        pulse: DataTypes.bool,
        label: DataTypes.string,
        flip(props, propName) {
            let val = props[propName];
            return val === 'horizontal' || val === 'vertical';
        }
    };

    static trimWhitespace = 'all';

    initData() {
        return {
            childrenWidth: 0,
            childrenHeight: 0,
            outerScale: 1
        };
    }

    static computed = {
        normalizedScale() {
            let scale = this.data.get('scale');
            scale = scale === undefined ? 1 : scale;
            let outerScale = this.data.get('outerScale');
            return scale * outerScale;
        },

        computedClass() {
            let spin = this.data.get('spin');
            let flip = this.data.get('flip');
            let inverse = this.data.get('inverse');
            let pulse = this.data.get('pulse');
            let normalClass = this.data.get('normalClass');
            return classnames(
                cx(this).build(),
                {[normalClass]: normalClass},
                'fa-icon',
                {'fa-spin': spin},
                {'fa-flip-horizontal': flip === 'horizontal'},
                {'fa-flip-vertical': flip === 'vertical'},
                {'fa-inverse': inverse},
                {'fa-pulse': pulse}
            );
        },

        icon() {
            let name = this.data.get('name');
            if (name) {
                return getIcon(name);
            }
            return null;
        },

        box() {
            let icon = this.data.get('icon');
            let width = this.data.get('width');
            let height = this.data.get('height');
            if (icon) {
                return `0 0 ${icon.width} ${icon.height}`;
            }
            return `0 0 ${width} ${height}`;
        },

        ratio() {
            let icon = this.data.get('icon');
            if (!icon) {
                return 1;
            }
            let {width, height} = icon;
            return Math.max(width, height) / 16;
        },

        width() {
            let childrenWidth = this.data.get('childrenWidth');
            let icon = this.data.get('icon');
            let ratio = this.data.get('ratio');
            let normalizedScale = this.data.get('normalizedScale');
            return childrenWidth || icon && icon.width / ratio * normalizedScale || 0;
        },
        height() {
            let childrenHeight = this.data.get('childrenHeight');
            let icon = this.data.get('icon');
            let ratio = this.data.get('ratio');
            let normalizedScale = this.data.get('normalizedScale');
            return childrenHeight || icon && icon.height / ratio * normalizedScale || 0;
        },
        computedStyle() {
            let normalizedScale = this.data.get('normalizedScale');
            if (normalizedScale === 1) {
                return '';
            }
            return `font-size: ${normalizedScale}em`;
        }
    }

    attached() {
        let icon = this.data.get('icon');
        let fillRule = this.data.get('fillRule');
        this.el.setAttribute('fill-rule', fillRule || 'evenodd');
        let normalizedScale = this.data.get('normalizedScale');
        if (icon) {
            return;
        }
        const childrenIcons = this.slot('icon')[0].children
            .filter(child => isComponent(child));
        childrenIcons.forEach(child => {
            child.data.set('outerScale', this.data.get('normalizedScale'));
        });
        let width = 0;
        let height = 0;
        childrenIcons.forEach(child => {
            width = Math.max(width, child.data.get('width'));
            height = Math.max(height, child.data.get('height'));
        });
        this.data.set('childrenWidth', width);
        this.data.set('childrenHeight', height);

        childrenIcons.forEach(child => {
            child.data.set('x', (width - child.data.get('width')) / 2);
            child.data.set('y', (height - child.data.get('height')) / 2);
        });
    }
}

function isComponent(node) {
    return node instanceof Component;
}
