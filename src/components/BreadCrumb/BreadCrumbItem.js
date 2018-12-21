/**
 * @file  component BreadCrumbItem
 * @author sqliang(hfutsqliang@gmail.com)
 *         liuchaofan(asd123freedom@gmail.com)
 */

import {Component, DataTypes} from 'san';
import Icon from '../Icon';
import {create} from '../../util/cx';
import {SpanFallBackFromLink, DivFallBackFromLink, NativeLink} from '../Link';
import {
    BREAD_CRUMB_ITEM_INIT,
    BREAD_CRUMB_ITEM_DETACHED
} from './constant';

const cx = create('breadcrumb-item');

const ui = 'link primary';
const iconMap = {
    separator: 'angle-right-small'
};
export default class BreadCrumbItem extends Component {
    static components = {
        'ui-span-link': SpanFallBackFromLink,
        'ui-div-link': DivFallBackFromLink,
        'ui-native-link': NativeLink,
        'ui-icon': Icon
    };
    static template = `
        <li class="{{computedClass}}">
            <template s-if="type === 'link'">
                <ui-span-link
                    on-change="handleChange"
                    ui="${ui}"
                    s-if="!to && fallback ==='span'" replace="{{replace}}" native="{{native}}">
                    <slot></slot>
                </ui-span-link>
                <ui-div-link
                    on-change="handleChange"
                    ui="${ui}"
                    s-elif="!to && fallback ==='div'" replace="{{replace}}" native="{{native}}">
                    <slot></slot>
                </ui-div-link>
                <ui-native-link
                    on-change="handleChange"
                    ui="${ui}"
                    s-else to="{{to}}" replace="{{replace}}" native="{{native}}">
                    <slot></slot>
                </ui-native-link>
            </template>
            <span s-else class="${cx.getPartClassName('current')}"><slot></slot></span>
            <span class="dux-breadcrumb-separator">
                <slot name="separator">
                    <ui-icon name="${iconMap.separator}"></ui-icon>
                </slot>
            </span>
        </li>
    `;

    static dataTypes = {
        // 跳转链接,不传递则没有连接
        to: DataTypes.string,
        // 是否使用原生跳转
        native: DataTypes.bool,
        // 路由跳转是否向history添加新记录
        replace: DataTypes.bool,
        // 是否需要跳转
        type: DataTypes.oneOf(['link', 'text'])
    };

    static trimWhitespace = 'all';

    initData() {
        return {
            to: '',
            native: false,
            replace: false,
            type: 'link'
        };
    }
    inited() {
        this.dispatch(BREAD_CRUMB_ITEM_INIT);
    }
    attached() {}
    detached() {
        this.dispatch(BREAD_CRUMB_ITEM_DETACHED);
    }
    static computed = {
        computedClass() {
            return cx(this).build();
        }
    };
    handleChange(e) {
        this.fire('redirect', e);
    }
}
